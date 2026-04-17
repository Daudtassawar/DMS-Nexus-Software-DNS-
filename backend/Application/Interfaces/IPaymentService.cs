using System.Collections.Generic;
using System.Threading.Tasks;
using DMS.Domain.Entities;
using DMS.Application.DTOs;

namespace DMS.Application.Interfaces
{
    public interface IPaymentService
    {
        Task<Payment> RecordPaymentAsync(Payment payment);
        Task<IEnumerable<Payment>> GetPaymentsByInvoiceIdAsync(int invoiceId);
        Task<IEnumerable<Payment>> GetAllPaymentsAsync();
        Task ProcessBulkPaymentAsync(BulkPaymentDTO dto);
    }
}
