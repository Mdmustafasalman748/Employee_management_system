# Employee Management System

A full-stack system for managing employee records — add, edit, delete and
view employees. Built with **C#**, **ASP.NET Core MVC**, **Entity Framework
Core**, and **SQL Server**.

> This is a from-scratch rewrite of the original Next.js/React/Vercel
> Postgres version, now running on the .NET stack.

## Features

- Add, edit and delete employee records
- Fields: name, email, position, department, salary, hire date
- Server-rendered Razor views with client + server-side validation
- Data persists in SQL Server, schema managed by EF Core Migrations
  (applied automatically on startup — no manual setup step needed)

## Project structure

```
EmployeeManagementSystem.sln
src/EmployeeManagementSystem/
  Controllers/
    EmployeesController.cs   → Index/Create/Edit/Delete actions
  Models/
    Employee.cs               → entity + validation attributes
  Data/
    AppDbContext.cs            → EF Core DbContext
    Migrations/                → EF Core schema migrations
  Views/
    Employees/                 → Index, Create, Edit, Delete, _Form partial
    Shared/_Layout.cshtml       → page shell
  wwwroot/css/site.css          → styling
  Program.cs                    → app startup, DI, auto-migrate on boot
  Dockerfile
docker-compose.yml               → web + SQL Server, for local dev
```

## Running locally with Docker (recommended)

Requires Docker Desktop.

```bash
cp .env.example .env      # then edit .env and set a strong MSSQL_SA_PASSWORD
docker compose up --build
```

Visit `http://localhost:8080`. The `web` container waits for SQL Server to
be healthy, then applies EF Core migrations automatically on startup.

## Running locally without Docker

Requires the .NET SDK and either SQL Server or SQL Server LocalDB
(installed with Visual Studio on Windows).

```bash
cd src/EmployeeManagementSystem
dotnet run
```

`appsettings.Development.json` points at `(localdb)\mssqllocaldb` by
default — change `ConnectionStrings:DefaultConnection` if you're using a
different SQL Server instance. Migrations apply automatically on startup.

## Deploying (Railway or Render, via Docker)

Vercel cannot host this app — it only runs Node/Python/Go/Ruby serverless
functions and static sites, not ASP.NET Core or SQL Server. This project
deploys as two Docker services instead:

1. **Database service**: deploy the `mcr.microsoft.com/mssql/server:2022-latest`
   image as its own service. Set environment variables `ACCEPT_EULA=Y` and
   `MSSQL_SA_PASSWORD=<a strong password>`, and attach a persistent volume
   at `/var/opt/mssql` so data survives restarts.
2. **Web service**: deploy this repo — the platform will detect
   `src/EmployeeManagementSystem/Dockerfile` (on Render/Railway you may
   need to set the Dockerfile path / build context explicitly to
   `src/EmployeeManagementSystem`). Set these environment variables:
   - `ASPNETCORE_ENVIRONMENT=Production`
   - `ConnectionStrings__DefaultConnection=Server=<db-service-internal-host>,1433;Database=EmployeeManagementSystem;User Id=sa;Password=<same password as above>;TrustServerCertificate=True`
     (Railway: the db service's internal hostname, e.g. `mssql.railway.internal`.
     Render: use a Private Service for the database and its internal hostname.)
3. Deploy. On first boot the web service applies EF Core migrations and
   creates the `Employees` table automatically — no manual setup step.

## Migrations

To add a new migration after changing `Employee.cs` or `AppDbContext.cs`:

```bash
cd src/EmployeeManagementSystem
dotnet ef migrations add <Name> -o Data/Migrations
```

Migrations apply automatically on app startup (`Program.cs`), both
locally and in production.
