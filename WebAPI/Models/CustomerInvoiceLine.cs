using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace WebAPI.Models
{
    public class CustomerInvoiceLine
    {
        [Key]
        public Guid InvoiceLineId { get; set; } = Guid.NewGuid();

        [Required]
        public Guid CustomerInvoice_id { get; set; }

        [ForeignKey(nameof(CustomerInvoice_id))]
        [JsonIgnore]
        public virtual CustomerInvoice CustomerInvoice { get; set; }

        [Required]
        public Guid Item_id { get; set; }

        [ForeignKey(nameof(Item_id))]
        [JsonIgnore]
        public virtual Item Item { get; set; }

        [Required]
        [Column(TypeName = "decimal(10,2)")]
        public decimal Quantity { get; set; }

        [Required]
        [Column(TypeName = "decimal(10,2)")]
        public decimal Price { get; set; }
    }
}
