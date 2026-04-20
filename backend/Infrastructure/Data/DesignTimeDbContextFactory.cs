using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;
using Microsoft.Extensions.Configuration;
using System;
using System.IO;

namespace DMS.Infrastructure.Data
{
    /// <summary>
    /// Used by the EF Core CLI tools (dotnet ef migrations add / update) at design time.
    /// Priority: DATABASE_URL env var → local SQLite fallback.
    /// </summary>
    public class DesignTimeDbContextFactory : IDesignTimeDbContextFactory<ApplicationDbContext>
    {
        public ApplicationDbContext CreateDbContext(string[] args)
        {
            var optionsBuilder = new DbContextOptionsBuilder<ApplicationDbContext>();

            // Use DATABASE_URL if available (e.g. when generating migrations against Neon)
            var databaseUrl = Environment.GetEnvironmentVariable("DATABASE_URL");

            if (!string.IsNullOrWhiteSpace(databaseUrl))
            {
                // Ensure SSL is required
                if (!databaseUrl.Contains("sslmode=", StringComparison.OrdinalIgnoreCase) &&
                    !databaseUrl.Contains("SSL Mode=", StringComparison.OrdinalIgnoreCase))
                {
                    databaseUrl += databaseUrl.Contains("?") ? "&sslmode=require" : "?sslmode=require";
                }

                optionsBuilder.UseNpgsql(databaseUrl);
                Console.WriteLine("[DesignTime] Using PostgreSQL (DATABASE_URL).");
            }
            else
            {
                // SQLite fallback so CLI tools work without network access
                var dbPath = Path.Combine(Directory.GetCurrentDirectory(), "dms.db");
                optionsBuilder.UseSqlite($"Data Source={dbPath}");
                Console.WriteLine($"[DesignTime] Using SQLite fallback at {dbPath}.");
            }

            return new ApplicationDbContext(optionsBuilder.Options);
        }
    }
}
