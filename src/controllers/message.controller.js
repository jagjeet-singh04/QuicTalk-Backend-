import { ObjectId } from 'mongodb';

import { Message } from "../models/message.model.js";
import { getReceiverSocketId, io } from "../lib/socket.js";
import cloudinary from "../lib/cloudinary.js";

import { User } from "../models/user.model.js";

// Remove other getUsersForSidebar implementations
// Add this clean implementation:

export const getUsersForSidebar = async (req, res) => {
  try {
    const loggedInUserId = req.user._id;
    
    // Use User model to find users
    const users = await User.find(
      { _id: { $ne: loggedInUserId } },
      { password: 0 } // Exclude password field
    );

    // Format users with string IDs
    const formattedUsers = users.map(user => ({
      ...user,
      _id: user._id.toString()
    }));

    res.status(200).json(formattedUsers);
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