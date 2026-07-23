import os
import requests
from fastapi import FastAPI, Request, Query, Response, BackgroundTasks
from pydantic import BaseModel
from dotenv import load_dotenv

# LangChain Imports
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.tools import tool
from langchain.agents import create_tool_calling_agent, AgentExecutor
from langchain_community.chat_message_histories import ChatMessageHistory
from langchain_core.runnables.history import RunnableWithMessageHistory

load_dotenv()

app = FastAPI(title="Samsung Repair AI Agent")

# ---------------------------------------------------------------------
# 1. AI & TOOL INITIALIZATION
# ---------------------------------------------------------------------
llm = ChatGoogleGenerativeAI(model="gemini-2.5-flash", temperature=0)

@tool
def check_repair_status(ticket_number: str) -> str:
    """
    Queries the central database API to find the real-time status, device details, 
    and the estimated cost of a repair ticket.
    Input should be a string in the format 'REP-XXXX' (e.g., 'REP-4092').
    """
    csharp_api_url = f"https://localhost:7193/api/tickets/number/{ticket_number}"
    
    try:
        response = requests.get(csharp_api_url, verify=False, timeout=5)
        
        if response.status_code == 200:
            ticket_data = response.json()
            
            status_mapping = {0: "Received", 1: "In Progress", 2: "Completed", 3: "Cancelled"}
            status_num = ticket_data.get("status", 0)
            status_text = status_mapping.get(status_num, "Unknown")
            
            device_brand = ticket_data.get("device", {}).get("brand", "Device")
            device_model = ticket_data.get("device", {}).get("model", "")
            cost = ticket_data.get("estimatedCost", "Not provided yet")
            
            return f"Ticket {ticket_number} Found: Device is a {device_brand} {device_model}. Current status is '{status_text}'. Estimated Cost: ${cost}."
            
        elif response.status_code == 404:
            return f"System message: Ticket number '{ticket_number}' was not found."
        else:
            return f"System message: Database API error code {response.status_code}."
            
    except Exception as e:
        return f"System error: Unable to reach C# backend API. Details: {str(e)}"

tools = [check_repair_status]

SYSTEM_PROMPT = """
You are a professional, friendly AI Assistant representing the "Samsung Authorized Repair Center Portal".

Your core jobs are:
1. Help customers check the real-time status, device details, and estimated cost of their repair tickets by using your 'check_repair_status' tool.
2. Provide polite customer service answers.

Strict Security & Data Rules:
- You must always use the 'check_repair_status' tool when a user provides a ticket number. Do not guess.
- You are fully authorized to share the estimated cost and device details returned by your tool with the customer.
- If a ticket is 'Completed', tell the customer their device is ready for pickup!
- If a ticket is 'In Progress', give them polite reassurance.
"""
prompt = ChatPromptTemplate.from_messages([
    ("system", SYSTEM_PROMPT),
    ("placeholder", "{chat_history}"),
    ("human", "{input}"),
    ("placeholder", "{agent_scratchpad}"),
])

agent = create_tool_calling_agent(llm, tools, prompt)
agent_executor = AgentExecutor(agent=agent, tools=tools, verbose=True)

# ---------------------------------------------------------------------
# 2. MEMORY STORAGE
# ---------------------------------------------------------------------
store = {}

def get_session_history(session_id: str):
    if session_id not in store:
        store[session_id] = ChatMessageHistory()
    return store[session_id]

agent_with_chat_history = RunnableWithMessageHistory(
    agent_executor,
    get_session_history,
    input_messages_key="input",
    history_messages_key="chat_history",
)

# ---------------------------------------------------------------------
# 3. FASTAPI ENDPOINTS & WEBHOOKS
# ---------------------------------------------------------------------
class ChatRequest(BaseModel):
    message: str
    session_id: str = "default_user"

@app.get("/")
def home():
    return {"status": "AI Agent Microservice is running with Database Tools, Memory, and Webhooks!"}

@app.post("/api/chat")
async def ask_gemini(request: ChatRequest):
    try:
        result = agent_with_chat_history.invoke(
            {"input": request.message},
            config={"configurable": {"session_id": request.session_id}}
        )
        return {
            "reply": result["output"],
            "session_id": request.session_id
        }
    except Exception as e:
        return {"error": str(e)}

# --- WHATSAPP CLOUD API INTEGRATION ---

# We will add these credentials to your .env file in the next step!
META_VERIFY_TOKEN = os.getenv("META_VERIFY_TOKEN", "samsung_repair_secret_123")
META_API_TOKEN = os.getenv("META_API_TOKEN", "")
META_PHONE_NUMBER_ID = os.getenv("META_PHONE_NUMBER_ID", "")

@app.get("/api/webhook")
async def verify_whatsapp_webhook(
    hub_mode: str = Query(None, alias="hub.mode"),
    hub_verify_token: str = Query(None, alias="hub.verify_token"),
    hub_challenge: str = Query(None, alias="hub.challenge")
):
    """Meta sends a GET request here to verify our server."""
    if hub_mode == "subscribe" and hub_verify_token == META_VERIFY_TOKEN:
        print("✅ Meta Webhook Verified!")
        return Response(content=hub_challenge, media_type="text/plain")
    return Response(content="Authentication failed. Invalid Token.", status_code=403)

def process_whatsapp_message(sender_phone: str, message_text: str):
    """Runs the AI and sends the reply back to WhatsApp."""
    try:
        # 1. Ask Gemini (using the phone number as the memory session ID)
        result = agent_with_chat_history.invoke(
            {"input": message_text},
            config={"configurable": {"session_id": sender_phone}}
        )
        ai_reply = result["output"]
        
        # 2. Send the reply back to the user's phone via Meta API
        headers = {
            "Authorization": f"Bearer {META_API_TOKEN}",
            "Content-Type": "application/json"
        }
        payload = {
            "messaging_product": "whatsapp",
            "to": sender_phone,
            "type": "text",
            "text": {"body": ai_reply}
        }
        
        url = f"https://graph.facebook.com/v20.0/{META_PHONE_NUMBER_ID}/messages"
        requests.post(url, headers=headers, json=payload)
        print(f"✅ Reply sent to {sender_phone}!")
        
    except Exception as e:
        print(f"❌ Error processing WhatsApp message: {str(e)}")

@app.post("/api/webhook")
async def receive_whatsapp_message(request: Request, background_tasks: BackgroundTasks):
    """Meta sends incoming WhatsApp messages here as a POST request."""
    data = await request.json()
    
    try:
        # Navigate Meta's complex JSON payload to find the incoming message
        if "entry" in data and len(data["entry"]) > 0:
            changes = data["entry"][0].get("changes", [])
            if len(changes) > 0:
                value = changes[0].get("value", {})
                if "messages" in value and len(value["messages"]) > 0:
                    
                    message = value["messages"][0]
                    sender_phone = message.get("from")
                    
                    # We only care about text messages for now
                    if message.get("type") == "text":
                        message_text = message["text"].get("body")
                        print(f"📲 Received WhatsApp message from {sender_phone}: {message_text}")
                        
                        # Process the AI reply in the background so we can instantly return a 200 OK to Meta
                        background_tasks.add_task(process_whatsapp_message, sender_phone, message_text)
                        
    except Exception as e:
        print(f"Webhook parsing error: {e}")

    # Meta requires a fast 200 OK response, or it will think our server is dead and retry the message.
    return {"status": "success"}