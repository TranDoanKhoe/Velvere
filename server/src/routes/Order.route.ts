import { Router } from 'express';
import {
    getOrdersByUserId,
    getOrderById,
    createOrder,
    updateOrderStatus,
    cancelOrder,
    getRevenueStats,
    getMinMaxOrderTotalAmount,
    getAllOrders
} from '../controllers/Order.controller';

const router = Router();

// Routes quản lý đơn hàng
router.get("/", getRevenueStats)
router.get('/all', getAllOrders); // GET     /api/orders
router.get('/min-max-total', getMinMaxOrderTotalAmount);
router.get('/user/:userId', getOrdersByUserId);    // GET     /api/orders/user/:userId
router.get('/:id', getOrderById);                  // GET     /api/orders/:id
router.post('/', createOrder);                     // POST    /api/orders
router.put('/:id/status', updateOrderStatus);      // PUT     /api/orders/:id/status
router.put('/:id/cancel', cancelOrder);            // PUT     /api/orders/:id/cancel



export default router;
