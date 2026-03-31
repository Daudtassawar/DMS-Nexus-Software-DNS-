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
        private readonly ICustomerLedgerService _ledgerService;
        private readonly Infrastructure.Data.ApplicationDbContext _dbContext;

        public InvoiceService(IInvoiceRepository invoiceRepository, IStockRepository stockRepository, ICustomerRepository customerRepository, ICustomerLedgerService ledgerService, Infrastructure.Data.ApplicationDbContext dbContext)
        {
            _invoiceRepository = invoiceRepository;
            _stockRepository = stockRepository;
            _customerRepository = customerRepository;
            _ledgerService = ledgerService;
            _dbContext = dbContext;
        }

        public async Task<IEnumerable<Invoice>> GetAllInvoicesAsync(int? routeId = null, int? salesmanId = null)
            => await _invoiceRepository.GetAllAsync(routeId, salesmanId);

        public async Task<Invoice?> GetInvoiceByIdAsync(int id)
            => await _invoiceRepository.GetByIdAsync(id);

        public async Task<Invoice> CreateInvoiceAsync(Invoice invoice)
        {
            using var transaction = await _dbContext.Database.BeginTransactionAsync();
            try
            {
                // 1. Set invoice date and number
                invoice.InvoiceDate = DateTime.UtcNow;
                invoice.InvoiceNumber = $"INV-{DateTime.UtcNow:yyyyMMdd}-{new Random().Next(1000, 9999)}";
                
                if (string.IsNullOrEmpty(invoice.InvoiceType))
                    invoice.InvoiceType = "Spot";

                // Status logic based on PaidAmount
                // Handled after total calculation to ensure consistency
                decimal calculatedTotal = 0;

                foreach (var item in invoice.InvoiceItems)
                {
                    // 2. Validate stock (Only for Spot)
                    var productStock = (await _stockRepository.GetByProductIdAsync(item.ProductId)).ToList();
                    int totalAvailable = productStock.Sum(s => s.Quantity);

                    if (invoice.InvoiceType == "Spot" && totalAvailable < item.Quantity)
                        throw new InvalidOperationException(
                            $"Insufficient stock for Product ID {item.ProductId}. Available: {totalAvailable}, Requested: {item.Quantity}");

                    item.TotalPrice = item.Quantity * item.UnitPrice;
                    calculatedTotal += item.TotalPrice;

                    // 3. Deduct stock — FIFO across warehouses (Only for Spot)
                    if (invoice.InvoiceType == "Spot")
                    {
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
                                TransactionType = $"Out (Spot Invoice) - {stock.WarehouseLocation}",
                                Quantity = deduct,
                                Date = DateTime.UtcNow
                            });
                        }
                    }
                }

                // 5. Calculate totals
                invoice.TotalAmount = calculatedTotal;
                invoice.NetAmount = Math.Max(0, invoice.TotalAmount - invoice.Discount);
                
                // Calculate Status & Balances
                RecalculateStatus(invoice);

                // 6. Update customer balance and returnables
                var customer = await _customerRepository.GetByIdAsync(invoice.CustomerId);
                if (customer != null)
                {
                    if (invoice.InvoiceType != "Spot")
                    {
                        customer.Balance += invoice.RemainingAmount;
                    }
                    
                    // Track empties
                    foreach(var item in invoice.InvoiceItems)
                    {
                        customer.EmptyCratesBalance += (item.Quantity - item.ReturnedQuantity);
                    }

                    _customerRepository.Update(customer);

                    // Auto-assign salesman from customer if not set
                    if (customer.SalesmanId.HasValue && (invoice.SalesmanId == null || invoice.SalesmanId <= 0))
                        invoice.SalesmanId = customer.SalesmanId.Value;

                    // 8. Add Ledger Entry (Debit)
                    await _ledgerService.AddTransactionAsync(new Application.DTOs.CustomerLedgerDTO
                    {
                        CustomerId = invoice.CustomerId,
                        TransactionType = TransactionType.Debit,
                        Amount = invoice.NetAmount,
                        Description = $"Invoice Created: {invoice.InvoiceNumber}",
                        Reference = invoice.InvoiceNumber,
                        Date = invoice.InvoiceDate
                    });
                }
                else
                {
                     throw new InvalidOperationException($"Customer with ID {invoice.CustomerId} not found.");
                }

                // 7. Save everything in one transaction
                await _invoiceRepository.AddAsync(invoice);
                await _invoiceRepository.SaveChangesAsync();

                await transaction.CommitAsync();
                return invoice;
            }
            catch (Exception)
            {
                await transaction.RollbackAsync();
                throw;
            }
        }

        public async Task UpdatePaymentStatusAsync(int id, string newStatus)
        {
            var validStatuses = new[] { "Unpaid", "Paid", "Partial", "Overdue", "Cancelled" };
            if (!Array.Exists(validStatuses, s => s.Equals(newStatus, StringComparison.OrdinalIgnoreCase)))
                throw new InvalidOperationException($"Invalid payment status: '{newStatus}'");

            var invoice = await _invoiceRepository.GetByIdAsync(id);
            if (invoice == null) throw new InvalidOperationException("Invoice not found");

            var oldStatus = invoice.PaymentStatus;
            invoice.PaymentStatus = newStatus;
            _invoiceRepository.Update(invoice);

            // Transition TO Paid
            if (newStatus == "Paid" && oldStatus != "Paid")
            {
                var customer = await _customerRepository.GetByIdAsync(invoice.CustomerId);
                if (customer != null)
                {
                    customer.Balance = Math.Max(0, customer.Balance - invoice.NetAmount);
                    _customerRepository.Update(customer);
                    await _customerRepository.SaveChangesAsync();
                }

                if (invoice.InvoiceType == "Delivery")
                {
                    foreach (var item in invoice.InvoiceItems)
                    {
                        var productStock = (await _stockRepository.GetByProductIdAsync(item.ProductId)).ToList();
                        int remaining = item.Quantity;
                        
                        // Ensure enough stock exists before delivery
                        int totalAvailable = productStock.Sum(s => s.Quantity);
                        if (totalAvailable < remaining)
                            throw new InvalidOperationException($"Insufficient stock to deliver Product ID {item.ProductId}. Available: {totalAvailable}, Requested: {remaining}");

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
                                TransactionType = $"Out (Status Update: {newStatus}) - {stock.WarehouseLocation}",
                                Quantity = deduct,
                                Date = DateTime.UtcNow
                            });
                        }
                    }
                }
            }
            // Transition FROM Paid
            else if (oldStatus == "Paid" && newStatus != "Paid")
            {
                var customer = await _customerRepository.GetByIdAsync(invoice.CustomerId);
                if (customer != null)
                {
                    customer.Balance += invoice.NetAmount;
                    _customerRepository.Update(customer);
                    await _customerRepository.SaveChangesAsync();
                }

                if (invoice.InvoiceType == "Delivery")
                {
                    foreach (var item in invoice.InvoiceItems)
                    {
                        var productStock = await _stockRepository.GetByProductIdAsync(item.ProductId);
                        var targetStock = productStock.FirstOrDefault();
                        if (targetStock != null)
                        {
                            targetStock.Quantity += item.Quantity;
                            targetStock.LastUpdated = DateTime.UtcNow;
                            _stockRepository.Update(targetStock);
                        }

                        await _stockRepository.AddTransactionAsync(new StockTransaction
                        {
                            ProductId = item.ProductId,
                            TransactionType = $"In (Status Revert: {newStatus}) - {targetStock?.WarehouseLocation ?? "Default"}",
                            Quantity = item.Quantity,
                            Date = DateTime.UtcNow
                        });
                    }
                }
            }

            await _invoiceRepository.SaveChangesAsync();
        }

        public async Task<Invoice?> UpdateInvoiceAsync(int id, Invoice updatedInvoice)
        {
            var existing = await _invoiceRepository.GetByIdAsync(id);
            if (existing == null) throw new InvalidOperationException("Invoice not found");

            using var transaction = await _dbContext.Database.BeginTransactionAsync();
            try
            {
                // 1. Revert Old Stock Deductions
                bool wasSpot = existing.InvoiceType == "Spot";
                bool wasPaidDelivery = existing.InvoiceType == "Delivery" && existing.PaymentStatus == "Paid";
                if (wasSpot || wasPaidDelivery)
                {
                    foreach (var item in existing.InvoiceItems)
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
                            TransactionType = $"In (Update Revert) - {targetStock?.WarehouseLocation ?? "Default"}",
                            Quantity = item.Quantity,
                            Date = DateTime.UtcNow
                        });
                    }
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

                    // 2.5 Add Ledger Entry (Credit/Adjustment) for Old Invoice Version
                    await _ledgerService.AddTransactionAsync(new Application.DTOs.CustomerLedgerDTO
                    {
                        CustomerId = existing.CustomerId,
                        TransactionType = TransactionType.Credit,
                        Amount = existing.NetAmount,
                        Description = $"Invoice Updated (Old Version): {existing.InvoiceNumber}",
                        Reference = existing.InvoiceNumber,
                        Date = DateTime.UtcNow
                    });
                }

                // 3. Clear existing items and update basic info
                existing.CustomerId = updatedInvoice.CustomerId;
                existing.SalesmanId = updatedInvoice.SalesmanId;
                existing.Discount = updatedInvoice.Discount;
                existing.InvoiceItems.Clear();

                decimal calculatedTotal = 0;

                // 4. Apply New Items & Stock Deductions
                bool deductStock = existing.InvoiceType == "Spot" || (existing.InvoiceType == "Delivery" && existing.PaymentStatus == "Paid");

                foreach (var item in updatedInvoice.InvoiceItems)
                {
                    var productStock = (await _stockRepository.GetByProductIdAsync(item.ProductId)).ToList();
                    int totalAvailable = productStock.Sum(s => s.Quantity);

                    if (deductStock && totalAvailable < item.Quantity)
                        throw new InvalidOperationException($"Insufficient stock for Product ID {item.ProductId}. Available: {totalAvailable}, Requested: {item.Quantity}");

                    item.TotalPrice = item.Quantity * item.UnitPrice;
                    calculatedTotal += item.TotalPrice;

                    // FIFO deduction
                    if (deductStock)
                    {
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
                    }
                    existing.InvoiceItems.Add(item);
                }

                // 5. Update Totals
                existing.TotalAmount = calculatedTotal;
                existing.NetAmount = Math.Max(0, existing.TotalAmount - existing.Discount);
                existing.PaidAmount = updatedInvoice.PaidAmount; // Preserve or update PaidAmount
                
                RecalculateStatus(existing);

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

                    // 6.5 Add Ledger Entry (Debit/Adjustment) for New Invoice Version
                    await _ledgerService.AddTransactionAsync(new Application.DTOs.CustomerLedgerDTO
                    {
                        CustomerId = existing.CustomerId,
                        TransactionType = TransactionType.Debit,
                        Amount = existing.NetAmount,
                        Description = $"Invoice Updated (New Version): {existing.InvoiceNumber}",
                        Reference = existing.InvoiceNumber,
                        Date = DateTime.UtcNow
                    });
                }

                _invoiceRepository.Update(existing);
                await _invoiceRepository.SaveChangesAsync();

                await transaction.CommitAsync();
                return existing;
            }
            catch (Exception)
            {
                await transaction.RollbackAsync();
                throw;
            }
        }

        public async Task<bool> DeleteInvoiceAsync(int id)
        {
            var invoice = await _invoiceRepository.GetByIdAsync(id);
            if (invoice == null) return false;

            // 1. Restore Stock
            bool wasSpot = invoice.InvoiceType == "Spot";
            bool wasPaidDelivery = invoice.InvoiceType == "Delivery" && invoice.PaymentStatus == "Paid";
            if (wasSpot || wasPaidDelivery)
            {
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

                // 3. Add Ledger Entry (Credit/Adjustment) for Deletion
                await _ledgerService.AddTransactionAsync(new Application.DTOs.CustomerLedgerDTO
                {
                    CustomerId = invoice.CustomerId,
                    TransactionType = TransactionType.Credit,
                    Amount = invoice.NetAmount,
                    Description = $"Invoice Deleted: {invoice.InvoiceNumber}",
                    Reference = invoice.InvoiceNumber,
                    Date = DateTime.UtcNow
                });
            }

            _invoiceRepository.Delete(invoice);
            await _invoiceRepository.SaveChangesAsync();
            return true;
        }
        private void RecalculateStatus(Invoice invoice)
        {
            invoice.RemainingAmount = Math.Max(0, invoice.NetAmount - invoice.PaidAmount);
            
            if (invoice.PaidAmount <= 0) 
                invoice.PaymentStatus = "Unpaid";
            else if (invoice.PaidAmount < invoice.NetAmount) 
                invoice.PaymentStatus = "Partial";
            else 
                invoice.PaymentStatus = "Paid";
        }
    }
}
