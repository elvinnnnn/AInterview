using Microsoft.AspNetCore.Identity;
using backend.Data;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;

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
            .AllowAnyMethod()
            .AllowCredentials();
    });
});

builder.Services.AddTransient<AuthService>();
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options => {
        options.TokenValidationParameters = new TokenValidationParameters {
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secret)),
            ValidateIssuer = false,
            ValidateAudience = false,
        };
    });

var app = builder.Build();

app.Use(async (context, next) => {
    context.Response.Headers.Append("X-Content-Type-Options", "nosniff");
    await next();
});

app.UseCors("ainterview");
app.UseAuthentication();
app.UseAuthorization();
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