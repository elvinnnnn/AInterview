using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using MongoDB.Bson.Serialization.Attributes;
using MongoDB.Bson;

namespace backend
{
    public class Review
    {
        [BsonId]
        public ObjectId Id { get; set; }
        public required string UserId { get; set; }
        public required string DialogueId { get; set; }

        public required string OverallFeedback { get; set; }
        public required Dictionary<int,string> Feedbacks { get; set; }
    }
}