import mongoose from 'mongoose';

// Explicitly load Mongoose internals
mongoose.set('debug', false);
mongoose.set('strictQuery', true);
export const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`MongoDB Connected successfully at ${conn.connection.host}`);
  } catch (err) {
    console.error("MongoDB connection error:", err);
    process.exit(1);
  }
};