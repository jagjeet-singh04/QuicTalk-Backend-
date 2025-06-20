// ULTIMATE MODULE PRELOAD SOLUTION
import { createRequire } from 'module';
const require = createRequire(import.meta.url);

// Preload debug and its internal modules
const debugPath = require.resolve('debug');
require(debugPath);
require('debug/src/common');
require('debug/src/node');
require('debug/src/browser');

// Preload Mongoose dependencies
require('mongoose');
require('mongoose/lib/drivers/node-mongodb-native/collection');
require('mongoose/lib/drivers/node-mongodb-native/index');

// Preload other critical modules
require('iconv-lite');
require('iconv-lite/extend-node');
require('raw-body');
require('body-parser');
require('mquery');
require('ms');

// WORKAROUND FOR EXPRESS ROUTER ISSUE
import express from 'express';
import { Router } from 'express';

// Create router instance
const router = Router();

// Patch Express application
express.application.router = router;
express.Router = () => router;

// Override lazy loading
express.application.lazyrouter = function() {
  if (!this._router) this._router = router;
  return this;
};

// Import other modules
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import path from "path";
import { fileURLToPath } from 'url';
import { connectDB } from "./lib/db.js";
import authRoutes from "./routes/auth.route.js";
import messageRoutes from "./routes/message.route.js";
import { app, server } from "./lib/socket.js";

// Force Mongoose initialization
import mongoose from 'mongoose';
mongoose.set('debug', false); // Disable Mongoose debug to prevent issues
console.log('Mongoose initialized, version:', mongoose.version);

dotenv.config();

const PORT = process.env.PORT || 5000;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure allowed origins
const allowedOrigins = process.env.ALLOWED_ORIGINS 
  ? process.env.ALLOWED_ORIGINS.split(',').map(origin => origin.trim())
  : [];

// CORS configuration
const corsOptions = {
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
};

app.use(express.json({ limit: "10mb" }));
app.use(cookieParser());

// Apply CORS middleware
app.use(cors(corsOptions));

// Handle preflight requests
app.options("*", cors(corsOptions));

// HTTPS redirection in production
if (process.env.NODE_ENV === "production") {
  app.use((req, res, next) => {
    if (req.headers['x-forwarded-proto'] !== 'https') {
      return res.redirect(`https://${req.headers.host}${req.url}`);
    }
    next();
  });
}

// Serve static files (including favicon)
app.use(express.static(path.join(__dirname, 'public')));

// Favicon route
app.get('/favicon.ico', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'favicon.ico'));
});

app.get('/favicon.png', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'favicon.ico'));
});

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);

// Explicitly define root route
app.get('/', (req, res) => {
  res.json({
    status: 'success',
    message: 'Backend server is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ 
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV
  });
});

// Start server
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  connectDB().catch(err => {
    console.error("Database connection failed:", err);
    process.exit(1);
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('⚠️ Server Error:', err.message);
  
  // Handle CORS errors specifically
  if (err.message.includes("CORS")) {
    return res.status(403).json({
      status: 'error',
      message: err.message
    });
  }
  
  res.status(500).json({
    status: 'error',
    message: 'Internal Server Error',
    errorId: Date.now()
  });
});

export default app;