using System.Collections.Generic;
using System.Threading.Tasks;
using DMS.Application.DTOs;

namespace DMS.Application.Interfaces
{
    public interface ICompanyLedgerService
    {
        Task<IEnumerable<CompanyLedgerDTO>> GetLedgerByCompanyIdAsync(int companyId);
        Task<CompanyLedgerDTO> AddTransactionAsync(CompanyLedgerDTO transactionDto);
        Task<decimal> GetRunningBalanceAsync(int companyId);
        Task UpdateTransactionAsync(int id, CompanyLedgerDTO transactionDto);
        Task DeleteTransactionAsync(int id);
    }
}
