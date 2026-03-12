using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using DMS.Application.Interfaces;
using DMS.Domain.Entities;
using DMS.Infrastructure.Data;

namespace DMS.Infrastructure.Repositories
{
    public class SalesmanRepository : ISalesmanRepository
    {
        private readonly ApplicationDbContext _context;

        public SalesmanRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<Salesman?> GetByIdAsync(int id)
        {
            return await _context.Salesmen
                .Include(s => s.Customers)
                .Include(s => s.Invoices)
                .FirstOrDefaultAsync(s => s.SalesmanId == id);
        }

        public async Task<IEnumerable<Salesman>> GetAllAsync()
        {
            return await _context.Salesmen
                .Include(s => s.Customers)
                .ToListAsync();
        }

        public async Task<Salesman> AddAsync(Salesman salesman)
        {
            _context.Salesmen.Add(salesman);
            await _context.SaveChangesAsync();
            return salesman;
        }

        public async Task UpdateAsync(Salesman salesman)
        {
            _context.Entry(salesman).State = EntityState.Modified;
            await _context.SaveChangesAsync();
        }

        public async Task DeleteAsync(int id)
        {
            var salesman = await _context.Salesmen.FindAsync(id);
            if (salesman != null)
            {
                _context.Salesmen.Remove(salesman);
                await _context.SaveChangesAsync();
            }
        }
    }
}
