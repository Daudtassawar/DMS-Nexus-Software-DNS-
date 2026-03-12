using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using DMS.Infrastructure.Data;
using System.Linq;

namespace DMS.Application.Services
{
    public class ReportService
    {
        private readonly ApplicationDbContext _context;

        public ReportService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<object> GetDashboardMetricsAsync()
        {
            var today = System.DateTime.UtcNow.Date;
            
            // 1. Basic Metrics
            var todayInvoices = await _context.Invoices
                .Where(i => i.InvoiceDate.Date == today)
                .ToListAsync();

            var todaySales = todayInvoices.Sum(i => i.TotalAmount);
            var todayCount = todayInvoices.Count;
            var totalProducts = await _context.Products.CountAsync();
            var totalOutstanding = await _context.Customers.SumAsync(c => c.Balance);

            // Calculate low stock (grouped by product across warehouses)
            var lowStockCount = await _context.Products
                .Include(p => p.Stock)
                .Where(p => p.Stock != null && p.Stock.Quantity < p.MinStockLevel)
                .CountAsync();

            // 2. Monthly Sales Trend (Last 6 Months)
            var sixMonthsAgo = today.AddMonths(-5);
            var rawMonthly = await _context.Invoices
                .Where(i => i.InvoiceDate >= sixMonthsAgo)
                .GroupBy(i => new { i.InvoiceDate.Year, i.InvoiceDate.Month })
                .Select(g => new { 
                    Year = g.Key.Year, 
                    Month = g.Key.Month, 
                    Total = g.Sum(i => i.TotalAmount) 
                })
                .ToListAsync();

            var monthlySales = rawMonthly
                .Select(m => new {
                    Month = $"{m.Year}-{m.Month:D2}",
                    Total = m.Total
                })
                .OrderBy(m => m.Month)
                .ToList();

            // 3. Top Selling Products (Top 5)
            var topProducts = await _context.InvoiceItems
                .GroupBy(i => i.Product.ProductName)
                .Select(g => new { 
                    Name = g.Key, 
                    Value = g.Sum(i => i.TotalPrice) 
                })
                .OrderByDescending(p => p.Value)
                .Take(5)
                .ToListAsync();

            // 4. Sales by Salesman
            var rawSalesman = await _context.Invoices
                .GroupBy(i => i.Salesman.Name)
                .Select(g => new { 
                    Name = g.Key, 
                    Value = g.Sum(i => i.TotalAmount) 
                })
                .OrderByDescending(s => s.Value)
                .Take(5)
                .ToListAsync();

            var salesmanPerformance = rawSalesman
                .Select(s => new {
                    Name = s.Name ?? "Direct/System",
                    Value = s.Value
                })
                .ToList();

            // 5. Recent Activity
            var recentInvoices = await _context.Invoices
                .Include(i => i.Customer)
                .OrderByDescending(i => i.InvoiceDate)
                .Take(5)
                .Select(i => new {
                    i.InvoiceId,
                    i.InvoiceNumber,
                    CustomerName = i.Customer.CustomerName,
                    i.NetAmount,
                    i.PaymentStatus,
                    i.InvoiceDate
                })
                .ToListAsync();

            var recentStock = await _context.StockTransactions
                .Include(t => t.Product)
                .OrderByDescending(t => t.Date)
                .Take(5)
                .Select(t => new {
                    t.TransactionId,
                    ProductName = t.Product.ProductName,
                    t.TransactionType,
                    t.Quantity,
                    t.Date
                })
                .ToListAsync();

            return new { 
                Totals = new {
                    TodaySales = todaySales,
                    TodayInvoices = todayCount,
                    TotalProducts = totalProducts,
                    LowStock = lowStockCount,
                    OutstandingBalance = totalOutstanding
                },
                Charts = new {
                    MonthlyTrend = monthlySales,
                    TopProducts = topProducts,
                    SalesmanPerformance = salesmanPerformance
                },
                Activity = new {
                    RecentInvoices = recentInvoices,
                    RecentStock = recentStock
                }
            };
        }

        public async Task<object> GetSalesAnalyticsAsync(System.DateTime? startDate, System.DateTime? endDate)
        {
            var query = _context.Invoices.AsQueryable();
            if (startDate.HasValue) query = query.Where(i => i.InvoiceDate >= startDate.Value);
            if (endDate.HasValue) query = query.Where(i => i.InvoiceDate <= endDate.Value);

            var invoices = await query
                .Include(i => i.Salesman)
                .Select(i => new { i.InvoiceDate, i.TotalAmount, i.SalesmanId, SalesmanName = i.Salesman.Name })
                .ToListAsync();

            var dailySales = invoices
                .GroupBy(i => i.InvoiceDate.Date)
                .Select(g => new { Date = g.Key.ToString("yyyy-MM-dd"), Total = g.Sum(i => i.TotalAmount) })
                .OrderBy(d => d.Date)
                .ToList();

            var monthlySales = invoices
                .GroupBy(i => new { i.InvoiceDate.Year, i.InvoiceDate.Month })
                .Select(g => new { Month = $"{g.Key.Year}-{g.Key.Month:D2}", Total = g.Sum(i => i.TotalAmount) })
                .OrderBy(m => m.Month)
                .ToList();

            var salesmanSales = invoices
                .GroupBy(i => new { i.SalesmanId, i.SalesmanName })
                .Select(g => new { SalesmanName = g.Key.SalesmanName, TotalSales = g.Sum(i => i.TotalAmount) })
                .OrderByDescending(s => s.TotalSales)
                .ToList();

            return new { DailySales = dailySales, MonthlySales = monthlySales, SalesBySalesman = salesmanSales };
        }

