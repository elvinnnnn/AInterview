using Microsoft.AspNetCore.Identity;
using backend.Data;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using DotNetEnv;

DotNetEnv.Env.Load();
var secret = Environment.GetEnvironmentVariable("JWT_SECRET");
if (string.IsNullOrEmpty(secret) || secret.Length < 32)
{
    throw new InvalidOperationException("JWT_SECRET environment variable is invalid/missing");
}

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

builder.Services.AddTransient<AuthService>();
builder.Services.AddAuthentication(x => {
    x.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    x.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
}).AddJwtBearer(x => {
    x.TokenValidationParameters = new TokenValidationParameters {
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secret)),
        ValidateIssuer = false,
        ValidateAudience = false,
    };
});
builder.Services.AddAuthorization();

var app = builder.Build();
app.UseCors("ainterview");
app.MapControllers();
app.UseAuthentication();
app.UseAuthorization();
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