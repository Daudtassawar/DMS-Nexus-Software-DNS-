using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using DMS.Application.Interfaces;
using DMS.Domain.Entities;

namespace DMS.Application.Services
{
    public class InvoiceService
    {
        private readonly IInvoiceRepository _invoiceRepository;
        private readonly IStockRepository _stockRepository;
        private readonly ICustomerRepository _customerRepository;

        public InvoiceService(IInvoiceRepository invoiceRepository, IStockRepository stockRepository, ICustomerRepository customerRepository)
        {
            _invoiceRepository = invoiceRepository;
            _stockRepository = stockRepository;
            _customerRepository = customerRepository;
        }

        public async Task<IEnumerable<Invoice>> GetAllInvoicesAsync()
            => await _invoiceRepository.GetAllAsync();

        public async Task<Invoice?> GetInvoiceByIdAsync(int id)
            => await _invoiceRepository.GetByIdAsync(id);

        public async Task<Invoice> CreateInvoiceAsync(Invoice invoice)
        {
            // 1. Set invoice date and number
            invoice.InvoiceDate = DateTime.UtcNow;
            invoice.InvoiceNumber = $"INV-{DateTime.UtcNow:yyyyMMdd}-{new Random().Next(1000, 9999)}";
            invoice.PaymentStatus = "Pending";

            decimal calculatedTotal = 0;

            foreach (var item in invoice.InvoiceItems)
            {
                // 2. Validate stock
                var productStock = (await _stockRepository.GetByProductIdAsync(item.ProductId)).ToList();
                int totalAvailable = productStock.Sum(s => s.Quantity);

                if (totalAvailable < item.Quantity)
                    throw new InvalidOperationException(
                        $"Insufficient stock for Product ID {item.ProductId}. Available: {totalAvailable}, Requested: {item.Quantity}");

                item.TotalPrice = item.Quantity * item.UnitPrice;
                calculatedTotal += item.TotalPrice;

                // 3. Deduct stock — FIFO across warehouses
                int remaining = item.Quantity;
                foreach (var stock in productStock.Where(s => s.Quantity > 0))
                {
                    if (remaining <= 0) break;
                    int deduct = Math.Min(stock.Quantity, remaining);
                    stock.Quantity -= deduct;
                    stock.LastUpdated = DateTime.UtcNow;
                    _stockRepository.Update(stock);
                    remaining -= deduct;

                    // 4. Log stock transaction
                    await _stockRepository.AddTransactionAsync(new StockTransaction
                    {
                        ProductId = item.ProductId,
                        TransactionType = $"Out (Invoice) - {stock.WarehouseLocation}",
                        Quantity = deduct,
                        Date = DateTime.UtcNow
                    });
                }
            }

            // 5. Calculate totals
            invoice.TotalAmount = calculatedTotal;
            invoice.NetAmount = Math.Max(0, invoice.TotalAmount - invoice.Discount);

            // 6. Update customer balance and returnables
            var customer = await _customerRepository.GetByIdAsync(invoice.CustomerId);
            if (customer != null)
            {
                customer.Balance += invoice.NetAmount;
                
                // Track empties (assuming 1 item = 1 bottle/crate for simplicity in this logic)
                foreach(var item in invoice.InvoiceItems)
                {
                    customer.EmptyCratesBalance += (item.Quantity - item.ReturnedQuantity);
                }

                _customerRepository.Update(customer);

                // Auto-assign salesman from customer if not set
                if (customer.SalesmanId.HasValue && (invoice.SalesmanId == null || invoice.SalesmanId <= 0))
                    invoice.SalesmanId = customer.SalesmanId.Value;
            }

            // 7. Save everything in one transaction — all share the same DbContext (scoped)
            await _invoiceRepository.AddAsync(invoice);
            await _invoiceRepository.SaveChangesAsync();  // single commit includes stock & customer changes

            return invoice;
        }

        public async Task UpdatePaymentStatusAsync(int id, string newStatus)
        {
            var validStatuses = new[] { "Pending", "Paid", "Partial", "Overdue", "Cancelled" };
            if (!Array.Exists(validStatuses, s => s.Equals(newStatus, StringComparison.OrdinalIgnoreCase)))
                throw new InvalidOperationException($"Invalid payment status: '{newStatus}'");

            var invoice = await _invoiceRepository.GetByIdAsync(id);
            if (invoice == null) throw new InvalidOperationException("Invoice not found");

            var oldStatus = invoice.PaymentStatus;
            invoice.PaymentStatus = newStatus;
            _invoiceRepository.Update(invoice);

            // If marking as Paid, clear customer balance for this invoice
            if (newStatus == "Paid" && oldStatus != "Paid")
            {
                var customer = await _customerRepository.GetByIdAsync(invoice.CustomerId);
                if (customer != null)
                {
                    customer.Balance = Math.Max(0, customer.Balance - invoice.NetAmount);
                    _customerRepository.Update(customer);
                    await _customerRepository.SaveChangesAsync();
                }
            }

            await _invoiceRepository.SaveChangesAsync();
        }

