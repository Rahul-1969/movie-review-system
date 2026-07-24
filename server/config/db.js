import mongoose from 'mongoose';

let isConnected = false;

export const connectDB = async () => {
  if (isConnected) return;

  const conn = await mongoose.connect(process.env.MONGO_URI, {
    serverSelectionTimeoutMS: 5000,
  });

  isConnected = true;
  console.log(`MongoDB connected: ${conn.connection.host}`);
  return conn;
};

mongoose.connection.on('disconnected', () => {
  console.warn('MongoDB disconnected — retrying...');
  isConnected = false;
});

export default connectDB;
