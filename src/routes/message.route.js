import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import { 
  getMessages, 
  getUsersForSidebar, 
  sendMessage 
} from "../controllers/message.controller.js"; // Ensure consistent casing

const router = express.Router();

router.get("/conversation/:userId", protectRoute, getMessages);
router.get("/users", protectRoute, getUsersForSidebar);
router.post("/send/:receiverId", protectRoute, sendMessage); 
export default router;