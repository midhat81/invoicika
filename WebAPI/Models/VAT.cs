using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace WebAPI.Models
{
    public class VAT
    {
        [Key]
        public Guid VatId { get; set; } = Guid.NewGuid();

        [Required]
        [Range(0.00, 99.99, ErrorMessage = "VAT percentage must be between 0% and 99.99%.")]
        [Column(TypeName = "decimal(4,2)")]
        public decimal Percentage { get; set; }

        public DateTime CreationDate { get; set; } = DateTime.UtcNow;

        public virtual ICollection<CustomerInvoice> CustomerInvoices { get; set; } = new List<CustomerInvoice>();
    }
}
