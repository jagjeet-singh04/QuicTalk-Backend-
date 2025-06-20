import mongoose from "mongoose" 

export const connectDB = async () => {
  try {
    if (process.env.VERCEL) {
      console.log('Skipping DB connection in Vercel build environment');
      return;
    }
    
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`MongoDB Connected successfully at ${conn.connection.host}`);
  } catch (err) {
    console.error("MongoDB connection error:", err);
    process.exit(1);
  }
};