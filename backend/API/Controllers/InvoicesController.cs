using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using DMS.Application.Services;
using DMS.Domain.Entities;
using DMS.Infrastructure.Authorization;
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

        public InvoicesController(InvoiceService invoiceService, IAuditLogService auditLogService)
        {
            _invoiceService = invoiceService;
            _auditLogService = auditLogService;
        }

        // GET /api/v1/invoices
        [HttpGet]
        [RequirePermission("Invoices.View")]
        public async Task<ActionResult<IEnumerable<Invoice>>> GetInvoices()
            => Ok(await _invoiceService.GetAllInvoicesAsync());

        // GET /api/v1/invoices/{id}
        [HttpGet("{id}")]
        [RequirePermission("Invoices.View")]
        public async Task<ActionResult<Invoice>> GetInvoice(int id)
        {
            var invoice = await _invoiceService.GetInvoiceByIdAsync(id);
            if (invoice == null) return NotFound();
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
