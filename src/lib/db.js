import { MongoClient } from 'mongodb';

let client;
let db;

export const connectDB = async () => {
  try {
    console.log('Connecting to MongoDB...');
    
    // Use new connection syntax
    client = new MongoClient(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 10000,
      minPoolSize: 5,
      maxPoolSize: 10,
    });
    
    await client.connect();
    
    // Extract database name from connection string
    const dbName = process.env.MONGODB_URI.split('/').pop().split('?')[0];
    db = client.db(dbName);
    
    console.log(`✅ MongoDB Connected to database: ${dbName}`);
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