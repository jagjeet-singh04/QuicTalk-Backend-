import { MongoClient } from 'mongodb';

let client;
let db;
export const connectDB = async () => {
  try {
    console.log('Connecting to MongoDB...');
    client = new MongoClient(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    
    await client.connect();
    
    const dbName = process.env.MONGODB_URI.split('/').pop().split('?')[0];
    db = client.db(dbName);
    
    console.log(`✅ MongoDB Connected to database: ${dbName}`);
    
    // Test the connection
    await db.command({ ping: 1 });
    console.log("Database ping successful");
  } catch (err) {
    console.error("❌ MongoDB connection error:", err);
    process.exit(1);
  }
};

// ... rest of the code

// ... rest of the file

export const getDB = () => {
  if (!db) {
    throw new Error('Database not connected! Call connectDB first.');
  }
  return db;
};

export const closeDB = async () => {
  if (client) {
    await client.close();
    console.log('MongoDB connection closed');
  }
};