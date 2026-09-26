using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using WebAPI.Models;
using WebAPI.Services;


namespace WebAPI.Controllers
{
    [ApiController]
    [Authorize]
    [Route("api/[controller]")]
    public class ItemsController : ControllerBase
    {
        private readonly IItemService _itemService;

        public ItemsController(IItemService itemService)
        {
            _itemService = itemService;
        }

        // GET: api/Items
        [Authorize(Roles = "Employee, Admin")]
        [HttpGet]
        public async Task<IActionResult> GetItems([FromQuery] string? searchTerm, [FromQuery] int pageNumber = 1, [FromQuery] int pageSize = 10)
        {
            var result = await _itemService.GetItemsPagedAndSortedAsync(searchTerm, pageNumber, pageSize);
            return Ok(result);
        }

        // GET: api/Items/{id}
        [Authorize(Roles = "Employee, Admin")]
        [HttpGet("{id}")]
        public async Task<IActionResult> GetItemById(Guid id)
        {
            var item = await _itemService.GetItemByIdAsync(id);
            if (item == null)
            {
                return NotFound();
            }
            return Ok(item);
        }

        // POST: api/Items
        [Authorize(Roles = "Admin")]
        [HttpPost]
        public async Task<IActionResult> CreateItem([FromBody] Item item)
        {
            if (item == null)
            {
                return BadRequest();
            }

            await _itemService.AddItemAsync(item);
            return CreatedAtAction(nameof(GetItemById), new { id = item.ItemId }, item);
        }

        // PUT: api/Items/{id}
        [Authorize(Roles = "Admin")]
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateItem(Guid id, [FromBody] Item item)
        {
            if (id != item.ItemId)
            {
                return BadRequest("Item ID mismatch");
            }

            var existingItem = await _itemService.GetItemByIdAsync(id);
            if (existingItem == null)
            {
                return NotFound();
            }

            existingItem.Name = item.Name;
            existingItem.Description = item.Description;
            existingItem.PurchasePrice = item.PurchasePrice;
            existingItem.SalePrice = item.SalePrice;
            existingItem.Quantity = item.Quantity;
            existingItem.User_id = item.User_id;
            await _itemService.UpdateItemAsync(existingItem);
            return NoContent();
        }

        // DELETE: api/Items/{id}
        [Authorize(Roles = "Admin")]
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteItem(Guid id)
        {
            var existingItem = await _itemService.GetItemByIdAsync(id);
            if (existingItem == null)
            {
                return NotFound();
            }

            await _itemService.DeleteItemAsync(id);
            return NoContent();
        }
    }
}
