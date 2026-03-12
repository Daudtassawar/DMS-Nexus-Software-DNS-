using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.EntityFrameworkCore;
using DMS.Domain.Entities;

namespace DMS.Infrastructure.Data
{
    public static class RoleSeeder
    {
        public static async Task SeedRolesAndAdminAsync(IServiceProvider serviceProvider)
        {
            var roleManager = serviceProvider.GetRequiredService<RoleManager<AppRole>>();
            var userManager = serviceProvider.GetRequiredService<UserManager<AppUser>>();
            var dbContext = serviceProvider.GetRequiredService<ApplicationDbContext>();

            // 1. Seed Permissions
            var permissions = new List<Permission>
            {
                // Dashboard
                new() { Id = "Dashboard.View", Name = "View Dashboard", Module = "Dashboard", Description = "Allows viewing the main dashboard" },
                
                // Products
                new() { Id = "Products.View", Name = "View Products", Module = "Products", Description = "Allows viewing products list" },
                new() { Id = "Products.Create", Name = "Create Products", Module = "Products", Description = "Allows adding new products" },
                new() { Id = "Products.Edit", Name = "Edit Products", Module = "Products", Description = "Allows modifying existing products" },
                new() { Id = "Products.Delete", Name = "Delete Products", Module = "Products", Description = "Allows removing products" },

                // Customers
                new() { Id = "Customers.View", Name = "View Customers", Module = "Customers", Description = "Allows viewing customers list" },
                new() { Id = "Customers.Create", Name = "Create Customers", Module = "Customers", Description = "Allows adding new customers" },
                new() { Id = "Customers.Edit", Name = "Edit Customers", Module = "Customers", Description = "Allows modifying existing customers" },
                new() { Id = "Customers.Delete", Name = "Delete Customers", Module = "Customers", Description = "Allows removing customers" },

                // Invoices
                new() { Id = "Invoices.View", Name = "View Invoices", Module = "Invoices", Description = "Allows viewing invoices" },
                new() { Id = "Invoices.Create", Name = "Create Invoices", Module = "Invoices", Description = "Allows creating new invoices" },
                new() { Id = "Invoices.Print", Name = "Print Invoices", Module = "Invoices", Description = "Allows printing/exporting invoices" },

                // Stock
                new() { Id = "Stock.View", Name = "View Stock", Module = "Stock", Description = "Allows viewing inventory levels" },
                new() { Id = "Stock.Update", Name = "Update Stock", Module = "Stock", Description = "Allows adding or adjusting stock" },

                // Reports
                new() { Id = "Reports.View", Name = "View Reports", Module = "Reports", Description = "Allows accessing reports module" },

                // Users
                new() { Id = "Users.View", Name = "View Users", Module = "Users", Description = "Allows viewing system users" },
                new() { Id = "Users.Create", Name = "Create Users", Module = "Users", Description = "Allows creating new users" },
                new() { Id = "Users.Edit", Name = "Edit Users", Module = "Users", Description = "Allows modifying existing users" },
                new() { Id = "Users.Delete", Name = "Delete Users", Module = "Users", Description = "Allows removing users" },

                // Salesmen
                new() { Id = "Salesmen.View", Name = "View Salesmen", Module = "Salesmen", Description = "Allows viewing salesmen team" },

                // Finance & Operations
                new() { Id = "Finance.View", Name = "View Finance", Module = "Finance", Description = "Allows viewing financial daily reports" },
                new() { Id = "Finance.Update", Name = "Update Finance", Module = "Finance", Description = "Allows recording expenses" },
                new() { Id = "Operations.View", Name = "View Operations", Module = "Operations", Description = "Allows viewing daily activities" },
                new() { Id = "Operations.Update", Name = "Update Operations", Module = "Operations", Description = "Allows logging activities" },

                // Distributors
                new() { Id = "Distributors.View", Name = "View Distributors", Module = "Distributors", Description = "Allows viewing distributors list" },
                new() { Id = "Distributors.Create", Name = "Create Distributors", Module = "Distributors", Description = "Allows adding distributors" },
                new() { Id = "Distributors.Edit", Name = "Edit Distributors", Module = "Distributors", Description = "Allows modifying distributors" },
                new() { Id = "Distributors.Delete", Name = "Delete Distributors", Module = "Distributors", Description = "Allows removing distributors" }
            };

            var existingPermissions = await dbContext.Permissions.Select(p => p.Id).ToListAsync();
            var newPermissions = permissions.Where(p => !existingPermissions.Contains(p.Id)).ToList();
            
            if (newPermissions.Any())
            {
                await dbContext.Permissions.AddRangeAsync(newPermissions);
                await dbContext.SaveChangesAsync();
            }

            // 2. Seed Roles
            var roles = new List<AppRole>
            {
                new() { Name = "Admin", Description = "Full system access" },
                new() { Name = "Manager", Description = "Operational management access" },
                new() { Name = "Salesman", Description = "Limited field access" }
            };

            foreach (var role in roles)
            {
                if (!await roleManager.RoleExistsAsync(role.Name!))
                    await roleManager.CreateAsync(role);
            }

            // 3. Seed Role Permissions Defaults
            var rolePermissionMaps = new Dictionary<string, List<string>>
            {
                { "Admin", permissions.Select(p => p.Id).ToList() }, // Admin gets everything
                { "Manager", new List<string> { 
                    "Products.View", "Products.Edit", "Customers.View", "Stock.View", "Reports.View", "Invoices.View", 
                    "Finance.View", "Finance.Update", "Operations.View", "Operations.Update",
                    "Distributors.View", "Distributors.Create", "Distributors.Edit", "Distributors.Delete"
                } },
                { "Salesman", new List<string> { "Invoices.Create", "Invoices.View", "Customers.View" } }
            };

            foreach (var mapping in rolePermissionMaps)
            {
                var role = await roleManager.FindByNameAsync(mapping.Key);
                if (role != null)
                {
                    var existingRolePerms = await dbContext.RolePermissions
                        .Where(rp => rp.RoleId == role.Id)
                        .Select(rp => rp.PermissionId)
                        .ToListAsync();

                    var permsToAdd = mapping.Value.Where(pId => !existingRolePerms.Contains(pId)).ToList();
                    
                    foreach (var pId in permsToAdd)
                    {
                        dbContext.RolePermissions.Add(new RolePermission { RoleId = role.Id, PermissionId = pId });
                    }
                }
            }
            await dbContext.SaveChangesAsync();

            // 4. Seed Admin User
            var adminUser = await userManager.FindByNameAsync("admin");
            if (adminUser == null)
            {
                var newAdmin = new AppUser
                {
                    UserName = "admin",
                    Email = "admin@dms.com",
                    FullName = "System Administrator",
                    Role = "Admin",
                    Status = "Approved"
                };

                var result = await userManager.CreateAsync(newAdmin, "Admin@123!");
                if (result.Succeeded)
                {
                    await userManager.AddToRoleAsync(newAdmin, "Admin");
                }
            }
        }
    }
}
