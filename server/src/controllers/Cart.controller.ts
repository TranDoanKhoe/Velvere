import type { Request, Response } from 'express';
import mongoose from 'mongoose';
import Cart from '../models/Cart.model';
import { checkAuth } from './User.controller';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const validateCartItems = (items: any[]): boolean => {
    if (!Array.isArray(items)) return false;
    return items.every(
        (item) =>
            item.product_id &&
            typeof item.product_id === 'string' &&
            item.product_name &&
            typeof item.product_name === 'string' &&
            item.image &&
            typeof item.image === 'string' &&
            item.price &&
            typeof item.price === 'number' &&
            item.quantity &&
            typeof item.quantity === 'number' &&
            item.quantity >= 1 &&
            item.size &&
            typeof item.size === 'string' &&
            item.color &&
            typeof item.color === 'string',
    );
};

export const getCart = async (req: Request, res: Response): Promise<void> => {
    try {
        const authResult = await checkAuth(req);
        if (
            !authResult.authenticated ||
            !authResult.user ||
            !authResult.user._id
        ) {
            res.status(401).json({ message: 'Không xác thực được người dùng' });
            return;
        }
        const userId = authResult.user._id;
        const cart = await Cart.findOne({ user: userId });
        res.status(200).json({ items: cart?.items || [] });
    } catch (err) {
        console.error('Lỗi khi lấy giỏ hàng:', err);
        res.status(500).json({
            message: 'Lỗi server khi lấy giỏ hàng',
            error: err instanceof Error ? err.message : 'Unknown error',
        });
    }
};

export const updateCart = async (
    req: Request,
    res: Response,
): Promise<void> => {
    try {
        const authResult = await checkAuth(req);
        if (
            !authResult.authenticated ||
            !authResult.user ||
            !authResult.user._id
        ) {
            res.status(401).json({ message: 'Không xác thực được người dùng' });
            return;
        }
        const userId = authResult.user._id;
        const { items } = req.body;
        console.log('Items received for user', userId, ':', items);

        if (!validateCartItems(items)) {
            res.status(400).json({ message: 'Dữ liệu giỏ hàng không hợp lệ' });
            return;
        }

        interface CartItem {
            product_id: string;
            product_name: string;
            image: string;
            price: number;
            quantity: number;
            size: string;
            color: string;
            _id?: string;
        }

        const itemsWithId = items.map((item: CartItem) => ({
            ...item,
            _id: item._id || new mongoose.Types.ObjectId().toString(),
        }));

        const result = await Cart.findOneAndUpdate(
            { user: userId },
            { user: userId, items: itemsWithId },
            { upsert: true, new: true, runValidators: true },
        );
        console.log('Kết quả cập nhật giỏ hàng:', result);

        res.status(200).json({
            message: 'Cập nhật giỏ hàng thành công',
            items: result.items,
        });
    } catch (err) {
        console.error('Lỗi khi cập nhật giỏ hàng:', err);
        res.status(500).json({
            message: 'Lỗi server khi cập nhật giỏ hàng',
            error: err instanceof Error ? err.message : 'Unknown error',
            stack: err instanceof Error ? err.stack : undefined, // Thêm stack trace để debug
        });
    }
};

export const clearCart = async (req: Request, res: Response): Promise<void> => {
    try {
        const authResult = await checkAuth(req);
        if (
            !authResult.authenticated ||
            !authResult.user ||
            !authResult.user._id
        ) {
            res.status(401).json({ message: 'Không xác thực được người dùng' });
            return;
        }
        const userId = authResult.user._id;
        const result = await Cart.findOneAndUpdate(
            { user: userId },
            { items: [] },
            { upsert: true, new: true },
        );
        console.log('Kết quả xóa giỏ hàng:', result);
        res.status(200).json({ message: 'Đã xóa giỏ hàng thành công' });
    } catch (err) {
        console.error('Lỗi khi xóa giỏ hàng:', err);
        res.status(500).json({
            message: 'Lỗi server khi xóa giỏ hàng',
            error: err instanceof Error ? err.message : 'Unknown error',
        });
    }
};

export default {
    getCart,
    updateCart,
    clearCart,
};
