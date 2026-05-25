import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { connectDB } from './config/db.js'; //import ham connectDB

//import cac routes
import productRoutes from './routes/productRoutes.js';
import customerRoutes from './routes/customerRoutes.js';
import staffRoutes from './routes/staffRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import couponRoutes from './routes/couponRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
dotenv.config(); //cau hinh .env
connectDB(); //ket noi voi MongoDB


const app = express(); //khoi tao express
app.use(cors());
app.use(express.json()); //middeware de express hieu json
app.use('/api/products', productRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/staff', staffRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/coupons', couponRoutes)
app.use('/api/dashboard', dashboardRoutes);


const PORT = process.env.PORT || 5000; //cau hinh port
app.listen(PORT, ()=>{
    console.log(`server started at http://localhost:${PORT}`)
});
// duyducha22_db_user
// rItlFLB2VnJNSk34