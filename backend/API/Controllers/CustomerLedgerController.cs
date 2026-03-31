using System;
using System.Collections.Generic;
using System.Security.Claims;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using DMS.Application.DTOs;
using DMS.Application.Interfaces;

namespace DMS.API.Controllers
{
    [ApiController]
    [Route("api/v1/CustomerLedger")]
    [Authorize(Roles = "Admin,Manager,Salesman")]
    public class CustomerLedgerController : ControllerBase
    {
        private readonly ICustomerLedgerService _ledgerService;

        public CustomerLedgerController(ICustomerLedgerService ledgerService)
        {
            _ledgerService = ledgerService;
        }

        [HttpGet("{customerId}")]
        public async Task<IActionResult> GetLedger(int customerId)
        {
            var ledger = await _ledgerService.GetLedgerByCustomerIdAsync(customerId);
            return Ok(ledger);
        }

        [HttpPost]
        public async Task<IActionResult> AddTransaction([FromBody] CustomerLedgerDTO transactionDto)
        {
            if (transactionDto.Amount <= 0)
                return BadRequest(new { Message = "Amount must be greater than zero." });

            if (string.IsNullOrWhiteSpace(transactionDto.Description))
                return BadRequest(new { Message = "Description is required." });

            try
            {
                var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
                transactionDto.CreatedByUserId = userId;

                var result = await _ledgerService.AddTransactionAsync(transactionDto);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(new { Message = ex.Message });
            }
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "Admin,Manager")]
        public async Task<IActionResult> UpdateTransaction(int id, [FromBody] CustomerLedgerDTO transactionDto)
        {
            if (transactionDto.Amount <= 0)
                return BadRequest(new { Message = "Amount must be greater than zero." });

            try
            {
                await _ledgerService.UpdateTransactionAsync(id, transactionDto);
                return Ok(new { Message = "Transaction updated successfully." });
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { Message = ex.Message });
            }
            catch (Exception ex)
            {
                return BadRequest(new { Message = ex.Message });
            }
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin,Manager")]
        public async Task<IActionResult> DeleteTransaction(int id)
        {
            try
            {
                await _ledgerService.DeleteTransactionAsync(id);
                return Ok(new { Message = "Transaction deleted successfully." });
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { Message = ex.Message });
            }
            catch (Exception ex)
            {
                return BadRequest(new { Message = ex.Message });
            }
        }
    }
}
