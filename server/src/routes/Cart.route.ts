import express from 'express';
import { getCart, updateCart, clearCart } from '../controllers/Cart.controller';

const router = express.Router();

// GET /api/cart - Get current user's cart
router.get('/', getCart);

// PUT /api/cart - Update current user's cart (dùng PUT thay vì POST để đúng chuẩn REST khi update)
router.put('/', updateCart);

// DELETE /api/cart - Clear current user's cart
router.delete('/', clearCart);

export default router;
