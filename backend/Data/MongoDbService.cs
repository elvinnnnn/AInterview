using DnsClient.Protocol;
using MongoDB.Driver;

namespace backend.Data
{
    public class MongoDbService{
        private readonly IConfiguration _configuration;
        private readonly IMongoDatabase? _db;
        public MongoDbService(IConfiguration configuration) {
            _configuration = configuration;
            string connectionString = _configuration.GetConnectionString("DbConnection") ?? throw new ArgumentNullException("DbConnection", "Connection string cannot be null");
            var mongoUrl = MongoUrl.Create(connectionString);
            var mongoClient = new MongoClient(mongoUrl);
            _db = mongoClient.GetDatabase(mongoUrl.DatabaseName);
        }

        public IMongoDatabase? Database => _db;
    }
}