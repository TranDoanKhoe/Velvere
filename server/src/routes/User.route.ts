import { Router } from 'express';
import {
    getAllUsers,
    getUserById,
    createUser,
    updateUser,
    deleteUser,
    loginUser,
    logoutUser,
    checkSession,
} from '../controllers/User.controller';

const router = Router();

// User management routes
router.get('/check-session', checkSession);
router.post('/login', loginUser);
router.post('/logout', logoutUser);
router.get('/', getAllUsers);
router.get('/:id', getUserById);
router.post('/', createUser);
router.put('/:id', updateUser);
router.patch('/:id', updateUser); // Thêm route PATCH để cập nhật một phần thông tin người dùng
router.delete('/:id', deleteUser);


export default router;
