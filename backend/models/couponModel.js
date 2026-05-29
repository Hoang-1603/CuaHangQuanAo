import mongoose from 'mongoose';
 
const couponSchema = mongoose.Schema({
  code: { 
    type: String, 
    required: true, 
    unique: true, 
    uppercase: true,
    trim: true 
  },
  
  // Loại giảm giá: 'percentage' (%) hoặc 'fixed' (số tiền cụ thể)
  discountType: {
    type: String,
    required: true,
    enum: ['percentage', 'fixed'],
    default: 'percentage'
  },
 
  // Giá trị giảm (Ví dụ: 10 nếu là % hoặc 50000 nếu là tiền mặt)
  discountValue: { 
    type: Number, 
    required: true,
    min: 0
  }, 
 
  // Số tiền giảm tối đa (Chỉ áp dụng khi discountType là 'percentage')
  // Ví dụ: Giảm 10% nhưng tối đa không quá 100k
  maxDiscountAmount: { 
    type: Number,
    default: 0 
  },
 
  // Đơn hàng tối thiểu để áp dụng mã (Ví dụ: Đơn từ 500k mới được dùng)
  minPurchaseAmount: {
    type: Number,
    default: 0
  },
 
  expirationDate: { 
    type: Date, 
    required: true 
  },
 
  // Giới hạn số lần mã này được sử dụng trên toàn hệ thống
  usageLimit: {
    type: Number,
    default: 100
  },
 
  // Số lần đã sử dụng thực tế
  usageCount: {
    type: Number,
    default: 0
  },
 
  // Danh sách user đã dùng mã này (mỗi user chỉ dùng 1 lần)
  usedBy: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer'
  }],
 
  isActive: { 
    type: Boolean, 
    default: true 
  },
}, { timestamps: true });
 
// Middleware kiểm tra xem mã còn hạn hay không (Optional)
couponSchema.methods.isValid = function() {
  return this.isActive && 
         this.expirationDate > new Date() && 
         this.usageCount < this.usageLimit;
};
 
const Coupon = mongoose.model('Coupon', couponSchema);
export default Coupon;