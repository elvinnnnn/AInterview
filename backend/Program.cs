using Microsoft.AspNetCore.Mvc;
using OpenAI.Chat;
using System;
using System.Collections.Generic;
using System.Globalization;
using System.Runtime.CompilerServices;
using System.Text.Json;
using MongoDB.Driver;
using MongoDB.Bson;

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
    new SystemChatMessage("You are a job interviewer. You will be provided with a job description. First give a greeting, then formulate 10 questions based on the job description, but also include general questions at the start. Number these questions by simply providing an integer, do NOT include any words/characters. At the end give a farewell and thank them for coming.")
};

ChatCompletionOptions options = new()
{
    ResponseFormat = ChatResponseFormat.CreateJsonSchemaFormat(
        jsonSchemaFormatName: "job-interview",
        jsonSchema: BinaryData.FromBytes("""
        {   
            "type": "object",
            "properties": {
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
            "required": ["greeting", "questions", "farewell"],
            "additionalProperties": false
        }
        """u8.ToArray()),
        jsonSchemaIsStrict: true
    )
};

static void DialogueToDB(Dialogue dialogue) {
    string jsonString = JsonSerializer.Serialize(dialogue, new JsonSerializerOptions { WriteIndented = true });
    File.WriteAllText("db.json", jsonString);
}

ChatClient client = new(model: "gpt-4o-mini", apiKey: Environment.GetEnvironmentVariable("OPENAI_API_KEY"));

app.MapPost("/dialogues", async ([FromBody] string description) => {
    messages.Add(new UserChatMessage(description));
    ChatCompletion completion = await client.CompleteChatAsync(messages, options);
    using JsonDocument structuredJson = JsonDocument.Parse(completion.Content[0].Text);
    var dialogue = new Dialogue
    {
        currentQuestionIndex = 0,
        Greeting = structuredJson.RootElement.GetProperty("greeting").GetString() ?? string.Empty,
        Farewell = structuredJson.RootElement.GetProperty("farewell").GetString() ?? string.Empty,
        Questions = new Dictionary<int, Question>()
    };
    foreach (JsonElement stepElement in structuredJson.RootElement.GetProperty("questions").EnumerateArray())
    {
        dialogue.Questions.Add(int.Parse(stepElement.GetProperty("number").GetString() ?? "-1"), new Question
        {
            Text = stepElement.GetProperty("question").GetString() ?? string.Empty,
            Answer = ""
        });
    }
    DialogueToDB(dialogue);
    return dialogue.Greeting;
});

app.MapPut("/answer", ([FromBody] string answer) => {
    string jsonString = File.ReadAllText("db.json");
    Dialogue? dialogue = JsonSerializer.Deserialize<Dialogue>(jsonString);
    if (dialogue == null) {
        throw new Exception("No dialogue found");
    }
    if (dialogue.currentQuestionIndex <= 10)
    {
        if (dialogue.currentQuestionIndex > 0) {
            dialogue.Questions[dialogue.currentQuestionIndex].Answer = answer;
            jsonString = JsonSerializer.Serialize(dialogue, new JsonSerializerOptions { WriteIndented = true });
            File.WriteAllText("db.json", jsonString);
        }
        dialogue.currentQuestionIndex++;
        return dialogue.Questions[dialogue.currentQuestionIndex].Text;
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
    public required int currentQuestionIndex { get; set; }
    public required string Greeting { get; set; }
    public required Dictionary<int, Question> Questions { get; set; }
    public required string Farewell { get; set; }
}

public class Question
{
    public required string Text { get; set; }
    public required string Answer { get; set; }
}
