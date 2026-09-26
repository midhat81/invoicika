using WebAPI.Models;
using WebAPI.Data;
using Microsoft.EntityFrameworkCore;
using WebAPI.Helpers;

namespace WebAPI.Services
{
    public interface IItemService
    {
        Task<PaginationResult<Item>> GetItemsPagedAndSortedAsync(string? searchTerm, int pageNumber, int pageSize);
        Task<Item> GetItemByIdAsync(Guid id);
        Task AddItemAsync(Item item);
        Task UpdateItemAsync(Item item);
        Task DeleteItemAsync(Guid id);
    }
    public class ItemService : IItemService
    {
        private readonly InvoicikaDbContext _context;

        public ItemService(InvoicikaDbContext context)
        {
            _context = context;
        }

        public async Task<PaginationResult<Item>> GetItemsPagedAndSortedAsync(string? searchTerm, int pageNumber, int pageSize)
        {
            var query = _context.Items.AsQueryable();
            if (!string.IsNullOrEmpty(searchTerm))
            {
                searchTerm = searchTerm.ToLower();
                decimal salePriceSearch;
                bool isNumeric = decimal.TryParse(searchTerm, out salePriceSearch);

                query = query.Where(c =>
                    c.Name.ToLower().Contains(searchTerm.ToLower()) ||
                    (isNumeric && c.SalePrice == salePriceSearch)
                );
            }
            var totalCount = await query.CountAsync();
            var items = await query
                .OrderByDescending(i => i.CreationDate)
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            return new PaginationResult<Item>(items, totalCount, pageNumber, pageSize);
        }

        public async Task<Item> GetItemByIdAsync(Guid id)
        {
            return await _context.Items
                .FirstOrDefaultAsync(i => i.ItemId == id);
        }

        public async Task AddItemAsync(Item item)
        {
            _context.Items.Add(item);
            await _context.SaveChangesAsync();
        }

        public async Task UpdateItemAsync(Item item)
        {
            _context.Items.Update(item);
            await _context.SaveChangesAsync();
        }

        public async Task DeleteItemAsync(Guid id)
        {
            var item = await GetItemByIdAsync(id);
            if (item != null)
            {
                _context.Items.Remove(item);
                await _context.SaveChangesAsync();
            }
        }
    }
 }


