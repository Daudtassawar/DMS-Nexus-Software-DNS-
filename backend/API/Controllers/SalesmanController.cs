using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using DMS.Domain.Entities;
using DMS.Infrastructure.Data;
using Microsoft.AspNetCore.Authorization;
using System;
using System.Linq;
using System.Threading.Tasks;

namespace DMS.API.Controllers
{
    [ApiController]
    [Route("api/v1/[controller]")]
    [Authorize(Roles = "Salesman,Admin,Manager")]
    public class SalesmanController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public SalesmanController(ApplicationDbContext context)
        {
            _context = context;
        }

        private void GetIsolationFilters(out int? routeId, out int? salesmanId)
        {
            routeId = null;
            salesmanId = null;
            if (User.IsInRole("Salesman"))
            {
                if (int.TryParse(User.FindFirst("RouteId")?.Value, out int r)) routeId = r;
                if (int.TryParse(User.FindFirst("SalesmanId")?.Value, out int s)) salesmanId = s;
            }
        }

        [HttpGet("dashboard")]
        public async Task<IActionResult> GetDashboard()
        {
            GetIsolationFilters(out int? routeId, out int? salesmanId);

            var today = DateTime.UtcNow.Date;

            // Route-isolated queries
            var customersQuery = _context.Customers.AsQueryable();
            var invoicesQuery = _context.Invoices.Where(i => i.InvoiceDate.Date == today).AsQueryable();

            if (routeId.HasValue) 
            {
                customersQuery = customersQuery.Where(c => c.RouteId == routeId.Value);
                invoicesQuery = invoicesQuery.Where(i => i.RouteId == routeId.Value);
            }
            if (salesmanId.HasValue) 
            {
                customersQuery = customersQuery.Where(c => c.SalesmanId == salesmanId.Value);
                invoicesQuery = invoicesQuery.Where(i => i.SalesmanId == salesmanId.Value);
            }

            var visibleCustomers = await customersQuery.ToListAsync();
            var totalCustomers = visibleCustomers.Count;
            
            var todayInvoices = await invoicesQuery.ToListAsync();
            var todaySales = todayInvoices.Sum(i => i.NetAmount);
            var todayOrders = todayInvoices.Count;
            var todayCashCollected = todayInvoices.Sum(i => i.PaidAmount);
            
            var visitedCustomerIds = todayInvoices.Select(i => i.CustomerId).Distinct().ToList();
            var visitedCount = visitedCustomerIds.Count;
            var pendingCount = Math.Max(0, totalCustomers - visitedCount);

            // Actionable list: Customers in route who haven't been visited yet
            var pendingCustomersList = visibleCustomers
                .Where(c => !visitedCustomerIds.Contains(c.CustomerId))
                .Select(c => new {
                    c.CustomerId,
                    c.CustomerName,
                    c.Area,
                    c.Phone,
                    c.Balance
                })
                .ToList();

            var routeName = "No Route Assigned";
            if (routeId.HasValue)
            {
                var route = await _context.Routes.FindAsync(routeId.Value);
                if (route != null) routeName = route.RouteName;
            }

            return Ok(new 
            {
                RouteName = routeName,
                TotalCustomers = totalCustomers,
                VisitedCustomers = visitedCount,
                PendingCustomers = pendingCount,
                PendingCustomersList = pendingCustomersList,
                TodaySales = todaySales,
                TodayOrders = todayOrders,
                TodayCashCollected = todayCashCollected,
                EmployeeId = User.FindFirst("EmployeeId")?.Value ?? "N/A",
                Date = today
            });
        }
    }
}
