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
using DMS.Infrastructure.Data;
using DMS.Application.Interfaces;
using DMS.Infrastructure.Repositories;
using DMS.Application.Services;
using DMS.Domain.Entities;
using DMS.Infrastructure.Authorization;
using Microsoft.AspNetCore.Authorization;
using System.IO;
using Microsoft.AspNetCore.RateLimiting;
using System.Threading.RateLimiting;
using Microsoft.AspNetCore.Http;

var root = Directory.GetCurrentDirectory();
var dotenv = Path.Combine(root, ".env");
if (File.Exists(dotenv))
{
    foreach (var line in File.ReadAllLines(dotenv))
    {
        var parts = line.Split('=', 2, StringSplitOptions.RemoveEmptyEntries);
        if (parts.Length != 2) continue;
        var envKey = parts[0].Trim();
        var envVal = parts[1].Trim();
        Environment.SetEnvironmentVariable(envKey, envVal);
        if (envKey == "APP_ENVIRONMENT")
        {
            Environment.SetEnvironmentVariable("ASPNETCORE_ENVIRONMENT", 
                envVal.Equals("development", StringComparison.OrdinalIgnoreCase) ? "Development" : "Production");
        }
    }
}

var builder = WebApplication.CreateBuilder(args);
builder.Configuration.AddEnvironmentVariables();

// Add services to the container.
builder.Services.AddResponseCompression(options =>
{
    options.EnableForHttps = true;
    options.Providers.Add<BrotliCompressionProvider>();
    options.Providers.Add<GzipCompressionProvider>();
});
builder.Services.AddMemoryCache();
builder.Services.AddControllers()
    .AddJsonOptions(opts =>
    {
        opts.JsonSerializerOptions.ReferenceHandler = System.Text.Json.Serialization.ReferenceHandler.IgnoreCycles;
        opts.JsonSerializerOptions.DefaultIgnoreCondition = System.Text.Json.Serialization.JsonIgnoreCondition.WhenWritingNull;
        opts.JsonSerializerOptions.Converters.Add(new System.Text.Json.Serialization.JsonStringEnumConverter());
    });

// Configure Database
var connectionString = Environment.GetEnvironmentVariable("DB_CONNECTION_STRING") 
    ?? builder.Configuration.GetConnectionString("DefaultConnection");

builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseSqlServer(connectionString));

// Configure Identity
builder.Services.AddIdentity<AppUser, AppRole>(options =>
{
    options.SignIn.RequireConfirmedEmail = false;
    options.User.RequireUniqueEmail = false;
    options.Password.RequireDigit = true;
    options.Password.RequiredLength = 8;
    options.Password.RequireNonAlphanumeric = true;
    options.Password.RequireUppercase = false;
    options.Password.RequireLowercase = false;
    
    options.Lockout.DefaultLockoutTimeSpan = TimeSpan.FromMinutes(15);
    options.Lockout.MaxFailedAccessAttempts = 5;
    options.Lockout.AllowedForNewUsers = true;
})
    .AddEntityFrameworkStores<ApplicationDbContext>()
    .AddDefaultTokenProviders();

// Register Custom Authorization Handlers for RBAC
builder.Services.AddSingleton<IAuthorizationPolicyProvider, PermissionPolicyProvider>();
builder.Services.AddSingleton<IAuthorizationHandler, PermissionAuthorizationHandler>();

// Configure JWT Authentication
var jwtKey = Environment.GetEnvironmentVariable("JWT_SECRET_KEY") ?? builder.Configuration["Jwt:Key"] ?? "superSecretKey123!456@789#VeryLongSecret";
var jwtIssuer = Environment.GetEnvironmentVariable("JWT_ISSUER") ?? builder.Configuration["Jwt:Issuer"];
var jwtAudience = Environment.GetEnvironmentVariable("JWT_AUDIENCE") ?? builder.Configuration["Jwt:Audience"];

var key = Encoding.ASCII.GetBytes(jwtKey);

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.RequireHttpsMetadata = false;
    options.SaveToken = true;
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuerSigningKey = true,
        IssuerSigningKey = new SymmetricSecurityKey(key),
        ValidateIssuer = !string.IsNullOrEmpty(jwtIssuer),
        ValidIssuer = jwtIssuer,
        ValidateAudience = !string.IsNullOrEmpty(jwtAudience),
        ValidAudience = jwtAudience,
        ClockSkew = TimeSpan.Zero
    };
});

