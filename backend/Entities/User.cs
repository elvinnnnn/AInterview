using MongoDB.Bson.Serialization.Attributes;

namespace backend.Entities
{
    public class User
    {
        [BsonId]
        [BsonElement("_id"), BsonRepresentation(MongoDB.Bson.BsonType.ObjectId)]
        public string? Id { get; set; }
        
        [BsonElement("username"), BsonRepresentation(MongoDB.Bson.BsonType.String)]
        public string? Username { get; set; }
        
        [BsonElement("password"), BsonRepresentation(MongoDB.Bson.BsonType.String)]
        public string? Password { get; set; }
    }
}