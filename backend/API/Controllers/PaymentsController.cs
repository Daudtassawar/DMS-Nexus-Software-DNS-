using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using DMS.Application.Interfaces;
using DMS.Domain.Entities;
using Microsoft.AspNetCore.Http;

namespace DMS.API.Controllers
{
    [ApiController]
    [Route("api/v1/[controller]")]
    [Authorize(Roles = "Admin,Manager")]
    public class PaymentsController : ControllerBase
    {
        private readonly IPaymentService _paymentService;
        private readonly IAuditLogService _auditLogService;

        public PaymentsController(IPaymentService paymentService, IAuditLogService auditLogService)
        {
            _paymentService = paymentService;
            _auditLogService = auditLogService;
        }

        [HttpPost]
        // [Authorize]
        // [RequirePermission("Payments.Create")]
        public async Task<ActionResult<Payment>> PostPayment([FromBody] Payment payment)
        {
            if (payment == null) return BadRequest();

            try
            {
                var created = await _paymentService.RecordPaymentAsync(payment);
                
                var currentUserId = User.Identity?.Name ?? "System";
                await _auditLogService.LogActionAsync(currentUserId, $"Payment recorded: Invoice {payment.InvoiceId}, Amount {payment.AmountPaid}", HttpContext.Connection.RemoteIpAddress?.ToString());

                return CreatedAtAction(nameof(GetPaymentsByInvoice), new { invoiceId = created.InvoiceId }, created);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("invoice/{invoiceId}")]
        public async Task<ActionResult<IEnumerable<Payment>>> GetPaymentsByInvoice(int invoiceId)
        {
            return Ok(await _paymentService.GetPaymentsByInvoiceIdAsync(invoiceId));
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Payment>>> GetAllPayments()
        {
            return Ok(await _paymentService.GetAllPaymentsAsync());
        }
    }
}
