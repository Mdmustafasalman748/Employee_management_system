import { sql } from "@vercel/postgres";

export default async function handler(req, res) {
  const {
    method,
    query: { id },
  } = req;

  if (method === "GET") {
    try {
      const { rows } = await sql`
        SELECT id, name, email, position, department, salary,
               hire_date AS "hireDate", created_at AS "createdAt"
        FROM employees WHERE id = ${id}
      `;

      if (rows.length === 0) {
        return res
          .status(404)
          .json({ success: false, error: "Employee not found" });
      }

      return res.status(200).json({ success: true, data: rows[0] });
    } catch (error) {
      return res.status(400).json({ success: false, error: error.message });
    }
  }

  if (method === "PUT") {
    try {
      const { name, email, position, department, salary, hireDate } = req.body;

      const { rows } = await sql`
        UPDATE employees
        SET name = ${name},
            email = ${email},
            position = ${position},
            department = ${department},
            salary = ${salary},
            hire_date = ${hireDate || null}
        WHERE id = ${id}
        RETURNING id, name, email, position, department, salary,
                  hire_date AS "hireDate", created_at AS "createdAt"
      `;

      if (rows.length === 0) {
        return res
          .status(404)
          .json({ success: false, error: "Employee not found" });
      }

      return res.status(200).json({ success: true, data: rows[0] });
    } catch (error) {
      return res.status(400).json({ success: false, error: error.message });
    }
  }

  if (method === "DELETE") {
    try {
      const { rowCount } = await sql`DELETE FROM employees WHERE id = ${id}`;

      if (rowCount === 0) {
        return res
          .status(404)
          .json({ success: false, error: "Employee not found" });
      }

      return res.status(200).json({ success: true, data: {} });
    } catch (error) {
      return res.status(400).json({ success: false, error: error.message });
    }
  }

  res.setHeader("Allow", ["GET", "PUT", "DELETE"]);
  return res
    .status(405)
    .json({ success: false, error: `Method ${method} not allowed` });
}