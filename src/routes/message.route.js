import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import { 
  getMessages, 
  getUsersForSidebar, 
  sendMessage 
} from "../controllers/message.controller.js";

const router = express.Router();

// Fixed routes with proper parameter names
// Ensure routes have proper parameter names:
// message.route.js
router.get("/conversation/:userId", protectRoute, getMessages); // Keep this as-is
router.get("/users", protectRoute, getUsersForSidebar);
router.post("/send/:receiverId", protectRoute, sendMessage);
export default router;