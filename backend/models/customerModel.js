import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { hashPassword } from "../utils/hashPassword.js";

// cap nhat schema gio hang
const cartItemSchema = mongoose.Schema({
    name: { type: String, required: true },
    quantity: { type: Number, required: true, min: 1 },
    image: { type: String, required: true },
    price: { type: Number, required: true },
    size: { type: String, required: true },  
    color: { type: String, required: true },
    product: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Product', 
    },
});

const customerSchema = mongoose.Schema(
    {
        email: { type: String, required: true, unique: true },
        name: { type: String, required: false },
        phone: { type: String, required: false },
        password: { type: String, required: true },
        isAdmin: { type: Boolean, default: false },
        
        // danh sach dia chi 
        addresses: [
            {
                label: { type: String, default: '' }, // 'city' | 'district' | 'ward' | 'address'
                value: { type: String, default: '' },
            }
        ],

        cart: [cartItemSchema], 
    },
    {
        timestamps: true,
    }
);

// ma hoa mat khau truoc khi luu
customerSchema.pre("save", async function (next) {
    if (!this.isModified("password")) {
        return next();
    }
    // su dung ham hashPassword
    this.password = await hashPassword(this.password);
    next();
});

// ham so sanh mat khau
customerSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

const Customer = mongoose.model('Customer', customerSchema);
export default Customer;