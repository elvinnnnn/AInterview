using Microsoft.AspNetCore.Mvc;
using backend.Data;
using MongoDB.Driver;

namespace backend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class UserController : ControllerBase
{
    private readonly IMongoCollection<User>? _users;
    private readonly AuthService _authService;
    public UserController(MongoDbService mongoDbService, AuthService authService) {
        _users = mongoDbService.Database?.GetCollection<User>("users");
        _authService = authService;
    }

    // To find the user based off ID.
    [HttpGet("{id}")]
    public async Task<ActionResult<User>> GetById(string id)
    {
        var filter = Builders<User>.Filter.Eq("Id", id);
        var user = await _users.Find(filter).FirstOrDefaultAsync();
        return user is not null ? Ok(user) : NotFound();
    }
    
    // Remove user by ID
    [HttpDelete("{id}")]
    public async Task<ActionResult> Delete(string id) {
        var filter = Builders<User>.Filter.Eq("Id", id);
        await _users!.DeleteOneAsync(filter);
        return Ok();
    }

    // Create a new user
    [HttpPost("register")]
    public async Task<ActionResult> Create([FromBody] User registerUser) {
        Console.WriteLine($"Username: {registerUser.Username}, Password: {registerUser.Password}");
        try {
            if (registerUser.Password.Length < 6) {
                return BadRequest(new {message = "Password must be at least 6 characters long."});
            }
            var filter = Builders<User>.Filter.Eq("Username", registerUser.Username);
            var user = await _users.Find(filter).FirstOrDefaultAsync();
            if (user is not null) {
                return BadRequest(new {message = "Username already exists."});
            }
            // Hash the password
            registerUser.Password = BCrypt.Net.BCrypt.HashPassword(registerUser.Password);
            await _users!.InsertOneAsync(registerUser);
            var token = _authService.GenerateToken(registerUser);
            return Ok(new { token, message = "Registration Successful" });
        } catch (Exception e) {
            return BadRequest(new {message = e.Message});
        }
    }

    // Find the existence of a username/password. If exists, return user Id.
    [HttpPost("login")]
    public async Task<ActionResult> Login([FromBody] User loginUser) {
        var filter = Builders<User>.Filter.Eq("Username", loginUser.Username);
        var foundUser = await _users.Find(filter).FirstOrDefaultAsync();
        if (foundUser is null || !_authService.VerifyPassword(loginUser.Password, foundUser.Password)) {
            return BadRequest(new {message = "Invalid username or password."});
        }
        var token = _authService.GenerateToken(loginUser);
        return Ok(new { token, message = "Login Successful" });
    }
    
    [HttpPost("logout")]
    public ActionResult Logout() {
        // Remove the jwtToken cookie by setting its expiration date in the past
        var cookieOptions = new CookieOptions
        {
            Expires = DateTime.UtcNow.AddDays(-1), // Set expiration date in the past
            HttpOnly = true,
            Secure = false, // Set to false for local development; true for production
            SameSite = SameSiteMode.Lax
        };
        Response.Cookies.Append("jwtToken", "", cookieOptions);
        return Ok(new { message = "Logout successful." });
    }
}
