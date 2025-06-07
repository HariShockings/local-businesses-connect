import asyncHandler from 'express-async-handler';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Activity from '../models/Activity.js';
import { cloudinary, configureCloudinary } from '../config/cloudinaryConfig.js';
import upload from '../config/multerConfig.js';

class UserController {
  generateToken(userId) {
    return jwt.sign({ userId }, process.env.JWT_SECRET, {
      expiresIn: '30d',
    });
  }

  register = asyncHandler(async (req, res) => {
    const { name, username, email, password, role } = req.body;

    const query = username ? { $or: [{ email }, { username }] } : { email };
    const userExists = await User.findOne(query);
    if (userExists) {
      res.status(400);
      throw new Error('User with this email or username already exists');
    }

    const user = await User.create({
      name,
      username: username || undefined,
      email,
      password,
      role: role || 'user',
    });

    if (user) {
      const token = this.generateToken(user._id);
      
      res.cookie('jwt', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV !== 'development',
        sameSite: 'strict',
        maxAge: 30 * 24 * 60 * 60 * 1000,
      });

      res.status(201).json({
        _id: user._id,
        name: user.name,
        username: user.username,
        email: user.email,
        role: user.role,
        preferences: user.preferences,
        profilePicture: user.profilePicture,
        coverImage: user.coverImage,
        location: user.location,
        website: user.website,
        bio: user.bio,
        token,
      });
    } else {
      res.status(400);
      throw new Error('Invalid user data');
    }
  });

  login = asyncHandler(async (req, res) => {
    const { email, password, device, ip, location } = req.body;

    const user = await User.findOne({
      $or: [{ email: email }, { username: email }],
    });

    if (user && (await user.matchPassword(password))) {
      const token = this.generateToken(user._id);

      user.sessions.push({
        device: device || 'Unknown Device',
        location: location || 'Unknown',
        ip: ip || req.ip || 'Unknown',
        lastActive: new Date(),
        token,
      });
      await user.save();

      res.cookie('jwt', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV !== 'development',
        sameSite: 'strict',
        maxAge: 30 * 24 * 60 * 60 * 1000,
      });

      res.json({
        _id: user._id,
        name: user.name,
        username: user.username,
        email: user.email,
        role: user.role,
        preferences: user.preferences,
        profilePicture: user.profilePicture,
        coverImage: user.coverImage,
        location: user.location,
        website: user.website,
        bio: user.bio,
        token,
      });
    } else {
      res.status(401);
      throw new Error('Invalid email/username or password');
    }
  });

  logout = asyncHandler(async (req, res) => {
    const token = req.cookies.jwt;
    if (token) {
      const user = await User.findById(req.user._id);
      user.sessions = user.sessions.filter((session) => session.token !== token);
      await user.save();
    }

    res.cookie('jwt', '', {
      httpOnly: true,
      expires: new Date(0),
    });
    res.status(200).json({ message: 'Logged out successfully' });
  });

  getProfile = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id).select('-password');
    if (user) {
      res.json({
        _id: user._id,
        name: user.name,
        username: user.username,
        email: user.email,
        role: user.role,
        preferences: user.preferences,
        profilePicture: user.profilePicture,
        coverImage: user.coverImage,
        location: user.location,
        website: user.website,
        bio: user.bio,
        phone: user.phone,
      });
    } else {
      res.status(404);
      throw new Error('User not found');
    }
  });

  updateProfilePicture = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);
    if (!user) {
      res.status(404);
      throw new Error('User not found');
    }

    if (!req.file) {
      // Remove profile picture if no file is uploaded
      if (user.profilePicture) {
        const publicId = user.profilePicture.split('/').pop().split('.')[0];
        await cloudinary.uploader.destroy(`profile_pictures/${publicId}`);
        user.profilePicture = null;
        await user.save();

        await Activity.create({
          userId: user._id,
          type: 'profile_update',
          description: `${user.name} removed their profile picture`,
        });

        res.json({ profilePicture: null });
      } else {
        res.status(400);
        throw new Error('No profile picture to remove');
      }
      return;
    }

    try {
      configureCloudinary();
      const result = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: 'profile_pictures',
            resource_type: 'image',
            format: 'png',
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );
        uploadStream.end(req.file.buffer);
      });

      if (user.profilePicture) {
        const publicId = user.profilePicture.split('/').pop().split('.')[0];
        await cloudinary.uploader.destroy(`profile_pictures/${publicId}`);
      }

      user.profilePicture = result.secure_url;
      await user.save();

      await Activity.create({
        userId: user._id,
        type: 'profile_update',
        description: `${user.name} updated their profile picture`,
      });

      res.json({ profilePicture: user.profilePicture });
    } catch (error) {
      res.status(500);
      throw new Error('Failed to update profile picture');
    }
  });

  updateCoverImage = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);
    if (!user) {
      res.status(404);
      throw new Error('User not found');
    }

    if (!req.file && !req.body.gradient) {
      // Remove cover image if no file or gradient is provided
      if (user.coverImage) {
        const publicId = user.coverImage.split('/').pop().split('.')[0];
        await cloudinary.uploader.destroy(`cover_images/${publicId}`);
        user.coverImage = null;
        await user.save();

        await Activity.create({
          userId: user._id,
          type: 'profile_update',
          description: `${user.name} removed their cover image`,
        });

        res.json({ coverImage: null });
      } else {
        res.status(400);
        throw new Error('No cover image to remove');
      }
      return;
    }

    if (req.body.gradient) {
      // Save gradient as cover image
      user.coverImage = req.body.gradient;
      await user.save();

      await Activity.create({
        userId: user._id,
        type: 'profile_update',
        description: `${user.name} updated their cover to a gradient`,
      });

      res.json({ coverImage: user.coverImage });
      return;
    }

    try {
      configureCloudinary();
      const result = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: 'cover_images',
            resource_type: 'image',
            format: 'png',
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );
        uploadStream.end(req.file.buffer);
      });

      if (user.coverImage && user.coverImage.startsWith('http')) {
        const publicId = user.coverImage.split('/').pop().split('.')[0];
        await cloudinary.uploader.destroy(`cover_images/${publicId}`);
      }

      user.coverImage = result.secure_url;
      await user.save();

      await Activity.create({
        userId: user._id,
        type: 'profile_update',
        description: `${user.name} updated their cover image`,
      });

      res.json({ coverImage: user.coverImage });
    } catch (error) {
      res.status(500);
      throw new Error('Failed to update cover image');
    }
  });

  updateBio = asyncHandler(async (req, res) => {
    const { bio } = req.body;
    const user = await User.findById(req.user._id);

    if (!user) {
      res.status(404);
      throw new Error('User not found');
    }

    user.bio = bio || user.bio;
    await user.save();

    await Activity.create({
      userId: user._id,
      type: 'profile_update',
      description: `${user.name} updated their bio`,
    });

    res.json({ bio: user.bio });
  });

  updatePersonalInfo = asyncHandler(async (req, res) => {
    const { email, phone, location, website } = req.body;
    const user = await User.findById(req.user._id);

    if (!user) {
      res.status(404);
      throw new Error('User not found');
    }

    // Validate email uniqueness
    if (email && email !== user.email) {
      const emailExists = await User.findOne({ email });
      if (emailExists) {
        res.status(400);
        throw new Error('Email is already in use');
      }
      user.email = email;
    }

    user.phone = phone || user.phone;
    user.location = location || user.location;
    user.website = website || user.website;
    await user.save();

    await Activity.create({
      userId: user._id,
      type: 'profile_update',
      description: `${user.name} updated their personal information`,
    });

    res.json({
      email: user.email,
      phone: user.phone,
      location: user.location,
      website: user.website,
    });
  });

  getSessions = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id).select('sessions');
    if (!user) {
      res.status(404);
      throw new Error('User not found');
    }

    res.json(user.sessions);
  });

  revokeSession = asyncHandler(async (req, res) => {
    const { sessionId } = req.params;
    const user = await User.findById(req.user._id);

    if (!user) {
      res.status(404);
      throw new Error('User not found');
    }

    const sessionIndex = user.sessions.findIndex((s) => s._id.toString() === sessionId);
    if (sessionIndex === -1) {
      res.status(404);
      throw new Error('Session not found');
    }

    const currentToken = req.cookies.jwt;
    if (user.sessions[sessionIndex].token === currentToken) {
      res.status(400);
      throw new Error('Cannot revoke current session');
    }

    user.sessions.splice(sessionIndex, 1);
    await user.save();

    res.json({ message: 'Session revoked successfully' });
  });

  getActivities = asyncHandler(async (req, res) => {
    const activities = await Activity.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .limit(10);
    res.json(activities);
  });
}

export default new UserController();