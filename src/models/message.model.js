import { getDB } from "../lib/db.js";
import { ObjectId } from "mongodb";

// 🗂️ Collection name
const collectionName = "messages";

// 🧹 Helper: Format message for frontend readability
// 🧹 Helper: Format message for frontend readability
const formatMessage = (message) => {
  // Convert to plain JavaScript object
  const formatted = { ...message };
  
  // Convert ObjectIDs to strings
  if (formatted._id && typeof formatted._id !== 'string') {
    formatted._id = formatted._id.toString();
  }
  if (formatted.senderId && typeof formatted.senderId !== 'string') {
    formatted.senderId = formatted.senderId.toString();
  }
  if (formatted.receiverId && typeof formatted.receiverId !== 'string') {
    formatted.receiverId = formatted.receiverId.toString();
  }
  
  // Format date
  if (formatted.createdAt instanceof Date) {
    formatted.createdAt = formatted.createdAt.toISOString();
  } else if (typeof formatted.createdAt === 'string') {
    // Ensure ISO format
    formatted.createdAt = new Date(formatted.createdAt).toISOString();
  }
  
  return formatted;
};

export const Message = {
  // 📥 Create a new message
  async create(messageData) {
    const db = getDB();

    const message = {
      ...messageData,
      senderId: new ObjectId(messageData.senderId),
      receiverId: new ObjectId(messageData.receiverId),
      createdAt: messageData.createdAt || new Date(),
    };

    const result = await db.collection(collectionName).insertOne(message);
    return formatMessage({
      ...message,
      _id: result.insertedId,
    });
  },

  // 🔍 Find messages based on generic query
  async find(query) {
    const db = getDB();
    const messages = await db.collection(collectionName).find(query).toArray();
    return messages.map(formatMessage);
  },

  // 🔍 Find single message by ID
  async findById(id) {
    const db = getDB();
    const message = await db.collection(collectionName).findOne({ _id: new ObjectId(id) });
    return message ? formatMessage(message) : null;
  },

  // 📜 Get all messages between two users (ordered by time)
  async findMessages(senderId, receiverId) {
    const db = getDB();
    const messages = await db
      .collection(collectionName)
      .find({
        $or: [
          { senderId: new ObjectId(senderId), receiverId: new ObjectId(receiverId) },
          { senderId: new ObjectId(receiverId), receiverId: new ObjectId(senderId) },
        ],
      })
      .sort({ createdAt: 1 }) // chronological
      .toArray();

    return messages.map(formatMessage);
  },

  // ❌ Delete entire conversation between two users
  async deleteConversation(senderId, receiverId) {
    const db = getDB();
    const result = await db.collection(collectionName).deleteMany({
      $or: [
        {
          senderId: new ObjectId(senderId),
          receiverId: new ObjectId(receiverId),
        },
        {
          senderId: new ObjectId(receiverId),
          receiverId: new ObjectId(senderId),
        },
      ],
    });
    return { deletedCount: result.deletedCount };
  },

  // ❌ Delete based on a custom query
  async deleteMany(query) {
    const db = getDB();
    const result = await db.collection(collectionName).deleteMany(query);
    return { deletedCount: result.deletedCount };
  },
};