// Core Repositories
builder.Services.AddScoped<IProductRepository, ProductRepository>();
builder.Services.AddScoped<ICustomerRepository, CustomerRepository>();
builder.Services.AddScoped<ISalesmanRepository, SalesmanRepository>();
builder.Services.AddScoped<IDistributorRepository, DistributorRepository>();
builder.Services.AddScoped<IInvoiceRepository, InvoiceRepository>();
builder.Services.AddScoped<IStockRepository, StockRepository>();
builder.Services.AddScoped<IDailyOperationsRepository, DailyOperationsRepository>();

// Core Services
builder.Services.AddScoped<ProductService>();
builder.Services.AddScoped<CustomerService>();
builder.Services.AddScoped<InvoiceService>();
builder.Services.AddScoped<StockService>();
builder.Services.AddScoped<ISalesmanService, SalesmanService>();
builder.Services.AddScoped<IDistributorService, DistributorService>();
builder.Services.AddScoped<ReportService>();
builder.Services.AddScoped<DailyOperationsService>();
builder.Services.AddScoped<AIContextAssistantService>();
builder.Services.AddScoped<IAuditLogService, AuditLogService>();
builder.Services.AddScoped<IPaymentService, PaymentService>();

// Company Ledger Services
builder.Services.AddScoped<ICompanyService, CompanyService>();
builder.Services.AddScoped<ICompanyLedgerService, CompanyLedgerService>();
builder.Services.AddScoped<ICustomerLedgerService, CustomerLedgerService>();

// Authentication & Email Utility
builder.Services.AddScoped<IEmailService, EmailService>();

// CORS Setup for React Frontend
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll",
        builder =>
        {
            builder.AllowAnyOrigin()
                   .AllowAnyMethod()
                   .AllowAnyHeader();
        });
});

// Add Swagger
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Configure Rate Limiting
builder.Services.AddRateLimiter(options =>
{
    options.GlobalLimiter = PartitionedRateLimiter.Create<HttpContext, string>(httpContext =>
        RateLimitPartition.GetFixedWindowLimiter(
            partitionKey: httpContext.User.Identity?.Name ?? httpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown",
            factory: partition => new FixedWindowRateLimiterOptions
            {
                AutoReplenishment = true,
                PermitLimit = 100,
                QueueLimit = 0,
                Window = TimeSpan.FromMinutes(1)
            }));
    options.OnRejected = async (context, token) =>
    {
        context.HttpContext.Response.StatusCode = 429;
        await context.HttpContext.Response.WriteAsync("Too many requests. Please try again later.", cancellationToken: token);
    };
});

var app = builder.Build();

