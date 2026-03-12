using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using DMS.Domain.Entities;
using DMS.Application.Interfaces; // Added
using DMS.Application.Services;   // Restored
using DMS.Infrastructure.Authorization; // Added

namespace DMS.API.Controllers
{
    [ApiController]
    [Route("api/v1/[controller]")]
    [Authorize(Roles = "Admin,Manager")]
    public class CustomersController : ControllerBase
    {
        private readonly CustomerService _customerService;

        public CustomersController(CustomerService customerService)
        {
            _customerService = customerService;
        }

        // GET: api/v1/customers
        [HttpGet]
        [RequirePermission("Customers.View")] // Added
        public async Task<ActionResult<IEnumerable<Customer>>> GetCustomers([FromQuery] string? search) // Renamed from Get
            => Ok(await _customerService.GetAllCustomersAsync(search));

        // GET: api/v1/customers/5
        [HttpGet("{id}")]
        [RequirePermission("Customers.View")] // Added
        public async Task<ActionResult<Customer>> GetCustomer(int id) // Renamed from Get
        {
            var customer = await _customerService.GetCustomerByIdAsync(id);
            if (customer == null) return NotFound();
            return Ok(customer);
        }

        // GET /api/v1/customers/{id}/history
        [HttpGet("{id}/history")]
        [RequirePermission("Customers.View")] // Added
        public async Task<ActionResult> GetHistory(int id)
        {
            var history = await _customerService.GetCustomerWithHistoryAsync(id);
            if (history == null) return NotFound();
            return Ok(history);
        }

        // POST: api/v1/customers
        [HttpPost]
        [RequirePermission("Customers.Create")] // Added
        public async Task<ActionResult<Customer>> PostCustomer([FromBody] Customer customer) // Renamed from Post
        {
            var created = await _customerService.CreateCustomerAsync(customer);
            return CreatedAtAction(nameof(GetCustomer), new { id = created.CustomerId }, created); // Updated nameof
        }

        // PUT: api/v1/customers/5
        [HttpPut("{id}")]
        [RequirePermission("Customers.Edit")] // Added
        public async Task<IActionResult> PutCustomer(int id, [FromBody] Customer customer) // Renamed from Put, changed return type
        {
            if (id != customer.CustomerId) return BadRequest("ID mismatch.");
            try
            {
                await _customerService.UpdateCustomerAsync(customer);
                return NoContent();
            }
            catch (System.InvalidOperationException ex)
            {
                return NotFound(ex.Message);
            }
        }

        // DELETE: api/v1/customers/5
        [HttpDelete("{id}")]
        [RequirePermission("Customers.Delete")] // Added
        public async Task<IActionResult> DeleteCustomer(int id) // Renamed from Delete, changed return type
        {
            await _customerService.DeleteCustomerAsync(id);
            return NoContent();
        }

        // POST /api/v1/customers/{id}/payment
        [HttpPost("{id}/payment")]
        public async Task<ActionResult> RecordPayment(int id, [FromBody] PaymentRequest req)
        {
            try
            {
                await _customerService.RecordPaymentAsync(id, req.Amount, req.Note);
                return Ok(new { message = "Payment recorded." });
            }
            catch (System.InvalidOperationException ex)
            {
                return NotFound(ex.Message);
            }
        }
    }

    public class PaymentRequest
    {
        public decimal Amount { get; set; }
        public string? Note { get; set; }
    }
}