        public async Task<Invoice?> UpdateInvoiceAsync(int id, Invoice updatedInvoice)
        {
            var existing = await _invoiceRepository.GetByIdAsync(id);
            if (existing == null) throw new InvalidOperationException("Invoice not found");

            // 1. Revert Old Stock Deductions
            foreach (var item in existing.InvoiceItems)
            {
                var stock = await _stockRepository.GetByProductIdAsync(item.ProductId);
                // For simplicity, just add back to the first available batch if not specified
                var targetStock = stock.FirstOrDefault();
                if (targetStock != null)
                {
                    targetStock.Quantity += item.Quantity;
                    targetStock.LastUpdated = DateTime.UtcNow;
                    _stockRepository.Update(targetStock);
                }

                await _stockRepository.AddTransactionAsync(new StockTransaction
                {
                    ProductId = item.ProductId,
                    TransactionType = $"In (Update Revert) - {targetStock?.WarehouseLocation ?? "Default"}",
                    Quantity = item.Quantity,
                    Date = DateTime.UtcNow
                });
            }

            // 2. Revert Old Customer Balance and Returnables Change
            var oldCustomer = await _customerRepository.GetByIdAsync(existing.CustomerId);
            if (oldCustomer != null)
            {
                if (existing.PaymentStatus != "Paid")
                {
                    oldCustomer.Balance = Math.Max(0, oldCustomer.Balance - existing.NetAmount);
                }
                
                // Revert empties
                foreach(var item in existing.InvoiceItems)
                {
                    oldCustomer.EmptyCratesBalance -= (item.Quantity - item.ReturnedQuantity);
                }
                _customerRepository.Update(oldCustomer);
            }

            // 3. Clear existing items and update basic info
            existing.CustomerId = updatedInvoice.CustomerId;
            existing.SalesmanId = updatedInvoice.SalesmanId;
            existing.Discount = updatedInvoice.Discount;
            existing.InvoiceItems.Clear();

            decimal calculatedTotal = 0;

            // 4. Apply New Items & Stock Deductions
            foreach (var item in updatedInvoice.InvoiceItems)
            {
                var productStock = (await _stockRepository.GetByProductIdAsync(item.ProductId)).ToList();
                int totalAvailable = productStock.Sum(s => s.Quantity);

                if (totalAvailable < item.Quantity)
                    throw new InvalidOperationException($"Insufficient stock for Product ID {item.ProductId}. Available: {totalAvailable}, Requested: {item.Quantity}");

                item.TotalPrice = item.Quantity * item.UnitPrice;
                calculatedTotal += item.TotalPrice;

                // FIFO deduction
                int remaining = item.Quantity;
                foreach (var stock in productStock.Where(s => s.Quantity > 0))
                {
                    if (remaining <= 0) break;
                    int deduct = Math.Min(stock.Quantity, remaining);
                    stock.Quantity -= deduct;
                    stock.LastUpdated = DateTime.UtcNow;
                    _stockRepository.Update(stock);
                    remaining -= deduct;

                    await _stockRepository.AddTransactionAsync(new StockTransaction
                    {
                        ProductId = item.ProductId,
                        TransactionType = $"Out (Update) - {stock.WarehouseLocation}",
                        Quantity = deduct,
                        Date = DateTime.UtcNow
                    });
                }
                existing.InvoiceItems.Add(item);
            }

            // 5. Update Totals
            existing.TotalAmount = calculatedTotal;
            existing.NetAmount = Math.Max(0, existing.TotalAmount - existing.Discount);

            // 6. Apply New Customer Balance Update and Returnables
            var newCustomer = await _customerRepository.GetByIdAsync(existing.CustomerId);
            if (newCustomer != null)
            {
                if (existing.PaymentStatus != "Paid")
                {
                    newCustomer.Balance += existing.NetAmount;
                }
                
                // Apply new empties
                foreach(var item in existing.InvoiceItems)
                {
                    newCustomer.EmptyCratesBalance += (item.Quantity - item.ReturnedQuantity);
                }
                _customerRepository.Update(newCustomer);
            }

            _invoiceRepository.Update(existing);
            await _invoiceRepository.SaveChangesAsync();

            return existing;
        }

        public async Task<bool> DeleteInvoiceAsync(int id)
        {
            var invoice = await _invoiceRepository.GetByIdAsync(id);
            if (invoice == null) return false;

            // 1. Restore Stock
            foreach (var item in invoice.InvoiceItems)
            {
                var stock = await _stockRepository.GetByProductIdAsync(item.ProductId);
                var targetStock = stock.FirstOrDefault();
                if (targetStock != null)
                {
                    targetStock.Quantity += item.Quantity;
                    targetStock.LastUpdated = DateTime.UtcNow;
                    _stockRepository.Update(targetStock);
                }

                await _stockRepository.AddTransactionAsync(new StockTransaction
                {
                    ProductId = item.ProductId,
                    TransactionType = $"In (Delete Restore) - {targetStock?.WarehouseLocation ?? "Default"}",
                    Quantity = item.Quantity,
                    Date = DateTime.UtcNow
                });
            }

            // 2. Restore customer balance and returnables
            var customer = await _customerRepository.GetByIdAsync(invoice.CustomerId);
            if (customer != null)
            {
                if (invoice.PaymentStatus != "Paid")
                {
                    customer.Balance = Math.Max(0, customer.Balance - invoice.NetAmount);
                }
                
                // Revert empties
                foreach(var item in invoice.InvoiceItems)
                {
                    customer.EmptyCratesBalance -= (item.Quantity - item.ReturnedQuantity);
                }
                _customerRepository.Update(customer);
            }

            _invoiceRepository.Delete(invoice);
            await _invoiceRepository.SaveChangesAsync();
            return true;
        }
    }
}
