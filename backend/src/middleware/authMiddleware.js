import jwt from 'jsonwebtoken';
import asyncHandler from 'express-async-handler';
import User from '../models/User.js';

class AuthMiddleware {
  protect = asyncHandler(async (req, res, next) => {
    let token = req.cookies.jwt;

    if (!token) {
      res.status(401);
      throw new Error('Not authorized, no token');
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.userId).select('-password');
      next();
    } catch (error) {
      res.status(401);
      throw new Error('Not authorized, token failed');
    }
  });

  admin = asyncHandler(async (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
      next();
    } else {
      res.status(401);
      throw new Error('Not authorized as admin');
    }
  });
}

const allowPublic = (req, res, next) => {
  // Allow public access without requiring authentication
  next();
};

export default new AuthMiddleware();