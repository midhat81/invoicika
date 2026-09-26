using Microsoft.AspNetCore.Mvc;
using WebAPI.Dtos;
using WebAPI.Models;
using WebAPI.Services;

namespace WebAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class UsersController : ControllerBase
    {
        private readonly IUserService _userService;
        private readonly IWebHostEnvironment _env;
        public UsersController(IUserService userService, IWebHostEnvironment env)
        {
            _userService = userService;
            _env = env;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<UserDto>>> GetUsers()
        {
            var users = await _userService.GetAllUsersAsync();
            var userDtos = users.Select(u => MapToUserDto(u)).ToList();
            return Ok(userDtos);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<UserDto>> GetUserById(Guid id)
        {
            var user = await _userService.GetUserByIdAsync(id);
            if (user == null)
            {
                return NotFound();
            }

            var userDto = MapToUserDto(user);
            return Ok(userDto);
        }

        [HttpPost]
        public async Task<IActionResult> CreateUser([FromBody] UserDto userDto)
        {
            if (await UsernameExists(userDto.Username))
            {
                return BadRequest("Username already exists");
            }

            var user = MapToUser(userDto);
            await _userService.AddUserAsync(user);
            return CreatedAtAction(nameof(GetUserById), new { id = user.UserId }, userDto);
        }

        [HttpPatch("{id}")]
        public async Task<IActionResult> UpdateUser(Guid id, [FromForm] UserDto userDto, [FromForm] IFormFile? photo)
        {
            // Check if the provided ID matches the DTO's UserId
            if (id != userDto.UserId)
            {
                return BadRequest("User ID mismatch");
            }

            // Ensure the username remains unique, excluding the current user
            if (await UsernameExists(userDto.Username, id))
            {
                return BadRequest("Username already exists");
            }
            if (photo != null)
            {
                var uploadsFolder = Path.Combine(_env.WebRootPath, "uploads");
                var uniqueFileName = Guid.NewGuid().ToString() + "_" + photo.FileName;
                var filePath = Path.Combine(uploadsFolder, uniqueFileName);
                using (var fileStream = new FileStream(filePath, FileMode.Create))
                {
                    await photo.CopyToAsync(fileStream);
                }
                userDto.PhotoUrl = "/uploads/" + uniqueFileName;
            }
            // Map the UserDto to a User model
            var user = MapToUser(userDto);

            // Call the service to update the user with conditional PasswordHash handling
            await _userService.UpdateUserAsync(id, userDto);

            return NoContent();
        }


        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteUser(Guid id)
        {
            await _userService.DeleteUserAsync(id);
            return NoContent();
        }

        // Mapping from User to UserDto
        private UserDto MapToUserDto(User user)
        {
            return new UserDto
            {
                UserId = user.UserId,
                Username = user.Username,
                EmailAddress = user.EmailAddress,
                PhotoUrl = user.PhotoUrl,
                PasswordHash = user.PasswordHash,
                Role_id = user.Role_id,
                RoleName = user.Role?.RoleName,
                CreationDate = user.CreationDate,
                UpdateDate = user.UpdateDate
            };
        }

        // Mapping from UserDto to User
        private User MapToUser(UserDto userDto)
        {
            return new User
            {
                UserId = userDto.UserId,
                Username = userDto.Username,
                EmailAddress = userDto.EmailAddress,
                PhotoUrl = userDto.PhotoUrl,
                PasswordHash = userDto.PasswordHash,  // Make sure to handle password securely
                Role_id = userDto.Role_id,
                CreationDate = userDto.CreationDate ?? DateTime.UtcNow,
                UpdateDate = userDto.UpdateDate
            };
        }

        // Check if username already exists
        private async Task<bool> UsernameExists(string username, Guid? userId = null)
        {
            var existingUsers = await _userService.GetAllUsersAsync();
            if (userId.HasValue)
            {
                return existingUsers.Any(u => u.Username == username && u.UserId != userId.Value);
            }

            return existingUsers.Any(u => u.Username == username);
        }
    }
}
