using MongoDB.Bson.Serialization.Attributes;
using MongoDB.Bson;

namespace backend
{
    public class User
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public ObjectId Id { get; set; } 
        [BsonElement("username")]
        public required string Username { get; set; }
        [BsonElement("password")]
        public required string Password { get; set; }
    }
}