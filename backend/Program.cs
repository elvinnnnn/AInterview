using OpenAI.Chat;

var builder = WebApplication.CreateBuilder(args);
var app = builder.Build();
DotNetEnv.Env.Load();

ChatClient client = new(model: "gpt-4o", apiKey: Environment.GetEnvironmentVariable("OPENAI_API_KEY"));
ChatCompletion completion = client.CompleteChat("Say 'this is a test'");

Console.WriteLine($"[ASSISTANT]: {completion}");

app.MapGet("/", () => "Hello World!");

app.Run();
