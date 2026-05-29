import Customer from "../models/customerModel.js";
import generateToken from "../utils/generateToken.js";
import Product from '../models/productModel.js';
 
//@desc dang ky khach hang moi
//@route POST /api/customers
//@access Public
const registerCustomer = async (req, res) => {
    const { email, name, phone, password } = req.body;
 
    try {
        const customerExists = await Customer.findOne({ email });
        if (customerExists) {
            return res.status(400).json({ message: "Email đã tồn tại" });
        }
 
        const customer = await Customer.create({ email, name, phone, password });
 
        res.status(201).json({
            _id: customer._id,
            name: customer.name,
            email: customer.email,
            token: generateToken(customer._id),
        });
    } catch (error) {
        res.status(400).json({ message: "Dữ liệu không hợp lệ", error: error.message });
    }
};
 
//@desc dang nhap khach hang
//@route POST /api/customers/login
//@access Public
const loginCustomer = async (req, res) => {
    const { email, password } = req.body;
 
    try {
        const customer = await Customer.findOne({ email });
 
        if (!customer) {
            return res.status(404).json({ message: "Không tìm thấy tài khoản khách hàng" });
        }
 
        if (!(await customer.matchPassword(password))) {
            return res.status(401).json({ message: "Email hoặc mật khẩu không chính xác" });
        }
 
        res.json({
            _id:       customer._id,
            name:      customer.name,
            email:     customer.email,
            phone:     customer.phone,
            dob:       customer.dob,
            addresses: customer.addresses,
            isAdmin:   customer.isAdmin,
            token:     generateToken(customer._id),
        });
    } catch (error) {
        res.status(500).json({ message: "Lỗi máy chủ" });
    }
};
 
