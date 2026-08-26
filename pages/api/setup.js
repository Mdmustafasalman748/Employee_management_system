import { sql } from "@vercel/postgres";

// Visit /api/setup once (locally or on your deployed site) to create the
// employees table. Safe to call more than once — it won't overwrite
// existing data.
export default async function handler(req, res) {
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS employees (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT NOT NULL,
        position TEXT NOT NULL,
        department TEXT NOT NULL,
        salary NUMERIC NOT NULL,
        hire_date DATE,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `;

    return res
      .status(200)
      .json({ success: true, message: "employees table is ready" });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
}