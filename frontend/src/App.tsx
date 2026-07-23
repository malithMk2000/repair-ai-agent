import { useEffect, useState } from 'react'

interface RepairTicket {
  id: number;
  ticketNumber: string;
  status: number;
  createdAt: string;
  estimatedCost: number;
  actualCost?: number;
  finalCost?: number;
  estimatedCompletionDate?: string;
  estimatedDeliveryDate?: string;
  diagnosticNotes?: string;
  issuesFound?: string;
  specialNotes?: string;
  device?: {
    brand: string;
    model: string;
    customer?: {
      name: string;
      phoneNumber: string;
    }
  }
}

function App() {
  const [tickets, setTickets] = useState<RepairTicket[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editingTicketId, setEditingTicketId] = useState<number | null>(null)

  // Form State
  const [formData, setFormData] = useState({
    customerName: '',
    phoneNumber: '',
    brand: '',
    model: '',
    estimatedCost: '',
    notes: '',
    actualCost: '',
    issuesFound: '',
    specialNotes: '',
    estimatedDeliveryDate: '',
    status: '0'
  })

  const fetchTickets = () => {
    fetch('https://localhost:7193/api/tickets') 
      .then(res => res.json())
      .then(data => {
        setTickets(data)
        setLoading(false)
      })
      .catch(err => console.error("Fetch error:", err))
  }

  useEffect(() => {
    fetchTickets()
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleEdit = (ticket: RepairTicket) => {
    setFormData({
      customerName: ticket.device?.customer?.name || '',
      phoneNumber: ticket.device?.customer?.phoneNumber || '',
      brand: ticket.device?.brand || '',
      model: ticket.device?.model || '',
      estimatedCost: ticket.estimatedCost?.toString() || '',
      notes: ticket.diagnosticNotes || '',
      actualCost: ticket.actualCost?.toString() || '',
      issuesFound: ticket.issuesFound || '',
      specialNotes: ticket.specialNotes || '',
      estimatedDeliveryDate: ticket.estimatedDeliveryDate ? new Date(ticket.estimatedDeliveryDate).toISOString().split('T')[0] : '',
      status: ticket.status.toString()
    });
    setEditingTicketId(ticket.id);
    setIsEditing(true);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  const handleDelete = () => {
    if (!editingTicketId) return;
    if (!confirm("Are you sure you want to delete this ticket?")) return;

    fetch(`https://localhost:7193/api/tickets/${editingTicketId}`, {
      method: 'DELETE'
    })
    .then(res => {
      if(res.ok) {
        fetchTickets();
        resetForm();
      }
    })
    .catch(err => console.error("Delete error:", err))
  }

  const resetForm = () => {
    setShowForm(false);
    setIsEditing(false);
    setEditingTicketId(null);
    setFormData({ 
      customerName: '', 
      phoneNumber: '', 
      brand: '', 
      model: '', 
      estimatedCost: '', 
      notes: '',
      actualCost: '',
      issuesFound: '',
      specialNotes: '',
      estimatedDeliveryDate: '',
      status: '0'
    });
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const ticketPayload = {
      Id: editingTicketId || 0,
      Device: {
        Brand: formData.brand,
        Model: formData.model,
        Customer: {
          Name: formData.customerName,
          PhoneNumber: formData.phoneNumber
        }
      },
      Status: parseInt(formData.status),
      EstimatedCost: parseFloat(formData.estimatedCost) || 0,
      ActualCost: parseFloat(formData.actualCost) || 0,
      DiagnosticNotes: formData.notes,
      IssuesFound: formData.issuesFound,
      SpecialNotes: formData.specialNotes,
      EstimatedDeliveryDate: formData.estimatedDeliveryDate ? new Date(formData.estimatedDeliveryDate).toISOString() : null
    };

    const url = isEditing ? `https://localhost:7193/api/tickets/${editingTicketId}` : 'https://localhost:7193/api/tickets';
    const method = isEditing ? 'PUT' : 'POST';

    fetch(url, {
      method: method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(ticketPayload)
    })
    .then(res => {
      if(res.ok) {
        fetchTickets();
        resetForm();
      }
    })
    .catch(err => console.error("Submit error:", err))
  }

  const getStatusLabel = (status: number) => {
    const statuses = ['Received', 'In Diagnostics', 'Waiting For Parts', 'Repair In Progress', 'Ready For Pickup', 'Completed', 'Cancelled'];
    return statuses[status] || 'Unknown';
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        
        {/* Header Section */}
        <div className="flex justify-between items-center mb-8 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 tracking-tight">Repair Dashboard</h1>
            <p className="text-gray-500 mt-1">Manage intake and repair status</p>
          </div>
          <button 
            onClick={() => showForm ? resetForm() : setShowForm(true)}
            className={`${showForm ? 'bg-gray-500 hover:bg-gray-600' : 'bg-blue-600 hover:bg-blue-700'} text-white font-semibold py-2.5 px-5 rounded-lg shadow transition duration-200`}
          >
            {showForm ? 'Cancel' : '+ New Repair Ticket'}
          </button>
        </div>

        {/* Ticket Form */}
        {showForm && (
          <div className="bg-white p-8 rounded-xl shadow-md mb-8 border border-blue-100 animate-fade-in-down">
            <h2 className="text-xl font-bold text-gray-800 mb-6">{isEditing ? `Edit Ticket: ${tickets.find(t => t.id === editingTicketId)?.ticketNumber}` : 'Intake New Device'}</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Customer Info */}
                <div className="space-y-4 p-4 bg-gray-50 rounded-lg border border-gray-100">
                  <h3 className="font-semibold text-gray-700 border-b pb-2">Customer Details</h3>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                    <input type="text" name="customerName" required value={formData.customerName} onChange={handleInputChange} className="w-full border-gray-300 rounded-md shadow-sm p-2 border focus:ring-blue-500 focus:border-blue-500" placeholder="e.g. John Doe" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                    <input type="tel" name="phoneNumber" required value={formData.phoneNumber} onChange={handleInputChange} className="w-full border-gray-300 rounded-md shadow-sm p-2 border focus:ring-blue-500 focus:border-blue-500" placeholder="e.g. 0771234567" />
                  </div>
                </div>

                {/* Device Info */}
                <div className="space-y-4 p-4 bg-gray-50 rounded-lg border border-gray-100">
                  <h3 className="font-semibold text-gray-700 border-b pb-2">Device Details</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Brand</label>
                      <input type="text" name="brand" required value={formData.brand} onChange={handleInputChange} className="w-full border-gray-300 rounded-md shadow-sm p-2 border focus:ring-blue-500 focus:border-blue-500" placeholder="Samsung" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Model</label>
                      <input type="text" name="model" required value={formData.model} onChange={handleInputChange} className="w-full border-gray-300 rounded-md shadow-sm p-2 border focus:ring-blue-500 focus:border-blue-500" placeholder="S24 Ultra" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Est. Cost (Rs)</label>
                      <input type="number" name="estimatedCost" required value={formData.estimatedCost} onChange={handleInputChange} className="w-full border-gray-300 rounded-md shadow-sm p-2 border focus:ring-blue-500 focus:border-blue-500" placeholder="15000" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Actual Cost (Rs)</label>
                      <input type="number" name="actualCost" value={formData.actualCost} onChange={handleInputChange} className="w-full border-gray-300 rounded-md shadow-sm p-2 border focus:ring-blue-500 focus:border-blue-500" placeholder="16500" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Repair Progress */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4 p-4 bg-blue-50 rounded-lg border border-blue-100">
                  <h3 className="font-semibold text-blue-800 border-b border-blue-200 pb-2">Repair Status</h3>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Current Status</label>
                    <select name="status" value={formData.status} onChange={handleInputChange} className="w-full border-gray-300 rounded-md shadow-sm p-2 border focus:ring-blue-500 focus:border-blue-500 bg-white">
                      <option value="0">Received</option>
                      <option value="1">In Diagnostics</option>
                      <option value="2">Waiting For Parts</option>
                      <option value="3">Repair In Progress</option>
                      <option value="4">Ready For Pickup</option>
                      <option value="5">Completed</option>
                      <option value="6">Cancelled</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Est. Delivery Date</label>
                    <input type="date" name="estimatedDeliveryDate" value={formData.estimatedDeliveryDate} onChange={handleInputChange} className="w-full border-gray-300 rounded-md shadow-sm p-2 border focus:ring-blue-500 focus:border-blue-500" />
                  </div>
                </div>

                <div className="space-y-4 p-4 bg-gray-50 rounded-lg border border-gray-100">
                  <h3 className="font-semibold text-gray-700 border-b pb-2">Technical Notes</h3>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Issues Found</label>
                    <input type="text" name="issuesFound" value={formData.issuesFound} onChange={handleInputChange} className="w-full border-gray-300 rounded-md shadow-sm p-2 border focus:ring-blue-500 focus:border-blue-500" placeholder="e.g. Battery dead, loose flex" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Diagnositic Notes</label>
                    <textarea name="notes" rows={2} value={formData.notes} onChange={handleInputChange} className="w-full border-gray-300 rounded-md shadow-sm p-2 border focus:ring-blue-500 focus:border-blue-500" placeholder="Initial observations..."></textarea>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Special Notes</label>
                <textarea name="specialNotes" rows={2} value={formData.specialNotes} onChange={handleInputChange} className="w-full border-gray-300 rounded-md shadow-sm p-2 border focus:ring-blue-500 focus:border-blue-500" placeholder="Important customer instructions or additional details..."></textarea>
              </div>

              <div className="flex justify-between items-center pt-4 border-t">
                <div>
                  {isEditing && (
                    <button type="button" onClick={handleDelete} className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-6 rounded-lg shadow transition">
                      Delete Ticket
                    </button>
                  )}
                </div>
                <div className="space-x-4">
                  <button type="button" onClick={resetForm} className="text-gray-600 font-semibold hover:text-gray-800">
                    Cancel
                  </button>
                  <button type="submit" className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-8 rounded-lg shadow transition">
                    {isEditing ? 'Update Ticket' : 'Save Ticket'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        )}

        {/* Data Table */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-200">
          <div className="p-4 bg-gray-50 border-b border-gray-200">
            <p className="text-sm text-gray-500 font-medium">Double-click any row to view or edit ticket details</p>
          </div>
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Ticket #</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Customer</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Device</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {loading ? (
                <tr><td colSpan={5} className="px-6 py-8 text-center text-gray-500">Loading tickets...</td></tr>
              ) : tickets.length === 0 ? (
                <tr><td colSpan={5} className="px-6 py-8 text-center text-gray-500">No tickets found. Create one above!</td></tr>
              ) : (
                tickets.map((ticket) => (
                  <tr 
                    key={ticket.id} 
                    onDoubleClick={() => handleEdit(ticket)}
                    className="hover:bg-blue-50 transition-colors cursor-pointer select-none"
                    title="Double click to edit"
                  >
                    <td className="px-6 py-4 whitespace-nowrap font-bold text-blue-600">{ticket.ticketNumber}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-800 font-medium">{ticket.device?.customer?.name || 'N/A'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-600">{ticket.device?.brand} {ticket.device?.model}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-500">{new Date(ticket.createdAt).toLocaleDateString()}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 inline-flex text-xs leading-5 font-bold rounded-full border ${
                        ticket.status === 5 ? 'bg-green-100 text-green-800 border-green-200' : 
                        ticket.status === 6 ? 'bg-red-100 text-red-800 border-red-200' :
                        'bg-yellow-100 text-yellow-800 border-yellow-200'
                      }`}>
                        {getStatusLabel(ticket.status)} 
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  )
}

export default App

