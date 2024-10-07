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

// feedbackMessages will populate as the /answer endpoint is called. Feedback messages should have the structure of:
// [System, Assistant] + ([User, Assistant] * 10)
// The first AssistantChatMessage is the description, and the following User, Assistant pairs are the QnA
var feedbackMessages = new List<ChatMessage>{
    new SystemChatMessage("Provide feedback to the user on how they did in the interview. After looking through the answers to the questions, give some general feedback at the start. Then, give feedback for each answer to the question. Number these feedbacks by simply providing an integer, do NOT include any words/characters. Please refer to the job description to give more personalized feedback.")
};


ChatCompletionOptions feedbackOptions = new()
{
    ResponseFormat = ChatResponseFormat.CreateJsonSchemaFormat(
        jsonSchemaFormatName: "job-interview-feedback",
        jsonSchema: BinaryData.FromBytes("""
        {   
            "type": "object",
            "properties": {
                "general_feedback": { "type": "string" },
                "feedbacks": {
                    "type": "array",
                    "items": {
                        "type": "object",
                        "properties": {
                            "number": { "type": "string" },
                            "feedback": { "type": "string" }
                        },
                        "required": ["number", "feedback"],
                        "additionalProperties": false
                    }
                },
            },
            "required": ["general_feedback", "feedbacks"],
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
    return dialogueDocument["_id"]?.ToString() ?? "";
}

string ReviewToDB(Review review) {
    var reviewDocument = new BsonDocument
    {
        { "user_id", review.UserId },
        { "dialogue_id", review.DialogueId },
        { "overall_feedback", review.OverallFeedback },
        { "feedbacks", new BsonDocument(review.Feedbacks.Select(f => new BsonElement(f.Key.ToString(), new BsonDocument
        {
            { "feedback", f.Value }
        }))) }
    };
    collection.InsertOne(reviewDocument);
    return reviewDocument["_id"]?.ToString() ?? "";
}

app.MapPost("/dialogues", async ([FromBody] string description) => {
    messages.Add(new UserChatMessage(description));
    feedbackMessages.Add(new UserChatMessage(description));

    ChatCompletion completion;
    try {
        completion = await client.CompleteChatAsync(messages, options);
    } catch (Exception e) {
        Console.WriteLine(e);
        throw new Exception("Error in dialogue completion");
    }

    JsonDocument completionJson;
    try {
        completionJson =JsonDocument.Parse(completion.Content[0].Text);
    } catch (Exception e) {
        Console.WriteLine(e);
        throw new Exception("Error in parsing dialogue");
    }

    var dialogue = new Dialogue
    {
        UserId = "wip",
        JobTitle = completionJson.RootElement.GetProperty("job_title").GetString() ?? "",
        Greeting = completionJson.RootElement.GetProperty("greeting").GetString() ?? "",
        CurrentQuestionIndex = 0,
        Questions = new Dictionary<int, Dialogue.QnA>(),
        Farewell = completionJson.RootElement.GetProperty("farewell").GetString() ?? ""
    };

    // Enumerates through a dictionary with keys that are indexes. Array wasn't used due to unpredictable sorting behaviour
    foreach (JsonElement step in completionJson.RootElement.GetProperty("questions").EnumerateArray())
    {
        dialogue.Questions.Add(int.Parse(step.GetProperty("number").GetString() ?? "-1"), new Dialogue.QnA
        {
            Question = step.GetProperty("question").GetString() ?? "",
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
    Dictionary<string, dynamic> returnPayload;
    if (index <= 10)
    {
        if (index > 0) {
            dialogue["questions"][index.ToString()]["answer"] = request.answer;
            var updateQuestions = Builders<BsonDocument>.Update.Set("questions", dialogue["questions"]);
            /// Update db based on count
            collection.UpdateOne(filter, updateQuestions);
            
            // Start populating feedback messages list for use in the feedback endpoint
            feedbackMessages.Add(new AssistantChatMessage(dialogue["questions"][index.ToString()]["question"].ToString()));
            feedbackMessages.Add(new AssistantChatMessage(request.answer));
        }
        index++;
        var updateCurrentQuestionIndex = Builders<BsonDocument>.Update.Set("current_question_index", index.ToString());
        collection.UpdateOne(filter, updateCurrentQuestionIndex);
        if (index > 10) {
            returnPayload = new Dictionary<string, dynamic>
            {
                { "text", dialogue["farewell"].ToString() ?? "" },
                { "finished", true }
            };
        } else {
            returnPayload = new Dictionary<string, dynamic>
            {
                { "text", dialogue["questions"][index.ToString()]["question"].ToString() ?? "" },
                { "finished", false }
            };
        }
        // Payload required to indicate to the frontend whether the questions have concluded or not.
        return returnPayload;
    }
    else // This should not run, but if it returns the farewell to indicate end of questions
    {
        returnPayload = new Dictionary<string, dynamic>
        {
            { "text", dialogue["farewell"].ToString() ?? "" },
            { "finished", true }
        };
        return returnPayload;
    }
});

app.MapPost("/feedback", async ([FromBody] string dialogueId) => {
    // Check that the feedbackMessages is of correct length (22)
    Console.WriteLine("feedback length=" + feedbackMessages.Count);
    if (feedbackMessages.Count != 22) {
        throw new Exception("Feedback is not ready");
    }

    ChatCompletion completion;
    try {
        completion = await client.CompleteChatAsync(feedbackMessages, feedbackOptions);
    } catch (Exception e) {
        Console.WriteLine(e);
        throw new Exception("Error in feedback completion");
    }

    JsonDocument completionJson;
    try {
        completionJson = JsonDocument.Parse(completion.Content[0].Text);
    } catch (Exception e) {
        Console.WriteLine(e);
        throw new Exception("Error in parsing feedback");
    }

    var review = new Review
    {
        UserId = "wip",
        DialogueId = dialogueId,
        OverallFeedback = completionJson.RootElement.GetProperty("general_feedback").GetString() ?? "",
        Feedbacks = new Dictionary<int, string>()
    };

    foreach (JsonElement step in completionJson.RootElement.GetProperty("feedbacks").EnumerateArray())
    {
        review.Feedbacks.Add(int.Parse(step.GetProperty("number").GetString() ?? "-1"), step.GetProperty("feedback").GetString() ?? "");
    }

    var reviewId = ReviewToDB(review);
    return reviewId;
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