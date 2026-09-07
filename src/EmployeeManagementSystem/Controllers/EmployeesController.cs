using System.Diagnostics;
using EmployeeManagementSystem.Data;
using EmployeeManagementSystem.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace EmployeeManagementSystem.Controllers;

public class EmployeesController : Controller
{
    private readonly AppDbContext _context;

    public EmployeesController(AppDbContext context)
    {
        _context = context;
    }

    // GET: /Employees
    public async Task<IActionResult> Index()
    {
        var employees = await _context.Employees
            .OrderByDescending(e => e.CreatedAt)
            .ToListAsync();

        return View(employees);
    }

    // GET: /Employees/Create
    public IActionResult Create()
    {
        return View(new Employee());
    }

    // POST: /Employees/Create
    [HttpPost]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> Create(
        [Bind("Name,Email,Position,Department,Salary,HireDate")] Employee employee)
    {
        if (!ModelState.IsValid)
        {
            return View(employee);
        }

        _context.Employees.Add(employee);
        await _context.SaveChangesAsync();

        TempData["Message"] = $"{employee.Name} was added.";
        return RedirectToAction(nameof(Index));
    }

    // GET: /Employees/Edit/5
    public async Task<IActionResult> Edit(int? id)
    {
        if (id is null)
        {
            return NotFound();
        }

        var employee = await _context.Employees.FindAsync(id.Value);
        if (employee is null)
        {
            return NotFound();
        }

        return View(employee);
    }

    // POST: /Employees/Edit/5
    [HttpPost]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> Edit(
        int id,
        [Bind("Id,Name,Email,Position,Department,Salary,HireDate,CreatedAt")] Employee employee)
    {
        if (id != employee.Id)
        {
            return NotFound();
        }

        if (!ModelState.IsValid)
        {
            return View(employee);
        }

        try
        {
            _context.Employees.Update(employee);
            await _context.SaveChangesAsync();
        }
        catch (DbUpdateConcurrencyException)
        {
            if (!await EmployeeExists(employee.Id))
            {
                return NotFound();
            }

            throw;
        }

        TempData["Message"] = $"{employee.Name} was updated.";
        return RedirectToAction(nameof(Index));
    }

    // GET: /Employees/Delete/5
    public async Task<IActionResult> Delete(int? id)
    {
        if (id is null)
        {
            return NotFound();
        }

        var employee = await _context.Employees.FirstOrDefaultAsync(e => e.Id == id.Value);
        if (employee is null)
        {
            return NotFound();
        }

        return View(employee);
    }

    // POST: /Employees/Delete/5
    [HttpPost, ActionName("Delete")]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> DeleteConfirmed(int id)
    {
        var employee = await _context.Employees.FindAsync(id);
        if (employee is not null)
        {
            _context.Employees.Remove(employee);
            await _context.SaveChangesAsync();
            TempData["Message"] = $"{employee.Name} was deleted.";
        }

        return RedirectToAction(nameof(Index));
    }

    private async Task<bool> EmployeeExists(int id)
    {
        return await _context.Employees.AnyAsync(e => e.Id == id);
    }

    [Route("/Employees/Error")]
    public IActionResult Error()
    {
        return View("Error", new ErrorViewModel
        {
            RequestId = Activity.Current?.Id ?? HttpContext.TraceIdentifier
        });
    }
}
