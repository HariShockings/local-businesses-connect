import dotenv from 'dotenv';

// Load environment variables first
dotenv.config();
console.log('Loaded environment variables:', {
  MONGODB_URI: process.env.MONGODB_URI,
  PORT: process.env.PORT,
  CLIENT_URL: process.env.CLIENT_URL,
  CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME,
  CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY ? 'set' : 'unset',
}); // Debug log

import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import connectDB from './config/db.js';
import userRoutes from './routes/userRoutes.js';
import businessRoutes from './routes/businessRoutes.js';
import { configureCloudinary } from './config/cloudinaryConfig.js';

// Configure Cloudinary after loading env variables
try {
  configureCloudinary();
} catch (error) {
  console.error('Failed to configure Cloudinary:', error.message);
  process.exit(1);
}

// Connect to the database
connectDB();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(cors({
  origin: process.env.CLIENT_URL,
  credentials: true,
}));

app.use('/api/users', userRoutes);
app.use('/api/businesses', businessRoutes);

// Global error handler
app.use((err, req, res, next) => {
  console.error('Global error handler:', {
    message: err.message,
    stack: err.stack,
    statusCode: res.statusCode,
    path: req.path,
    method: req.method,
  });
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode).json({
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});