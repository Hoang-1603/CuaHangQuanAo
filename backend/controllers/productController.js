import Product from "../models/productModel.js";
import Order from '../models/orderModel.js';
 
// @desc    Lay danh sach san pham (Loc theo size, mau, gioi tinh, gia...)
// @route   GET /api/products
const getProducts = async (req, res) => {
    try {
        const { keyword, category, size, color, gender, minPrice, maxPrice } = req.query;
        let query = {};
        if (keyword) {
            query.name = { $regex: keyword, $options: 'i' };
        }
        if (category) {
            query.category = category;
        }
        if (gender) {
            query.gender = gender;
        }
        if (size || color) {
            query.variants = { $elemMatch: {} };
            if (size) query.variants.$elemMatch.size = size;
            if (color) query.variants.$elemMatch.color = color;
        }
        if (minPrice || maxPrice) {
            query.price = {};
            if (minPrice) query.price.$gte = Number(minPrice);
            if (maxPrice) query.price.$lte = Number(maxPrice);
        }
 
        const products = await Product.find(query);
        res.json(products);
    } catch (error) {
        res.status(500).json({ message: "Lỗi hệ thống khi lấy danh sách sản phẩm" });
    }
};
 
// @desc    lay chi tiet mot san pham theo id
// @route   GET /api/products/:id
const getProductById = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (product) {
            res.json(product);
        } else {
            res.status(404).json({ message: 'Không tìm thấy sản phẩm này' });
        }
    } catch (error) {
        res.status(400).json({ message: 'ID sản phẩm không hợp lệ' });
    }
};
 
// @desc    tao san pham moi (Admin)
// @route   POST /api/products
// @access  Private/Admin
const createProduct = async (req, res) => {
    try {
        const {
            name, price, images, brand, category,
            description, variants, material, gender,
            metaTitle, metaDescription, metaKeywords
        } = req.body;
 
        const totalStock = variants
            ? variants.reduce((acc, item) => acc + Number(item.stock), 0)
            : 0;
 
        const product = new Product({
            user: req.user._id,
            name,
            price,
            images,
            brand: brand || 'No Brand',
            category,
            description: description || 'Sản phẩm thời trang mới nhất',
            variants,
            countInStock: totalStock,
            material,
            gender,
            metaTitle: metaTitle || name,
            metaDescription: metaDescription || description?.substring(0, 160),
            metaKeywords: metaKeywords || `${name}, ${category}, thời trang`
        });
 
        const createdProduct = await product.save();
        res.status(201).json(createdProduct);
    } catch (error) {
        res.status(500).json({ message: 'Lỗi tạo sản phẩm: ' + error.message });
    }
};
 
// @desc    cap nhat san pham
// @route   PUT /api/products/:id
// @access  Private/Admin
const updateProduct = async (req, res) => {
    try {
        const {
            name, price, description, images, brand,
            category, variants, material, gender,
            metaTitle, metaDescription, metaKeywords
        } = req.body;
 
        const product = await Product.findById(req.params.id);
 
        if (product) {
            // FIX: Dùng !== undefined thay vì || để tránh falsy bug
            // Ví dụ: price=0 hoặc name='' sẽ bị bỏ qua nếu dùng "||"
            if (name !== undefined && name !== '') product.name = name;
            if (price !== undefined) product.price = Number(price);
            if (description !== undefined && description !== '') product.description = description;
            if (images !== undefined) product.images = images;
            if (brand !== undefined && brand !== '') product.brand = brand;
            if (category !== undefined && category !== '') product.category = category;
            if (material !== undefined) product.material = material;
            if (gender !== undefined) product.gender = gender;
 
            if (variants) {
                product.variants = variants;
                product.countInStock = variants.reduce((acc, item) => acc + Number(item.stock), 0);
            }
 
            if (metaTitle !== undefined) product.metaTitle = metaTitle;
            if (metaDescription !== undefined) product.metaDescription = metaDescription;
            if (metaKeywords !== undefined) product.metaKeywords = metaKeywords;
 
            const updatedProduct = await product.save();
            res.json(updatedProduct);
        } else {
            res.status(404).json({ message: 'Không tìm thấy sản phẩm' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Lỗi cập nhật: ' + error.message });
    }
};
 
// @desc    xoa san pham (Soft Delete)
// @route   DELETE /api/products/:id
// @access  Private/Admin
const deleteProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (product) {
            await product.delete();
            res.json({ message: 'Sản phẩm đã được đưa vào thùng rác' });
        } else {
            res.status(404).json({ message: 'Không tìm thấy sản phẩm' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
 
// @desc    tao danh gia san pham (chi gianh cho khach hang da mua thanh cong san pham)
// @route   POST /api/products/:id/reviews
const createProductReview = async (req, res) => {
    try {
        const { rating, comment } = req.body;
        const product = await Product.findById(req.params.id);
 
        if (product) {
            const hasPurchased = await Order.findOne({
                user: req.user._id,
                'orderItems.product': req.params.id,
                orderStatus: 'Đã giao'
            });
 
            if (!hasPurchased) {
                return res.status(400).json({ message: 'Bạn cần hoàn tất mua hàng trước khi để lại đánh giá' });
            }
 
            const alreadyReviewed = product.reviews.find(
                (r) => r.user.toString() === req.user._id.toString()
            );
 
            if (alreadyReviewed) {
                return res.status(400).json({ message: 'Bạn đã đánh giá sản phẩm này rồi' });
            }
 
            const review = {
                name: req.user.name,
                rating: Number(rating),
                comment,
                user: req.user._id,
            };
 
            product.reviews.push(review);
            product.numReviews = product.reviews.length;
            product.rating = product.reviews.reduce((acc, item) => item.rating + acc, 0) / product.reviews.length;
 
            await product.save();
            res.status(201).json({ message: 'Đã thêm đánh giá thành công' });
        } else {
            res.status(404).json({ message: 'Không tìm thấy sản phẩm' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
 
// @desc    Lấy danh sách sản phẩm theo danh sách ID (So sánh / Yêu thích)
// @route   POST /api/products/compare
const getProductsForComparison = async (req, res) => {
    const { productIds } = req.body;
    if (!productIds || productIds.length === 0) {
        return res.status(400).json({ message: 'Chưa chọn sản phẩm nào' });
    }
    try {
        const products = await Product.find({ _id: { $in: productIds } });
        res.json(products);
    } catch (error) {
        res.status(500).json({ message: 'Lỗi khi lấy dữ liệu so sánh' });
    }
};
 
export {
    getProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct,
    createProductReview,
    getProductsForComparison
};