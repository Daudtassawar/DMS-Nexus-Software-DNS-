using System;
using System.Collections.Generic;
using System.Security.Claims;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using DMS.Application.Services;
using DMS.Application.Interfaces;
using DMS.Domain.Entities;
using DMS.Infrastructure.Authorization;

namespace DMS.API.Controllers
{
    [ApiController]
    [Route("api/v1/[controller]")]
    [Authorize(Roles = "Admin,Manager,Salesman")]
    public class StockController : ControllerBase
    {
        private readonly StockService _stockService;
        private readonly IAuditLogService _auditLogService;

        public StockController(StockService stockService, IAuditLogService auditLogService)
        {
            _stockService = stockService;
            _auditLogService = auditLogService;
        }

        // GET: api/v1/stock/overview
        [HttpGet("overview")]
        [RequirePermission("Stock.View")]
        public async Task<ActionResult<IEnumerable<object>>> GetStockOverview()
            => Ok(await _stockService.GetStockOverviewAsync());

        // GET: api/v1/stock
        [HttpGet]
        [RequirePermission("Stock.View")]
        public async Task<ActionResult<IEnumerable<Stock>>> GetAllStock()
             => Ok(await _stockService.GetWarehouseStockAsync(0));

        // GET: api/v1/stock/{productId}
        [HttpGet("{productId}")]
        [RequirePermission("Stock.View")]
        public async Task<ActionResult<IEnumerable<Stock>>> GetStockByProduct(int productId)
        {
            var stock = await _stockService.GetWarehouseStockAsync(productId);
            return Ok(stock);
        }

        // GET /api/v1/stock/transactions?productId=xxx
        [HttpGet("transactions")]
        [RequirePermission("Stock.View")]
        public async Task<ActionResult<IEnumerable<object>>> GetTransactions([FromQuery] int? productId)
        {
            return Ok(await _stockService.GetTransactionsAsync(productId));
        }

        // POST: api/v1/stock/add
        [HttpPost("add")]
        [RequirePermission("Stock.Update")]
        public async Task<IActionResult> AddStock([FromBody] StockOpRequest request)
        {
            try
            {
                var result = await _stockService.AddStockAsync(request.ProductId, request.Quantity, request.WarehouseLocation, request.BatchNumber, request.ExpiryDate);
                var userId = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? "unknown";
                var userName = User.FindFirstValue(ClaimTypes.Name) ?? userId;
                await _auditLogService.LogActionAsync(userId, userName, "Add Stock", "Stock",
                    $"Added {request.Quantity} units for product ID {request.ProductId}", request.ProductId.ToString(),
                    HttpContext.Connection.RemoteIpAddress?.ToString());
                return Ok(result);
            }
            catch (Exception ex) { return BadRequest(new { error = ex.Message }); }
        }

        // POST: api/v1/stock/reduce
        [HttpPost("reduce")]
        [RequirePermission("Stock.Update")]
        public async Task<IActionResult> ReduceStock([FromBody] StockOpRequest request)
        {
            try
            {
                var result = await _stockService.ReduceStockAsync(request.ProductId, request.Quantity, request.WarehouseLocation, request.Reason ?? "Manual reduction");
                var userId = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? "unknown";
                var userName = User.FindFirstValue(ClaimTypes.Name) ?? userId;
                await _auditLogService.LogActionAsync(userId, userName, "Reduce Stock", "Stock",
                    $"Reduced {request.Quantity} units for product ID {request.ProductId}. Reason: {request.Reason}", request.ProductId.ToString(),
                    HttpContext.Connection.RemoteIpAddress?.ToString());
                return Ok(result);
            }
            catch (Exception ex) { return BadRequest(new { error = ex.Message }); }
        }

        // POST /api/v1/stock/adjust
        [HttpPost("adjust")]
        public async Task<ActionResult<Stock>> AdjustStock([FromBody] StockOpRequest req)
        {
            try
            {
                var result = await _stockService.AdjustStockAsync(req.ProductId, req.Quantity, req.WarehouseLocation);
                var userId = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? "unknown";
                var userName = User.FindFirstValue(ClaimTypes.Name) ?? userId;
                await _auditLogService.LogActionAsync(userId, userName, "Adjust Stock", "Stock",
                    $"Adjusted stock for product ID {req.ProductId} to {req.Quantity}", req.ProductId.ToString(),
                    HttpContext.Connection.RemoteIpAddress?.ToString());
                return Ok(result);
            }
            catch (Exception ex) { return BadRequest(new { error = ex.Message }); }
        }

        // POST /api/v1/stock/transfer
        [HttpPost("transfer")]
        public async Task<ActionResult> TransferStock([FromBody] StockTransferRequest req)
        {
            try
            {
                await _stockService.TransferStockAsync(req.ProductId, req.Quantity, req.FromWarehouse, req.ToWarehouse);
                var userId = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? "unknown";
                var userName = User.FindFirstValue(ClaimTypes.Name) ?? userId;
                await _auditLogService.LogActionAsync(userId, userName, "Transfer Stock", "Stock",
                    $"Transferred {req.Quantity} units of product ID {req.ProductId} from {req.FromWarehouse} to {req.ToWarehouse}", req.ProductId.ToString(),
                    HttpContext.Connection.RemoteIpAddress?.ToString());
                return Ok(new { message = "Stock transferred successfully." });
            }
            catch (Exception ex) { return BadRequest(new { error = ex.Message }); }
        }
    }

    public class StockOpRequest
    {
        public int ProductId { get; set; }
        public int Quantity { get; set; }
        public string WarehouseLocation { get; set; } = string.Empty;
        public string? BatchNumber { get; set; }
        public DateTime? ExpiryDate { get; set; }
        public string? Reason { get; set; }
    }

    public class StockTransferRequest
    {
        public int ProductId { get; set; }
        public int Quantity { get; set; }
        public string FromWarehouse { get; set; } = string.Empty;
        public string ToWarehouse { get; set; } = string.Empty;
    }
}
