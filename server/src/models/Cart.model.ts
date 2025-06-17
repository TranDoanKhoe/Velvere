import mongoose from 'mongoose';

const cartItemSchema = new mongoose.Schema({
    _id: { type: String, required: true },
    product_id: { type: String, required: true },
    product_name: { type: String, required: true },
    image: { type: String, required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true, min: 1 },
    size: { type: String, required: true },
    color: { type: String, required: true },
});

const cartSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true,
    },
    items: [cartItemSchema],
});

export default mongoose.model('Cart', cartSchema);
