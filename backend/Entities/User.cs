using MongoDB.Bson.Serialization.Attributes;
using MongoDB.Bson;

namespace backend
{
    public class User
    {
        [BsonId]
        public ObjectId Id { get; set; } // optional to let mongodb generate the id
        [BsonElement("username")]
        public required string Username { get; set; }
        [BsonElement("password")]
        public required string Password { get; set; }
    }
}