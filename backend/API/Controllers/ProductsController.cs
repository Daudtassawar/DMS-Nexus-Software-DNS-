using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using DMS.Application.Services;
using DMS.Application.Interfaces;
using DMS.Domain.Entities;
using DMS.Infrastructure.Authorization;

namespace DMS.API.Controllers
{
    [ApiController]
    [Route("api/v1/[controller]")]
    [Authorize]
    public class ProductsController : ControllerBase
    {
        private readonly ProductService _productService;
        private readonly IAuditLogService _auditLogService;

        public ProductsController(ProductService productService, IAuditLogService auditLogService)
        {
            _productService = productService;
            _auditLogService = auditLogService;
        }

        // GET /api/v1/products?search=&category=
        [HttpGet]
        [RequirePermission("Products.View")]
        public async Task<ActionResult<IEnumerable<Product>>> Get(
            [FromQuery] string? search,
            [FromQuery] string? category)
        {
            if (!string.IsNullOrEmpty(search) || (!string.IsNullOrEmpty(category) && category != "All"))
                return Ok(await _productService.SearchProductsAsync(search, category));

            return Ok(await _productService.GetAllProductsAsync());
        }

        // GET /api/v1/products/{id}
        [HttpGet("{id}")]
        [RequirePermission("Products.View")]
        public async Task<ActionResult<Product>> Get(int id)
        {
            var product = await _productService.GetProductByIdAsync(id);
            if (product == null) return NotFound();
            return Ok(product);
        }

        // POST /api/v1/products
        [HttpPost]
        [Authorize(Roles = "Admin,Manager")]
        [RequirePermission("Products.Create")]
        public async Task<ActionResult<Product>> Post([FromBody] Product product)
        {
            var (success, message, created) = await _productService.CreateProductAsync(product);
            if (!success) return Conflict(new { error = message });

            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? "unknown";
            var userName = User.FindFirstValue(ClaimTypes.Name) ?? userId;
            await _auditLogService.LogActionAsync(userId, userName, "Create Product", "Products",
                $"Created product '{product.ProductName}'", created!.ProductId.ToString(),
                HttpContext.Connection.RemoteIpAddress?.ToString());

            return CreatedAtAction(nameof(Get), new { id = created!.ProductId }, created);
        }

        // PUT /api/v1/products/{id}
        [HttpPut("{id}")]
        [Authorize(Roles = "Admin,Manager")]
        [RequirePermission("Products.Edit")]
        public async Task<ActionResult> Put(int id, [FromBody] Product product)
        {
            if (id != product.ProductId) return BadRequest();
            var (success, message) = await _productService.UpdateProductAsync(product);
            if (!success) return Conflict(new { error = message });

            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? "unknown";
            var userName = User.FindFirstValue(ClaimTypes.Name) ?? userId;
            await _auditLogService.LogActionAsync(userId, userName, "Edit Product", "Products",
                $"Updated product '{product.ProductName}'", id.ToString(),
                HttpContext.Connection.RemoteIpAddress?.ToString());

            return NoContent();
        }

        // DELETE /api/v1/products/{id}
        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin,Manager")]
        [RequirePermission("Products.Delete")]
        public async Task<ActionResult> Delete(int id)
        {
            await _productService.DeleteProductAsync(id);

            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? "unknown";
            var userName = User.FindFirstValue(ClaimTypes.Name) ?? userId;
            await _auditLogService.LogActionAsync(userId, userName, "Delete Product", "Products",
                $"Deleted product ID {id}", id.ToString(),
                HttpContext.Connection.RemoteIpAddress?.ToString());

            return NoContent();
        }

