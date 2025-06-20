import { getDB } from "../lib/db.js";
import { ObjectId } from "mongodb";

// Collection name
const collectionName = "messages";

// Helper: Format message for frontend
const formatMessage = (message) => ({
  ...message,
  _id: message._id?.toString?.() ?? message._id,
  senderId: message.senderId?.toString?.() ?? message.senderId,
  receiverId: message.receiverId?.toString?.() ?? message.receiverId,
  createdAt: new Date(message.createdAt).toISOString(),
});

export const Message = {
  // 🔍 Generic find with query
  async find(query) {
    const db = getDB();
    const messages = await db.collection(collectionName).find(query).toArray();
    return messages.map(formatMessage);
  },

  // 🔍 Find message by ID
  async findById(id) {
    const db = getDB();
    const message = await db.collection(collectionName).findOne({ _id: new ObjectId(id) });
    return message ? formatMessage(message) : null;
  },

  // 📜 Find messages between two users
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
      .sort({ createdAt: 1 })
      .toArray();

    return messages.map(formatMessage);
  },

  // 📝 Create new message
  async create(messageData) {
    const db = getDB();

    const messageWithTimestamps = {
      ...messageData,
      senderId: new ObjectId(messageData.senderId),
      receiverId: new ObjectId(messageData.receiverId),
      createdAt: messageData.createdAt || new Date(),
    };

    const result = await db.collection(collectionName).insertOne(messageWithTimestamps);

    return formatMessage({
      ...messageWithTimestamps,
      _id: result.insertedId,
    });
  },

  // ❌ Delete all messages in a conversation
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

  // ❌ Generic deleteMany by query
  async deleteMany(query) {
    const db = getDB();
    const result = await db.collection(collectionName).deleteMany(query);
    return { deletedCount: result.deletedCount };
  },
};
