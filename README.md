# Employee Management System

A full-stack system for managing employee records — add, edit, delete and
view employees. Built with **C#**, **ASP.NET Core MVC**, and **Entity
Framework Core**.

> This is a from-scratch rewrite of the original Next.js/React/Vercel
> Postgres version, now running on the .NET stack.

## Features

- Add, edit and delete employee records
- Fields: name, email, position, department, salary, hire date
- Server-rendered Razor views with client + server-side validation
- Schema created automatically on startup — no manual setup step needed

## Database: SQL Server locally, SQLite in production

- **Local dev**: SQL Server (via `docker compose` or LocalDB), schema
  managed by checked-in EF Core migrations, applied automatically on
  startup.
- **Production (Render)**: SQLite — a single file, no separate database
  service to provision. Render's free tier can't run SQL Server's
  container anyway (it needs ~2GB RAM, which free/cheap tiers don't give
  you), so this is what makes a free deployment possible at all. See
  [Using real SQL Server in production](#using-real-sql-server-in-production-optional)
  if you'd rather pay for that.
- ⚠️ **Without a paid persistent disk, the SQLite file resets on every
  redeploy** (and possibly after a long idle spin-down) — Render's free
  tier has no persistent storage. Fine for a demo; not for data you care
  about keeping. See below for how to attach a disk.

`Program.cs` picks the provider automatically: SQL Server when a
connection string is configured, SQLite otherwise.

## Project structure

```
EmployeeManagementSystem.slnx
Dockerfile                        → repo root is the build context (Render's default)
docker-compose.yml                → web + SQL Server, for local dev
src/EmployeeManagementSystem/
  Controllers/
    EmployeesController.cs   → Index/Create/Edit/Delete actions
  Models/
    Employee.cs               → entity + validation attributes
  Data/
    AppDbContext.cs            → EF Core DbContext
    Migrations/                → EF Core schema migrations (SQL Server)
  Views/
    Employees/                 → Index, Create, Edit, Delete, _Form partial
    Shared/_Layout.cshtml       → page shell
  wwwroot/css/site.css          → styling
  Program.cs                    → app startup, DB provider selection
.github/workflows/ci-cd.yml      → build/test + deploy-to-Render hook
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

## Deploying to Render

Vercel cannot host this app — it only runs Node/Python/Go/Ruby serverless
functions and static sites, not ASP.NET Core.

1. In the Render dashboard: **New +** → **Web Service** → connect this
   GitHub repo.
2. Render auto-detects the root-level `Dockerfile` and uses the repo root
   as the build context — no path settings to change.
3. No environment variables are required for the SQLite default — just
   deploy. (Render sets `PORT` itself; the app already listens on it.)
4. Once deployed, go to **Settings → Deploy Hook**, copy the URL, and add
   it as a GitHub Actions secret named `RENDER_DEPLOY_HOOK_URL`
   (repo **Settings → Secrets and variables → Actions**). From then on,
   every push to `main` builds, tests, and redeploys automatically via
   `.github/workflows/ci-cd.yml`.

### Persisting data across redeploys (optional, paid)

Attach a Render **Disk** (Starter plan or above) to the web service —
e.g. mounted at `/data` — then set an environment variable:

```
ConnectionStrings__Sqlite=Data Source=/data/employees.db
```

### Using real SQL Server in production (optional, paid)

The app already supports this — it just needs somewhere to run a SQL
Server container with ~2GB+ RAM (Render Standard plan or higher, or
Railway). Deploy `mcr.microsoft.com/mssql/server:2022-latest` as its own
service with `ACCEPT_EULA=Y` and `MSSQL_SA_PASSWORD` set, a persistent
disk at `/var/opt/mssql`, then set these on the web service:

```
DB_HOST=<db service's internal hostname>
DB_PASSWORD=<same password as above>
```

(`DB_PORT` defaults to `1433`, `DB_NAME` to `EmployeeManagementSystem`,
`DB_USER` to `sa` — override any of them if needed.) The app will use
real SQL Server (and run the checked-in EF Core migrations) instead of
SQLite whenever these are set.

## Migrations

To add a new SQL Server migration after changing `Employee.cs` or
`AppDbContext.cs`:

```bash
cd src/EmployeeManagementSystem
dotnet ef migrations add <Name> -o Data/Migrations
```

Migrations apply automatically on startup whenever SQL Server is the
active provider. The SQLite path doesn't use migrations — it creates the
schema directly from the current model (`EnsureCreated`) since it has no
separate migration history of its own.
