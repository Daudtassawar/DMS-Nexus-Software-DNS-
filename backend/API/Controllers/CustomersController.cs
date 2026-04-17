using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using DMS.Domain.Entities;
using DMS.Application.Interfaces; // Added
using DMS.Application.Services;   // Restored
using DMS.Infrastructure.Authorization; // Added
using Microsoft.Extensions.Caching.Memory;
using DMS.Application.DTOs;

namespace DMS.API.Controllers
{
    [ApiController]
    [Route("api/v1/[controller]")]
    [Authorize(Roles = "Admin,Manager,Salesman")]
    public class CustomersController : ControllerBase
    {
        private readonly CustomerService _customerService;
        private readonly IMemoryCache _cache;

        public CustomersController(CustomerService customerService, IMemoryCache cache)
        {
            _customerService = customerService;
            _cache = cache;
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

        // GET: api/v1/customers?search=&page=1&pageSize=20
        [HttpGet]
        [RequirePermission("Customers.View")]
        public async Task<ActionResult<PagedResult<Customer>>> GetCustomers(
            [FromQuery] string? search,
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 20)
        {
            GetIsolationFilters(out int? routeId, out int? salesmanId);
            IEnumerable<Customer> results;

            if (!routeId.HasValue && !salesmanId.HasValue && string.IsNullOrEmpty(search))
            {
                results = await _cache.GetOrCreateAsync("customers_all", entry =>
                {
                    entry.AbsoluteExpirationRelativeToNow = System.TimeSpan.FromMinutes(5);
                    return _customerService.GetAllCustomersAsync(null, null, null);
                });
            }
            else
            {
                results = await _customerService.GetAllCustomersAsync(search, routeId, salesmanId);
            }

            var totalCount = results.Count();
            var items = results.Skip((page - 1) * pageSize).Take(pageSize).ToList();

            var result = new PagedResult<Customer>
            {
                Items = items,
                TotalCount = totalCount,
                Page = page,
                PageSize = pageSize,
                TotalPages = (int)Math.Ceiling(totalCount / (double)pageSize)
            };

            return Ok(result);
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
                
                if (!salesmanId.HasValue)
                    return BadRequest(new { message = "Unauthorized: Salesman ID not found in security context." });
                
                customer.SalesmanId = salesmanId.Value;
                
                // If the salesman has a specific route, they can ONLY add customers to that route
                if (routeId.HasValue)
                    customer.RouteId = routeId.Value;
            }

            var created = await _customerService.CreateCustomerAsync(customer);
            _cache.Remove("customers_all");
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
                _cache.Remove("customers_all");
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
            _cache.Remove("customers_all");
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
                _cache.Remove("customers_all");
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