// Seed Roles and Admin
using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    try
    {
        var context = services.GetRequiredService<ApplicationDbContext>();

        // Bypass EF Core Migrations for the new tables by manually ensuring they exist
        try 
        {
            await context.Database.ExecuteSqlRawAsync(@"
                IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Companies' and xtype='U')
                BEGIN
                    CREATE TABLE Companies (
                        Id INT IDENTITY(1,1) PRIMARY KEY,
                        Name NVARCHAR(MAX) NOT NULL,
                        ContactPerson NVARCHAR(MAX) NULL,
                        Phone NVARCHAR(MAX) NULL,
                        Address NVARCHAR(MAX) NULL,
                        CreatedAt DATETIME2 NOT NULL
                    );
                END

                IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='CompanyLedgers' and xtype='U')
                BEGIN
                    CREATE TABLE CompanyLedgers (
                        Id INT IDENTITY(1,1) PRIMARY KEY,
                        CompanyId INT NOT NULL,
                        TransactionType INT NOT NULL,
                        Amount DECIMAL(18,2) NOT NULL,
                        Description NVARCHAR(MAX) NOT NULL,
                        Reference NVARCHAR(MAX) NULL,
                        Date DATETIME2 NOT NULL,
                        RunningBalance DECIMAL(18,2) NOT NULL DEFAULT 0,
                        CreatedByUserId NVARCHAR(450) NULL,
                        CONSTRAINT FK_CompanyLedgers_Companies FOREIGN KEY (CompanyId) REFERENCES Companies(Id) ON DELETE CASCADE
                    );
                END

                IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='CustomerLedgers' and xtype='U')
                BEGIN
                    CREATE TABLE CustomerLedgers (
                        Id INT IDENTITY(1,1) PRIMARY KEY,
                        CustomerId INT NOT NULL,
                        TransactionType INT NOT NULL,
                        Amount DECIMAL(18,2) NOT NULL,
                        Description NVARCHAR(MAX) NOT NULL,
                        Reference NVARCHAR(MAX) NULL,
                        Date DATETIME2 NOT NULL,
                        RunningBalance DECIMAL(18,2) NOT NULL DEFAULT 0,
                        CreatedByUserId NVARCHAR(450) NULL,
                        CONSTRAINT FK_CustomerLedgers_Customers FOREIGN KEY (CustomerId) REFERENCES Customers(CustomerId) ON DELETE CASCADE
                    );
                END

                IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='DailyActivities' and xtype='U')
                BEGIN
                    CREATE TABLE DailyActivities (
                        ActivityId INT IDENTITY(1,1) PRIMARY KEY,
                        Title NVARCHAR(MAX) NOT NULL,
                        Description NVARCHAR(MAX) NOT NULL,
                        ActivityDate DATETIME2 NOT NULL,
                        CreatedBy NVARCHAR(MAX) NOT NULL
                    );
                END

                IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='DailyExpenses' and xtype='U')
                BEGIN
                    CREATE TABLE DailyExpenses (
                        ExpenseId INT IDENTITY(1,1) PRIMARY KEY,
                        ExpenseTitle NVARCHAR(MAX) NOT NULL,
                        Category NVARCHAR(MAX) NOT NULL,
                        Amount DECIMAL(18,2) NOT NULL,
                        ExpenseDate DATETIME2 NOT NULL,
                        Notes NVARCHAR(MAX) NULL
                    );
                END

                IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Payments' and xtype='U')
                BEGIN
                    CREATE TABLE Payments (
                        PaymentId INT IDENTITY(1,1) PRIMARY KEY,
                        InvoiceId INT NOT NULL,
                        AmountPaid DECIMAL(18,2) NOT NULL,
                        PaymentDate DATETIME2 NOT NULL,
                        PaymentMethod NVARCHAR(MAX) NOT NULL,
                        CONSTRAINT FK_Payments_Invoices FOREIGN KEY (InvoiceId) REFERENCES Invoices(InvoiceId) ON DELETE CASCADE
                    );
                END

                IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='InvoiceItems' and xtype='U')
                BEGIN
                    CREATE TABLE InvoiceItems (
                        Id INT IDENTITY(1,1) PRIMARY KEY,
                        InvoiceId INT NOT NULL,
                        ProductId INT NOT NULL,
                        Quantity INT NOT NULL,
                        UnitPrice DECIMAL(18,2) NOT NULL,
                        CONSTRAINT FK_InvoiceItems_Invoices FOREIGN KEY (InvoiceId) REFERENCES Invoices(InvoiceId) ON DELETE CASCADE,
                        CONSTRAINT FK_InvoiceItems_Products FOREIGN KEY (ProductId) REFERENCES Products(ProductId) ON DELETE CASCADE
                    );
                END

                IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Routes' and xtype='U')
                BEGIN
                    CREATE TABLE Routes (
                        RouteId INT IDENTITY(1,1) PRIMARY KEY,
                        RouteName NVARCHAR(MAX) NOT NULL,
                        Area NVARCHAR(MAX) NULL,
                        Description NVARCHAR(MAX) NULL,
                        IsActive BIT NOT NULL DEFAULT 1
                    );
                END

                IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Vehicles' and xtype='U')
                BEGIN
                    CREATE TABLE Vehicles (
                        VehicleId INT IDENTITY(1,1) PRIMARY KEY,
                        VehicleNumber NVARCHAR(MAX) NOT NULL,
                        DriverName NVARCHAR(MAX) NULL,
                        DriverPhone NVARCHAR(MAX) NULL,
                        VehicleType NVARCHAR(MAX) NOT NULL DEFAULT 'Truck',
                        IsActive BIT NOT NULL DEFAULT 1
                    );
                END

                IF NOT EXISTS (SELECT * FROM sys.columns WHERE Name = N'RouteId' AND Object_ID = Object_ID(N'Invoices'))
                BEGIN
                    ALTER TABLE Invoices ADD RouteId INT NULL;
                    ALTER TABLE Invoices ADD CONSTRAINT FK_Invoices_Routes FOREIGN KEY (RouteId) REFERENCES Routes(RouteId);
                END

                IF NOT EXISTS (SELECT * FROM sys.columns WHERE Name = N'VehicleId' AND Object_ID = Object_ID(N'Invoices'))
                BEGIN
                    ALTER TABLE Invoices ADD VehicleId INT NULL;
                    ALTER TABLE Invoices ADD CONSTRAINT FK_Invoices_Vehicles FOREIGN KEY (VehicleId) REFERENCES Vehicles(VehicleId);
                END
                
                IF NOT EXISTS (SELECT * FROM sys.columns WHERE Name = N'RouteId' AND Object_ID = Object_ID(N'Customers'))
                BEGIN
                    ALTER TABLE Customers ADD RouteId INT NULL;
                    ALTER TABLE Customers ADD CONSTRAINT FK_Customers_Routes FOREIGN KEY (RouteId) REFERENCES Routes(RouteId);
                END

                IF NOT EXISTS (SELECT * FROM sys.columns WHERE Name = N'RunningBalance' AND Object_ID = Object_ID(N'CompanyLedgers'))
                BEGIN
                    ALTER TABLE CompanyLedgers ADD RunningBalance DECIMAL(18,2) NOT NULL DEFAULT 0;
                END

                IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='AuditLogs' and xtype='U')
                BEGIN
                    CREATE TABLE AuditLogs (
                        Id INT IDENTITY(1,1) PRIMARY KEY,
                        UserId NVARCHAR(MAX) NOT NULL,
                        UserName NVARCHAR(MAX) NOT NULL,
                        Action NVARCHAR(MAX) NOT NULL,
                        Module NVARCHAR(MAX) NOT NULL,
                        RecordId NVARCHAR(MAX) NULL,
                        Description NVARCHAR(MAX) NULL,
                        Timestamp DATETIME2 NOT NULL,
                        IPAddress NVARCHAR(MAX) NULL
                    );
                END

                IF COL_LENGTH('Users', 'EmployeeId') IS NULL
                BEGIN
                    ALTER TABLE Users ADD EmployeeId NVARCHAR(MAX) NULL;
                END

                IF COL_LENGTH('Users', 'RouteId') IS NULL
                BEGIN
                    ALTER TABLE Users ADD RouteId INT NULL;
                END

                IF COL_LENGTH('Users', 'SalesmanId') IS NULL
                BEGIN
                    ALTER TABLE Users ADD SalesmanId INT NULL;
                END

                IF COL_LENGTH('Salesmen', 'EmployeeId') IS NULL
                BEGIN
                    ALTER TABLE Salesmen ADD EmployeeId NVARCHAR(MAX) NULL;
                END
            ");

            // Seed Default Company
            if (!await context.Companies.AnyAsync()) 
            {
                context.Companies.Add(new DMS.Domain.Entities.Company { Name = "Gourmet Plant", CreatedAt = DateTime.UtcNow });
                await context.SaveChangesAsync();
            }
        } 
        catch (Exception sqlEx) 
        {
            Console.WriteLine($"Error executing raw SQL table generation: {sqlEx.Message}");
        }

        // Apply pending migrations automatically on startup
        try 
        {
            await context.Database.MigrateAsync(); 
        } 
        catch (Exception migEx) 
        {
            Console.WriteLine($"Error running EF Migrations (non-fatal): {migEx.Message}");
        }

        await RoleSeeder.SeedRolesAndAdminAsync(services);
    }
    catch (Exception ex)
    {
        // Handle seeder error
        Console.WriteLine($"Error seeding roles: {ex.Message}");
    }
}

