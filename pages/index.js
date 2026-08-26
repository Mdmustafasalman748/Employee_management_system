import { useEffect, useState } from "react";
import Head from "next/head";
import EmployeeForm from "../components/EmployeeForm";

export default function Home() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [showForm, setShowForm] = useState(false);

  async function loadEmployees() {
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/employees");
      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || "Could not load employees");
      }

      setEmployees(result.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadEmployees();
  }, []);

  async function handleAddOrUpdate(formData) {
    setError("");

    try {
      const isEditing = Boolean(editingEmployee);
      const url = isEditing
        ? `/api/employees/${editingEmployee.id}`
        : "/api/employees";
      const method = isEditing ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || "Something went wrong");
      }

      setEditingEmployee(null);
      setShowForm(false);
      loadEmployees();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleDelete(id) {
    const confirmed = window.confirm(
      "Delete this employee record? This can't be undone."
    );

    if (!confirmed) return;

    setError("");

    try {
      const response = await fetch(`/api/employees/${id}`, {
        method: "DELETE",
      });
      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || "Could not delete employee");
      }

      loadEmployees();
    } catch (err) {
      setError(err.message);
    }
  }

  function startEdit(employee) {
    setEditingEmployee(employee);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function startAdd() {
    setEditingEmployee(null);
    setShowForm(true);
  }

  return (
    <>
      <Head>
        <title>Employee Management System</title>
        <meta
          name="description"
          content="A full-stack system for managing employee records"
        />
      </Head>

      <main className="page">
        <header className="page-header">
          <div>
            <p className="kicker">employee management system</p>
            <h1>Manage your team's records</h1>
            <p className="subhead">
              Add, update and remove employee information — backed by
              MongoDB and deployed on Vercel.
            </p>
          </div>

          {!showForm && (
            <button className="btn btn-primary" onClick={startAdd}>
              + Add employee
            </button>
          )}
        </header>

        {error && <p className="error-banner">{error}</p>}

        {showForm && (
          <section className="panel">
            <h2>{editingEmployee ? "Edit employee" : "New employee"}</h2>
            <EmployeeForm
              initialData={editingEmployee}
              onSubmit={handleAddOrUpdate}
              onCancel={() => {
                setShowForm(false);
                setEditingEmployee(null);
              }}
            />
          </section>
        )}

        <section className="panel">
          <div className="panel-head">
            <h2>All employees</h2>
            <span className="count-badge">{employees.length}</span>
          </div>

          {loading ? (
            <p className="empty-state">Loading employees…</p>
          ) : employees.length === 0 ? (
            <p className="empty-state">
              No employees yet. Click "Add employee" to create the first
              record.
            </p>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Position</th>
                    <th>Department</th>
                    <th>Salary</th>
                    <th>Hire date</th>
                    <th aria-label="Actions"></th>
                  </tr>
                </thead>
                <tbody>
                  {employees.map((employee) => (
                    <tr key={employee.id}>
                      <td>{employee.name}</td>
                      <td>{employee.email}</td>
                      <td>{employee.position}</td>
                      <td>{employee.department}</td>
                      <td>
                        {employee.salary
                          ? `$${Number(employee.salary).toLocaleString()}`
                          : "—"}
                      </td>
                      <td>
                        {employee.hireDate
                          ? new Date(employee.hireDate).toLocaleDateString()
                          : "—"}
                      </td>
                      <td className="row-actions">
                        <button
                          className="link-btn"
                          onClick={() => startEdit(employee)}
                        >
                          Edit
                        </button>
                        <button
                          className="link-btn link-btn-danger"
                          onClick={() => handleDelete(employee.id)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>
    </>
  );
}