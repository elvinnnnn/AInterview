using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using MongoDB.Bson.Serialization.Attributes;
using MongoDB.Bson;

namespace backend
{
    public class Dialogue
    {
        [BsonId]
        public ObjectId Id { get; set; }
        public required string JobTitle { get; set; }
        public required string UserId { get; set; }
        public required int CurrentQuestionIndex { get; set; }
        public required string Greeting { get; set; }
        public required Dictionary<int, QnA> Questions { get; set; }
        public required string Farewell { get; set; }
        public class QnA
        {
            public required string Question { get; set; }
            public required string Answer { get; set; }
        }
    }
}