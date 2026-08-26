# Employee Management System

A full-stack system for managing employee records — add, edit, delete
and view employees. Built with **Next.js**, **React**, and **Vercel
Postgres**.

## 1. Push this project to GitHub first

1. Create a new repository on GitHub (e.g. `employee-management-system`).
2. In this project folder, run:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/<your-username>/employee-management-system.git
   git push -u origin main
   ```
   (No database password to worry about leaking this time — nothing
   sensitive lives in this repo.)

## 2. Import the project into Vercel

1. Go to [vercel.com](https://vercel.com) and sign in with GitHub.
2. Click **Add New → Project**, import your `employee-management-system` repo.
3. Click **Deploy**. It will build successfully even before the database
   exists — the pages just won't load data yet.

## 3. Create your Postgres database (inside Vercel — no separate account needed)

1. Open your project in the Vercel dashboard.
2. Click the **Storage** tab → **Create Database** → choose **Postgres**.
3. Give it a name and click **Create**. Vercel provisions it in seconds.
4. On the next screen, click **Connect** to link this database to your
   `employee-management-system` project. This automatically adds all the
   required environment variables (`POSTGRES_URL`, etc.) to your project
   — you don't need to type any connection string yourself.
5. Go to your project's **Deployments** tab and **redeploy** the latest
   deployment (three-dot menu → Redeploy) so it picks up the new
   environment variables.

## 4. Create the database table

Your table doesn't exist yet — this project includes a one-time setup
route that creates it for you.

1. Visit `https://<your-site>.vercel.app/api/setup` in your browser once.
2. You should see `{"success":true,"message":"employees table is ready"}`.
3. That's it — go to your homepage and start adding employees.

## Running it locally (optional)

```bash
npm install -g vercel      # if you don't have the Vercel CLI yet
vercel link                # connect this folder to your Vercel project
vercel env pull .env.local # download the database connection details
npm install
npm run dev
```

Then visit `http://localhost:3000/api/setup` once, and
`http://localhost:3000` to use the app.

## Project structure

```
pages/
  index.js              → main UI (list, add, edit, delete)
  _app.js                → loads global styles
  api/
    setup.js             → one-time: creates the employees table
    employees/
      index.js           → GET (list) & POST (create)
      [id].js             → GET / PUT / DELETE one employee
components/
  EmployeeForm.js         → shared add/edit form
styles/
  globals.css
```

## Features

- Add, edit and delete employee records
- Fields: name, email, position, department, salary, hire date
- Data persists in Vercel Postgres
- Responsive UI