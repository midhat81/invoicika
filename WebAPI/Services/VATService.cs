using WebAPI.Models;
using WebAPI.Data;
using Microsoft.EntityFrameworkCore;

namespace WebAPI.Services
{
    public interface IVATService
    {
        Task<IEnumerable<VAT>> GetVATsAsync();
        Task<VAT> GetVATByIdAsync(Guid id);
        Task AddVATAsync(VAT vat);
        Task UpdateVATAsync(VAT vat);
        Task DeleteVATAsync(Guid id);
    }

    public class VATService : IVATService
    {
        private readonly InvoicikaDbContext _context;

        public VATService(InvoicikaDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<VAT>> GetVATsAsync()
        {
            return await _context.VATs.ToListAsync();
        }

        public async Task<VAT> GetVATByIdAsync(Guid id)
        {
            return await _context.VATs.FirstOrDefaultAsync(v => v.VatId == id);
        }

        public async Task AddVATAsync(VAT vat)
        {
            _context.VATs.Add(vat);
            await _context.SaveChangesAsync();
        }

        public async Task UpdateVATAsync(VAT vat)
        {
            _context.VATs.Update(vat);
            await _context.SaveChangesAsync();
        }

        public async Task DeleteVATAsync(Guid id)
        {
            var vat = await GetVATByIdAsync(id);
            if (vat != null)
            {
                _context.VATs.Remove(vat);
                await _context.SaveChangesAsync();
            }
        }
    }
}
