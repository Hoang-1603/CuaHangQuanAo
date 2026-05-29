import express from 'express';
const router = express.Router();
import {
    getProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct,
    createProductReview,
    getProductsForComparison
} from '../controllers/productController.js';
 
import { protect, admin } from '../middleware/authMiddleware.js';
 
router.get('/', getProducts);
 
// /compare phải đứng TRƯỚC /:id để tránh bị match nhầm
router.post('/compare', getProductsForComparison);
 
router.post('/', protect, admin, createProduct);
router.get('/:id', getProductById);
router.put('/:id', protect, admin, updateProduct);
router.delete('/:id', protect, admin, deleteProduct);
router.post('/:id/reviews', protect, createProductReview);
 
export default router;
 