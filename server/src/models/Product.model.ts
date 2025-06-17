import mongoose, { Schema, Document } from 'mongoose';

// Interface for Variant subdocument
export interface Variant {
    size: string;
    color: string;
    stock: number;
}

// Interface for Product document
export interface ProductDocument extends Document {
    product_id: string;
    product_name: string;
    description: string;
    category_id: string;
    sex: string;
    images: string[];
    price: number;
    xuatXu: string;
    chatLieu: string;
    variants: Variant[];
}

// Variant schema
const variantSchema = new Schema<Variant>(
    {
        size: { type: String, required: true, trim: true },
        color: { type: String, required: true, trim: true },
        stock: { type: Number, required: true, min: 0 },
    },
    { _id: false },
);

// Product schema
const productSchema = new Schema<ProductDocument>(
    {
        product_id: { type: String, required: true, unique: true, trim: true },
        product_name: { type: String, required: true, trim: true },
        description: { type: String, required: true, trim: true },
        category_id: {
            type: String,
            required: true,
            trim: true,
            default: 'Áo len',
        },
        sex: { type: String, required: true, trim: true, default: 'Nam' },
        images: { type: [String], required: true, default: [] },
        price: { type: Number, required: true, min: 0 },
        xuatXu: { type: String, required: true, trim: true },
        chatLieu: { type: String, required: true, trim: true },
        variants: { type: [variantSchema], required: true, default: [] },
    },
    {
        collection: 'Products',
        timestamps: true, // Add createdAt and updatedAt fields
    },
);

// Index for product_id
productSchema.index({ product_id: 1 }, { unique: true });

// Export the model
export default mongoose.model<ProductDocument>('Product', productSchema);
