import express from 'express';
import { getCoupons, createCoupon, deleteCoupon, validateCoupon } from '../controllers/couponController.js';
import { protect, admin } from '../middleware/authMiddleware.js';
 
const router = express.Router();
 
router.route('/')
  .get(protect, admin, getCoupons)
  .post(protect, admin, createCoupon);
 
// /validate phải đứng TRƯỚC /:id để tránh bị match nhầm
router.route('/validate')
  .post(protect, validateCoupon);
 
router.route('/:id')
  .delete(protect, admin, deleteCoupon);
 
export default router;
 