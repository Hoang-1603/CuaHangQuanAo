import Order from '../models/orderModel.js';
import Customer from '../models/customerModel.js';
import Product from '../models/productModel.js';
import Coupon from '../models/couponModel.js';
 
// @desc    Tạo đơn hàng mới & Trừ kho theo Biến thể (Size/Màu)
// @route   POST /api/orders
// @access  Private
const addOrderItems = async (req, res) => {
    try {
        const {
            orderItems,
            shippingAddress,
            paymentMethod,
            totalPrice,
            itemsPrice,
            shippingPrice,
            discountPrice,
            couponCode
        } = req.body;
 
        if (!orderItems || orderItems.length === 0) {
            return res.status(400).json({ message: 'Giỏ hàng trống' });
        }
 
        // Kiểm tra và trừ kho bằng atomic update (tránh race condition)
        for (const item of orderItems) {
            const updated = await Product.findOneAndUpdate(
                {
                    _id: item.product,
                    'variants.size': item.size,
                    'variants.color': item.color,
                    'variants.stock': { $gte: item.quantity }
                },
                { $inc: { 'variants.$.stock': -item.quantity } },
                { new: true }
            );
 
            if (!updated) {
                const product = await Product.findById(item.product);
                if (!product) {
                    return res.status(404).json({ message: `Sản phẩm ${item.name} không tồn tại` });
                }
                return res.status(400).json({ message: `${item.name} - ${item.size}/${item.color} không đủ hàng` });
            }
 
            // Cập nhật lại countInStock tổng
            const updatedProduct = await Product.findById(item.product);
            if (updatedProduct) {
                updatedProduct.countInStock = updatedProduct.variants.reduce((acc, v) => acc + v.stock, 0);
                await updatedProduct.save({ validateBeforeSave: false });
            }
        }
 
        const order = new Order({
            orderItems,
            user: req.user._id,
            shippingAddress,
            paymentMethod,
            itemsPrice: itemsPrice || 0,
            shippingPrice: shippingPrice || 0,
            discountPrice: discountPrice || 0,
            totalPrice,
            couponCode: couponCode ? couponCode.toUpperCase() : null,
        });
 
        const createdOrder = await order.save();
 
        if (couponCode) {
            await Coupon.findOneAndUpdate(
                { code: couponCode.toUpperCase() },
                { $inc: { usageCount: 1 }, $addToSet: { usedBy: req.user._id } }
            );
        }
 
        res.status(201).json(createdOrder);
    } catch (error) {
        const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
        res.status(statusCode).json({ message: error.message });
    }
};
 
// @desc    cap nhat trang thai don hang
// @route   PUT /api/orders/:id/status
// @access  Private/Admin
const updateOrderStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const order = await Order.findById(req.params.id);
        if (order) {
            if (order.orderStatus === 'Đã hủy') {
                return res.status(400).json({ message: 'Đơn hàng đã hủy không thể cập nhật trạng thái khác' });
            }
            order.orderStatus = status;
            switch (status) {
                case 'Đã giao':
                    order.isDelivered = true;
                    order.deliveredAt = Date.now();
                    break;
                case 'Đã hủy':
                    order.isCancelled = true;
                    order.cancelledAt = Date.now();
                    for (const item of order.orderItems) {
                        await Product.findOneAndUpdate(
                            { _id: item.product, 'variants.size': item.size, 'variants.color': item.color },
                            { $inc: { 'variants.$.stock': item.quantity } }
                        );
                        const product = await Product.findById(item.product);
                        if (product) {
                            product.countInStock = product.variants.reduce((acc, v) => acc + v.stock, 0);
                            await product.save({ validateBeforeSave: false });
                        }
                    }
                    if (order.couponCode) {
                        await Coupon.findOneAndUpdate(
                            { code: order.couponCode },
                            { $inc: { usageCount: -1 }, $pull: { usedBy: order.user } }
                        );
                    }
                    break;
                default:
                    break;
            }
            const updatedOrder = await order.save();
            res.json(updatedOrder);
        } else {
            res.status(404).json({ message: 'Không tìm thấy đơn hàng' });
        }
    } catch (error) {
        const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
        res.status(statusCode).json({ message: error.message });
    }
};
 
