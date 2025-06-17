// Product.model.ts
import { Document, Schema, model } from 'mongoose';

export interface Variant {
  size: string;
  color: string;
  stock: number;
}

export interface ProductDocument extends Document {
  name: string;
  variants: Variant[]; // Giả sử mỗi sản phẩm có nhiều biến thể
}

const VariantSchema = new Schema<Variant>({
  size: { type: String, required: true },
  color: { type: String, required: true },
  stock: { type: Number, required: true },
});

const ProductSchema = new Schema<ProductDocument>({
  name: { type: String, required: true },
  variants: [VariantSchema],
});

export const Product = model<ProductDocument>('Product', ProductSchema);
