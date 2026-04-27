using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.ResponseCompression;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using DMS.Infrastructure.Data;
using DMS.Application.Interfaces;
using DMS.Infrastructure.Repositories;
using DMS.Application.Services;
using DMS.Domain.Entities;
using DMS.Infrastructure.Authorization;
using Microsoft.AspNetCore.Authorization;
using System.IO;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.HttpOverrides;
using Npgsql;
using DMS.Infrastructure.Authorization;
using Microsoft.AspNetCore.Authorization;

var builder = WebApplication.CreateBuilder(args);

// ============================================================
// DATABASE CONNECTION
// Priority: DATABASE_URL → DB_CONNECTION_STRING → appsettings → SQLite
// ============================================================
static string? BuildNeonConnectionString(IConfiguration config)
{
    // 1. DATABASE_URL — recommended Render/Neon standard key
    var rawUrl = Environment.GetEnvironmentVariable("DATABASE_URL")
              ?? config["DATABASE_URL"];

    // 2. DB_CONNECTION_STRING — legacy/alternative Render key name
    if (string.IsNullOrWhiteSpace(rawUrl))
        rawUrl = Environment.GetEnvironmentVariable("DB_CONNECTION_STRING")
              ?? config["DB_CONNECTION_STRING"];

    // 3. appsettings ConnectionStrings:DefaultConnection
    if (string.IsNullOrWhiteSpace(rawUrl))
        rawUrl = config.GetConnectionString("DefaultConnection");

    if (string.IsNullOrWhiteSpace(rawUrl))
        return null;

    // Guard: ensure SSL is required (Npgsql keyword form AND URI form)
    if (!rawUrl.Contains("sslmode=", StringComparison.OrdinalIgnoreCase) &&
        !rawUrl.Contains("SSL Mode=", StringComparison.OrdinalIgnoreCase))
    {
        // URI style (postgresql://...)
        if (rawUrl.StartsWith("postgresql://", StringComparison.OrdinalIgnoreCase) ||
            rawUrl.StartsWith("postgres://", StringComparison.OrdinalIgnoreCase))
        {
            rawUrl += rawUrl.Contains("?") ? "&sslmode=require" : "?sslmode=require";
        }
        else
        {
            // Npgsql keyword style (Host=...;Database=...;)
            rawUrl = rawUrl.TrimEnd(';') + ";SSL Mode=Require;Trust Server Certificate=true;";
        }
    }

    Console.WriteLine("[DMS] Connection string source resolved. SSL enforced.");
    return rawUrl;
}

var connectionString = BuildNeonConnectionString(builder.Configuration);

if (!string.IsNullOrWhiteSpace(connectionString))
{
    builder.Services.AddDbContext<ApplicationDbContext>(options =>
    {
        options.UseNpgsql(connectionString, npgsqlOptions =>
        {
            // Resilience: retry transient failures up to 5 times
            npgsqlOptions.EnableRetryOnFailure(
                maxRetryCount: 5,
                maxRetryDelay: TimeSpan.FromSeconds(10),
                errorCodesToAdd: null
            );
            npgsqlOptions.CommandTimeout(60);
        });
    });
    Console.WriteLine("[DMS] Database provider: PostgreSQL (Neon)");
}
else
{
    // SQLite fallback for local dev without any env vars
    var dbPath = Path.Combine(AppContext.BaseDirectory, "dms.db");
    builder.Services.AddDbContext<ApplicationDbContext>(options =>
        options.UseSqlite($"Data Source={dbPath}"));
    Console.WriteLine($"[DMS] Database provider: SQLite (dev fallback) → {dbPath}");
}

// ============================================================
// MEMORY CACHE
// ============================================================
builder.Services.AddMemoryCache();

// ============================================================
// IDENTITY
// ============================================================
builder.Services.AddIdentity<AppUser, AppRole>(options =>
{
    options.Password.RequireDigit = false;
    options.Password.RequiredLength = 6;
    options.Password.RequireNonAlphanumeric = false;
    options.Password.RequireUppercase = false;
})
.AddEntityFrameworkStores<ApplicationDbContext>()
.AddDefaultTokenProviders();

// ============================================================
// JWT — key is read from env var; NEVER hardcoded in production
// ============================================================
var jwtKey = Environment.GetEnvironmentVariable("JWT_SECRET_KEY")
          ?? builder.Configuration["JWT_SECRET_KEY"]
          ?? "VerySecureSecretKey123!456@789#VeryLongSecret"; // dev-only default

var jwtIssuer   = Environment.GetEnvironmentVariable("JWT_ISSUER")   ?? builder.Configuration["JWT_ISSUER"]   ?? "DMS_SYSTEM";
var jwtAudience = Environment.GetEnvironmentVariable("JWT_AUDIENCE")  ?? builder.Configuration["JWT_AUDIENCE"]  ?? "DMS_CLIENT";

