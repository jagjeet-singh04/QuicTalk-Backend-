import { Server } from "socket.io";
import http from "http";
import express from "express";
import cors from "cors";

const app = express();
const server = http.createServer(app);

// Track online users with socket IDs
const userSocketMap = {}; // { userId: socketId }

// Utility function to get socket ID
export function getReceiverSocketId(userId) {
  // Add debug logging
  const socketId = userSocketMap[userId];
  console.log(`🔍 Looking up socket for ${userId}: ${socketId || 'Not found'}`);
  return socketId;
}

// Allowed Origins
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(",")
  : [
      "http://localhost:5173",
      "http://localhost:3000",
      "https://quick-talk-ten.vercel.app",
      "https://quictalk-backend-production.up.railway.app"
    ];

const isOriginAllowed = (origin) => {
  if (!origin) return true;
  if (process.env.NODE_ENV === "development") return true;
  if (allowedOrigins.includes(origin)) return true;
  if (origin.endsWith(".vercel.app")) return true;
  if (/^https?:\/\/localhost(:\d+)?$/.test(origin)) return true;
  return false;
};

// Express CORS Setup
app.use(
  cors({
    origin: (origin, callback) => {
      if (isOriginAllowed(origin)) {
        callback(null, true);
      } else {
        console.warn(`🚫 Express CORS blocked: ${origin}`);
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"]
  })
);

// Socket.IO Initialization
const io = new Server(server, {
  cors: {
    origin: (origin, callback) => {
      if (isOriginAllowed(origin)) {
        callback(null, true);
      } else {
        console.warn(`🚫 Socket.IO CORS blocked: ${origin}`);
        callback(new Error("Not allowed by CORS"));
      }
    },
    methods: ["GET", "POST"],
    credentials: true
  },
  pingTimeout: 60000,
  pingInterval: 25000,
  transports: ["websocket"],
  connectionStateRecovery: {
    maxDisconnectionDuration: 5 * 60 * 1000,
    skipMiddlewares: true
  }
});

// Socket.IO Event Handling
io.on("connection", (socket) => {
  const userId = socket.handshake.query.userId;
  console.log("🟢 New connection:", socket.id, "| User ID:", userId);
  console.log("🔢 Connected Clients:", io.engine.clientsCount);

  if (userId && typeof userId === "string") {
    // Track user connection
    userSocketMap[userId] = socket.id;
    
    // Get all online users
    const onlineUsers = Object.keys(userSocketMap);
    io.emit("onlineUsersUpdate", onlineUsers);
    
    // Add debug log
    console.log(`📡 User ${userId} connected with socket ${socket.id}`);
  }

  // Heartbeat from client
  socket.on("heartbeat", (cb) => {
    if (typeof cb === "function") cb();
  });

  // Handle disconnect
  socket.on("disconnect", () => {
    console.log("🔴 Disconnected:", socket.id);
    if (userId && userSocketMap[userId]) {
      // Remove user from tracking
      delete userSocketMap[userId];
      
      // Update all clients
      const onlineUsers = Object.keys(userSocketMap);
      io.emit("onlineUsersUpdate", onlineUsers);
    }
    console.log("🔢 Clients remaining:", io.engine.clientsCount);
  });

  // Handle socket errors
  socket.on("error", (err) => {
    console.error("❗ Socket error:", err.message || err);
  });
});

// Heartbeat Broadcast (every 15s)
setInterval(() => {
  io.emit("heartbeat");
}, 15000);

// Track engine-level close
io.engine.on("connection", (rawSocket) => {
  rawSocket.on("close", (reason) => {
    console.log("⚡ Engine closed connection due to:", reason);
  });

  


});



export { app, server, io };