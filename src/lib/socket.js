import { Server } from "socket.io";
import http from "http";
import express from "express";
import cors from "cors";

const app = express();
const server = http.createServer(app);

// Configure allowed origins from environment
const allowedOrigins = process.env.ALLOWED_ORIGINS 
  ? process.env.ALLOWED_ORIGINS.split(',')
  : [
      "http://localhost:5173",
      "http://localhost:3000",
      "https://quick-talk-ten.vercel.app",
      "https://quictalk-backend-production.up.railway.app"
    ];

// Add this pattern matching function
const isOriginAllowed = (origin) => {
  if (!origin) return true; // Allow no-origin requests
  
  // Allow all in development
  if (process.env.NODE_ENV === "development") return true;
  
  // Check exact matches
  if (allowedOrigins.includes(origin)) return true;
  
  // Allow all Vercel preview deployments
  if (origin.endsWith('.vercel.app')) return true;
  
  // Allow localhost with any port
  if (/^https?:\/\/localhost(:\d+)?$/.test(origin)) return true;
  
  return false;
};

// Apply CORS middleware to Express app
app.use(cors({
  origin: (origin, callback) => {
    if (isOriginAllowed(origin)) {
      callback(null, true);
    } else {
      console.warn(`⚠️ Express CORS blocked: ${origin}`);
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"]
}));

// Socket.IO configuration
const io = new Server(server, {
  cors: {
    origin: (origin, callback) => {
      if (isOriginAllowed(origin)) {
        callback(null, true);
      } else {
        console.warn(`⚠️ Socket.IO CORS blocked: ${origin}`);
        callback(new Error("Not allowed by CORS"));
      }
    },
    methods: ["GET", "POST"],
    credentials: true
  },
  connectionStateRecovery: {
    maxDisconnectionDuration: 2 * 60 * 1000, // 2 minutes
    skipMiddlewares: true
  }
});

// Track online users
const userSocketMap = {}; // {userId: socketId}

// Utility function to get socket ID
export function getReceiverSocketId(userId) {
  return userSocketMap[userId];
}

io.on("connection", (socket) => {
  console.log("New connection:", socket.id);

  // Handle authentication
  const userId = socket.handshake.query.userId;
  if (userId && typeof userId === "string") {
    userSocketMap[userId] = socket.id;
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  }

  // Handle disconnection
  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
    if (userId && typeof userId === "string") {
      delete userSocketMap[userId];
      io.emit("getOnlineUsers", Object.keys(userSocketMap));
    }
  });

  // Error handling
  socket.on("error", (err) => {
    console.error("Socket error:", err);
  });
});

// Enhanced ping/pong for connection health
io.engine.on("connection", (rawSocket) => {
  rawSocket.on("close", (reason) => {
    console.log("Connection closed:", reason);
  });
});

export { app, server, io };