import jwt from 'jsonwebtoken';
import Customer from '../models/customerModel.js';
import Staff from '../models/staffModel.js';

//@desc Middleware xác thực người dùng (Cả Khách và Nhân viên)
const protect = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // 1. Tìm trong bảng Khách hàng trước
            let user = await Customer.findById(decoded.id).select('-password');

            // 2. Nếu không phải khách, tìm trong bảng Nhân viên
            if (!user) {
                user = await Staff.findById(decoded.id).select('-password');
                
                // Kiểm tra nếu là nhân viên thì tài khoản phải đang Active
                if (user && user.status === 'Inactive') {
                    res.status(403);
                    throw new Error('Tài khoản nhân viên đã bị khóa');
                }
            }

            if (!user) {
                res.status(401);
                throw new Error('Không tìm thấy thông tin người dùng');
            }

            // Gán thông tin người dùng vào request
            req.user = user;
            next();
        } catch (error) {
            res.status(401).json({ message: error.message || 'Token không hợp lệ' });
        }
    }

    if (!token) {
        return res.status(401).json( { message: 'Không có token, truy cập bị từ chối' } );
    }
};

//@desc Kiểm tra quyền Admin
const admin = (req, res, next) => {
    if (req.user && req.user.isAdmin) {
        next();
    } else {
        res.status(403); // Dùng 403 (Forbidden) sẽ chuẩn hơn 401
        throw new Error('Không có quyền truy cập, yêu cầu quyền Admin');
    }
};

//@desc Kiểm tra xem có phải Nhân viên không (Chung cho Sales, Inventory, Manager)
const isStaff = (req, res, next) => {
    if (req.user && req.user.role) {
        next();
    } else {
        res.status(403);
        throw new Error('Chỉ nhân viên mới có quyền thực hiện hành động này');
    }
};

//@desc Kiểm tra quyền cụ thể của nhân viên (Ví dụ: Chỉ Inventory mới được nhập kho)
const authorizeRoles = (...roles) => {
    return (req, res, next) => {
        if (req.user && roles.includes(req.user.role)) {
            next();
        } else {
            res.status(403);
            throw new Error(`Chức vụ ${req.user.role} không có quyền thực hiện việc này`);
        }
    };
};

export { protect, admin, isStaff, authorizeRoles };