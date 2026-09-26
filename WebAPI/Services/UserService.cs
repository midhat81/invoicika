using WebAPI.Models;
using Microsoft.EntityFrameworkCore;
using WebAPI.Data;
using WebAPI.Dtos;
using System.Text;
using System.Security.Cryptography;

namespace WebAPI.Services
{
    public interface IUserService
    {
        Task<IEnumerable<User>> GetAllUsersAsync();
        Task<User> GetUserByIdAsync(Guid id);
        Task AddUserAsync(User user);
        Task UpdateUserAsync(Guid id, UserDto userDto);
        Task DeleteUserAsync(Guid id);
    }

    public class UserService : IUserService
    {
        private readonly InvoicikaDbContext _context;

        public UserService(InvoicikaDbContext context)
        {
            _context = context;
        }

        // Fetch all users including their roles
        public async Task<IEnumerable<User>> GetAllUsersAsync()
        {
            return await _context.Users
                .Include(u => u.Role)
                .ToListAsync();
        }

        // Get a user by their ID including their role
        public async Task<User> GetUserByIdAsync(Guid id)
        {
            return await _context.Users
                .Include(u => u.Role)
                .FirstOrDefaultAsync(u => u.UserId == id);
        }

        // Add a new user, ensuring the username is unique
        public async Task AddUserAsync(User user)
        {
            if (await UsernameExistsAsync(user.Username))
            {
                throw new ArgumentException("Username already exists.");
            }

            _context.Users.Add(user);
            await _context.SaveChangesAsync();
        }

        // Update an existing user, ensuring the username remains unique
        public async Task UpdateUserAsync(Guid id, UserDto userDto)
        {
            var user = await _context.Users
                .Include(u => u.Role)
                .FirstOrDefaultAsync(u => u.UserId == id);

            if (user == null)
            {
                throw new ArgumentException("User not found.");
            }

            if (await UsernameExistsAsync(userDto.Username, id))
            {
                throw new ArgumentException("Username already exists.");
            }

            // Update only the properties that are provided in the DTO
            user.Username = userDto.Username;
            user.EmailAddress = userDto.EmailAddress;
            user.PhotoUrl = userDto.PhotoUrl;
            user.Role_id = userDto.Role_id;
            user.UpdateDate = DateTime.UtcNow;

            // Update PasswordHash only if provided
            if (!string.IsNullOrEmpty(userDto.PasswordHash) && userDto.PasswordHash != "null")
            {
                user.PasswordHash = HashPassword(userDto.PasswordHash);
            }

            // Save changes
            await _context.SaveChangesAsync();
        }



        // Delete a user by their ID
        public async Task DeleteUserAsync(Guid id)
        {
            var user = await GetUserByIdAsync(id);
            if (user != null)
            {
                _context.Users.Remove(user);
                await _context.SaveChangesAsync();
            }
        }

        // Helper method to check if a username exists, excluding the user with the given ID if provided
        private async Task<bool> UsernameExistsAsync(string username, Guid? excludeUserId = null)
        {
            return await _context.Users
                .AnyAsync(u => u.Username == username && (!excludeUserId.HasValue || u.UserId != excludeUserId.Value));
        }
        private string HashPassword(string password)
        {
            using (var sha256 = SHA256.Create())
            {
                var bytes = sha256.ComputeHash(Encoding.UTF8.GetBytes(password));
                return Convert.ToBase64String(bytes);
            }
        }
    }
}
