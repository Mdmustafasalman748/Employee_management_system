using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace EmployeeManagementSystem.Models;

public class Employee
{
    public int Id { get; set; }

    [Required(ErrorMessage = "Full name is required.")]
    [StringLength(200)]
    [Display(Name = "Full name")]
    public string Name { get; set; } = string.Empty;

    [Required(ErrorMessage = "Email is required.")]
    [EmailAddress(ErrorMessage = "Enter a valid email address.")]
    [StringLength(200)]
    public string Email { get; set; } = string.Empty;

    [Required(ErrorMessage = "Position is required.")]
    [StringLength(150)]
    public string Position { get; set; } = string.Empty;

    [Required(ErrorMessage = "Department is required.")]
    [StringLength(150)]
    public string Department { get; set; } = string.Empty;

    [Required(ErrorMessage = "Salary is required.")]
    [Range(0, 100_000_000, ErrorMessage = "Salary must be zero or greater.")]
    [Column(TypeName = "decimal(12,2)")]
    public decimal Salary { get; set; }

    [Display(Name = "Hire date")]
    [DataType(DataType.Date)]
    public DateTime? HireDate { get; set; }

    [Display(Name = "Created")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
