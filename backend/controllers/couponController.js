import Coupon from '../models/couponModel.js';
 
// @desc    Lấy danh sách mã giảm giá
// @route   GET /api/coupons
// @access  Private/Admin
const getCoupons = async (req, res) => {
  try {
    const coupons = await Coupon.find({}).sort({ createdAt: -1 });
    res.json(coupons);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi hệ thống khi lấy danh sách mã' });
  }
};
 
// @desc    Tạo mã giảm giá mới
// @route   POST /api/coupons
// @access  Private/Admin
const createCoupon = async (req, res) => {
  try {
    const {
      code,
      discountType,
      discountValue,
      expirationDate,
      minPurchaseAmount,
      maxDiscountAmount,
      usageLimit
    } = req.body;
 
    const couponExists = await Coupon.findOne({ code: code.toUpperCase() });
    if (couponExists) {
      return res.status(400).json({ message: 'Mã giảm giá này đã tồn tại' });
    }
 
    const coupon = await Coupon.create({
      code: code.toUpperCase(),
      discountType,
      discountValue,
      expirationDate,
      minPurchaseAmount: minPurchaseAmount || 0,
      maxDiscountAmount: maxDiscountAmount || 0,
      usageLimit: usageLimit || 100
    });
 
    res.status(201).json(coupon);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi tạo mã giảm giá: ' + error.message });
  }
};
 
// @desc    Xóa mã giảm giá
// @route   DELETE /api/coupons/:id
// @access  Private/Admin
const deleteCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.findById(req.params.id);
    if (coupon) {
      await coupon.deleteOne();
      res.json({ message: 'Đã xóa mã giảm giá thành công' });
    } else {
      res.status(404).json({ message: 'Không tìm thấy mã giảm giá' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi xóa mã giảm giá: ' + error.message });
  }
};
 
// @desc    Kiểm tra mã giảm giá (Cho khách hàng áp dụng trong giỏ hàng)
// @route   POST /api/coupons/validate
// @access  Private
const validateCoupon = async (req, res) => {
  try {
    const { code, cartTotal } = req.body;
    const coupon = await Coupon.findOne({ code: code.toUpperCase(), isActive: true });
 
    if (!coupon) {
      return res.status(404).json({ message: 'Mã giảm giá không tồn tại hoặc đã bị vô hiệu hóa' });
    }
    if (new Date() > coupon.expirationDate) {
      return res.status(400).json({ message: 'Mã giảm giá đã hết hạn sử dụng' });
    }
    if (coupon.usageCount >= coupon.usageLimit) {
      return res.status(400).json({ message: 'Mã giảm giá đã hết lượt sử dụng' });
    }
 
    // Kiểm tra khách hàng đã dùng mã này chưa
    const userId = req.user._id.toString();
    const alreadyUsed = coupon.usedBy.some(id => id.toString() === userId);
    if (alreadyUsed) {
      return res.status(400).json({ message: 'Bạn đã sử dụng mã giảm giá này rồi' });
    }
 
    if (cartTotal < coupon.minPurchaseAmount) {
      return res.status(400).json({
        message: `Đơn hàng tối thiểu ${coupon.minPurchaseAmount.toLocaleString()}đ mới được áp dụng mã này`
      });
    }
 
    let discountAmount = 0;
    if (coupon.discountType === 'percentage') {
      discountAmount = cartTotal * (coupon.discountValue / 100);
      if (coupon.maxDiscountAmount > 0 && discountAmount > coupon.maxDiscountAmount) {
        discountAmount = coupon.maxDiscountAmount;
      }
    } else {
      discountAmount = coupon.discountValue;
    }
 
    // KHÔNG tăng usageCount ở đây — chỉ tăng sau khi đơn hàng được tạo thành công
    res.json({
      code: coupon.code,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      discountAmount,
      message: 'Áp dụng mã giảm giá thành công!'
    });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi hệ thống: ' + error.message });
  }
};
 
export { getCoupons, createCoupon, deleteCoupon, validateCoupon };
 