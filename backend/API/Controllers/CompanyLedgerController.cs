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
    [Route("api/v1/CompanyLedger")]
    [Authorize(Roles = "Admin,Manager")] // Salesman has NO access
    public class CompanyLedgerController : ControllerBase
    {
        private readonly ICompanyLedgerService _ledgerService;

        public CompanyLedgerController(ICompanyLedgerService ledgerService)
        {
            _ledgerService = ledgerService;
        }

        [HttpGet("{companyId}")]
        public async Task<IActionResult> GetLedger(int companyId)
        {
            var ledger = await _ledgerService.GetLedgerByCompanyIdAsync(companyId);
            return Ok(ledger);
        }

        [HttpPost]
        public async Task<IActionResult> AddTransaction([FromBody] CompanyLedgerDTO transactionDto)
        {
            if (transactionDto.Amount <= 0)
                return BadRequest(new { Message = "Amount must be greater than zero." });

            if (string.IsNullOrWhiteSpace(transactionDto.Description))
                return BadRequest(new { Message = "Description is required." });

            try
            {
                // Inject the current user ID
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
        public async Task<IActionResult> UpdateTransaction(int id, [FromBody] CompanyLedgerDTO transactionDto)
        {
            if (transactionDto.Amount <= 0)
                return BadRequest(new { Message = "Amount must be greater than zero." });

            if (string.IsNullOrWhiteSpace(transactionDto.Description))
                return BadRequest(new { Message = "Description is required." });

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
