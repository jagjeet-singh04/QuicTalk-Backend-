import { User } from "../models/user.model.js";
import { Message } from "../models/message.model.js";
import cloudinary from "../lib/cloudinary.js";
import { getReceiverSocketId, io } from "../lib/socket.js";

export const getUsersForSidebar = async (req, res) => {
  try {
    const loggedInUserId = req.user._id;
    const filteredUsers = await User.find(
      { _id: { $ne: loggedInUserId } }, 
      { password: 0 } // Exclude password
    );

    res.status(200).json(filteredUsers);
  } catch (error) {
    console.error("Error in getUsersForSidebar: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getMessages = async (req, res) => {
   try {
    const { userId: userToChatId } = req.params;
    const myId = req.user._id;

    // In getMessages controller
const messages = await Message.find({
  $or: [
    { senderId: new ObjectId(myId), receiverId: new ObjectId(userToChatId) },
    { senderId: new ObjectId(userToChatId), receiverId: new ObjectId(myId) }
  ]
});

    res.status(200).json(messages);
  } catch (error) {
    console.log("Error in getMessages controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const sendMessage = async (req, res) => {
  try {
    const { text, image } = req.body;
    const { id: receiverId } = req.params;
    const senderId = req.user._id;

    let imageUrl;
    if (image) {
      const uploadResponse = await cloudinary.uploader.upload(image);
      imageUrl = uploadResponse.secure_url;
    }

    const newMessage = {
      senderId,
      receiverId,
      text,
      image: imageUrl,
      createdAt: new Date()
    };

    const createdMessage = await Message.create(newMessage);

    const receiverSocketId = getReceiverSocketId(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("newMessage", createdMessage);
    }

    res.status(201).json(createdMessage);
  } catch (error) {
    console.log("Error in sendMessage controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};