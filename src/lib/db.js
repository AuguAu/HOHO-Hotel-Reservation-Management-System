import mongoose from 'mongoose';
 
// Retrieve the database connection string from environment variables
const MONGODB_URI = process.env.MONGODB_URI;
 
if (!MONGODB_URI) {
  throw new Error(
    'Please define the MONGODB_URI environment variable inside .env.local'
  );
}
 
// Global variable is used here to maintain a cached connection across hot reloads in development.
// This prevents database connections from growing exponentially during API Route usage.
let cached = global.mongoose;
 
if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}
 
async function dbConnect() {
  // If a connection already exists, return it immediately
  if (cached.conn) {
    return cached.conn;
  }
 
  // If no connection promise exists, create a new one
  if (!cached.promise) {
    const opts = {
      bufferCommands: false, // Disable mongoose buffering
    };
 
    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
      console.log('MongoDB connected successfully.');
      return mongoose;
    });
  }
 
  try {
    // Wait for the connection to be established and cache it
    cached.conn = await cached.promise;
  } catch (error) {
    cached.promise = null;
    console.error('MongoDB connection error:', error);
    throw error;
  }
 
  return cached.conn;
}
 
export default dbConnect;