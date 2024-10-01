using OpenAI.Chat;
using System;
using System.ClientModel;
using System.Threading.Tasks;

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

ChatClient client = new(model: "gpt-4o", apiKey: Environment.GetEnvironmentVariable("OPENAI_API_KEY"));

app.MapGet("/description", async (string description) => {
    ChatCompletion completion = await client.CompleteChatAsync(new UserChatMessage(description));
    return completion.Content[0].Text;
});

app.Run();
