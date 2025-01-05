using System.IdentityModel.Tokens.Jwt;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using System.Security.Claims;

namespace backend.Data;
public class AuthService {

    public bool VerifyPassword(string password, string hashedPassword) {
        return BCrypt.Net.BCrypt.Verify(password, hashedPassword);
    }

    public string GenerateToken(User user) {
        var handler = new JwtSecurityTokenHandler();
        var secret = Environment.GetEnvironmentVariable("JWT_SECRET") ?? "";
        var credentials = new SigningCredentials(new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secret)), SecurityAlgorithms.HmacSha256);
        var tokenDescriptor = new SecurityTokenDescriptor {
            SigningCredentials = credentials,
            Expires = DateTime.UtcNow.AddHours(1),
            Subject = GenerateClaims(user)
        };
        
        var token = handler.CreateToken(tokenDescriptor);
        return handler.WriteToken(token);
    }
  
    private static ClaimsIdentity GenerateClaims(User user) {
        if (user == null) {
            throw new ArgumentNullException(nameof(user), "User cannot be null");
        }
        var ci = new ClaimsIdentity();
        ci.AddClaim(new Claim("id", user.Id.ToString()));
        ci.AddClaim(new Claim(ClaimTypes.Name, user.Username));
        return ci;
    }
}