import express from 'express';
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import path from "path";
import { fileURLToPath } from 'url';
import { connectDB } from "./lib/db.js";
import authRoutes from "./routes/auth.route.js";
import messageRoutes from "./routes/message.route.js";
import { app, server } from "./lib/socket.js";

dotenv.config();

const PORT = process.env.PORT || 5000;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure allowed origins
const allowedOrigins = [
  "https://quick-talk-ten.vercel.app",
  "https://quic-talk-backend.vercel.app",
  "http://localhost:5173",
  "http://localhost:3000"
];

console.log("Allowed Origins:", allowedOrigins);

// Simplified CORS configuration
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.warn(`⚠️ CORS blocked: ${origin}`);
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
};

// Apply CORS middleware FIRST
app.use(cors(corsOptions));

// Handle preflight requests explicitly
app.options('*', cors(corsOptions));

// Other middleware
app.use(express.json({ limit: "10mb" }));
app.use(cookieParser());

// Remove manual CORS headers from individual routes
// API routes
app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);

// Health check endpoint - remove manual CORS headers
app.get('/api/health', (req, res) => {
  res.status(200).json({ 
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV
  });
});

// Root route - remove manual CORS headers
app.get('/', (req, res) => {
  res.json({
    status: 'success',
    message: 'Backend server is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// 404 handler - remove manual CORS headers
app.get('*', (req, res) => {
  res.status(404).json({ 
    status: 'error',
    message: 'Endpoint not found',
    path: req.path
  });
});

// Global error handler - remove manual CORS headers
app.use((err, req, res, next) => {
  console.error('⚠️ Server Error:', err.message);
  
  if (err.message.includes("CORS")) {
    return res.status(403).json({
      status: 'error',
      message: 'CORS policy blocked the request'
    });
  }
  
  res.status(500).json({
    status: 'error',
    message: 'Internal Server Error',
    errorId: Date.now()
  });
});

// Logging middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Start server
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Allowed origins: ${allowedOrigins.join(', ')}`);
  connectDB().catch(err => {
    console.error("Database connection failed:", err);
    process.exit(1);
  });
});

export default app;
