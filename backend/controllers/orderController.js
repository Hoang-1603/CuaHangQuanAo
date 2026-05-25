import Order from '../models/orderModel.js';
import Customer from '../models/customerModel.js';
import Product from '../models/productModel.js';

// @desc    Tạo đơn hàng mới & Trừ kho theo Biến thể (Size/Màu)
// @route   POST /api/orders
// @access  Private
const addOrderItems = async (req, res) => {
    const { shippingAddress, paymentMethod, totalPrice } = req.body;
    const customer = await Customer.findById(req.user._id);
    const cartItems = customer.cart;
    if (cartItems && cartItems.length === 0) {
        res.status(400);
        throw new Error('Giỏ hàng trống');
    }
    // kiem tra va tru kho truoc khi tao don
    for (const item of cartItems) {
        const product = await Product.findById(item.product);
        if (!product) {
            res.status(404);
            throw new Error(`Sản phẩm ${item.name} không tồn tại`);
        }
        const variant = product.variants.find(
            (v) => v.size === item.size && v.color === item.color
        );
        if (!variant || variant.stock < item.quantity) {
            res.status(400);
            throw new Error(`Sản phẩm ${item.name} - ${item.size}/${item.color} không đủ hàng`);
        }
        // tru kho bien the va tinh lai tong countInStock
        variant.stock -= item.quantity;
        product.countInStock = product.variants.reduce((acc, v) => acc + v.stock, 0);
        await product.save();
    }
    // luu don hang
    const order = new Order({
        orderItems: cartItems.map((item) => ({
            ...item,
            product: item.product,
            _id: undefined
        })),
        user: req.user._id,
        shippingAddress,
        paymentMethod,
        totalPrice,
    });
    const createdOrder = await order.save();
    // xoa gio hang
    customer.cart = [];
    await customer.save();
    res.status(201).json(createdOrder);
};

// @desc    cap nhat trang thai don hang
// @route   PUT /api/orders/:id/status
// @access  Private/Admin
const updateOrderStatus = async (req, res) => {
    const { status } = req.body; 
    // status: 'Chờ xác nhận', 'Đang xử lý', 'Đang giao', 'Đã giao', 'Đã hủy'
    const order = await Order.findById(req.params.id);
    if (order) {
        // neu don hang da huy thi khong cho doi trang thai khac
        if (order.orderStatus === 'Đã hủy') {
            res.status(400);
            throw new Error('Đơn hàng đã hủy không thể cập nhật trạng thái khác');
        }
        order.orderStatus = status;
        // xu ly logic cho tung trang thai don hang
        switch (status) {
            case 'Đã giao':
                order.isDelivered = true;
                order.deliveredAt = Date.now();
                break;
            case 'Đã hủy':
                order.isCancelled = true;
                order.cancelledAt = Date.now();
                // hoan khi huy don
                for (const item of order.orderItems) {
                    const product = await Product.findById(item.product);
                    if (product) {
                        const variant = product.variants.find(
                            (v) => v.size === item.size && v.color === item.color
                        );
                        if (variant) {
                            variant.stock += item.quantity; // cong lai so luong vao kho
                            product.countInStock = product.variants.reduce((acc, v) => acc + v.stock, 0);
                            await product.save();
                        }
                    }
                }
                break;

            default:
                // cac trang thai khac (dang xu ly/ dang giao) chi cap nhat string orderStatus
                break;
        }
        const updatedOrder = await order.save();
        res.json(updatedOrder);
    } else {
        res.status(404);
        throw new Error('Không tìm thấy đơn hàng');
    }
};

// @desc    lay don hang cua toi
const getMyOrders = async (req, res) => {
    try {
        // Thêm .populate để lấy thông tin sản phẩm
        const orders = await Order.find({ user: req.user._id })
            .populate({
                path: 'orderItems.product', // Đường dẫn tới model Product
                select: 'name images'     // Chỉ lấy tên và ảnh để tối ưu tốc độ
            })
            .sort({ createdAt: -1 });
        
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: 'Lỗi server' });
    }
};

// @desc    lay tat ca don hang(admin)
const getOrders = async (req, res) => {
    const orders = await Order.find({}).populate('user', 'id name email').sort({ createdAt: -1 });
    res.json(orders);
};

// @desc    lay don hang theo id
const getOrderById = async (req, res) => {
    const order = await Order.findById(req.params.id).populate('user', 'name email');
    if (order && (req.user.isAdmin || order.user._id.equals(req.user._id))) {
        res.json(order);
    } else {
        res.status(401);
        throw new Error('Không có quyền truy cập');
    }
};

// @desc    xoa don hang
const deleteOrder = async (req, res) => {
    const order = await Order.findById(req.params.id);
    if (order) {
        await order.deleteOne();
        res.json({ message: 'Đơn hàng đã được xóa' });
    } else {
        res.status(404);
        throw new Error('Không tìm thấy đơn hàng');
    }
};

export { 
    addOrderItems, 
    getMyOrders, 
    getOrders, 
    getOrderById, 
    deleteOrder, 
    updateOrderStatus 
};