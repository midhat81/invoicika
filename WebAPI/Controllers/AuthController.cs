using Microsoft.AspNetCore.Mvc;
using WebAPI.Dtos;
using WebAPI.Services;

[Route("api/[controller]")]
[ApiController]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;

    public AuthController(IAuthService authService)
    {
        _authService = authService;
    }

    [HttpPost("signup")]
    public async Task<IActionResult> Signup([FromBody] SignupDto signupDto)
    {
        try
        {
            if (signupDto == null)
            {
                return BadRequest("Signup data is required.");
            }

            if (string.IsNullOrEmpty(signupDto.Username) || string.IsNullOrEmpty(signupDto.EmailAddress) || string.IsNullOrEmpty(signupDto.Password))
            {
                return BadRequest("Username, email, and password are required.");
            }

            var user = await _authService.SignupAsync(signupDto);
            return CreatedAtAction(nameof(Signup), new { id = user.UserId }, user);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(ex.Message);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ex.Message);
        }
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginDto loginDto)
    {
        try
        {
            if (loginDto == null)
            {
                return BadRequest("Login data is required.");
            }

            if (string.IsNullOrEmpty(loginDto.Username) || string.IsNullOrEmpty(loginDto.Password))
            {
                return BadRequest("Username and password are required.");
            }

            var token = await _authService.LoginAsync(loginDto);
            return Ok(new { Token = token });
        }
        catch (ArgumentException ex)
        {
            return Unauthorized(ex.Message);
        }
    }
}
