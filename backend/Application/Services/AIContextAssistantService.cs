using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using DMS.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;

namespace DMS.Application.Services
{
    public class AIContextAssistantService
    {
        private readonly ApplicationDbContext _context;
        private readonly IConfiguration _configuration;

        public AIContextAssistantService(ApplicationDbContext context, IConfiguration configuration)
        {
            _context = context;
            _configuration = configuration;
        }

        public async Task<string> ProcessQueryAsync(string question, string currentPage)
        {
            question = question.ToLower();

            // 1. Check for Data Queries
            if (question.Contains("today's sales") || question.Contains("today sales"))
            {
                return await GetTodaySalesSummary();
            }
            if (question.Contains("low stock") || question.Contains("out of stock"))
            {
                return await GetLowStockSummary();
            }
            if (question.Contains("outstanding payment") || question.Contains("unpaid"))
            {
                return await GetOutstandingPaymentsSummary();
            }

            // 2. Check for Knowledge Base / Guidance
            return GetContextualGuidance(question, currentPage);
        }

        private async Task<string> GetTodaySalesSummary()
        {
            var today = DateTime.UtcNow.Date;
            var sales = await _context.Invoices
                .Where(i => i.InvoiceDate.Date == today)
                .SumAsync(i => i.NetAmount);
            var count = await _context.Invoices.CountAsync(i => i.InvoiceDate.Date == today);

            return $"Today's summary: We have made {count} invoices totaling ${sales:N2}.";
        }

        private async Task<string> GetLowStockSummary()
        {
            var lowStock = await _context.Products
                .Include(p => p.Stocks)
                .Where(p => p.Stocks.Sum(s => s.Quantity) < 10)
                .Take(5)
                .ToListAsync();

            if (!lowStock.Any()) return "Great news! All products are well-stocked.";

            var items = string.Join(", ", lowStock.Select(p => $"{p.ProductName} ({p.Stocks.Sum(s => s.Quantity)} left)"));
            return $"Warning: The following items are low in stock: {items}.";
        }

        private async Task<string> GetOutstandingPaymentsSummary()
        {
            var outstanding = await _context.Invoices
                .Where(i => i.PaymentStatus == "Pending" || i.PaymentStatus == "Partial")
                .SumAsync(i => i.NetAmount);
            
            return $"Total outstanding customer balance is approximately ${outstanding:N2}. Check the Reports module for a detailed breakdown.";
        }

        private string GetContextualGuidance(string question, string page)
        {
            var kb = new Dictionary<string, string>
            {
                { "dashboard", "The Dashboard gives you a bird's-eye view of your business. Red widgets indicate low stock, while charts show your sales trends." },
                { "products", "In the Products page, you can manage your catalog. Use the 'Add Product' button to register new items." },
                { "customers", "Manage your client base here. You can track customer balances and empty bottle/crate returns." },
                { "invoices", "To create a sale, go to 'Invoices' and click 'Create Invoice'. You'll need to select a customer and add products." },
                { "stock", "Stock levels are updated automatically when you save an invoice. You can also manually adjust stock if needed." },
                { "daily operations", "This module is for tracking non-sale activities like fuel expenses and maintenance." }
            };

            var context = page.ToLower();
            if (kb.ContainsKey(context))
            {
                return $"Context [ {page} ]: {kb[context]} Is there something specific you'd like to do?";
            }

            return "I'm here to help! I can answer questions about your sales, stock levels, or guide you through the system. Try asking 'What are today's sales?'";
        }
    }
}