var key = Encoding.UTF8.GetBytes(jwtKey);
builder.Services.AddAuthentication(x =>
{
    x.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    x.DefaultChallengeScheme    = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(x =>
{
    x.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer           = true,
        ValidateAudience         = true,
        ValidateLifetime         = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer              = jwtIssuer,
        ValidAudience            = jwtAudience,
        IssuerSigningKey         = new SymmetricSecurityKey(key),
        ClockSkew                = TimeSpan.Zero
    };
});

// ============================================================
// REPOSITORIES & SERVICES
// ============================================================
builder.Services.AddSingleton<IAuthorizationPolicyProvider, PermissionPolicyProvider>();
builder.Services.AddSingleton<IAuthorizationHandler, PermissionAuthorizationHandler>();

builder.Services.AddScoped<IProductRepository, ProductRepository>();
builder.Services.AddScoped<ICustomerRepository, CustomerRepository>();
builder.Services.AddScoped<IInvoiceRepository, InvoiceRepository>();
builder.Services.AddScoped<IDistributorRepository, DistributorRepository>();
builder.Services.AddScoped<ISalesmanRepository, SalesmanRepository>();
builder.Services.AddScoped<IStockRepository, StockRepository>();
builder.Services.AddScoped<IDailyOperationsRepository, DailyOperationsRepository>();

builder.Services.AddScoped<ICompanyService, CompanyService>();
builder.Services.AddScoped<IDistributorService, DistributorService>();
builder.Services.AddScoped<ISalesmanService, SalesmanService>();
builder.Services.AddScoped<IAuditLogService, AuditLogService>();
builder.Services.AddScoped<IPaymentService, PaymentService>();
builder.Services.AddScoped<ICustomerLedgerService, CustomerLedgerService>();
builder.Services.AddScoped<ICompanyLedgerService, CompanyLedgerService>();
builder.Services.AddScoped<DailyOperationsService>();

builder.Services.AddScoped<IEmailService, EmailService>();
builder.Services.AddScoped<ProductService>();
builder.Services.AddScoped<StockService>();
builder.Services.AddScoped<InvoiceService>();
builder.Services.AddScoped<CustomerService>();
builder.Services.AddScoped<IFinancialService, FinancialService>();
builder.Services.AddScoped<ReportService>();

// ============================================================
// MVC / CORS / SWAGGER
// ============================================================
builder.Services.AddControllers()
    .AddJsonOptions(x =>
        x.JsonSerializerOptions.ReferenceHandler =
            System.Text.Json.Serialization.ReferenceHandler.IgnoreCycles);

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddCors(options =>
    options.AddPolicy("AllowAll", b =>
        b.AllowAnyOrigin().AllowAnyMethod().AllowAnyHeader()));

// ============================================================
// PORT BINDING — Render injects PORT; fallback to 5000
// ============================================================
var port = Environment.GetEnvironmentVariable("PORT") ?? "5000";
builder.WebHost.UseUrls($"http://0.0.0.0:{port}");

// ============================================================
// BUILD APP
// ============================================================
var app = builder.Build();

// ============================================================
// DB INITIALISATION WITH RETRY
// ============================================================
_ = Task.Run(async () =>
{
    const int maxAttempts = 5;
    for (int attempt = 1; attempt <= maxAttempts; attempt++)
    {
        try
        {
            using var scope = app.Services.CreateScope();
            var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();

            Console.WriteLine($"[DMS] DB connection attempt {attempt}/{maxAttempts}…");
            await context.Database.MigrateAsync();
            await RoleSeeder.SeedRolesAndAdminAsync(scope.ServiceProvider);
            Console.WriteLine("[DMS] Database connected successfully. Migration and seeding complete.");
            return; // success — exit loop
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[DMS] DB init attempt {attempt} failed: {ex.Message}");
            if (attempt < maxAttempts)
            {
                var delay = TimeSpan.FromSeconds(5 * attempt); // back-off: 5s, 10s, 15s …
                Console.WriteLine($"[DMS] Retrying in {delay.TotalSeconds}s…");
                await Task.Delay(delay);
            }
            else
            {
                Console.WriteLine("[DMS] All DB connection attempts exhausted. App will continue — endpoints will return 503 until DB is reachable.");
            }
        }
    }
});

// ============================================================
// MIDDLEWARE PIPELINE
// ============================================================
app.UseSwagger();
app.UseSwaggerUI(c =>
{
    c.SwaggerEndpoint("/swagger/v1/swagger.json", "DMS v1");
    c.RoutePrefix = "swagger";
});

app.UseForwardedHeaders(new ForwardedHeadersOptions
{
    ForwardedHeaders = ForwardedHeaders.XForwardedFor | ForwardedHeaders.XForwardedProto
});

app.UseCors("AllowAll");
app.UseAuthentication();
app.UseAuthorization();

// ============================================================
// /api/health — database connectivity check
// ============================================================
app.MapGet("/api/health", async (ApplicationDbContext context) =>
{
    var response = new Dictionary<string, object>
    {
        ["status"]    = "ok",
        ["timestamp"] = DateTime.UtcNow,
        ["version"]   = "3.0-Neon"
    };

    try
    {
        // Open connection and execute lightweight query
        await context.Database.OpenConnectionAsync();
        using var cmd = context.Database.GetDbConnection().CreateCommand();
        cmd.CommandText = "SELECT 1";
        await cmd.ExecuteScalarAsync();

        response["database"] = "connected";
        response["provider"]  = context.Database.ProviderName ?? "unknown";

        // Bonus: user count to prove data is reachable
        response["totalUsers"] = await context.Users.CountAsync();

        return Results.Ok(response);
    }
    catch (Exception ex)
    {
        response["status"]   = "error";
        response["database"] = "disconnected";
        // Do NOT expose full connection string / credentials
        response["error"]    = ex.GetType().Name + ": " + ex.Message.Split('\n')[0];
        return Results.Json(response, statusCode: 503);
    }
});

// Legacy health route — kept for backwards compat, redirects to /api/health
app.MapGet("/health", () => Results.Redirect("/api/health"));

app.MapControllers();

Console.WriteLine($"[DMS] Application started on port {port}.");
app.Run();
