using System.Collections.Generic;
using System.Threading.Tasks;
using DMS.Domain.Entities;

namespace DMS.Application.Interfaces
{
    public interface ICustomerRepository
    {
        Task<IEnumerable<Customer>> GetAllAsync();
        Task<Customer?> GetByIdAsync(int id);
        Task<Customer?> GetByIdWithHistoryAsync(int id);      // includes invoices + payments
        Task<IEnumerable<Customer>> SearchAsync(string query);
        Task<Customer> AddAsync(Customer customer);
        void Update(Customer customer);
        void Delete(Customer customer);
        Task SaveChangesAsync();
    }
}
