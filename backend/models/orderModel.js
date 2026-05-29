import mongoose from "mongoose";
 
const orderSchema = mongoose.Schema(
    {
        // tham chieu den khach hang
        user: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'Customer',
        },
 
        // danh sach san pham trong don hang
        orderItems: [
            {
                name: { type: String, required: true },
                quantity: { type: Number, required: true, min: 1 },
                image: { type: String, required: true },
                price: { type: Number, required: true }, // gia tai thoi diem mua hang
 
                size: { type: String, required: true },  
                color: { type: String, required: true },
 
                product: {
                    type: mongoose.Schema.Types.ObjectId,
                    required: true,
                    ref: 'Product',
                },
            },
        ],
 
        shippingAddress: {
            name: { type: String, required: true },
            address: { type: String, required: true },
            city: { type: String, required: true },
            district: { type: String},
            ward: { type: String},
            phone: { type: String, required: true },
            postalCode: { type: String },
        },
 
        paymentMethod: {
            type: String,
            required: true,
            enum: ['COD', 'VNPay', 'Momo', 'Bank Transfer'], // rang buoc cac phuong thuc
            default: 'COD',
        },
 
        couponCode: {
            type: String,
            default: null,
        },
 
        itemsPrice: {
            type: Number,
            default: 0,
        },
 
        shippingPrice: {
            type: Number,
            default: 0,
        },
 
        discountPrice: {
            type: Number,
            default: 0,
        },
 
        totalPrice: {
            type: Number,
            required: true,
            default: 0.0,
        },
 
        // Quan ly trang thai bang enum
        orderStatus: {
            type: String,
            required: true,
            enum: ['Chờ xác nhận', 'Đang xử lý', 'Đang giao', 'Đã giao', 'Đã hủy'],
            default: 'Chờ xác nhận',
        },
 
        //cac moc thoi gian quan trong
        isPaid: { type: Boolean, required: true, default: false },
        paidAt: { type: Date },
        
        isDelivered: { type: Boolean, required: true, default: false },
        deliveredAt: { type: Date },
 
        isCancelled: { type: Boolean, required: true, default: false },
        cancelledAt: { type: Date },
    },
    {
        timestamps: true,
    }
);
 
const Order = mongoose.model('Order', orderSchema);
export default Order;