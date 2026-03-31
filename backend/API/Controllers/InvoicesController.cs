using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using DMS.Application.Services;
using DMS.Domain.Entities;
using DMS.Infrastructure.Authorization;
using DMS.Infrastructure.Data;
using DMS.Application.Interfaces;

namespace DMS.API.Controllers
{
    // ─── Simple DTO that doesn't have required navigation properties ──────────
    public class CreateInvoiceItemDto
    {
        public int ProductId { get; set; }
        public int Quantity { get; set; }
        public int ReturnedQuantity { get; set; }
        public decimal UnitPrice { get; set; }
        public decimal TotalPrice { get; set; }
    }

    public class CreateInvoiceRequest
    {
        public int CustomerId { get; set; }
        public int? SalesmanId { get; set; }
        public decimal Discount { get; set; } = 0;
        public decimal TotalAmount { get; set; } = 0;
        public decimal NetAmount { get; set; } = 0;
        public decimal PaidAmount { get; set; } = 0;
        public DateTime? DeliveryDate { get; set; }
        public int? RouteId { get; set; }
        public int? VehicleId { get; set; }
        public string InvoiceType { get; set; } = "Spot";
        public List<CreateInvoiceItemDto> InvoiceItems { get; set; } = new();
    }

    public class UpdateStatusRequest
    {
        public string Status { get; set; } = string.Empty;
    }

    // ─────────────────────────────────────────────────────────────────────────

    [ApiController]
    [Route("api/v1/[controller]")]
    [Authorize(Roles = "Admin,Manager,Salesman")]
    public class InvoicesController : ControllerBase
    {
        private readonly InvoiceService _invoiceService;
        private readonly IAuditLogService _auditLogService;
        private readonly ApplicationDbContext _dbContext;

