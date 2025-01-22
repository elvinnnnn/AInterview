using MongoDB.Bson.Serialization.Attributes;
using MongoDB.Bson;

namespace backend
{
    public class Dialogue
    {
        [BsonId]
        public required string Id { get; set; }
        public required string JobTitle { get; set; }
        public required string UserId { get; set; }
        public required int CurrentQuestionIndex { get; set; }
        public required Dictionary<string, QnA> Messages { get; set; }
        public class QnA
        {
            public required string Question { get; set; }
            public required string Answer { get; set; }
        }
    }

    public class CreateDialogueRequest
    {
        public required string Description { get; set; }
        public required string UserId { get; set; }
    }
}