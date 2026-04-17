using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using DMS.Application.Services;
using DMS.Infrastructure.Authorization;
using Microsoft.Extensions.Caching.Memory;

namespace DMS.API.Controllers
{
    [ApiController]
    [Route("api/v1/[controller]")]
    [Authorize(Roles = "Admin,Manager")]
    public class ReportsController : ControllerBase
    {
        private readonly ReportService _reportService;
        private readonly IMemoryCache _cache;

        public ReportsController(ReportService reportService, IMemoryCache cache)
        {
            _reportService = reportService;
            _cache = cache;
        }

        // GET: api/v1/reports/dashboard-metrics
        [HttpGet("dashboard-metrics")]
        [RequirePermission("Dashboard.View")] // Dashboard uses reports controller for metrics
        public async Task<ActionResult> GetDashboardMetrics()
        {
            var metrics = await _cache.GetOrCreateAsync("dashboard_metrics", entry =>
            {
                entry.AbsoluteExpirationRelativeToNow = System.TimeSpan.FromMinutes(1);
                return _reportService.GetDashboardMetricsAsync();
            });
            return Ok(metrics);
        }

        // GET: api/v1/reports/sales
        [HttpGet("sales")]
        [RequirePermission("Reports.View")]
        public async Task<ActionResult> GetSalesReport([FromQuery] System.DateTime? startDate, [FromQuery] System.DateTime? endDate)
        {
            var data = await _reportService.GetSalesAnalyticsAsync(startDate, endDate);
            return Ok(data);
        }

        [HttpGet("products")]
        public async Task<IActionResult> GetProductReports([FromQuery] System.DateTime? startDate, [FromQuery] System.DateTime? endDate)
        {
            var data = await _reportService.GetProductPerformanceAsync(startDate, endDate);
            return Ok(data);
        }

        [HttpGet("financials")]
        public async Task<IActionResult> GetFinancialReports([FromQuery] System.DateTime? startDate, [FromQuery] System.DateTime? endDate)
        {
            var data = await _reportService.GetFinancialSummaryAsync(startDate, endDate);
            return Ok(data);
        }

        // GET: api/v1/reports/inventory
        [HttpGet("inventory")]
        [RequirePermission("Reports.View")]
        public async Task<ActionResult> GetInventoryReport()
        {
            var data = await _reportService.GetInventoryReportsAsync();
            return Ok(data);
        }

        [HttpGet("salesman-analysis")]
        public async Task<IActionResult> GetSalesManAnalysis([FromQuery] string range = "daily")
        {
            var data = await _reportService.GetSalesManAnalysisAsync(range);
            return Ok(data);
        }
    }
}