        public InvoicesController(InvoiceService invoiceService, IAuditLogService auditLogService, ApplicationDbContext dbContext)
        {
            _invoiceService = invoiceService;
            _auditLogService = auditLogService;
            _dbContext = dbContext;
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

        private bool IsAuthorizedForInvoice(Invoice invoice)
        {
            if (!User.IsInRole("Salesman")) return true;
            GetIsolationFilters(out int? routeId, out int? salesmanId);
            if (routeId.HasValue && invoice.RouteId != routeId.Value) return false;
            if (salesmanId.HasValue && invoice.SalesmanId != salesmanId.Value) return false;
            return true;
        }

        // GET /api/v1/invoices
        [HttpGet]
        [RequirePermission("Invoices.View")]
        public async Task<ActionResult<IEnumerable<Invoice>>> GetInvoices()
        {
            GetIsolationFilters(out int? routeId, out int? salesmanId);
            return Ok(await _invoiceService.GetAllInvoicesAsync(routeId, salesmanId));
        }

        // GET /api/v1/invoices/cumulative?startDate=2026-03-01&endDate=2026-03-28&salesmanId=1
        [HttpGet("cumulative")]
        [RequirePermission("Invoices.View")]
        public async Task<IActionResult> GetCumulativeSummary(
            [FromQuery] DateTime? startDate,
            [FromQuery] DateTime? endDate,
            [FromQuery] int? salesmanId)
        {
            try
            {
                var query = _dbContext.Invoices
                    .Include(i => i.InvoiceItems)
                    .ThenInclude(ii => ii.Product)
                    .Include(i => i.Salesman)
                    .AsQueryable();

                if (startDate.HasValue)
                    query = query.Where(i => i.InvoiceDate >= startDate.Value.Date);
                if (endDate.HasValue)
                    query = query.Where(i => i.InvoiceDate <= endDate.Value.Date.AddDays(1));
                if (salesmanId.HasValue && salesmanId.Value > 0)
                    query = query.Where(i => i.SalesmanId == salesmanId.Value);

                GetIsolationFilters(out int? forceRouteId, out int? forceSalesmanId);
                
                if (forceRouteId.HasValue) 
                    query = query.Where(i => i.RouteId == forceRouteId.Value);
                else if (HttpContext.Request.Query.ContainsKey("routeId"))
                {
                    if (int.TryParse(HttpContext.Request.Query["routeId"], out int routeIdQuery) && routeIdQuery > 0)
                        query = query.Where(i => i.RouteId == routeIdQuery);
                }

                if (forceSalesmanId.HasValue)
                    query = query.Where(i => i.SalesmanId == forceSalesmanId.Value);

                // Support vehicle-based filtering
                if (HttpContext.Request.Query.ContainsKey("vehicleId"))
                {
                    if (int.TryParse(HttpContext.Request.Query["vehicleId"], out int vehicleId) && vehicleId > 0)
                        query = query.Where(i => i.VehicleId == vehicleId);
                }

                // Filter for Cumulative: Include ONLY Delivery invoices
                query = query.Where(i => i.InvoiceType == "Delivery");

                var invoices = await query.ToListAsync();

                var summary = invoices
                    .SelectMany(i => i.InvoiceItems)
                    .Where(ii => ii.Product != null)
                    .GroupBy(ii => new
                    {
                        ii.Product!.ProductName,
                        Brand = ii.Product.Brand ?? "General",
                        Category = ii.Product.Category ?? "Uncategorized",
                        Unit = ii.Product.Unit ?? "pcs"
                    })
                    .Select(g => new
                    {
                        productName = g.Key.ProductName,
                        brand = g.Key.Brand,
                        category = g.Key.Category,
                        unit = g.Key.Unit,
                        totalQuantity = g.Sum(ii => ii.Quantity),
                        totalReturned = g.Sum(ii => ii.ReturnedQuantity),
                        netQuantity = g.Sum(ii => ii.Quantity) - g.Sum(ii => ii.ReturnedQuantity)
                    })
                    .OrderBy(x => x.brand)
                    .ThenBy(x => x.productName)
                    .ToList();

                return Ok(new
                {
                    invoiceCount = invoices.Count,
                    totalProducts = summary.Count,
                    totalItems = summary.Sum(s => s.totalQuantity),
                    items = summary
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        // GET /api/v1/invoices/bulk-print
        [HttpGet("bulk-print")]
        [RequirePermission("Invoices.View")]
        public async Task<IActionResult> GetBulkPrint(
            [FromQuery] DateTime? startDate,
            [FromQuery] DateTime? endDate,
            [FromQuery] int? salesmanId)
        {
            try
            {
                var query = _dbContext.Invoices
                    .Include(i => i.Customer)
                    .Include(i => i.InvoiceItems)
                    .ThenInclude(ii => ii.Product)
                    .Include(i => i.Salesman)
                    .AsQueryable();

                if (startDate.HasValue)
                    query = query.Where(i => i.InvoiceDate >= startDate.Value.Date);
                if (endDate.HasValue)
                    query = query.Where(i => i.InvoiceDate <= endDate.Value.Date.AddDays(1));
                if (salesmanId.HasValue && salesmanId.Value > 0)
                    query = query.Where(i => i.SalesmanId == salesmanId.Value);

                GetIsolationFilters(out int? forceRouteId, out int? forceSalesmanId);
                
                if (forceRouteId.HasValue) 
                    query = query.Where(i => i.RouteId == forceRouteId.Value);
                else if (HttpContext.Request.Query.ContainsKey("routeId"))
                {
                    if (int.TryParse(HttpContext.Request.Query["routeId"], out int routeIdQuery) && routeIdQuery > 0)
                        query = query.Where(i => i.RouteId == routeIdQuery);
                }

                if (forceSalesmanId.HasValue)
                    query = query.Where(i => i.SalesmanId == forceSalesmanId.Value);

                // Support vehicle-based filtering
                if (HttpContext.Request.Query.ContainsKey("vehicleId"))
                {
                    if (int.TryParse(HttpContext.Request.Query["vehicleId"], out int vehicleId) && vehicleId > 0)
                        query = query.Where(i => i.VehicleId == vehicleId);
                }

                query = query.Where(i => i.InvoiceType == "Delivery");

                var invoices = await query.ToListAsync();

                // Generate Grouped Output
                var groupedByCustomer = invoices
                    .Where(i => i.Customer != null)
                    .GroupBy(i => i.Customer)
                    .Select(g => new
                    {
                        customer = new
                        {
                            g.Key.CustomerId,
                            g.Key.CustomerName,
                            g.Key.Phone,
                            g.Key.Address
                        },
                        totalAmount = g.Sum(i => i.NetAmount),
                        invoices = g.Select(i => new
                        {
                            i.InvoiceId,
                            i.InvoiceNumber,
                            i.InvoiceDate,
                            i.DeliveryDate,
                            i.TotalAmount,
                            i.Discount,
                            i.NetAmount,
                            salesmanName = i.Salesman?.Name,
                            items = i.InvoiceItems.Select(ii => new {
                                ii.Product?.ProductName,
                                ii.Quantity,
                                ii.UnitPrice,
                                ii.TotalPrice
                            })
                        })
                    }).ToList();

                return Ok(groupedByCustomer);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        // GET /api/v1/invoices/{id}
        [HttpGet("{id}")]
        [RequirePermission("Invoices.View")]
        public async Task<ActionResult<Invoice>> GetInvoice(int id)
        {
            var invoice = await _invoiceService.GetInvoiceByIdAsync(id);
            if (invoice == null) return NotFound();
            if (!IsAuthorizedForInvoice(invoice)) return Forbid();
            return Ok(invoice);
        }

        // POST /api/v1/invoices  — accept DTO, map to domain entity
        [HttpPost]
        [RequirePermission("Invoices.Create")]
        public async Task<ActionResult<Invoice>> PostInvoice([FromBody] CreateInvoiceRequest request)
        {
            if (request == null || request.InvoiceItems == null || request.InvoiceItems.Count == 0)
                return BadRequest(new { message = "Invoice must have at least one item." });

            try
            {
                var invoice = new Invoice
                {
                    CustomerId = request.CustomerId,
                    SalesmanId = request.SalesmanId,
                    Discount = request.Discount,
                    PaidAmount = request.PaidAmount,
                    DeliveryDate = request.DeliveryDate,
                    RouteId = request.RouteId,
                    VehicleId = request.VehicleId,
                    InvoiceType = string.IsNullOrEmpty(request.InvoiceType) ? "Spot" : request.InvoiceType
                };

                if (User.IsInRole("Salesman"))
                {
                    GetIsolationFilters(out int? forceRouteId, out int? forceSalesmanId);
                    if (forceRouteId.HasValue) invoice.RouteId = forceRouteId.Value;
                    if (forceSalesmanId.HasValue) invoice.SalesmanId = forceSalesmanId.Value;
                    
                    // Mandatory: Salesman can ONLY create delivery invoices
                    invoice.InvoiceType = "Delivery";
                    
                    // Ensure a delivery date is set (default tomorrow if missing)
                    if (!invoice.DeliveryDate.HasValue)
                        invoice.DeliveryDate = DateTime.UtcNow.Date.AddDays(1);
                }

                foreach (var dto in request.InvoiceItems)
                {
                    invoice.InvoiceItems.Add(new InvoiceItem
                    {
                        ProductId = dto.ProductId,
                        Quantity = dto.Quantity,
                        ReturnedQuantity = dto.ReturnedQuantity,
                        UnitPrice = dto.UnitPrice,
                        TotalPrice = dto.TotalPrice,
                    });
                }

                var created = await _invoiceService.CreateInvoiceAsync(invoice);

                var currentUserId = User.Identity?.Name ?? "System";
                await _auditLogService.LogActionAsync(currentUserId, $"Invoice creation: {created.InvoiceNumber}", HttpContext.Connection.RemoteIpAddress?.ToString());

                return CreatedAtAction(nameof(GetInvoice), new { id = created.InvoiceId }, created);
            }
            catch (System.Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        // PUT /api/v1/invoices/{id}
        [HttpPut("{id}")]
        [Authorize(Roles = "Admin,Manager")]
        [RequirePermission("Invoices.Edit")]
        public async Task<ActionResult<Invoice>> PutInvoice(int id, [FromBody] CreateInvoiceRequest request)
        {
            if (request == null || request.InvoiceItems == null || request.InvoiceItems.Count == 0)
                return BadRequest(new { message = "Invoice must have at least one item." });

            try
            {
                var invoice = new Invoice
                {
                    CustomerId = request.CustomerId,
                    SalesmanId = request.SalesmanId,
                    Discount = request.Discount,
                    DeliveryDate = request.DeliveryDate
                };

                foreach (var dto in request.InvoiceItems)
                {
                    invoice.InvoiceItems.Add(new InvoiceItem
                    {
                        ProductId = dto.ProductId,
                        Quantity = dto.Quantity,
                        ReturnedQuantity = dto.ReturnedQuantity,
                        UnitPrice = dto.UnitPrice,
                        TotalPrice = dto.TotalPrice,
                    });
                }

                var updated = await _invoiceService.UpdateInvoiceAsync(id, invoice);
                if (updated == null) return NotFound();

                return Ok(updated);
            }
            catch (System.Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        // PATCH /api/v1/invoices/{id}/status
        [HttpPatch("{id}/status")]
        [Authorize(Roles = "Admin,Manager")]
        [RequirePermission("Invoices.Edit")] // Modifying status
        public async Task<IActionResult> UpdateInvoiceStatus(int id, [FromBody] UpdateStatusRequest req)
        {
            try
            {
                await _invoiceService.UpdatePaymentStatusAsync(id, req.Status);
                return NoContent();
            }
            catch (System.Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        // DELETE /api/v1/invoices/{id}
        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin,Manager")]
        [RequirePermission("Invoices.Delete")] // Deleting invoices usually part of create/modify flow
        public async Task<IActionResult> DeleteInvoice(int id)
        {
            try
            {
                var deleted = await _invoiceService.DeleteInvoiceAsync(id);
                if (!deleted) return NotFound();
                return NoContent();
            }
            catch (System.Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }
    }
}
