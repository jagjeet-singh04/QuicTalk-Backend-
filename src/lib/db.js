import mongoose from 'mongoose';

// Force Mongoose to use native promises
mongoose.Promise = global.Promise;

// Set strictQuery to true
mongoose.set('strictQuery', true);

export const connectDB = async () => {
  try {
    console.log('Connecting to MongoDB...');
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log(`MongoDB Connected successfully at ${conn.connection.host}`);
  } catch (err) {
    console.error("MongoDB connection error:", err);
    process.exit(1);
  }
};