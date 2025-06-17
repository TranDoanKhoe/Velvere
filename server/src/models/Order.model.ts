import mongoose from 'mongoose';

// Schema cho từng sản phẩm trong đơn hàng
const orderItemSchema = new mongoose.Schema(
    {
        product_id: { type: String, required: true },
        product_name: { type: String, required: true },
        image: { type: String, required: true },
        price: { type: Number, required: true },
        quantity: { type: Number, required: true },
        size: { type: String, required: true },
        color: { type: String, required: true },
    },
    { _id: false },
);

// Schema cho đơn hàng
const orderSchema = new mongoose.Schema(
    {
        order_id: { type: String, required: true, unique: true, index: true },
        user_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
          required: true,
            index: true,
        },
        user_name: { type: String, required: true },
        phone: { type: String, required: true },
        address: { type: String, required: true },
        items: [orderItemSchema],
        totalAmount: { type: Number, required: true },
        status: {
            type: String,
            required: true,
            enum: [
                'pending',
                'confirmed',
                'shipping',
                'delivered',
                'cancelled',
            ],
            default: 'pending',
        },
        payment_method: {
            type: String,
            required: true,
            enum: ['COD', 'VNPAY', 'MOMO'],
            default: 'COD',
        },
        orderDate: { type: Date, default: Date.now },
        estimatedDelivery: { type: Date, required: true },
        cancellationReason: { type: String }, // Tùy chọn: Lý do hủy
        cancelledAt: { type: Date }, // Tùy chọn: Thời gian hủy
    },
    { timestamps: true },
);

// Thêm chỉ mục
// orderSchema.index({ order_id: 1 }, { unique: true });
// orderSchema.index({ user_id: 1 });

// Hook để kiểm tra ngày giao hàng và tính tổng tiền
orderSchema.pre('save', function (next) {
    if (this.estimatedDelivery <= this.orderDate) {
        throw new Error('Ngày giao hàng dự kiến phải lớn hơn ngày đặt hàng');
    }
    this.totalAmount = this.items.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0,
    );
    next();
});

export default mongoose.model('Order', orderSchema, 'Orders');
