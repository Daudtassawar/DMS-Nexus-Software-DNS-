using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using DMS.Domain.Entities;
using DMS.Infrastructure.Data;
using Microsoft.AspNetCore.Authorization;
using System;
using System.Linq;
using System.Threading.Tasks;
using System.Collections.Generic;

namespace DMS.API.Controllers
{
    [ApiController]
    [Route("api/v1/[controller]")]
    [Authorize(Roles = "Admin,Manager")]
    public class AnalyticsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public AnalyticsController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet("product-profit")]
        public async Task<IActionResult> GetProductProfit()
        {
            var items = await _context.InvoiceItems
                .Include(ii => ii.Product)
                .ToListAsync();

            var analysis = items.GroupBy(ii => ii.ProductId)
                .Select(g => {
                    var product = g.First().Product;
                    var qtySold = g.Sum(ii => ii.Quantity - ii.ReturnedQuantity);
                    var revenue = g.Sum(ii => (ii.Quantity - ii.ReturnedQuantity) * ii.UnitPrice);
                    var cost = qtySold * (product?.PurchasePrice ?? 0);
                    return new {
                        ProductId = g.Key,
                        ProductName = product?.ProductName ?? "Unknown",
                        Brand = product?.Brand,
                        QuantitySold = qtySold,
                        Revenue = revenue,
                        Cost = cost,
                        Profit = revenue - cost,
                        Margin = revenue > 0 ? ((revenue - cost) / revenue) * 100 : 0
                    };
                })
                .OrderByDescending(x => x.Profit)
                .ToList();

            return Ok(analysis);
        }

        [HttpGet("sales-forecast")]
        public async Task<IActionResult> GetSalesForecast()
        {
            // Historical grouping by day
            var history = await _context.Invoices
                .Where(i => i.InvoiceDate >= DateTime.UtcNow.AddDays(-30))
                .GroupBy(i => i.InvoiceDate.Date)
                .Select(g => new { Date = g.Key, Amount = g.Sum(i => i.NetAmount) })
                .OrderBy(x => x.Date)
                .ToListAsync();

            if (!history.Any()) return Ok(new { Historical = new List<object>(), Forecast = new List<object>() });

            decimal avgDaily = history.Average(x => x.Amount);
            
            // Simple logic: Next 7 days prediction using moving average + trend factor
            var forecast = Enumerable.Range(1, 7).Select(i => new {
                Date = DateTime.UtcNow.Date.AddDays(i),
                PredictedAmount = Math.Round(avgDaily * (decimal)(1 + (0.015 * i)), 2) // 1.5% daily trend simulation
            });

            return Ok(new { Historical = history, Forecast = forecast });
        }

        [HttpGet("financial-insights")]
        public async Task<IActionResult> GetFinancialInsights()
        {
            var today = DateTime.UtcNow.Date;
            var yesterday = today.AddDays(-1);

            var todaySales = await _context.Invoices.Where(i => i.InvoiceDate.Date == today).SumAsync(i => i.NetAmount);
            var yesterdaySales = await _context.Invoices.Where(i => i.InvoiceDate.Date == yesterday).SumAsync(i => i.NetAmount);

            var insights = new List<string>();

            if (todaySales > yesterdaySales && yesterdaySales > 0)
            {
                var growth = ((todaySales - yesterdaySales) / yesterdaySales) * 100;
                insights.Add($"Sales increased by {growth:F1}% compared to yesterday.");
            }
            else if (todaySales < yesterdaySales)
            {
                insights.Add("Sales are lower than yesterday. Consider volume boost strategies.");
            }

            // High profit product
            var topProduct = await _context.InvoiceItems
                .Include(ii => ii.Product)
                .GroupBy(ii => ii.ProductId)
                .Select(g => new { 
                    Name = g.First().Product != null ? g.First().Product.ProductName : "Unknown", 
                    Profit = g.Sum(ii => (ii.Quantity - ii.ReturnedQuantity) * (ii.UnitPrice - (ii.Product != null ? ii.Product.PurchasePrice : 0))) 
                })
                .OrderByDescending(x => x.Profit)
                .FirstOrDefaultAsync();

            if (topProduct != null && topProduct.Name != "Unknown") 
                insights.Add($"'{topProduct.Name}' is your most profitable product today.");

            // Stock alerts
            var lowStock = await _context.Stock
                .Include(s => s.Product)
                .Where(s => s.Quantity <= s.Product.MinStockLevel)
                .CountAsync();

            if (lowStock > 0) insights.Add($"{lowStock} products are below critical stock levels.");

            return Ok(insights);
        }
    }
}
