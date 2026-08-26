import { sql } from "@vercel/postgres";

export default async function handler(req, res) {
  const { method } = req;

  if (method === "GET") {
    try {
      const { rows } = await sql`
        SELECT id, name, email, position, department, salary,
               hire_date AS "hireDate", created_at AS "createdAt"
        FROM employees
        ORDER BY created_at DESC
      `;
      return res.status(200).json({ success: true, data: rows });
    } catch (error) {
      return res.status(500).json({ success: false, error: error.message });
    }
  }

  if (method === "POST") {
    try {
      const { name, email, position, department, salary, hireDate } = req.body;

      const { rows } = await sql`
        INSERT INTO employees (name, email, position, department, salary, hire_date)
        VALUES (${name}, ${email}, ${position}, ${department}, ${salary}, ${hireDate || null})
        RETURNING id, name, email, position, department, salary,
                  hire_date AS "hireDate", created_at AS "createdAt"
      `;

      return res.status(201).json({ success: true, data: rows[0] });
    } catch (error) {
      return res.status(400).json({ success: false, error: error.message });
    }
  }

  res.setHeader("Allow", ["GET", "POST"]);
  return res
    .status(405)
    .json({ success: false, error: `Method ${method} not allowed` });
}