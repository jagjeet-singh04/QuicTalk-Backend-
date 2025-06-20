import { getDB } from "../lib/db.js";

const collectionName = "messages";

export const Message = {
  async create(messageData) {
    const db = getDB();
    const result = await db.collection(collectionName).insertOne(messageData);
    return { ...messageData, _id: result.insertedId };
  },

  async find(query) {
    const db = getDB();
    return db.collection(collectionName).find(query).toArray();
  }
};