        public async Task<object> GetProductPerformanceAsync(System.DateTime? startDate, System.DateTime? endDate)
        {
            var query = _context.InvoiceItems.AsQueryable();
            if (startDate.HasValue) query = query.Where(i => i.Invoice.InvoiceDate >= startDate.Value);
            if (endDate.HasValue) query = query.Where(i => i.Invoice.InvoiceDate <= endDate.Value);

            var performance = await query
                .GroupBy(i => new { i.ProductId, i.Product.ProductName })
                .Select(g => new { 
                    ProductName = g.Key.ProductName, 
                    QuantitySold = g.Sum(i => i.Quantity), 
                    Revenue = g.Sum(i => i.TotalPrice) 
                })
                .ToListAsync();

            var topSelling = performance.OrderByDescending(p => p.QuantitySold).Take(10).ToList();
            var slowMoving = performance.OrderBy(p => p.QuantitySold).Take(10).ToList();

            return new { TopSellingProducts = topSelling, SlowMovingProducts = slowMoving };
        }

        public async Task<object> GetFinancialSummaryAsync(System.DateTime? startDate, System.DateTime? endDate)
        {
            var invoiceItemsQuery = _context.InvoiceItems.AsQueryable();
            var invoicesQuery = _context.Invoices.AsQueryable();

            if (startDate.HasValue) {
                invoiceItemsQuery = invoiceItemsQuery.Where(i => i.Invoice.InvoiceDate >= startDate.Value);
                invoicesQuery = invoicesQuery.Where(i => i.InvoiceDate >= startDate.Value);
            }
            if (endDate.HasValue) {
                invoiceItemsQuery = invoiceItemsQuery.Where(i => i.Invoice.InvoiceDate <= endDate.Value);
                invoicesQuery = invoicesQuery.Where(i => i.InvoiceDate <= endDate.Value);
            }

            // Profit = Total Revenue (Sale Price * Qty) - Total Cost (Purchase Price * Qty)
            var profitData = await invoiceItemsQuery
                .Select(i => new {
                    Revenue = i.TotalPrice,
                    Cost = i.Product.PurchasePrice * i.Quantity
                })
                .ToListAsync();

            var totalRevenue = profitData.Sum(p => p.Revenue);
            var totalCost = profitData.Sum(p => p.Cost);
            var totalProfit = totalRevenue - totalCost;

            var outstandingPayments = await invoicesQuery
                .Where(i => i.PaymentStatus != "Paid")
                .Select(i => new {
                    i.InvoiceNumber,
                    CustomerName = i.Customer.CustomerName,
                    TotalAmount = i.TotalAmount,
                    AmountPaid = i.Payments.Sum(p => p.AmountPaid)
                })
                .ToListAsync();

            var outstandingSummary = outstandingPayments.Select(o => new {
                o.InvoiceNumber,
                o.CustomerName,
                o.TotalAmount,
                o.AmountPaid,
                Balance = o.TotalAmount - o.AmountPaid
            }).Where(o => o.Balance > 0).ToList();

            var totalOutstanding = outstandingSummary.Sum(o => o.Balance);

            return new { 
                TotalRevenue = totalRevenue, 
                TotalCost = totalCost, 
                GrossProfit = totalProfit, 
                ProfitMargin = totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0,
                TotalOutstanding = totalOutstanding,
                OutstandingInvoices = outstandingSummary 
            };
        }

        public async Task<object> GetInventoryReportsAsync()
        {
            var inventory = await _context.Products
                .Select(p => new {
                    p.ProductId,
                    p.ProductName,
                    p.Category,
                    p.PurchasePrice,
                    p.MinStockLevel,
                    TotalQuantity = _context.Stock.Where(s => s.ProductId == p.ProductId).Sum(s => s.Quantity)
                })
                .ToListAsync();

            var inventorySummary = inventory.Select(i => new {
                i.ProductId,
                i.ProductName,
                i.Category,
                i.TotalQuantity,
                TotalValue = i.TotalQuantity * i.PurchasePrice,
                Status = i.TotalQuantity < i.MinStockLevel ? "Low Stock" : (i.TotalQuantity == 0 ? "Out of Stock" : "In Stock")
            }).ToList();

            var lowStockReport = inventorySummary.Where(i => i.Status == "Low Stock" || i.Status == "Out of Stock").ToList();
            var totalInventoryValue = inventorySummary.Sum(i => i.TotalValue);

            return new { 
                TotalInventoryValue = totalInventoryValue, 
                InventorySummary = inventorySummary, 
                LowStockReport = lowStockReport 
            };
        }
    }
}
