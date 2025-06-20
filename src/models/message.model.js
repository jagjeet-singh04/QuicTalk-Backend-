import { getDB } from "../lib/db.js";
import { ObjectId } from "mongodb";

const collectionName = "messages";

export const User = {
  async findById(id) {
    const db = getDB();
    return db.collection("users").findOne({
      _id: new ObjectId(id), // Converted to ObjectId
    });
  }
};

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
