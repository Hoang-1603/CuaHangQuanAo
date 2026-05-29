import Order from '../models/orderModel.js';
import Product from '../models/productModel.js';
import Customer from '../models/customerModel.js';
import Coupon from '../models/couponModel.js';

// @desc    Lấy dữ liệu thống kê cho Dashboard
// @route   GET /api/dashboard
// @access  Private/Admin
const getDashboardStats = async (req, res) => {
    try {
        // 1. Thống kê Doanh thu & Đơn hàng
        const orders = await Order.find({});
        
        let totalRevenue = 0;
        let ordersByStatus = {
            'Chờ xác nhận': 0,
            'Đang xử lý': 0,
            'Đang giao': 0,
            'Đã giao': 0,
            'Đã hủy': 0
        };

        orders.forEach(order => {
            // Chỉ cộng doanh thu những đơn đã giao thành công
            if (order.orderStatus === 'Đã giao') {
                totalRevenue += order.totalPrice;
            }
            if (ordersByStatus[order.orderStatus] !== undefined) {
                ordersByStatus[order.orderStatus]++;
            }
        });

        // 2. Sản phẩm tồn kho thấp (VD: Tổng countInStock < 10)
        const lowStockProducts = await Product.find({ countInStock: { $lt: 10 } })
            .select('name countInStock images')
            .limit(5);

        // 3. Khách hàng mới trong tháng
        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0, 0, 0, 0);
        const newCustomersThisMonth = await Customer.countDocuments({ createdAt: { $gte: startOfMonth } });

        // 4. Tổng số lượng
        const totalCustomers = await Customer.countDocuments();
        const totalProducts = await Product.countDocuments();

        // 5. Coupon sắp hết hạn (còn hạn trong vòng 7 ngày tới)
        const next7Days = new Date();
        next7Days.setDate(next7Days.getDate() + 7);
        const expiringCoupons = await Coupon.find({
            expirationDate: { $gt: new Date(), $lte: next7Days },
            isActive: true
        }).select('code discountValue expirationDate');

        res.json({
            revenue: {
                total: totalRevenue,
                totalOrders: orders.length,
            },
            orders: ordersByStatus,
            products: {
                total: totalProducts,
                lowStock: lowStockProducts
            },
            customers: {
                total: totalCustomers,
                newThisMonth: newCustomersThisMonth
            },
            coupons: {
                expiring: expiringCoupons
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Lỗi server khi lấy dữ liệu thống kê' });
    }
};

export { getDashboardStats };