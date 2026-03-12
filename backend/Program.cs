using Microsoft.AspNetCore.Builder;
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
builder.Services.AddControllers()
    .AddJsonOptions(opts =>
    {
        opts.JsonSerializerOptions.ReferenceHandler = System.Text.Json.Serialization.ReferenceHandler.IgnoreCycles;
        opts.JsonSerializerOptions.DefaultIgnoreCondition = System.Text.Json.Serialization.JsonIgnoreCondition.WhenWritingNull;
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
        // Apply pending migrations automatically on startup
        await context.Database.MigrateAsync(); 
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

app.UseHttpsRedirection();

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();
