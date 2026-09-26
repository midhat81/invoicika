using Microsoft.AspNetCore.Mvc;
using WebAPI.Dtos;
using WebAPI.Services;

namespace WebAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class CustomerInvoicesController : ControllerBase
    {
        private readonly ICustomerInvoiceService _service;

        public CustomerInvoicesController(ICustomerInvoiceService service)
        {
            _service = service;
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<CustomerInvoiceDto>> GetCustomerInvoice(Guid id)
        {
            try
            {
                var invoice = await _service.GetCustomerInvoiceByIdAsync(id);
                if (invoice == null)
                {
                    return NotFound();
                }
                return Ok(invoice);
            }
            catch (KeyNotFoundException)
            {
                return NotFound();
            }
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<CustomerInvoiceDto>>> GetAllCustomerInvoices()
        {
            var invoices = await _service.GetAllCustomerInvoicesAsync();
            if (invoices == null)
            {
                return NotFound();
            }
            return Ok(invoices);
        }

        [HttpPost]
        public async Task<ActionResult> CreateCustomerInvoice([FromBody] CustomerInvoiceDto dto)
        {
            await _service.CreateCustomerInvoiceAsync(dto);
            return CreatedAtAction(nameof(GetCustomerInvoice), new { id = dto.CustomerInvoiceId }, dto);
        }

        // PUT: api/CustomerInvoice/{id}
        /*
        [HttpPut("{id}")]
        public async Task<ActionResult> UpdateCustomerInvoice(Guid id, [FromBody] CustomerInvoiceDto dto)
        {
            try
            {
                await _service.UpdateCustomerInvoiceAsync(id, dto);
                return NoContent();
            }
            catch (KeyNotFoundException)
            {
                return NotFound();
            }
        } */

        // PUT: api/CustomerInvoice/{id}
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateInvoice(Guid id, [FromBody] CustomerInvoiceDto updatedInvoice)
        {
            var updated = await _service.UpdateCustomerInvoiceAsync(id, updatedInvoice);
            if (!updated)
            {
                return NotFound();
            }

            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<ActionResult> DeleteCustomerInvoice(Guid id)
        {
            try
            {
                await _service.DeleteCustomerInvoiceAsync(id);
                return NoContent();
            }
            catch (KeyNotFoundException)
            {
                return NotFound();
            }
        }

        [HttpGet("pdf/{id}")]
        public async Task<IActionResult> GenerateInvoicePdf(Guid id)
        {
            try
            {
                var pdfBytes = await _service.GenerateInvoicePdfAsync(id);
                return File(pdfBytes, "application/pdf", "invoice.pdf");
            }
            catch (Exception ex)
            {
                return NotFound(ex.Message);
            }
        }

        [HttpPost("email/{invoiceId}")]
        public async Task<IActionResult> SendInvoiceEmail(Guid invoiceId)
        {
            try
            {
                await _service.SendInvoiceEmailAsync(invoiceId);
                return Ok(new { message = "Email sent successfully." });
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error: {ex.Message}");
            }
        }

    }

}
