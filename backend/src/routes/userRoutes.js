import express from 'express';
import userController from '../controllers/userController.js';
import authMiddleware from '../middleware/authMiddleware.js';
import upload from '../config/multerConfig.js';

const router = express.Router();

router.post('/register', userController.register);
router.post('/login', userController.login);
router.post('/logout', userController.logout);
router.get('/profile', authMiddleware.protect, userController.getProfile);
router.post('/profile/picture', authMiddleware.protect, upload.single('image'), userController.updateProfilePicture);
router.post('/profile/cover', authMiddleware.protect, upload.single('image'), userController.updateCoverImage);
router.put('/profile/bio', authMiddleware.protect, userController.updateBio);
router.put('/profile/personal', authMiddleware.protect, userController.updatePersonalInfo);
router.get('/sessions', authMiddleware.protect, userController.getSessions);
router.delete('/sessions/:sessionId', authMiddleware.protect, userController.revokeSession);
router.get('/activity', authMiddleware.protect, userController.getActivities);

export default router;