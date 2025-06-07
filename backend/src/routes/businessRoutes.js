import express from 'express';
import businessController from '../controllers/businessController.js';
import authMiddleware from '../middleware/authMiddleware.js';
import upload from '../config/multerConfig.js';

const router = express.Router();

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

export default router;