import { MongoClient } from 'mongodb';

let client;
let db;

export const connectDB = async () => {
  try {
    console.log('Connecting to MongoDB with native driver...');
    
    // Create a new client
    client = new MongoClient(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
    });
    
    // Connect to the database
    await client.connect();
    
    // Select the database
    db = client.db();
    
    console.log('✅ MongoDB Connected successfully with native driver');
  } catch (err) {
    console.error("❌ MongoDB connection error:", err);
    process.exit(1);
  }
};

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