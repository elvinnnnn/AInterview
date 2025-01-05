using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Http;
using backend.Data;
using MongoDB.Driver;
using System.Security.Cryptography.X509Certificates;
using System.Data.SqlTypes;
using BCrypt.Net;
using Microsoft.Extensions.Configuration.UserSecrets;

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

    // Create a new user
    [HttpPost("register")]
    public async Task<ActionResult> Create([FromBody] User registerUser) {
        Console.WriteLine($"Username: {registerUser.Username}, Password: {registerUser.Password}");
        try {
            if (registerUser.Password.Length < 6) {
                return BadRequest("Password must be at least 6 characters long.");
            }
            var filter = Builders<User>.Filter.Eq("Username", registerUser.Username);
            var user = await _users.Find(filter).FirstOrDefaultAsync();
            if (user is not null) {
                return BadRequest(new {message = "Username already exists."});
            }
            // Hash the password
            registerUser.Password = BCrypt.Net.BCrypt.HashPassword(registerUser.Password);
            await _users!.InsertOneAsync(registerUser);
            return ResponsePayload(registerUser, "Registration");
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
        return ResponsePayload(foundUser, "Login");
    }

    // Remove user by ID
    [HttpDelete("{id}")]
    public async Task<ActionResult> Delete(string id) {
        var filter = Builders<User>.Filter.Eq("Id", id);
        await _users!.DeleteOneAsync(filter);
        return Ok();
    }

    private ActionResult ResponsePayload(User user, string action) {
        // Generate JWT token
        var token = _authService.GenerateToken(user);

        // Set the token in a cookie
        // change Secure = true, and SameSite = SameSiteMode.Strict for production
        var cookieOptions = new CookieOptions
        {
            HttpOnly = true, // Prevents JavaScript access to the cookie
            Secure = false, // Ensures the cookie is only sent over HTTPS
            SameSite = SameSiteMode.Lax, // Prevents CSRF attacks
            Expires = DateTime.UtcNow.AddHours(1), // Set the expiration time
        };
        Response.Cookies.Append("jwtToken", token, cookieOptions);

        return Ok(new { id = user.Id, token, message = action + " Successful." });
    }
}
