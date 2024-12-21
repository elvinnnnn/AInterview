using MongoDB.Bson.Serialization.Attributes;
using MongoDB.Bson;

namespace backend.Entities
{
    public class User
    {
        [BsonId]
        public ObjectId Id { get; set; } // optional to let mongodb generate the id
        public required string Username { get; set; }
        public required string Password { get; set; }
    }
}