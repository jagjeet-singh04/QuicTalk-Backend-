import { getDB } from "../lib/db.js";

const collectionName = "users";

import { ObjectId } from 'mongodb';



export const User = {
  // Add this method
  async find(query, projection = {}) {
    const db = getDB();
    return db.collection(collectionName)
      .find(query)
      .project(projection)
      .toArray();
  },
  async findOne(query) {
    const db = getDB();
    return db.collection(collectionName).findOne(query);
  },  
 async findById(id) {
  const db = getDB();
  // Ensure proper ObjectId conversion
  return db.collection(collectionName).findOne({ 
    _id: new ObjectId(id)
  });
  },

  async create(userData) {
    const db = getDB();
    const result = await db.collection(collectionName).insertOne(userData);
    return { ...userData, _id: result.insertedId };
  },

  async update(query, update) {
  const db = getDB();
  // Convert string ID to ObjectId if needed
  if (query._id && typeof query._id === 'string') {
    query._id = new ObjectId(query._id);
  }
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