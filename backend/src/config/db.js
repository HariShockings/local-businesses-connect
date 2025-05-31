import mongoose from 'mongoose';

const connectDB = () => {
  console.log('Connecting to MongoDB with URI:', process.env.MONGODB_URI || 'No URI set');
  mongoose
    .connect(process.env.MONGODB_URI)
    .then(() => console.log('MongoDB connected successfully'))
    .catch((err) => console.error('MongoDB connection error:', err));
};

export default connectDB;