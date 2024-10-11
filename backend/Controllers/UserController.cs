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
            _users = mongoDbService.Database?.GetCollection<User>("user");
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<User?>> GetById(string id)
        {
            var filter = Builders<User>.Filter.Eq(x => x.Id, id);
            var user = _users.Find(filter).FirstOrDefault();
            return user is not null ? Ok(user) : NotFound();
        }

        [HttpPost]
        public async Task<ActionResult> Create(User user) {
            await _users.InsertOneAsync(user);
            return CreatedAtAction(nameof(GetById), new { id = user.Id}, user);
        }

        [HttpDelete("{id}")]
        public async Task<ActionResult> Delete(string id) {
            var filter = Builders<User>.Filter.Eq(x => x.Id, id);
            await _users.DeleteOneAsync(filter);
            return Ok();
        }
    }
}