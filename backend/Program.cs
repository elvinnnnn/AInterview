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
using backend;

ChatClient client = new(model: "gpt-4o-mini", apiKey: Environment.GetEnvironmentVariable("OPENAI_API_KEY"));

var connectionString = Environment.GetEnvironmentVariable("MONGODB_URI");

if (connectionString == null) {
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

// The system message provides the AI initial context and instructions to more accuretely complete the schema
var messages = new List<ChatMessage>{
    new SystemChatMessage("You are a job interviewer. You will be provided with a job description. Provide the job title, with the company's name if possible. First give a greeting, then formulate 10 questions based on the job description, but also include general questions at the start. Number these questions by simply providing an integer, do NOT include any words/characters. At the end give a farewell and thank them for coming.")
};

// A schema is created to ensure the AI provides the correct and required information
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
    var dialogueDocument = new BsonDocument
    {
        { "user_id", dialogue.UserId },
        { "job_title", dialogue.JobTitle },
        { "current_question_index", dialogue.CurrentQuestionIndex },
        { "greeting", dialogue.Greeting },
        { "farewell", dialogue.Farewell },
        { "questions", new BsonDocument(dialogue.Questions.Select(q => new BsonElement(q.Key.ToString(), new BsonDocument
        {
            { "question", q.Value.Question },
            { "answer", q.Value.Answer }
        }))) }
    };
    collection.InsertOne(dialogueDocument);
    return dialogueDocument["_id"]?.ToString() ?? string.Empty;
}

app.MapPost("/dialogues", async ([FromBody] string description) => {
    messages.Add(new UserChatMessage(description));
    ChatCompletion completion = await client.CompleteChatAsync(messages, options);
    using JsonDocument completionJson = JsonDocument.Parse(completion.Content[0].Text);
    var dialogue = new Dialogue
    {
        UserId = "wip",
        JobTitle = completionJson.RootElement.GetProperty("job_title").GetString() ?? string.Empty,
        Greeting = completionJson.RootElement.GetProperty("greeting").GetString() ?? string.Empty,
        CurrentQuestionIndex = 0,
        Questions = new Dictionary<int, Dialogue.QnA>(),
        Farewell = completionJson.RootElement.GetProperty("farewell").GetString() ?? string.Empty
    };

    // Enumerates through a dictionary with keys that are indexes. Array wasn't used due to unpredictable sorting behaviour
    foreach (JsonElement step in completionJson.RootElement.GetProperty("questions").EnumerateArray())
    {
        dialogue.Questions.Add(int.Parse(step.GetProperty("number").GetString() ?? "-1"), new Dialogue.QnA
        {
            Question = step.GetProperty("question").GetString() ?? string.Empty,
            Answer = ""
        });
    }
    var dialogueId = DialogueToDB(dialogue);

    // Returns greeting to immediately display on the frontend
    // Also returns the dialogue_id locate the dialogue for future requests
    var returnPayload = new Dictionary<string, string>
    {
        { "greeting", dialogue.Greeting },
        { "id", dialogueId }
    };
    return returnPayload;
});

app.MapPut("/answer", (AnswerRequest request) => {
    var filter = Builders<BsonDocument>.Filter.Eq("_id", ObjectId.Parse(request.id));
    var dialogue = collection.Find(filter).FirstOrDefault();
    if (dialogue == null) {
        throw new Exception("No dialogue found");
    }
    var index = dialogue["current_question_index"].ToInt32();
    if (index <= 10)
    {
        if (index > 0) {
            dialogue["questions"][index.ToString()]["answer"] = request.answer;
            var updateQuestions = Builders<BsonDocument>.Update.Set("questions", dialogue["questions"]);
            /// Update db based on count
            collection.UpdateOne(filter, updateQuestions);
        }
        index++;
        var updateCurrentQuestionIndex = Builders<BsonDocument>.Update.Set("current_question_index", index.ToString());
        collection.UpdateOne(filter, updateCurrentQuestionIndex);

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

public class AnswerRequest
{
    public required string answer { get; set; }
    public required string id { get; set; }
}