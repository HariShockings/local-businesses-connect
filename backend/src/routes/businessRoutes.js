import express from 'express';
import businessController from '../controllers/businessController.js'; // Fixed case
import authMiddleware from '../middleware/authMiddleware.js';
import upload from '../config/multerConfig.js';

const router = express.Router();

// Public routes
router.route('/get-all')
  .get(businessController.getAllBusinesses);
router.route('/:pageName')
  .get(businessController.getBusinessByPageName);

// Protected routes
router.use(authMiddleware.protect);

router.route('/')
  .post(businessController.createBusiness)
  .get(businessController.getBusinesses);

router.route('/upload/image')
  .post(upload.single('image'), businessController.uploadImage);

router.route('/stats')
  .get(businessController.getBusinessStats);

router.route('/:id')
  .get(businessController.getBusinessById)
  .put(businessController.updateBusiness)
  .delete(businessController.deleteBusiness);

router.route('/:id/products')
  .post(businessController.addProduct);

router.route('/:id/products/:productId')
  .put(businessController.updateProduct)
  .delete(businessController.deleteProduct);

// router.route('/:id/reviews')
//   .get(authMiddleware.allowPublic, businessController.getReviews)
//   .post(businessController.createReview);

export default router;