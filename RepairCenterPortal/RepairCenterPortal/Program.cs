using Microsoft.EntityFrameworkCore;
using RepairCenterPortal.Infrastructure;
using RepairCenterPortal.Repositories.Interfaces;
using RepairCenterPortal.Repositories.Repositories;
using RepairCenterPortal.Services.Interfaces;
using RepairCenterPortal.Services.Repositories;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

builder.Services.AddControllers().AddJsonOptions(x =>
    x.JsonSerializerOptions.ReferenceHandler = System.Text.Json.Serialization.ReferenceHandler.IgnoreCycles);

// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");

// 2. Register the DbContext to use PostgreSQL
builder.Services.AddDbContext<RepairDbContext>(options =>
    options.UseNpgsql(connectionString));

builder.Services.AddScoped<IRepairTicketRepository, RepairTicketRepository>();

// Register Services
builder.Services.AddScoped<IRepairTicketService, RepairTicketService>();

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReactApp",
        policy =>
        {
            policy.WithOrigins("http://localhost:5173") // Your exact Vite URL
                  .AllowAnyHeader()
                  .AllowAnyMethod();
        });
});


var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

app.UseCors("AllowReactApp");

app.UseAuthorization();

app.MapControllers();

app.Run();
