import { getDB } from "../lib/db.js";
import { ObjectId } from "mongodb";

// Collection name for messages
const collectionName = "messages";

// Formatter to ensure consistency in frontend display
const formatMessage = (message) => ({
  ...message,
  _id: message._id?.toString?.() ?? message._id,
  senderId: message.senderId?.toString?.() ?? message.senderId,
  receiverId: message.receiverId?.toString?.() ?? message.receiverId,
  createdAt: new Date(message.createdAt).toISOString(),
});

export const Message = {
  // Create a new message
  async create(messageData) {
    const db = getDB();

    const messageWithDate = {
      ...messageData,
      senderId: new ObjectId(messageData.senderId),
      receiverId: new ObjectId(messageData.receiverId),
      createdAt: messageData.createdAt || new Date(),
    };

    const result = await db.collection(collectionName).insertOne(messageWithDate);

    return formatMessage({
      ...messageWithDate,
      _id: result.insertedId,
    });
  },

  // Find all messages between two users (sorted by time)
  async findMessages(senderId, receiverId) {
    const db = getDB();

    const messages = await db
      .collection(collectionName)
      .find({
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
      })
      .sort({ createdAt: 1 }) // oldest to newest
      .toArray();

    return messages.map(formatMessage);
  },

  // Optional: Delete all messages between two users (if needed)
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
};
