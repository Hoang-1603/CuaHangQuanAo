import express from 'express';
const router = express.Router();
import {
    registerCustomer,
    loginCustomer,
    getCustomerCart,
    addItemToCart,
    removeItemFromCart,
    updateUserProfile,
    updateCartItemQuantity,
    getCustomers,
    deleteUser,
    getUserById,
    updateUser
} from '../controllers/customerController.js';
import { protect, admin } from '../middleware/authMiddleware.js';
 
// Routes công khai
router.post('/', registerCustomer);
router.post('/login', loginCustomer);
 
// Routes giỏ hàng
router
    .route('/cart')
    .get(protect, getCustomerCart)
    .post(protect, addItemToCart)
    .put(protect, updateCartItemQuantity);
 
// FIX: Xóa item giỏ hàng dùng req.body (productId + size + color) — không phải params
// Đổi route thành DELETE /cart (không có :productId) để tránh nhầm lẫn
router.delete('/cart', protect, removeItemFromCart);
 
// Route profile
router.route('/profile').put(protect, updateUserProfile);
 
// Routes admin — đặt TRƯỚC /:id để tránh conflict
router.get('/', protect, admin, getCustomers);
 
router
    .route('/:id')
    .delete(protect, admin, deleteUser)
    .get(protect, admin, getUserById)
    .put(protect, admin, updateUser);
 
export default router;
 