import Staff from '../models/staffModel.js';
import express from 'express';
const router = express.Router();
import { 
    registerStaff, 
    loginStaff, 
    getStaffs, 
    updateStaff 
} from '../controllers/staffController.js';

// Import các middleware bảo mật
import { protect, admin } from '../middleware/authMiddleware.js';

// Route đăng nhập - Để Public vì nhân viên cần đăng nhập để làm việc
router.post('/login', loginStaff);

// Route quản lý nhân viên - Chỉ Admin mới có quyền thực hiện
router.route('/')
    .post(protect, admin, registerStaff) // Chỉ Admin mới được tạo nhân viên mới
    .get(protect, admin, getStaffs);     // Chỉ Admin mới được xem danh sách nhân viên

router.route('/:id')
    .put(protect, admin, updateStaff);   // Chỉ Admin mới được sửa thông tin nhân viên (Lương, Chức vụ...)

export default router;