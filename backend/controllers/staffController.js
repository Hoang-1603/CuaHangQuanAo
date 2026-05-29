import Staff from "../models/staffModel.js";
import generateToken from "../utils/generateToken.js";

//@desc đăng ký nhân viên mới (Chỉ dành cho Admin tạo)
//@route POST /api/staff
//@access Private/Admin
const registerStaff = async (req, res) => {
    const { email, password, name, phone, role, salary } = req.body;
    try {
        const staffExists = await Staff.findOne({ email });
        if (staffExists) {
            return res.status(400).json({ message: "Nhân viên này đã tồn tại trên hệ thống" });
        }
        // Tự động gán quyền Admin nếu role là 'Admin'
        const isAdmin = role === 'Admin';
        // Tạo staff mới với đầy đủ thông số lương và vai trò
        const staff = await Staff.create({
            email,
            password,
            name,
            phone,
            role: role || 'Sales',
            salary,
            isAdmin
        });
        res.status(201).json({
            _id: staff._id,
            name: staff.name,
            email: staff.email,
            role: staff.role,
            isAdmin: staff.isAdmin,
            token: generateToken(staff._id)
        });
    } catch (error) {
        res.status(400).json({ message: "Dữ liệu không hợp lệ", error: error.message });
    }
};

//@desc đăng nhập nhân viên
//@route POST /api/staff/login
//@access Public
const loginStaff = async (req, res) => {
    const { email, password } = req.body;

    try {
        const staff = await Staff.findOne({ email });

        if (staff) {
            // Kiểm tra trạng thái làm việc trước khi cho đăng nhập
            if (staff.status === 'Inactive') {
                return res.status(403).json({ message: "Tài khoản này đã bị khóa hoặc nhân viên đã nghỉ việc" });
            }

            // Kiểm tra mật khẩu
            if (await staff.matchPassword(password)) {
                res.json({
                    _id: staff._id,
                    name: staff.name,
                    email: staff.email,
                    role: staff.role,
                    isAdmin: staff.isAdmin,
                    token: generateToken(staff._id),
                });
            } else {
                res.status(401).json({ message: "Email hoặc mật khẩu không chính xác" });
            }
        } else {
            res.status(404).json({ message: "Không tìm thấy thông tin nhân viên" });
        }
    } catch (error) {
        res.status(500).json({ message: "Lỗi máy chủ khi đăng nhập" });
    }
};

//@desc Lấy danh sách tất cả nhân viên
//@route GET /api/staff
//@access Private/Admin
const getStaffs = async (req, res) => {
    try {
        const staffs = await Staff.find({}).sort({ hireDate: -1 });
        res.json(staffs);
    } catch (error) {
        res.status(500).json({ message: "Lỗi hệ thống" });
    }
};

//@desc Cập nhật thông tin nhân viên (Lương, Chức vụ, Trạng thái)
//@route PUT /api/staff/:id
//@access Private/Admin
const updateStaff = async (req, res) => {
    try {
        const staff = await Staff.findById(req.params.id);

        if (staff) {
            staff.name = req.body.name || staff.name;
            staff.email = req.body.email || staff.email;
            staff.phone = req.body.phone || staff.phone;
            staff.role = req.body.role || staff.role;
            staff.salary = req.body.salary || staff.salary;
            staff.status = req.body.status || staff.status;
            
            // Nếu cập nhật role sang Admin thì cập nhật luôn isAdmin
            if (req.body.role) {
                staff.isAdmin = req.body.role === 'Admin';
            }

            if (req.body.password) {
                staff.password = req.body.password;
            }

            const updatedStaff = await staff.save();
            res.json(updatedStaff);
        } else {
            // Trả về response lỗi trực tiếp thay vì throw error
            res.status(404).json({ message: 'Không tìm thấy nhân viên' });
        }
    } catch (error) {
        // Xử lý các lỗi từ server hoặc database (VD: sai format ID)
        res.status(500).json({ 
            message: 'Lỗi khi cập nhật thông tin nhân viên', 
            error: error.message 
        });
    }
};

export { registerStaff, loginStaff, getStaffs, updateStaff };