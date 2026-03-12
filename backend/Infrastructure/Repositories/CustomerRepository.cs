using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using DMS.Application.Interfaces;
using DMS.Domain.Entities;
using DMS.Infrastructure.Data;

namespace DMS.Infrastructure.Repositories
{
    public class CustomerRepository : ICustomerRepository
    {
        private readonly ApplicationDbContext _context;

        public CustomerRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<Customer>> GetAllAsync()
        {
            return await _context.Customers
                .Include(c => c.Salesman)
                .OrderBy(c => c.CustomerName)
                .ToListAsync();
        }

        public async Task<Customer?> GetByIdAsync(int id)
        {
            return await _context.Customers.FindAsync(id);
        }

        // Returns customer WITH their full invoice + payment history
        public async Task<Customer?> GetByIdWithHistoryAsync(int id)
        {
            return await _context.Customers
                .Include(c => c.Invoices)
                    .ThenInclude(i => i.Payments)
                .Include(c => c.Invoices)
                    .ThenInclude(i => i.InvoiceItems)
                        .ThenInclude(ii => ii.Product)
                .FirstOrDefaultAsync(c => c.CustomerId == id);
        }

        public async Task<IEnumerable<Customer>> SearchAsync(string query)
        {
            var q = query.ToLower();
            return await _context.Customers
                .Include(c => c.Salesman)
                .Where(c => c.CustomerName.ToLower().Contains(q)
                         || c.Phone.Contains(q)
                         || (c.Area != null && c.Area.ToLower().Contains(q)))
                .OrderBy(c => c.CustomerName)
                .ToListAsync();
        }

        public async Task<Customer> AddAsync(Customer customer)
        {
            _context.Customers.Add(customer);
            return customer;
        }

        public void Update(Customer customer)
        {
            _context.Customers.Update(customer);
        }

        public void Delete(Customer customer)
        {
            _context.Customers.Remove(customer);
        }

        public async Task SaveChangesAsync()
        {
            await _context.SaveChangesAsync();
        }
    }
}