// Configure the HTTP request pipeline.
app.UseSwagger();
app.UseSwaggerUI(c => c.SwaggerEndpoint("/swagger/v1/swagger.json", "DMS v1"));

if (app.Environment.IsDevelopment())
{
    app.UseDeveloperExceptionPage();
}
else
{
    app.UseExceptionHandler(errorApp =>
    {
        errorApp.Run(async context =>
        {
            context.Response.StatusCode = 500;
            context.Response.ContentType = "application/json";
            await context.Response.WriteAsync("{\"message\": \"An unexpected error occurred.\"}");
        });
    });
    app.UseHsts();
}

app.UseRateLimiter();

app.Use(async (context, next) =>
{
    context.Response.Headers.Append("X-Frame-Options", "DENY");
    context.Response.Headers.Append("X-Content-Type-Options", "nosniff");
    context.Response.Headers.Append("X-XSS-Protection", "1; mode=block");
    context.Response.Headers.Append("Content-Security-Policy", "default-src 'self' 'unsafe-inline' 'unsafe-eval' *; connect-src *;");
    await next();
});

app.UseCors("AllowAll");

app.UseResponseCompression();

app.UseHttpsRedirection();

app.UseAuthentication();
app.UseAuthorization();

// Audit logging middleware - should be AFTER authentication/authorization
app.UseMiddleware<DMS.API.Middleware.AuditMiddleware>();

app.MapControllers();

app.Run("http://0.0.0.0:5000");
