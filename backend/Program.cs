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

var builder = WebApplication.CreateBuilder(args);

// DB Connection (Switching to SQLite for 100% Stability)
var dbPath = Path.Combine(AppContext.BaseDirectory, "dms.db");
builder.Services.AddDbContext<ApplicationDbContext>(options => options.UseSqlite($"Data Source={dbPath}"));

// Identity
builder.Services.AddIdentity<AppUser, AppRole>(options => {
    options.Password.RequireDigit = false;
    options.Password.RequiredLength = 6;
    options.Password.RequireNonAlphanumeric = false;
    options.Password.RequireUppercase = false;
})
.AddEntityFrameworkStores<ApplicationDbContext>()
.AddDefaultTokenProviders();

// JWT
var jwtKey = "VerySecureSecretKey123!456@789#VeryLongSecret";
var key = Encoding.UTF8.GetBytes(jwtKey);
builder.Services.AddAuthentication(x => {
    x.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    x.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(x => {
    x.TokenValidationParameters = new TokenValidationParameters {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = "DMS_SYSTEM",
        ValidAudience = "DMS_CLIENT",
        IssuerSigningKey = new SymmetricSecurityKey(key),
        ClockSkew = TimeSpan.Zero
    };
});

// Register ACTUAL Repositories & Services from your project
builder.Services.AddScoped<IProductRepository, ProductRepository>();
builder.Services.AddScoped<ICustomerRepository, CustomerRepository>();
builder.Services.AddScoped<IInvoiceRepository, InvoiceRepository>();
builder.Services.AddScoped<IDistributorRepository, DistributorRepository>();
builder.Services.AddScoped<ISalesmanRepository, SalesmanRepository>();
builder.Services.AddScoped<IStockRepository, StockRepository>();

builder.Services.AddScoped<ICompanyService, CompanyService>();
builder.Services.AddScoped<IDistributorService, DistributorService>();
builder.Services.AddScoped<ISalesmanService, SalesmanService>();
builder.Services.AddScoped<IAuditLogService, AuditLogService>();

builder.Services.AddControllers().AddJsonOptions(x => x.JsonSerializerOptions.ReferenceHandler = System.Text.Json.Serialization.ReferenceHandler.IgnoreCycles);
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddCors(options => options.AddPolicy("AllowAll", b => b.AllowAnyOrigin().AllowAnyMethod().AllowAnyHeader()));

var app = builder.Build();

// Background DB Init
_ = Task.Run(async () => {
    using var scope = app.Services.CreateScope();
    var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
    try {
        // This will create all tables (Users, Roles, etc.) if they don't exist
        await context.Database.MigrateAsync();

        // This will create the 'admin' user
        await RoleSeeder.SeedRolesAndAdminAsync(scope.ServiceProvider);
    } catch (Exception ex) {
        Console.WriteLine($"DB Initialization Error: {ex.Message}");
    }
});

app.UseSwagger();
app.UseSwaggerUI(c => { c.SwaggerEndpoint("/swagger/v1/swagger.json", "DMS v1"); c.RoutePrefix = "swagger"; });
app.UseCors("AllowAll");
app.UseAuthentication();
app.UseAuthorization();
// Health Check (Deep Network Diagnostic V2.0 - PostgreSQL)
app.MapGet("/health", async (ApplicationDbContext context) => {
    var diagnostic = new Dictionary<string, object>();
    diagnostic["Version"] = "2.0-Postgres";
    diagnostic["Status"] = "Alive";
    diagnostic["Timestamp"] = DateTime.UtcNow;

    // 1. Outbound IP Detection
    try {
        using var client = new System.Net.Http.HttpClient();
        diagnostic["OutboundIP"] = await client.GetStringAsync("https://api.ipify.org");
    } catch { }

    // 2. PostgreSQL Connection Test
    try {
        using var command = context.Database.GetDbConnection().CreateCommand();
        command.CommandText = "SELECT 1";
        await context.Database.OpenConnectionAsync();
        await command.ExecuteScalarAsync();
        diagnostic["Database"] = "Connected (PostgreSQL)";
    } catch (Exception ex) {
        diagnostic["Database"] = "Disconnected";
        diagnostic["DB_Error"] = ex.Message;
    }

    return Results.Ok(diagnostic);
});
app.MapControllers();

app.Run();
