using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using DMS.Domain.Entities;
using DMS.Infrastructure.Data;

namespace DMS.API.Controllers
{
    public class NotificationDto
    {
        public string Id { get; set; } = string.Empty;
        public string Type { get; set; } = "info"; // stock | overdue | due | info
        public string Title { get; set; } = string.Empty;
        public string Message { get; set; } = string.Empty;
    }

    [ApiController]
    [Route("api/notifications")]
    [Authorize]
    public class NotificationsController : ControllerBase
    {
        private readonly ApplicationDbContext _db;

        public NotificationsController(ApplicationDbContext db)
        {
            _db = db;
        }

        /// <summary>
        /// GET /api/notifications
        /// Returns real-time business alerts:
        ///  - Low stock items (quantity &lt; 10)
        ///  - Customers with outstanding balance &gt; 0
        ///  - Unpaid/Partial invoices older than 7 days (overdue)
        /// </summary>
        [HttpGet]
        public async Task<IActionResult> GetNotifications()
        {
            var notifications = new List<NotificationDto>();

            try
            {
                // 1. Low Stock Alerts
                var lowStockItems = await _db.Stock
                    .Include(s => s.Product)
                    .Where(s => s.Quantity > 0 && s.Quantity < 10 && s.Product != null)
                    .GroupBy(s => s.ProductId)
                    .Select(g => new
                    {
                        ProductId = g.Key,
                        TotalQty = g.Sum(s => s.Quantity),
                        ProductName = g.FirstOrDefault() != null && g.FirstOrDefault()!.Product != null 
                            ? g.FirstOrDefault()!.Product!.ProductName 
                            : "Unknown Product"
                    })
                    .Where(x => x.TotalQty < 10)
                    .Take(10)
                    .ToListAsync();

                foreach (var item in lowStockItems)
                {
                    notifications.Add(new NotificationDto
                    {
                        Id = $"stock-{item.ProductId}",
                        Type = "stock",
                        Title = "Low Stock Alert",
                        Message = $"{item.ProductName} — only {item.TotalQty} units remaining."
                    });
                }

                // 2. Overdue Invoices (Unpaid/Partial older than 7 days)
                var sevenDaysAgo = DateTime.UtcNow.AddDays(-7);
                var overdueInvoices = await _db.Invoices
                    .Include(i => i.Customer)
                    .Where(i =>
                        (i.PaymentStatus == "Unpaid" || i.PaymentStatus == "Partial") &&
                        i.InvoiceDate <= sevenDaysAgo)
                    .OrderByDescending(i => i.InvoiceDate)
                    .Take(10)
                    .ToListAsync();

                foreach (var inv in overdueInvoices)
                {
                    var daysPast = (int)(DateTime.UtcNow - inv.InvoiceDate).TotalDays;
                    notifications.Add(new NotificationDto
                    {
                        Id = $"overdue-{inv.InvoiceId}",
                        Type = "overdue",
                        Title = "Overdue Payment",
                        Message = $"{inv.Customer?.CustomerName ?? "Customer"} — Rs. {inv.RemainingAmount:N0} due for {daysPast} days. [{inv.InvoiceNumber}]"
                    });
                }

                // 3. Customers with outstanding balance
                var highBalanceCustomers = await _db.Customers
                    .Where(c => c.Balance > 0)
                    .OrderByDescending(c => c.Balance)
                    .Take(5)
                    .ToListAsync();

                foreach (var cust in highBalanceCustomers)
                {
                    notifications.Add(new NotificationDto
                    {
                        Id = $"due-cust-{cust.CustomerId}",
                        Type = "due",
                        Title = "Outstanding Balance",
                        Message = $"{cust.CustomerName} has an outstanding balance of Rs. {cust.Balance:N0}."
                    });
                }
            }
            catch (Exception ex)
            {
                // Return partial results if one query fails
                Console.WriteLine($"Notification fetch error: {ex.Message}");
            }

            // Return most critical first
            var ordered = notifications
                .OrderBy(n => n.Type == "overdue" ? 0 : n.Type == "stock" ? 1 : 2)
                .ToList();

            return Ok(ordered);
        }
    }
}
