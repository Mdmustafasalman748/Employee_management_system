using EmployeeManagementSystem.Data;
using Microsoft.AspNetCore.HttpOverrides;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

// Hosting platforms (Render, Railway, ...) assign the port to listen on via
// the PORT environment variable and terminate HTTPS at their edge.
var port = Environment.GetEnvironmentVariable("PORT") ?? "8080";
builder.WebHost.UseUrls($"http://0.0.0.0:{port}");

// Add services to the container.
builder.Services.AddControllersWithViews();

// Database: SQL Server when a connection string is configured (local dev via
// appsettings.Development.json / docker-compose, or a real SQL Server bound
// via DB_HOST + DB_PASSWORD on a host that can run one). Falls back to
// SQLite — a single file, no separate database service required — which is
// what lets this run on Render's free tier without a paid SQL Server
// instance (SQL Server's container needs ~2GB RAM, which free tiers don't
// give you). See README for how to switch a production deployment to real
// SQL Server once you have somewhere to run it.
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
if (string.IsNullOrWhiteSpace(connectionString))
{
    var dbHost = builder.Configuration["DB_HOST"];
    var dbPassword = builder.Configuration["DB_PASSWORD"];

    if (!string.IsNullOrWhiteSpace(dbHost) && !string.IsNullOrWhiteSpace(dbPassword))
    {
        var dbPort = builder.Configuration["DB_PORT"] ?? "1433";
        var dbName = builder.Configuration["DB_NAME"] ?? "EmployeeManagementSystem";
        var dbUser = builder.Configuration["DB_USER"] ?? "sa";

        connectionString =
            $"Server={dbHost},{dbPort};Database={dbName};User Id={dbUser};" +
            $"Password={dbPassword};TrustServerCertificate=True";
    }
}

var useSqlite = string.IsNullOrWhiteSpace(connectionString);
if (useSqlite)
{
    // Render's ephemeral filesystem resets this file on every redeploy (and
    // possibly after long idle spin-downs) unless a persistent disk is
    // mounted at this path — see README.
    connectionString = builder.Configuration.GetConnectionString("Sqlite")
        ?? "Data Source=employees.db";
}

builder.Services.AddDbContext<AppDbContext>(options =>
{
    if (useSqlite)
        options.UseSqlite(connectionString);
    else
        options.UseSqlServer(connectionString, sql => sql.EnableRetryOnFailure());
});

var app = builder.Build();

// Bring the schema up to date on startup — this is the equivalent of the
// old /api/setup route, but automatic. SQL Server uses the checked-in EF
// Core migrations; SQLite (no migrations shipped for that provider) just
// creates the schema directly from the current model.
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    if (useSqlite)
        db.Database.EnsureCreated();
    else
        db.Database.Migrate();
}

app.UseForwardedHeaders(new ForwardedHeadersOptions
{
    ForwardedHeaders = ForwardedHeaders.XForwardedFor | ForwardedHeaders.XForwardedProto
});

// Configure the HTTP request pipeline.
if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler("/Employees/Error");
}

app.UseRouting();

app.UseAuthorization();

app.MapStaticAssets();

app.MapControllerRoute(
    name: "default",
    pattern: "{controller=Employees}/{action=Index}/{id?}")
    .WithStaticAssets();

app.Run();
