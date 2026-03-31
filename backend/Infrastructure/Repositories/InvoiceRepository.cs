using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using DMS.Application.Interfaces;
using DMS.Domain.Entities;
using DMS.Infrastructure.Data;

namespace DMS.Infrastructure.Repositories
{
    public class InvoiceRepository : IInvoiceRepository
    {
        private readonly ApplicationDbContext _context;

        public InvoiceRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<Invoice>> GetAllAsync(int? routeId = null, int? salesmanId = null)
        {
            var query = _context.Invoices
                .Include(i => i.Customer)
                .Include(i => i.Salesman)
                .Include(i => i.InvoiceItems)
                .ThenInclude(ii => ii.Product)
                .AsQueryable();

            if (routeId.HasValue && routeId > 0) query = query.Where(i => i.RouteId == routeId.Value);
            if (salesmanId.HasValue && salesmanId > 0) query = query.Where(i => i.SalesmanId == salesmanId.Value);

            return await query.OrderByDescending(i => i.InvoiceDate).ToListAsync();
        }

        public async Task<Invoice?> GetByIdAsync(int id)
        {
            return await _context.Invoices
                .Include(i => i.Customer)
                .Include(i => i.Salesman)
                .Include(i => i.InvoiceItems)
                .ThenInclude(ii => ii.Product)
                .FirstOrDefaultAsync(i => i.InvoiceId == id);
        }

        public async Task<Invoice> AddAsync(Invoice invoice)
        {
            await _context.Invoices.AddAsync(invoice);
            return invoice;
        }

        public void Update(Invoice invoice)
        {
            _context.Invoices.Update(invoice);
        }

        public void Delete(Invoice invoice)
        {
            _context.Invoices.Remove(invoice);
        }

        public async Task SaveChangesAsync()
        {
            await _context.SaveChangesAsync();
        }
    }
}
