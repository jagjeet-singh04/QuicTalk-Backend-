import { Server } from "socket.io";
import http from "http";
import express from "express";
import cors from "cors";

const app = express();
const server = http.createServer(app);

// ✅ Allowed origins
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(",")
  : [
      "http://localhost:5173",
      "http://localhost:3000",
      "https://quick-talk-ten.vercel.app",
      "https://quictalk-backend-production.up.railway.app"
    ];

// ✅ Origin validator
const isOriginAllowed = (origin) => {
  if (!origin) return true;
  if (process.env.NODE_ENV === "development") return true;
  if (allowedOrigins.includes(origin)) return true;
  if (origin.endsWith(".vercel.app")) return true;
  if (/^https?:\/\/localhost(:\d+)?$/.test(origin)) return true;
  return false;
};

// ✅ CORS for Express
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

// ✅ Initialize Socket.IO
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
    maxDisconnectionDuration: 2 * 60 * 1000,
    skipMiddlewares: true
  }
});

// 🔍 Track online users
const userSocketMap = {}; // { userId: socketId }

export function getReceiverSocketId(userId) {
  return userSocketMap[userId];
}

// 🔄 Connection logic
io.on("connection", (socket) => {
  const userId = socket.handshake.query.userId;

  console.log("🟢 New connection:", socket.id);
  console.log(`📊 Active connections: ${io.engine.clientsCount}`);

  if (userId && typeof userId === "string") {
    userSocketMap[userId] = socket.id;
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  }

  // ❌ Handle disconnect
  socket.on("disconnect", () => {
    console.log("🔴 Disconnected:", socket.id);
    if (userId && typeof userId === "string") {
      delete userSocketMap[userId];
      io.emit("getOnlineUsers", Object.keys(userSocketMap));
    }
    console.log(`📉 Active connections after disconnect: ${io.engine.clientsCount}`);
  });

  // ⚠️ Socket-level error handling
  socket.on("error", (err) => {
    console.error("❗Socket error:", err.message || err);
  });
});

// 🔁 Raw connection for deep engine tracking
io.engine.on("connection", (rawSocket) => {
  rawSocket.on("close", (reason) => {
    console.log("⚡ Engine closed connection:", reason);
  });
});

export { app, server, io };
