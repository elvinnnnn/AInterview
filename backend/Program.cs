using Microsoft.AspNetCore.Mvc;
using OpenAI.Chat;
using System;
using System.Collections.Generic;
using System.Globalization;
using System.Runtime.CompilerServices;
using System.Text.Json;
using MongoDB.Driver;
using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

ChatClient client = new(model: "gpt-4o-mini", apiKey: Environment.GetEnvironmentVariable("OPENAI_API_KEY"));

var connectionString = Environment.GetEnvironmentVariable("MONGODB_URI");

if (connectionString == null) {
    Console.WriteLine("MongoDB environment variable missing");
    Environment.Exit(0);
}
var db = new MongoClient(connectionString);
var collection = db.GetDatabase("ainterview").GetCollection<BsonDocument>("dialogues");

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddCors(options => {
    options.AddPolicy("ainterview", policyBuilder => {
        policyBuilder.WithOrigins("http://localhost:3000")
            .AllowAnyHeader()
            .AllowAnyMethod();
    });
});

var app = builder.Build();

app.UseCors("ainterview");

DotNetEnv.Env.Load();

var messages = new List<ChatMessage>{
    new SystemChatMessage("You are a job interviewer. You will be provided with a job description. Provide the job title, with the company's name if possible. First give a greeting, then formulate 10 questions based on the job description, but also include general questions at the start. Number these questions by simply providing an integer, do NOT include any words/characters. At the end give a farewell and thank them for coming.")
};

ChatCompletionOptions options = new()
{
    ResponseFormat = ChatResponseFormat.CreateJsonSchemaFormat(
        jsonSchemaFormatName: "job-interview",
        jsonSchema: BinaryData.FromBytes("""
        {   
            "type": "object",
            "properties": {
                "job_title": { "type": "string" },
                "greeting": { "type": "string" },
                "questions": {
                    "type": "array",
                    "items": {
                        "type": "object",
                        "properties": {
                            "number": { "type": "string" },
                            "question": { "type": "string" }
                        },
                        "required": ["number", "question"],
                        "additionalProperties": false
                    }
                },
                "farewell": { "type": "string" }
            },
            "required": ["greeting", "job_title", "questions", "farewell"],
            "additionalProperties": false
        }
        """u8.ToArray()),
        jsonSchemaIsStrict: true
    )
};

string DialogueToDB(Dialogue dialogue) {
    var document = new BsonDocument
    {
        { "user_id", dialogue.user_id },
        { "job_title", dialogue.job_title },
        { "current_question_index", dialogue.current_question_index },
        { "greeting", dialogue.greeting },
        { "farewell", dialogue.farewell },
        { "questions", new BsonDocument(dialogue.questions.Select(q => new BsonElement(q.Key.ToString(), new BsonDocument
        {
            { "question", q.Value.question },
            { "answer", q.Value.answer }
        }))) }
    };
    collection.InsertOne(document);
    return document["_id"]?.ToString() ?? string.Empty;
}

app.MapPost("/dialogues", async ([FromBody] string description) => {
    messages.Add(new UserChatMessage(description));
    ChatCompletion completion = await client.CompleteChatAsync(messages, options);

    using JsonDocument structuredJson = JsonDocument.Parse(completion.Content[0].Text);
    Console.WriteLine(structuredJson);
    var dialogue = new Dialogue
    {
        user_id = "wip",
        job_title = structuredJson.RootElement.GetProperty("job_title").GetString() ?? string.Empty,
        current_question_index = 0,
        greeting = structuredJson.RootElement.GetProperty("greeting").GetString() ?? string.Empty,
        farewell = structuredJson.RootElement.GetProperty("farewell").GetString() ?? string.Empty,
        questions = new Dictionary<int, Question>()
    };

    foreach (JsonElement stepElement in structuredJson.RootElement.GetProperty("questions").EnumerateArray())
    {
        dialogue.questions.Add(int.Parse(stepElement.GetProperty("number").GetString() ?? "-1"), new Question
        {
            question = stepElement.GetProperty("question").GetString() ?? string.Empty,
            answer = ""
        });
    }
    var dialogue_id = DialogueToDB(dialogue);
    var returnDict = new Dictionary<string, string>
    {
        { "greeting", dialogue.greeting },
        { "id", dialogue_id }
    };
    return returnDict;
});

app.MapPut("/answer", (AnswerRequest request) => {
    var filter = Builders<BsonDocument>.Filter.Eq("_id", ObjectId.Parse(request.id));
    var dialogue = collection.Find(filter).FirstOrDefault();
    Console.WriteLine(dialogue);
    if (dialogue == null) {
        throw new Exception("No dialogue found");
    }
    Console.WriteLine(dialogue["current_question_index"]);
    var index = dialogue["current_question_index"].ToInt32();
    if (index <= 10)
    {
        if (index > 0) {
            dialogue["questions"][index.ToString()]["answer"] = request.answer;
            var changeQ = Builders<BsonDocument>.Update.Set("questions", dialogue["questions"]);
            /// Update db based on count
            collection.UpdateOne(filter, changeQ);
        }
        index++;
        var changeQIndex = Builders<BsonDocument>.Update.Set("current_question_index", index.ToString());
        collection.UpdateOne(filter, changeQIndex);

        return dialogue["questions"][index.ToString()]["question"].ToString();
    }
    else
    {
        return "Now let's give you some feedback...";
    }
});

app.MapGet("/feedback", () => {
    
});

app.MapDelete("/wipe", () => {
    var filePath = "db.json";
    if (File.Exists(filePath))
    {
        File.Delete(filePath);
    }
});

app.Run();

public class Dialogue
{
    [BsonId]
    public ObjectId Id { get; set; }
    public required string job_title { get; set; }
    public required string user_id { get; set; }
    public required int current_question_index { get; set; }
    public required string greeting { get; set; }
    public required Dictionary<int, Question> questions { get; set; }
    public required string farewell { get; set; }
}

public class Question
{
    public required string question { get; set; }
    public required string answer { get; set; }
}

public class AnswerRequest
{
    public required string answer { get; set; }
    public required string id { get; set; }
}