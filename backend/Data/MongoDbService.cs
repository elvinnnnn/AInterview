using DnsClient.Protocol;
using MongoDB.Driver;

namespace backend.Data;
public class MongoDbService{
    private readonly IConfiguration _configuration;
    private readonly IMongoDatabase? _db;
    public MongoDbService(IConfiguration configuration) {
        _configuration = configuration;
        string connectionString = _configuration.GetConnectionString("DbConnection") ?? throw new ArgumentNullException("DbConnection", "Connection string cannot be null");
        string databaseName = _configuration["ConnectionStrings:DatabaseName"] ?? throw new ArgumentNullException("DatabaseName", "Database name cannot be null");
        var mongoClient = new MongoClient(connectionString);
        _db = mongoClient.GetDatabase(databaseName);
    }

    public IMongoDatabase? Database => _db;
}