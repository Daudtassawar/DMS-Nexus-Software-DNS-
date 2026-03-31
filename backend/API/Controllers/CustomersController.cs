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
    [Authorize(Roles = "Admin,Manager,Salesman")]
    public class CustomersController : ControllerBase
    {
        private readonly CustomerService _customerService;

        public CustomersController(CustomerService customerService)
        {
            _customerService = customerService;
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

        private bool IsAuthorizedForCustomer(Customer customer)
        {
            if (!User.IsInRole("Salesman")) return true;
            
            GetIsolationFilters(out int? routeId, out int? salesmanId);

            if (routeId.HasValue && customer.RouteId != routeId.Value) return false;
            // Removed strict salesman check for customers in the same route to allow collaboration if needed, 
            // but strict per requirements: "customers are assigned based on routes"
            
            return true;
        }

        // GET: api/v1/customers
        [HttpGet]
        [RequirePermission("Customers.View")]
        public async Task<ActionResult<IEnumerable<Customer>>> GetCustomers([FromQuery] string? search)
        {
            GetIsolationFilters(out int? routeId, out int? salesmanId);
            return Ok(await _customerService.GetAllCustomersAsync(search, routeId, salesmanId));
        }

        // GET: api/v1/customers/5
        [HttpGet("{id}")]
        [RequirePermission("Customers.View")]
        public async Task<ActionResult<Customer>> GetCustomer(int id)
        {
            var customer = await _customerService.GetCustomerByIdAsync(id);
            if (customer == null) return NotFound();
            
            if (!IsAuthorizedForCustomer(customer)) return Forbid();

            return Ok(customer);
        }

        // GET /api/v1/customers/{id}/history
        [HttpGet("{id}/history")]
        [RequirePermission("Customers.View")]
        public async Task<ActionResult> GetHistory(int id)
        {
            var customer = await _customerService.GetCustomerByIdAsync(id);
            if (customer == null) return NotFound();
            if (!IsAuthorizedForCustomer(customer)) return Forbid();

            var history = await _customerService.GetCustomerWithHistoryAsync(id);
            return Ok(history);
        }

        // POST: api/v1/customers
        [HttpPost]
        [RequirePermission("Customers.Create")]
        public async Task<ActionResult<Customer>> PostCustomer([FromBody] Customer customer)
        {
            if (User.IsInRole("Salesman"))
            {
                GetIsolationFilters(out int? routeId, out int? salesmanId);
                if (routeId.HasValue) customer.RouteId = routeId.Value;
                if (salesmanId.HasValue) customer.SalesmanId = salesmanId.Value;
            }

            var created = await _customerService.CreateCustomerAsync(customer);
            return CreatedAtAction(nameof(GetCustomer), new { id = created.CustomerId }, created);
        }

        // PUT: api/v1/customers/5
        [HttpPut("{id}")]
        [RequirePermission("Customers.Edit")]
        public async Task<IActionResult> PutCustomer(int id, [FromBody] Customer customer)
        {
            if (id != customer.CustomerId) return BadRequest("ID mismatch.");
            
            var existing = await _customerService.GetCustomerByIdAsync(id);
            if (existing == null) return NotFound();
            if (!IsAuthorizedForCustomer(existing)) return Forbid();

            // Prevent salesman from changing Route/Salesman assignment
            if (User.IsInRole("Salesman"))
            {
                customer.RouteId = existing.RouteId;
                customer.SalesmanId = existing.SalesmanId;
            }

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
        [RequirePermission("Customers.Delete")]
        public async Task<IActionResult> DeleteCustomer(int id)
        {
            var existing = await _customerService.GetCustomerByIdAsync(id);
            if (existing == null) return NotFound();
            if (!IsAuthorizedForCustomer(existing)) return Forbid();

            await _customerService.DeleteCustomerAsync(id);
            return NoContent();
        }

        // POST /api/v1/customers/{id}/payment
        [HttpPost("{id}/payment")]
        public async Task<ActionResult> RecordPayment(int id, [FromBody] PaymentRequest req)
        {
            var existing = await _customerService.GetCustomerByIdAsync(id);
            if (existing == null) return NotFound("Customer not found.");
            if (!IsAuthorizedForCustomer(existing)) return Forbid();

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
