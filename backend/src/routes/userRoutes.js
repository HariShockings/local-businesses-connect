import express from 'express';
import userController from '../controllers/userController.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/register', userController.register);
router.post('/login', userController.login);
router.post('/logout', userController.logout);
router.route('/profile')
  .get(authMiddleware.protect, userController.getProfile)
  .put(authMiddleware.protect, userController.updateProfile);

export default router;