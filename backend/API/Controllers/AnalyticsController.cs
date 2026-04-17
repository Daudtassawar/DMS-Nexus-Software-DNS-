using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using DMS.Domain.Entities;
using DMS.Infrastructure.Data;
using Microsoft.AspNetCore.Authorization;
using System;
using System.Linq;
using System.Threading.Tasks;
using System.Collections.Generic;
using DMS.Application.Interfaces;

namespace DMS.API.Controllers
{
    [ApiController]
    [Route("api/v1/[controller]")]
    [Authorize(Roles = "Admin,Manager")]
    public class AnalyticsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly IFinancialService _financialService;

        public AnalyticsController(ApplicationDbContext context, IFinancialService financialService)
        {
            _context = context;
            _financialService = financialService;
        }

        [HttpGet("product-profit")]
        public async Task<IActionResult> GetProductProfit()
        {
            var items = await _context.InvoiceItems
                .Include(ii => ii.Product)
                .Include(ii => ii.Invoice)
                .Where(ii => ii.Invoice.PaymentStatus != "Cancelled")
                .ToListAsync();

            var analysis = items.GroupBy(ii => ii.ProductId)
                .Select(g => {
                    var product = g.First().Product;
                    var qtySold = g.Sum(ii => ii.Quantity); // ReturnedQuantity is typically packaging containers in this system
                    var revenue = g.Sum(ii => ii.TotalPrice);
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
            var result = await _financialService.GetSalesForecastAsync();
            return Ok(result);
        }

        [HttpGet("financial-insights")]
        public async Task<IActionResult> GetFinancialInsights()
        {
            var insights = await _financialService.GetFinancialInsightsAsync();
            
            // Add low stock alert directly here as it's operational
            var lowStock = await _context.Stock
                .Include(s => s.Product)
                .Where(s => s.Quantity <= s.Product.MinStockLevel)
                .CountAsync();

            var list = insights.ToList();
            if (lowStock > 0) list.Add($"{lowStock} products are below critical stock levels.");

            return Ok(list);
        }
    }
}
