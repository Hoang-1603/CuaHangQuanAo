import express from 'express';
const router = express.Router();
import { 
    addOrderItems, getMyOrders, getOrders, 
    getOrderById, deleteOrder, updateOrderStatus,
    cancelOrderByUser   // thêm
} from '../controllers/orderController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

router
  .route('/')
  .post(protect, addOrderItems)
  .get(protect, admin, getOrders);

router.get('/myorders', protect, getMyOrders);
router.get('/:id', protect, getOrderById);

router.route('/:id')
    .delete(protect, admin, deleteOrder);

router.route('/:id/status').put(protect, admin, updateOrderStatus);

// Route mới cho user tự hủy
router.put('/:id/cancel', protect, cancelOrderByUser);

export default router;