using System.Collections.Generic;
using System.Threading.Tasks;
using DMS.Application.DTOs;

namespace DMS.Application.Interfaces
{
    public interface ICustomerLedgerService
    {
        Task<IEnumerable<CustomerLedgerDTO>> GetLedgerByCustomerIdAsync(int customerId);
        Task<CustomerLedgerDTO> AddTransactionAsync(CustomerLedgerDTO transactionDto);
        Task<decimal> GetRunningBalanceAsync(int customerId);
        Task UpdateTransactionAsync(int id, CustomerLedgerDTO transactionDto);
        Task DeleteTransactionAsync(int id);
    }
}
