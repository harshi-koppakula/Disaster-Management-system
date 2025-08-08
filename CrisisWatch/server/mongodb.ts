import mongoose from 'mongoose';

// Try MongoDB Atlas or local MongoDB, fallback to memory storage message
const MONGODB_URI = process.env.MONGODB_URI || process.env.MONGO_URL || 'mongodb://localhost:27017/disastercare';

// Connection options
const options = {
  bufferCommands: false,
  maxPoolSize: 10,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
  family: 4,
  retryWrites: true
};

let cached = (global as any).mongoose;

if (!cached) {
  cached = (global as any).mongoose = { conn: null, promise: null };
}

async function connectToDatabase() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI, options).then((mongoose) => {
      console.log('✅ Connected to MongoDB at:', MONGODB_URI.replace(/\/\/.*@/, '//***@'));
      return mongoose;
    }).catch((error) => {
      console.error('❌ MongoDB connection failed:', error.message);
      console.log('\n📝 To use MongoDB with this project:');
      console.log('1. Local MongoDB: Install MongoDB locally and ensure it\'s running on port 27017');
      console.log('2. MongoDB Atlas: Get a free cluster at https://www.mongodb.com/atlas');
      console.log('3. Set MONGODB_URI environment variable with your connection string');
      console.log('\nExample Atlas connection string:');
      console.log('MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/disastercare');
      console.log('\nFalling back to in-memory storage for development...\n');
      
      // Re-throw to let caller handle the fallback
      throw error;
    });
  }
  
  try {
    cached.conn = await cached.promise;
    return cached.conn;
  } catch (error) {
    // Reset promise so we can try again later
    cached.promise = null;
    throw error;
  }
}

export default connectToDatabase;