// @desc    lay don hang cua toi
const getMyOrders = async (req, res) => {
    try {
        const orders = await Order.find({ user: req.user._id })
            .populate({ path: 'orderItems.product', select: 'name images' })
            .sort({ createdAt: -1 });
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: 'Lỗi server' });
    }
};
 
// @desc    lay tat ca don hang (admin)
const getOrders = async (req, res) => {
    try {
        const orders = await Order.find({}).populate('user', 'id name email').sort({ createdAt: -1 });
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: 'Lỗi server' });
    }
};
 
// @desc    lay don hang theo id
const getOrderById = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id).populate('user', 'name email');
        if (order && (req.user.isAdmin || order.user._id.equals(req.user._id))) {
            res.json(order);
        } else {
            res.status(401).json({ message: 'Không có quyền truy cập' });
        }
    } catch (error) {
        const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
        res.status(statusCode).json({ message: error.message });
    }
};
 
// @desc    xoa don hang (Admin)
// @route   DELETE /api/orders/:id
// @access  Private/Admin
const deleteOrder = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);
        if (order) {
            // FIX: Hoàn kho nếu đơn chưa bị hủy trước đó
            // (Nếu đã hủy thì kho đã được hoàn rồi, không hoàn lại lần nữa)
            if (order.orderStatus !== 'Đã hủy') {
                for (const item of order.orderItems) {
                    await Product.findOneAndUpdate(
                        { _id: item.product, 'variants.size': item.size, 'variants.color': item.color },
                        { $inc: { 'variants.$.stock': item.quantity } }
                    );
                    const product = await Product.findById(item.product);
                    if (product) {
                        product.countInStock = product.variants.reduce((acc, v) => acc + v.stock, 0);
                        await product.save({ validateBeforeSave: false });
                    }
                }
                // Hoàn coupon nếu có
                if (order.couponCode) {
                    await Coupon.findOneAndUpdate(
                        { code: order.couponCode },
                        { $inc: { usageCount: -1 }, $pull: { usedBy: order.user } }
                    );
                }
            }
            await order.deleteOne();
            res.json({ message: 'Đơn hàng đã được xóa' });
        } else {
            res.status(404).json({ message: 'Không tìm thấy đơn hàng' });
        }
    } catch (error) {
        const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
        res.status(statusCode).json({ message: error.message });
    }
};
 
const cancelOrderByUser = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);
 
        if (!order) {
            return res.status(404).json({ message: 'Không tìm thấy đơn hàng' });
        }
        if (order.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Bạn không có quyền hủy đơn hàng này' });
        }
        if (order.orderStatus !== 'Chờ xác nhận') {
            return res.status(400).json({ message: 'Chỉ có thể hủy đơn hàng đang ở trạng thái "Chờ xác nhận"' });
        }
 
        // Hoàn lại kho bằng atomic update
        for (const item of order.orderItems) {
            await Product.findOneAndUpdate(
                { _id: item.product, 'variants.size': item.size, 'variants.color': item.color },
                { $inc: { 'variants.$.stock': item.quantity } }
            );
            const product = await Product.findById(item.product);
            if (product) {
                product.countInStock = product.variants.reduce((acc, v) => acc + v.stock, 0);
                await product.save({ validateBeforeSave: false });
            }
        }
 
        if (order.couponCode) {
            await Coupon.findOneAndUpdate(
                { code: order.couponCode },
                { $inc: { usageCount: -1 }, $pull: { usedBy: req.user._id } }
            );
        }
 
        order.orderStatus = 'Đã hủy';
        order.isCancelled = true;
        order.cancelledAt = Date.now();
        await order.save();
 
        res.json({ message: 'Hủy đơn hàng thành công' });
    } catch (error) {
        const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
        res.status(statusCode).json({ message: error.message });
    }
};
 
export {
    addOrderItems,
    getMyOrders,
    getOrders,
    getOrderById,
    deleteOrder,
    updateOrderStatus,
    cancelOrderByUser
};