using Microsoft.AspNetCore.Mvc;
using backend.Data;
using MongoDB.Driver;
using MongoDB.Bson;
using OpenAI.Chat;
using System.Text.Json;

namespace backend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class DialogueController : ControllerBase
{
    private readonly string _apiKey;
    private readonly IMongoCollection<Dialogue>? _dialogues;
    private readonly ChatClient _client;
    private readonly List<ChatMessage> _messages;
    public DialogueController(MongoDbService mongoDbService) {
        DotNetEnv.Env.Load();
        _apiKey = Environment.GetEnvironmentVariable("OPENAI_API_KEY")!;
        _dialogues = mongoDbService.Database?.GetCollection<Dialogue>("dialogues");
        _client = new ChatClient(model: "gpt-4o-mini", apiKey: _apiKey);
        _messages = new List<ChatMessage>{
            new SystemChatMessage("You are a job interviewer. You will be provided with a job description. Provide the job title, with the company's name if possible. First give a greeting, then formulate 10 questions based on the job description, but also include general questions at the start. Number these questions by simply providing an integer, do NOT include any words/characters. At the end give a farewell and thank them for coming.")
        };
    }

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
        _dialogues?.InsertOne(dialogue);
        return dialogue.Id.ToString() ?? "";
    }

    // CREATE NEW DIALOGUE
    [HttpPost]
    public async Task<ActionResult> Create([FromBody] string description) {
        _messages.Add(new UserChatMessage(description));
        ChatCompletion completion;
        try {
            completion = await _client.CompleteChatAsync(_messages, options);
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
            Questions = new Dictionary<string, Dialogue.QnA>(),
            Farewell = completionJson.RootElement.GetProperty("farewell").GetString() ?? ""
        };

        // Enumerates through a dictionary with keys that are indexes. Array wasn't used due to unpredictable sorting behaviour
        foreach (JsonElement step in completionJson.RootElement.GetProperty("questions").EnumerateArray())
        {
            dialogue.Questions.Add(step.GetProperty("number").ToString() ?? "-1", new Dialogue.QnA
            {
                Question = step.GetProperty("question").GetString() ?? "",
                Answer = ""
            });
        }
        var dialogueId = DialogueToDB(dialogue);

        // Returns greeting to immediately display on the frontend
        // Also returns the dialogue_id locate the dialogue for future requests
        var returnPayload = new Dictionary<string, string>
        {{ "greeting", dialogue.Greeting }, { "id", dialogueId }, {"title", dialogue.JobTitle }};
        return Ok(returnPayload);
    }

    // UPDATE DIALOGUE IN DATABSE TO INCLUDE ANSWER
    [HttpPut]
    public async Task<ActionResult> Answer(AnswerRequest request) {
        var filter = Builders<Dialogue>.Filter.Eq("_id", ObjectId.Parse(request.id));
        var dialogue = await _dialogues.Find(filter).FirstOrDefaultAsync();
        if (dialogue == null) {
            throw new Exception("No dialogue found");
        }
        var index = dialogue.CurrentQuestionIndex;
        Dictionary<string, dynamic> returnPayload;
        if (index <= 10)
        {
            if (index > 0) {
                dialogue.Questions[index.ToString()].Answer = request.answer;
                var updateQuestions = Builders<Dialogue>.Update.Set(d => d.Questions, dialogue.Questions);
                /// Update db based on count
                _dialogues?.UpdateOne(filter, updateQuestions);
            }
            index++;
            var updateCurrentQuestionIndex = Builders<Dialogue>.Update.Set(d => d.CurrentQuestionIndex, index);
            _dialogues?.UpdateOne(filter, updateCurrentQuestionIndex);
            var isFinished = index > 10;
            var text = isFinished ? dialogue.Farewell : dialogue.Questions[index.ToString()].Question;
            returnPayload = new Dictionary<string, dynamic>
            {{ "text", text }, { "finished", isFinished }};
            // "finished" required to indicate to the frontend whether the questions have concluded or not.
            return Ok(returnPayload);
        }
        else // This should not run, but if it returns the farewell to indicate end of questions
        {
            returnPayload = new Dictionary<string, dynamic>
            {{ "text", dialogue.Farewell }, { "finished", true }, { "title", dialogue.JobTitle }};
            return Ok(returnPayload);
        }
    }
}