using OpenAI.Chat;
using System;
using System.Collections.Generic;
using System.Text.Json;

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
    new SystemChatMessage("You are a job interviewer. You will be provided with a job description. First give a greeting, then formulate 10 questions based on the job description, but also include general questions at the start. Number these questions. At the end give a farewell and thank them for coming.")
};

var questionsAndFarewell = new List<string>();
int currentQuestionIndex = 0;

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

ChatClient client = new(model: "gpt-4o-mini", apiKey: Environment.GetEnvironmentVariable("OPENAI_API_KEY"));

app.MapGet("/dialogues", async (string description) => {
    messages.Add(new UserChatMessage(description));
    ChatCompletion completion = await client.CompleteChatAsync(messages, options);
    using JsonDocument structuredJson = JsonDocument.Parse(completion.Content[0].Text);
    foreach (JsonElement stepElement in structuredJson.RootElement.GetProperty("questions").EnumerateArray())
        {
            var question = stepElement.GetProperty("question").GetString();
            if (question != null)
            {
                questionsAndFarewell.Add(question);
            }
            // Console.WriteLine($"  - Number: {stepElement.GetProperty("number").GetString()}");
            // Console.WriteLine($"    Question: {stepElement.GetProperty("question").GetString()}");
        }
    var farewell = structuredJson.RootElement.GetProperty("farewell").GetString(); 
    if (farewell != null)
    {
        questionsAndFarewell.Add(farewell);
    }
    return structuredJson.RootElement.GetProperty("greeting").GetString();
});

app.MapGet("/question", () => {
    if (currentQuestionIndex < questionsAndFarewell.Count)
    {
        var question = questionsAndFarewell[currentQuestionIndex];
        currentQuestionIndex++;
        return question;
    }
    else
    {
        return "Now let's give you some feedback...";
    }
});

app.Run();
