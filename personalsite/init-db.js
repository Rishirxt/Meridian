/**
 * init-db.js
 * A script to initialize the MongoDB collections and indexes for the Meridian app.
 * Run this with: node init-db.js
 */

const { MongoClient } = require('mongodb');

// Connection URL
const url = 'mongodb://localhost:27017';
const client = new MongoClient(url);

// Database Name
const dbName = 'meridian';

async function main() {
  await client.connect();
  console.log('Connected successfully to MongoDB server');
  const db = client.db(dbName);

  const collections = [
    'users',
    'tasks',
    'focus_sessions',
    'goals',
    'habits',
    'habit_logs',
    'notes',
    'quotes'
  ];

  for (const col of collections) {
    console.log(`Creating collection: ${col}...`);
    // MongoDB creates collections implicitly on first insert, but we can do it explicitly
    try {
      await db.createCollection(col);
    } catch (e) {
      if (e.codeName === 'NamespaceExists') {
        console.log(`Collection ${col} already exists.`);
      } else {
        throw e;
      }
    }
  }

  // Create Indexes
  console.log('Creating indexes...');
  await db.collection('tasks').createIndex({ userId: 1, date: -1 });
  await db.collection('focus_sessions').createIndex({ userId: 1, date: -1 });
  await db.collection('habit_logs').createIndex({ habitId: 1, date: 1 });
  await db.collection('notes').createIndex({ userId: 1, tag: 1 });
  await db.collection('quotes').createIndex({ tags: 1 });

  console.log('Database initialization complete!');
  process.exit(0);
}

main().catch(console.error);
