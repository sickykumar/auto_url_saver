const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

let isConnected = false;
let fallbackStore = [];

const DATA_DIR = path.join(__dirname, '../../data');
const FILE_PATH = path.join(DATA_DIR, 'domains.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Load persisted fallback data from local JSON file
if (fs.existsSync(FILE_PATH)) {
  try {
    const raw = fs.readFileSync(FILE_PATH, 'utf-8');
    fallbackStore = JSON.parse(raw);
  } catch (err) {
    fallbackStore = [];
  }
}

// Save fallback store back to JSON file
function saveFallbackFile() {
  try {
    fs.writeFileSync(FILE_PATH, JSON.stringify(fallbackStore, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to write local domains.json:', err.message);
  }
}

/**
 * Sync offline/fallback local JSON data into MongoDB upon connection
 */
async function syncOfflineDataToMongo() {
  if (!fallbackStore || fallbackStore.length === 0) return;

  try {
    const Domain = require('../models/Domain');
    console.log(`🔄 Syncing ${fallbackStore.length} offline saved domain(s) to MongoDB...`);

    for (const item of fallbackStore) {
      await Domain.updateOne(
        { userId: item.userId || 'default_user', domain: item.domain },
        {
          $setOnInsert: {
            title: item.title,
            description: item.description,
            favicon: item.favicon,
            image: item.image,
            notes: item.notes || '',
            tags: item.tags || ['Dev'],
            isFavorite: item.isFavorite || false,
            createdAt: item.createdAt || new Date(),
          },
          $addToSet: { visitedUrls: { $each: item.visitedUrls || [] } },
        },
        { upsert: true }
      );
    }

    console.log('✅ Offline data successfully synced to MongoDB!');
    // Clear local file after sync to prevent duplicate work
    fallbackStore = [];
    saveFallbackFile();
  } catch (err) {
    console.warn(`⚠️ Failed to sync offline data to Mongo: ${err.message}`);
  }
}

async function connectDB() {
  const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/auto_domain_saver';

  try {
    mongoose.set('strictQuery', false);
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 2000,
    });
    isConnected = true;
    console.log('✅ Connected to MongoDB database successfully.');

    // Auto-sync fallback data to MongoDB once connected
    await syncOfflineDataToMongo();
  } catch (err) {
    isConnected = false;
    console.warn(`⚠️ MongoDB not connected (${err.message}). Using persistent local JSON file store (backend/data/domains.json).`);
  }
}

function isMongoConnected() {
  return isConnected;
}

function getFallbackStore() {
  return fallbackStore;
}

module.exports = { connectDB, isMongoConnected, getFallbackStore, saveFallbackFile, syncOfflineDataToMongo };