        // POST /api/v1/products/{id}/image — upload product image
        [HttpPost("{id}/image")]
        [Authorize(Roles = "Admin,Manager")]
        public async Task<ActionResult> UploadImage(int id, IFormFile file)
        {
            var product = await _productService.GetProductByIdAsync(id);
            if (product == null) return NotFound();

            if (file == null || file.Length == 0)
                return BadRequest(new { error = "No file provided." });

            var allowedTypes = new[] { "image/jpeg", "image/png", "image/webp", "image/gif" };
            if (!allowedTypes.Contains(file.ContentType))
                return BadRequest(new { error = "Only image files are accepted." });

            var uploadsFolder = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "images", "products");
            Directory.CreateDirectory(uploadsFolder);

            var ext = Path.GetExtension(file.FileName);
            var fileName = $"product_{id}_{Guid.NewGuid():N}{ext}";
            var filePath = Path.Combine(uploadsFolder, fileName);

            using (var stream = new FileStream(filePath, FileMode.Create))
                await file.CopyToAsync(stream);

            if (!string.IsNullOrEmpty(product.ImagePath))
            {
                var oldFile = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", product.ImagePath.TrimStart('/'));
                if (System.IO.File.Exists(oldFile))
                    System.IO.File.Delete(oldFile);
            }

            product.ImagePath = $"/images/products/{fileName}";
            var (success, _) = await _productService.UpdateProductAsync(product);
            if (!success) return StatusCode(500);

            return Ok(new { imagePath = product.ImagePath });
        }

        // POST /api/v1/products/bulk-import — Excel/CSV upload
        [HttpPost("bulk-import")]
        [Authorize(Roles = "Admin,Manager")]
        public async Task<ActionResult> BulkImport([FromForm] IFormFile file)
        {
            if (file == null || file.Length == 0)
                return BadRequest(new { error = "No file provided." });

            var products = new List<Product>();

            using var reader = new StreamReader(file.OpenReadStream());
            var header = await reader.ReadLineAsync(); // skip header

            while (!reader.EndOfStream)
            {
                var line = await reader.ReadLineAsync();
                if (string.IsNullOrWhiteSpace(line)) continue;

                var cols = line.Split(',');
                if (cols.Length < 6) continue;

                try
                {
                    products.Add(new Product
                    {
                        ProductName = cols[0].Trim(),
                        Brand = cols.Length > 1 && !string.IsNullOrWhiteSpace(cols[1]) ? cols[1].Trim() : null,
                        Category = cols.Length > 2 && !string.IsNullOrWhiteSpace(cols[2]) ? cols[2].Trim() : null,
                        Barcode = cols.Length > 3 && !string.IsNullOrWhiteSpace(cols[3]) ? cols[3].Trim() : null,
                        PurchasePrice = decimal.TryParse(cols[4].Trim(), out var pp) ? pp : 0,
                        SalePrice = decimal.TryParse(cols[5].Trim(), out var sp) ? sp : 0,
                        Unit = cols.Length > 6 ? cols[6].Trim() : "Pcs",
                        MinStockLevel = cols.Length > 7 && int.TryParse(cols[7].Trim(), out var ms) ? ms : 0,
                    });
                }
                catch { /* skip malformed rows */ }
            }

            var (imported, skipped, errors) = await _productService.BulkImportAsync(products);

            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? "unknown";
            var userName = User.FindFirstValue(ClaimTypes.Name) ?? userId;
            await _auditLogService.LogActionAsync(userId, userName, "Bulk Import Products", "Products",
                $"Imported {imported} products, skipped {skipped}", null,
                HttpContext.Connection.RemoteIpAddress?.ToString());

            return Ok(new { imported, skipped, errors });
        }

        // GET /api/v1/products/categories
        [HttpGet("categories")]
        public async Task<ActionResult<IEnumerable<string>>> GetCategories()
        {
            var all = await _productService.GetAllProductsAsync();
            var cats = all
                .Where(p => !string.IsNullOrEmpty(p.Category))
                .Select(p => p.Category!)
                .Distinct()
                .OrderBy(c => c)
                .ToList();
            return Ok(cats);
        }
    }
}
