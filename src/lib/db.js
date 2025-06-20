import mongoose from 'mongoose';

// Fallback in case modules didn't load
if (!mongoose.ConnectionStates) {
  console.warn('Mongoose ConnectionStates not found! Creating fallback');
  mongoose.ConnectionStates = {
    disconnected: 0,
    connected: 1,
    connecting: 2,
    disconnecting: 3
  };
}

export const connectDB = async () => {
  try {
    console.log('Connecting to MongoDB...');
    
    // Check if native driver is available
    if (!mongoose.mongo) {
      console.error('Mongoose MongoDB driver missing!');
      throw new Error('MongoDB driver not loaded');
    }
    
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log(`MongoDB Connected successfully at ${conn.connection.host}`);
  } catch (err) {
    console.error("MongoDB connection error:", err);
    process.exit(1);
  }
};