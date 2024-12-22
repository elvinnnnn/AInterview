using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Http;
using backend.Data;
using MongoDB.Driver;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class UserController : ControllerBase
    {
        private readonly IMongoCollection<User>? _users;
        public UserController(MongoDbService mongoDbService) {
            _users = mongoDbService.Database?.GetCollection<User>("users");
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
            await _users!.InsertOneAsync(registerUser);
            return Ok(new {id = registerUser.Id});
        }

        // Find the existence of a username/password. If exists, return user Id.
        [HttpPost("login")]
        public async Task<ActionResult> Login([FromBody] User loginUser) {
            var filter = Builders<User>.Filter.Eq("Username", loginUser.Username) & Builders<User>.Filter.Eq("Password", loginUser.Password);
            var user = await _users.Find(filter).FirstOrDefaultAsync();
            return user is not null ? Ok(new {id = user.Id}) : NotFound();
        }

        // Remove user by ID
        [HttpDelete("{id}")]
        public async Task<ActionResult> Delete(string id) {
            var filter = Builders<User>.Filter.Eq("Id", id);
            await _users!.DeleteOneAsync(filter);
            return Ok();
        }
    }
}