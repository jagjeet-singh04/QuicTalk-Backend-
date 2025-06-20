import { getDB } from "../lib/db.js";

const collectionName = "users";

export const User = {
  async findOne(query) {
    const db = getDB();
    return db.collection(collectionName).findOne(query);
  },

  async create(userData) {
    const db = getDB();
    const result = await db.collection(collectionName).insertOne(userData);
    return { ...userData, _id: result.insertedId };
  },

  async update(query, update) {
    const db = getDB();
    return db.collection(collectionName).updateOne(query, { $set: update });
  },

  async findById(id) {
    const db = getDB();
    return db.collection(collectionName).findOne({ _id: id });
  },
  
  async find(query, projection = {}) {
    const db = getDB();
    return db.collection(collectionName).find(query).project(projection).toArray();
  }
};