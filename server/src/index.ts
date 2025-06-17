import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import session from 'express-session';
import MongoStore from 'connect-mongo';

import productRoutes from './routes/Product.route';
import userRoutes from './routes/User.route';
import orderRoutes from './routes/Order.route';
import chatRoutes from './routes/Chat.route';
import cartRoutes from './routes/Cart.route';

dotenv.config();

const app = express();

// Cấu hình CORS với hỗ trợ credentials
const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:3001',
    'https://velvere.vercel.app',
];

app.use(
    cors({
        origin: (origin, callback) => {
            // Cho phép requests không có origin (như mobile apps hoặc curl requests)
            if (!origin) return callback(null, true);

            if (allowedOrigins.indexOf(origin) !== -1) {
                callback(null, origin);
            } else {
                console.log(`Origin ${origin} không được phép`);
                callback(null, allowedOrigins[2]); // Fallback to first allowed origin
            }
        },
        credentials: true, // Quan trọng: cho phép gửi cookies qua CORS
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization'],
    }),
);

app.use(express.json());

// Kết nối MongoDB
const MONGO_URI = process.env.MONGO_URI!;
mongoose
    .connect(MONGO_URI)
    .then(() => console.log('✅ Connected to MongoDB'))
    .catch((err) => console.error('❌ MongoDB error:', err));

// Cấu hình session
app.use(
    session({
        secret: process.env.SESSION_SECRET || 'your_session_secret',
        resave: false,
        saveUninitialized: false,
        store: MongoStore.create({
            mongoUrl: MONGO_URI,
            ttl: 24 * 60 * 60, // Thời gian sống của session: 1 ngày (tính bằng giây)
            autoRemove: 'native', // Tự động xóa session hết hạn
        }),
        cookie: {
            httpOnly: true, // Không cho phép JavaScript truy cập cookie
            secure: process.env.NODE_ENV === 'production', // Chỉ sử dụng HTTPS trong production
            maxAge: 24 * 60 * 60 * 1000, // Thời gian sống của cookie: 1 ngày (tính bằng mili giây)
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax', // Cấu hình SameSite
        },
    }),
);

// Route API theo tài nguyên
app.use('/api/products', productRoutes);
app.use('/api/users', userRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/cart', cartRoutes);
// Error handling middleware - SỬA LỖI Ở ĐÂY
app.use(
    (
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        err: any,
        req: express.Request,
        res: express.Response,
        next: express.NextFunction,
    ) => {
        console.error('Server error:', err);
        if (res.headersSent) {
            return next(err); // Delegate to the default error handler if headers are already sent
        }
        res.status(500).json({ 
            message: 'Lỗi server',
            error: process.env.NODE_ENV === 'production' ? {} : err,
        });
    },
);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`✅ Server running at http://localhost:${PORT}`);
});


export default app;
