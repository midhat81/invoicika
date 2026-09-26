using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using WebAPI.Data;
using WebAPI.Dtos;
using WebAPI.Models;

namespace WebAPI.Services
{
    public interface IAuthService
    {
        Task<User> SignupAsync(SignupDto signupDto);
        Task<string> LoginAsync(LoginDto loginDto);
    }

    public class AuthService : IAuthService
    {
        private readonly InvoicikaDbContext _context;
        private readonly IConfiguration _configuration;
        private readonly string _employeeRoleName = "Employee";

        public AuthService(InvoicikaDbContext context, IConfiguration configuration)
        {
            _context = context;
            _configuration = configuration;
        }

        public async Task<User> SignupAsync(SignupDto signupDto)
        {
            var existingUser = await _context.Users
                .FirstOrDefaultAsync(u => u.Username == signupDto.Username);
            if (existingUser != null)
            {
                throw new ArgumentException("Username already exists.");
            }

            var role = await _context.Roles
                .FirstOrDefaultAsync(r => r.RoleName == _employeeRoleName);

            if (role == null)
            {
                throw new InvalidOperationException("Role 'Employee' not found.");
            }

            var newUser = new User
            {
                Username = signupDto.Username,
                EmailAddress = signupDto.EmailAddress,
                PasswordHash = HashPassword(signupDto.Password),
                Role_id = role.RoleId,
                CreationDate = DateTime.UtcNow
            };

            _context.Users.Add(newUser);
            await _context.SaveChangesAsync();

            return newUser;
        }

        public async Task<string> LoginAsync(LoginDto loginDto)
        {
            var user = await _context.Users
                .Include(u => u.Role)
                .FirstOrDefaultAsync(u => u.Username == loginDto.Username && u.PasswordHash == HashPassword(loginDto.Password));

            if (user == null)
            {
                throw new ArgumentException("Invalid username or password.");
            }

            if (user.Role == null)
            {
                throw new InvalidOperationException("User role is not set.");
            }

            return GenerateJwtToken(user);
        }

        private string HashPassword(string password)
        {
            using (var sha256 = SHA256.Create())
            {
                var bytes = sha256.ComputeHash(Encoding.UTF8.GetBytes(password));
                return Convert.ToBase64String(bytes);
            }
        }

        private string GenerateJwtToken(User user)
        {
            var key = Encoding.ASCII.GetBytes(_configuration["Jwt:Key"]);
            var tokenHandler = new JwtSecurityTokenHandler();
            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(new[]
                {
            new Claim(ClaimTypes.Name, user.Username),
            new Claim(ClaimTypes.NameIdentifier, user.UserId.ToString()),
            new Claim(ClaimTypes.Role, user.Role.RoleName)
        }),
                Expires = DateTime.UtcNow.AddDays(Convert.ToDouble(_configuration["Jwt:ExpireDays"])),
                Issuer = _configuration["Jwt:Issuer"],
                Audience = _configuration["Jwt:Audience"],
                SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
            };

            var token = tokenHandler.CreateToken(tokenDescriptor);
            return tokenHandler.WriteToken(token);
        }

    }
}
