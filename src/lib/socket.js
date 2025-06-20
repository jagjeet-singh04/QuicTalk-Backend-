import { Server } from "socket.io";
import http from "http";
import express from "express";
import cors from "cors";

const app = express();
const server = http.createServer(app);

// ✅ Allowed Origins (Set via ENV or fallback to localhost + vercel)
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(",")
  : [
      "http://localhost:5173",
      "http://localhost:3000",
      "https://quick-talk-ten.vercel.app",
      "https://quictalk-backend-production.up.railway.app"
    ];

// ✅ Origin Validator Function
const isOriginAllowed = (origin) => {
  if (!origin) return true;
  if (process.env.NODE_ENV === "development") return true;
  if (allowedOrigins.includes(origin)) return true;
  if (origin.endsWith(".vercel.app")) return true;
  if (/^https?:\/\/localhost(:\d+)?$/.test(origin)) return true;
  return false;
};

// ✅ CORS Middleware for Express
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

// ✅ Track online users
const userSocketMap = {}; // { userId: socketId }

// ✅ Export receiver socket ID (used in chat sending logic)
export function getReceiverSocketId(userId) {
  return userSocketMap[userId];
}

// ✅ Initialize Socket.IO with advanced config
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
    maxDisconnectionDuration: 5 * 60 * 1000, // 5 mins
    skipMiddlewares: true
  },
  pingTimeout: 60000, // disconnect if no pong after 60s
  pingInterval: 25000, // ping every 25s
  transports: ["websocket"] // force websocket only
});

// 🔌 Handle connection logic
io.on("connection", (socket) => {
  const userId = socket.handshake.query.userId;

  console.log("🟢 New connection:", socket.id, "User ID:", userId);
  console.log(`📊 Active clients: ${io.engine.clientsCount}`);

  // ✅ Add user to online map
  if (userId && typeof userId === "string") {
    userSocketMap[userId] = socket.id;
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  }

  // 💓 Custom ping-pong event (optional)
  socket.on("ping", (cb) => {
    console.log("📶 Ping received from", socket.id);
    if (typeof cb === "function") cb(); // send pong
  });

  // ❌ Disconnection
  socket.on("disconnect", (reason) => {
    console.log("🔴 Disconnected:", socket.id, "Reason:", reason);
    if (userId && typeof userId === "string") {
      delete userSocketMap[userId];
      io.emit("getOnlineUsers", Object.keys(userSocketMap));
    }
    console.log(`📉 Remaining clients: ${io.engine.clientsCount}`);
  });

  // ⚠️ Socket-level errors
  socket.on("error", (err) => {
    console.error("❗ Socket error:", err.message || err);
  });
});

// 🔁 Low-level engine connection
io.engine.on("connection", (rawSocket) => {
  rawSocket.on("close", (reason) => {
    console.log("⚡ Engine closed socket due to:", reason);
  });
});

export { app, server, io };
