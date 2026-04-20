using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using DMS.Domain.Entities;

namespace DMS.Infrastructure.Data
{
    public class ApplicationDbContext : IdentityDbContext<AppUser, AppRole, string>
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
            : base(options)
        {
        }

        public DbSet<Product> Products { get; set; } = null!;
        public DbSet<Customer> Customers { get; set; } = null!;
        public DbSet<Salesman> Salesmen { get; set; } = null!;
        public DbSet<Distributor> Distributors { get; set; } = null!;
        public DbSet<Supplier> Suppliers { get; set; } = null!;
        public DbSet<Invoice> Invoices { get; set; } = null!;
        public DbSet<InvoiceItem> InvoiceItems { get; set; } = null!;
        public DbSet<Stock> Stock { get; set; } = null!;
        public DbSet<StockTransaction> StockTransactions { get; set; } = null!;
        public DbSet<Payment> Payments { get; set; } = null!;
        public DbSet<UserActivityLog> UserActivityLogs { get; set; } = null!;
        
        // Company Ledger Module
        public DbSet<Company> Companies { get; set; } = null!;
        public DbSet<CompanyLedger> CompanyLedgers { get; set; } = null!;
        public DbSet<CustomerLedger> CustomerLedgers { get; set; } = null!;
        public DbSet<AuditLog> AuditLogs { get; set; } = null!;
        
        public DbSet<DailyActivity> DailyActivities { get; set; } = null!;
        public DbSet<DailyExpense> DailyExpenses { get; set; } = null!;
        
        // RBAC custom tables
        public DbSet<Permission> Permissions { get; set; } = null!;
        public DbSet<RolePermission> RolePermissions { get; set; } = null!;

        // Route & Vehicle
        public DbSet<DMS.Domain.Entities.Route> Routes { get; set; } = null!;
        public DbSet<Vehicle> Vehicles { get; set; } = null!;

        public DbSet<SystemSetting> SystemSettings { get; set; } = null!;

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Seed System Setting
            modelBuilder.Entity<SystemSetting>().HasData(new SystemSetting
            {
                Id = 1,
                CompanyName = "Hamdaan Traders",
                PhoneNumber = "+92 300 8843939",
                Address = "Sillanwali, Sargodha Road, Sargodha, Pakistan",
                Email = "contact@hamdaantraders.com",
                LastUpdated = DateTime.SpecifyKind(DateTime.Parse("2026-04-14"), DateTimeKind.Utc)
            });

            // Rename Identity tables to be more user-friendly as requested
            modelBuilder.Entity<AppUser>().ToTable("Users");
            modelBuilder.Entity<AppRole>().ToTable("Roles");
            modelBuilder.Entity<IdentityUserRole<string>>().ToTable("UserRoles");
            modelBuilder.Entity<IdentityUserClaim<string>>().ToTable("UserClaims");
            modelBuilder.Entity<IdentityUserLogin<string>>().ToTable("UserLogins");
            modelBuilder.Entity<IdentityRoleClaim<string>>().ToTable("RoleClaims");
            modelBuilder.Entity<IdentityUserToken<string>>().ToTable("UserTokens");

            // Configure RolePermission join table
            modelBuilder.Entity<RolePermission>()
                .HasKey(rp => new { rp.RoleId, rp.PermissionId });

            modelBuilder.Entity<RolePermission>()
                .HasOne(rp => rp.Role)
                .WithMany(r => r.RolePermissions)
                .HasForeignKey(rp => rp.RoleId);

            modelBuilder.Entity<RolePermission>()
                .HasOne(rp => rp.Permission)
                .WithMany(p => p.RolePermissions)
                .HasForeignKey(rp => rp.PermissionId);

            modelBuilder.Entity<Invoice>()
                .HasIndex(i => i.InvoiceNumber)
                .IsUnique();

            modelBuilder.Entity<Product>()
                .HasIndex(p => p.Barcode)
                .IsUnique();
                
            modelBuilder.Entity<UserActivityLog>()
                .HasOne(u => u.User)
                .WithMany()
                .HasForeignKey(u => u.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<CompanyLedger>()
                .HasOne(cl => cl.Company)
                .WithMany(c => c.Ledgers)
                .HasForeignKey(cl => cl.CompanyId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<CompanyLedger>()
                .HasOne(cl => cl.CreatedByUser)
                .WithMany()
                .HasForeignKey(cl => cl.CreatedByUserId)
                .OnDelete(DeleteBehavior.SetNull);

            modelBuilder.Entity<CustomerLedger>()
                .HasOne(cl => cl.Customer)
                .WithMany(c => c.Ledgers)
                .HasForeignKey(cl => cl.CustomerId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<CustomerLedger>()
                .HasOne(cl => cl.CreatedByUser)
                .WithMany()
                .HasForeignKey(cl => cl.CreatedByUserId)
                .OnDelete(DeleteBehavior.SetNull);

            modelBuilder.Entity<Stock>()
                .HasIndex(s => new { s.ProductId, s.WarehouseLocation })
                .IsUnique();

            modelBuilder.Entity<Customer>()
                .HasIndex(c => c.Phone)
                .IsUnique();

            modelBuilder.Entity<Customer>()
                .HasIndex(c => new { c.CustomerName, c.Area })
                .IsUnique();

            modelBuilder.Entity<Stock>()
                .HasOne(s => s.Product)
                .WithMany(p => p.Stocks)
                .HasForeignKey(s => s.ProductId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<DailyActivity>().HasKey(a => a.ActivityId);
            modelBuilder.Entity<DailyExpense>().HasKey(e => e.ExpenseId);
        }
    }
}
