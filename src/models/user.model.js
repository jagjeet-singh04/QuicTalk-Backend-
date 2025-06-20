import { getDB } from "../lib/db.js";

const collectionName = "users";

import { ObjectId } from 'mongodb';

export const User = {
  async findById(id) {
    const db = getDB();
    return db.collection("users").findOne({ 
      _id: new ObjectId(id) // Convert to ObjectId
    });
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
  },
   async update(query, update) {
    const db = getDB();
    // Use updateOne instead of update
    return db.collection(collectionName).updateOne(query, { $set: update });
  },

  async findById(id) {
    const db = getDB();
    // Convert string ID to ObjectId
    return db.collection(collectionName).findOne({ _id: new ObjectId(id) });
  }
};