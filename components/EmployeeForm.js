import { useState, useEffect } from "react";

const emptyForm = {
  name: "",
  email: "",
  position: "",
  department: "",
  salary: "",
  hireDate: "",
};

export default function EmployeeForm({ initialData, onSubmit, onCancel }) {
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    if (initialData) {
      setForm({
        name: initialData.name || "",
        email: initialData.email || "",
        position: initialData.position || "",
        department: initialData.department || "",
        salary: initialData.salary ?? "",
        hireDate: initialData.hireDate
          ? initialData.hireDate.substring(0, 10)
          : "",
      });
    } else {
      setForm(emptyForm);
    }
  }, [initialData]);

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((previous) => ({ ...previous, [name]: value }));
  }

  function handleSubmit(event) {
    event.preventDefault();
    onSubmit({
      ...form,
      salary: Number(form.salary),
    });
  }

  return (
    <form className="employee-form" onSubmit={handleSubmit}>
      <div className="form-grid">
        <label>
          Full name
          <input
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="Jane Doe"
            required
          />
        </label>

        <label>
          Email
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            placeholder="jane@company.com"
            required
          />
        </label>

        <label>
          Position
          <input
            type="text"
            name="position"
            value={form.position}
            onChange={handleChange}
            placeholder="Software Engineer"
            required
          />
        </label>

        <label>
          Department
          <input
            type="text"
            name="department"
            value={form.department}
            onChange={handleChange}
            placeholder="Engineering"
            required
          />
        </label>

        <label>
          Salary (USD)
          <input
            type="number"
            name="salary"
            value={form.salary}
            onChange={handleChange}
            placeholder="65000"
            min="0"
            required
          />
        </label>

        <label>
          Hire date
          <input
            type="date"
            name="hireDate"
            value={form.hireDate}
            onChange={handleChange}
          />
        </label>
      </div>

      <div className="form-actions">
        <button type="submit" className="btn btn-primary">
          {initialData ? "Save changes" : "Add employee"}
        </button>

        {initialData && (
          <button type="button" className="btn btn-ghost" onClick={onCancel}>
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}