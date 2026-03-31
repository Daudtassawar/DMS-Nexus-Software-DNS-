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
    [Route("api/v1/[controller]")]
    [Authorize(Roles = "Admin,Manager")] // Salesman has NO access
    public class CompanyController : ControllerBase
    {
        private readonly ICompanyService _companyService;

        public CompanyController(ICompanyService companyService)
        {
            _companyService = companyService;
        }

        [HttpGet]
        public async Task<IActionResult> GetAllCompanies()
        {
            var companies = await _companyService.GetAllCompaniesAsync();
            return Ok(companies);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetCompanyById(int id)
        {
            var company = await _companyService.GetCompanyByIdAsync(id);
            if (company == null) return NotFound(new { Message = "Company not found" });
            return Ok(company);
        }

        [HttpPost]
        public async Task<IActionResult> CreateCompany([FromBody] CompanyDTO companyDto)
        {
            if (string.IsNullOrWhiteSpace(companyDto.Name))
                return BadRequest(new { Message = "Company Name is required" });

            try
            {
                var created = await _companyService.CreateCompanyAsync(companyDto);
                return CreatedAtAction(nameof(GetCompanyById), new { id = created.Id }, created);
            }
            catch (Exception ex)
            {
                return BadRequest(new { Message = ex.Message });
            }
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "Admin")] // Only Admin can edit
        public async Task<IActionResult> UpdateCompany(int id, [FromBody] CompanyDTO companyDto)
        {
            if (string.IsNullOrWhiteSpace(companyDto.Name))
                return BadRequest(new { Message = "Company Name is required" });

            try
            {
                await _companyService.UpdateCompanyAsync(id, companyDto);
                return Ok(new { Message = "Company updated successfully" });
            }
            catch (Exception ex)
            {
                return BadRequest(new { Message = ex.Message });
            }
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")] // Only Admin can delete
        public async Task<IActionResult> DeleteCompany(int id)
        {
            try
            {
                await _companyService.DeleteCompanyAsync(id);
                return Ok(new { Message = "Company deleted successfully" });
            }
            catch (Exception ex)
            {
                return BadRequest(new { Message = ex.Message });
            }
        }
    }
}
