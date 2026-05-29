import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { connectDB } from './config/db.js';
 
// import cac routes
import productRoutes from './routes/productRoutes.js';
import customerRoutes from './routes/customerRoutes.js';
import staffRoutes from './routes/staffRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import couponRoutes from './routes/couponRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
 
dotenv.config();
connectDB();
 
const app = express();
app.use(cors());
app.use(express.json());
 
app.use('/api/products', productRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/staff', staffRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/coupons', couponRoutes);
app.use('/api/dashboard', dashboardRoutes);
 
// ─── Global Error Handler ───────────────────────────────────────────────────
// Phải đặt SAU tất cả routes. Bắt mọi lỗi async/sync không được xử lý.
app.use((err, req, res, next) => {
    const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
    res.status(statusCode).json({
        message: err.message,
        stack: process.env.NODE_ENV === 'production' ? null : err.stack,
    });
});
 
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`server started at http://localhost:${PORT}`);
});