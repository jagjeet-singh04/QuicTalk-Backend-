import { ObjectId } from 'mongodb';
import { Message } from "../models/message.model.js";
import { getReceiverSocketId, io } from "../lib/socket.js";
import cloudinary from "../lib/cloudinary.js";


export const getUsersForSidebar = async (req, res) => {
  try {
    const loggedInUserId = req.user._id;
    
    // Get database instance
    const db = getDB();
    
    // Find users excluding the logged-in user
    const users = await db.collection("users").find(
      { _id: { $ne: new ObjectId(loggedInUserId) } }
    ).project({ password: 0 }).toArray();

    res.status(200).json(users);
  } catch (error) {
    console.error("Error in getUsersForSidebar: ", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getMessages = async (req, res) => {
  try {
    const { userId: userToChatId } = req.params;
    const myId = req.user._id;

    // Use the proper findMessages method
    const messages = await Message.findMessages(myId, userToChatId);
    
    res.status(200).json(messages);
  } catch (error) {
    console.error("Error in getMessages controller: ", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const sendMessage = async (req, res) => {
  try {
    const { text, image } = req.body;
    const { id: receiverId } = req.params;
    const senderId = req.user._id;

    let imageUrl = null;
    if (image) {
      const uploadResponse = await cloudinary.uploader.upload(image);
      imageUrl = uploadResponse.secure_url;
    }

    // Create message with string IDs
    const newMessage = {
      senderId,
      receiverId,
      text,
      image: imageUrl,
      createdAt: new Date()
    };

    // Save to database
    const createdMessage = await Message.create(newMessage);
    
    // Emit to receiver
    const receiverSocketId = getReceiverSocketId(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("newMessage", createdMessage);
    }

    // Also send to sender in real-time
    const senderSocketId = getReceiverSocketId(senderId);
    if (senderSocketId && senderSocketId !== receiverSocketId) {
      io.to(senderSocketId).emit("newMessage", createdMessage);
    }

    res.status(201).json(createdMessage);
  } catch (error) {
    console.error("Error in sendMessage controller: ", error);
    res.status(500).json({ error: "Internal server error" });
  }
};