//@desc lấy giỏ hàng của khách
//@route GET /api/customers/cart
//@access Private
const getCustomerCart = async (req, res) => {
    try {
        const customer = await Customer.findById(req.user._id);
        if (customer) {
            await customer.populate('cart.product');
            res.json(customer.cart);
        } else {
            res.status(404).json({ message: 'Không tìm thấy khách hàng' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Lỗi server' });
    }
};
 
//@desc thêm sản phẩm vào giỏ hàng (Hỗ trợ Size/Màu)
//@route POST /api/customers/cart
//@access Private
const addItemToCart = async (req, res) => {
    try {
        const { productId, quantity, size, color } = req.body;
 
        const customer = await Customer.findById(req.user._id);
        const product = await Product.findById(productId);
 
        if (!product) {
            return res.status(404).json({ message: 'Không tìm thấy sản phẩm' });
        }
 
        const variant = product.variants.find(v => v.size === size && v.color === color);
        if (!variant) {
            return res.status(400).json({ message: `Sản phẩm ${product.name} không có biến thể Size ${size}/${color}` });
        }
 
        // Kiểm tra tổng số lượng (đã có trong giỏ + thêm mới) không vượt quá tồn kho
        const cartItemIndex = customer.cart.findIndex(
            (item) =>
                item.product.toString() === productId &&
                item.size === size &&
                item.color === color
        );
        const existingQty = cartItemIndex > -1 ? customer.cart[cartItemIndex].quantity : 0;
        const totalQty = existingQty + Number(quantity);
 
        if (variant.stock < totalQty) {
            return res.status(400).json({
                message: `${product.name} - Size ${size}/${color} chỉ còn ${variant.stock} sản phẩm (bạn đã có ${existingQty} trong giỏ)`
            });
        }
 
        if (cartItemIndex > -1) {
            customer.cart[cartItemIndex].quantity = totalQty;
        } else {
            customer.cart.push({
                product: productId,
                name: product.name,
                image: product.images[0],
                price: product.price,
                quantity: Number(quantity),
                size,
                color
            });
        }
 
        await customer.save();
        await customer.populate('cart.product');
        res.status(201).json(customer.cart);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};
 
//@desc xoa san pham khoi gio hang
//@route DELETE /api/customers/cart
//@access Private
const removeItemFromCart = async (req, res) => {
    try {
        // Nhận từ body (không phải params) vì cần cả size và color để xác định đúng biến thể
        const { productId, size, color } = req.body;
        const customer = await Customer.findById(req.user._id);
 
        if (customer) {
            customer.cart = customer.cart.filter(
                (item) => !(item.product.toString() === productId && item.size === size && item.color === color)
            );
            await customer.save();
            res.json(customer.cart);
        } else {
            res.status(404).json({ message: 'Không tìm thấy khách hàng' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
 
//@desc Cập nhật hồ sơ người dùng
//@route PUT /api/customers/profile
//@access Private
const updateUserProfile = async (req, res) => {
    try {
        const customer = await Customer.findById(req.user._id);
 
        if (!customer) {
            return res.status(404).json({ message: 'Không tìm thấy người dùng' });
        }
 
        customer.name  = req.body.name  || customer.name;
        customer.phone = req.body.phone || customer.phone;
        customer.email = req.body.email || customer.email;
        if (req.body.dob !== undefined) customer.dob = req.body.dob;
 
        if (Array.isArray(req.body.addresses)) {
            customer.addresses = req.body.addresses;
        }
        if (req.body.tinh !== undefined || req.body.huyen !== undefined || req.body.phuong !== undefined || req.body.address !== undefined) {
            customer.addresses = [
                { label: 'city',     value: req.body.tinh    || '' },
                { label: 'district', value: req.body.huyen   || '' },
                { label: 'ward',     value: req.body.phuong  || '' },
                { label: 'address',  value: req.body.address || '' },
            ];
        }
 
        // FIX: Kiểm tra mật khẩu cũ trước khi cho phép đổi mật khẩu mới
        if (req.body.password) {
            if (!req.body.oldPassword) {
                return res.status(400).json({ message: 'Vui lòng nhập mật khẩu cũ để xác nhận' });
            }
            const isMatch = await customer.matchPassword(req.body.oldPassword);
            if (!isMatch) {
                return res.status(401).json({ message: 'Mật khẩu cũ không chính xác' });
            }
            customer.password = req.body.password;
        }
 
        const updatedCustomer = await customer.save();
 
        res.json({
            _id:       updatedCustomer._id,
            name:      updatedCustomer.name,
            email:     updatedCustomer.email,
            isAdmin:   updatedCustomer.isAdmin,
            phone:     updatedCustomer.phone,
            dob:       updatedCustomer.dob,
            addresses: updatedCustomer.addresses,
            token:     generateToken(updatedCustomer._id),
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
 
//@desc Cập nhật số lượng sản phẩm trong giỏ hàng
//@route PUT /api/customers/cart
//@access Private
const updateCartItemQuantity = async (req, res) => {
    try {
        const { productId, size, color, quantity } = req.body;
 
        // FIX: Kiểm tra tồn kho trước khi cập nhật số lượng
        const product = await Product.findById(productId);
        if (product) {
            const variant = product.variants.find(v => v.size === size && v.color === color);
            if (variant && Number(quantity) > variant.stock) {
                return res.status(400).json({
                    message: `${product.name} - Size ${size}/${color} chỉ còn ${variant.stock} sản phẩm`
                });
            }
        }
 
        const customer = await Customer.findById(req.user._id);
 
        if (customer) {
            const itemIndex = customer.cart.findIndex(
                (item) => item.product.toString() === productId && item.size === size && item.color === color
            );
 
            if (itemIndex > -1) {
                customer.cart[itemIndex].quantity = Number(quantity);
                await customer.save();
                res.json(customer.cart);
            } else {
                res.status(404).json({ message: 'Sản phẩm không có trong giỏ hàng' });
            }
        } else {
            res.status(404).json({ message: 'Không tìm thấy khách hàng' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
 
//@desc Lấy tất cả người dùng (Chỉ dành cho Admin)
//@route GET /api/customers
//@access Private/Admin
const getCustomers = async (req, res) => {
    try {
        const customers = await Customer.find({}).sort({ createdAt: -1 });
        res.json(customers);
    } catch (error) {
        res.status(500).json({ message: 'Lỗi server' });
    }
};
 
//@desc Xóa người dùng
//@route DELETE /api/customers/:id
//@access Private/Admin
const deleteUser = async (req, res) => {
    try {
        const customer = await Customer.findById(req.params.id);
        if (customer) {
            await customer.deleteOne();
            res.json({ message: 'Người dùng đã bị xóa' });
        } else {
            res.status(404).json({ message: 'Không tìm thấy người dùng' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
 
//@desc Cập nhật người dùng (Sửa tên, email, quyền Admin)
//@route PUT /api/customers/:id
//@access Private/Admin
const updateUser = async (req, res) => {
    try {
        const customer = await Customer.findById(req.params.id);
        if (customer) {
            customer.name = req.body.name || customer.name;
            customer.email = req.body.email || customer.email;
            if (req.body.isAdmin !== undefined) {
                customer.isAdmin = req.body.isAdmin;
            }
            const updatedCustomer = await customer.save();
            res.json({
                _id: updatedCustomer._id,
                name: updatedCustomer.name,
                email: updatedCustomer.email,
                isAdmin: updatedCustomer.isAdmin,
            });
        } else {
            res.status(404).json({ message: 'Không tìm thấy người dùng' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
 
// @desc    Lấy chi tiết khách hàng (Admin)
// @route   GET /api/customers/:id
// @access  Private/Admin
const getUserById = async (req, res) => {
    try {
        const user = await Customer.findById(req.params.id).select('-password');
        if (user) {
            res.json(user);
        } else {
            res.status(404).json({ message: 'Không tìm thấy người dùng' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
 
export {
    registerCustomer,
    loginCustomer,
    getCustomerCart,
    addItemToCart,
    removeItemFromCart,
    updateUserProfile,
    updateCartItemQuantity,
    getCustomers,
    deleteUser,
    updateUser,
    getUserById
};