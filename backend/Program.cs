using Microsoft.AspNetCore.Identity;
using backend.Data;

var builder = WebApplication.CreateBuilder(args);
builder.Services.AddSingleton<MongoDbService>();
builder.Services.AddControllers();
builder.Services.AddCors(options => {
    options.AddPolicy("ainterview", policyBuilder => {
        policyBuilder.WithOrigins("http://localhost:3000")
            .AllowAnyHeader()
            .AllowAnyMethod();
    });
});

var app = builder.Build();
app.UseCors("ainterview");
app.MapControllers();
app.Run();

public class AnswerRequest
{
    public required string answer { get; set; }
    public required string id { get; set; }
}

public class LoginRequest
{
    public required string username { get; set; }
    public required string password { get; set; }
}

public class User: IdentityUser {

}