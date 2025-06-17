import { Request, Response } from 'express';
import ChatMessage from '../models/ChatMessage.model';
import ChatSession from '../models/ChatSession.model';
import mongoose from 'mongoose';

// Tạo một phiên chat mới
export const createChatSession = async (req: Request, res: Response): Promise<void> => {
    try {
        console.log('Nhận yêu cầu tạo phiên chat mới:', req.body);
        const { user_id, user_name, user_email } = req.body;

        // Tạo phiên chat mới
        const newSession = new ChatSession({
            user_id: user_id || null,
            user_name: user_name || 'Khách',
            user_email: user_email || null,
            status: 'active',
            last_message: new Date(),
        });

        await newSession.save();
        console.log('Đã tạo phiên chat mới:', newSession);

        // Tạo tin nhắn chào mừng tự động
        const welcomeMessage = new ChatMessage({
            session_id: newSession._id,
            sender_type: 'system',
            message: 'Chào mừng bạn đến với dịch vụ hỗ trợ của Velvere. Làm thế nào chúng tôi có thể giúp bạn?',
            read: false,
        });

        await welcomeMessage.save();
        console.log('Đã tạo tin nhắn chào mừng:', welcomeMessage);

        res.status(201).json({
            message: 'Tạo phiên chat thành công',
            session: newSession,
            welcomeMessage,
        });
    } catch (err) {
        console.error('Lỗi server khi tạo phiên chat:', err);
        res.status(500).json({ message: 'Lỗi server khi tạo phiên chat', error: err });
    }
};

// Gửi tin nhắn mới
export const sendMessage = async (req: Request, res: Response): Promise<void> => {
    try {
        console.log('Nhận yêu cầu gửi tin nhắn mới:', req.body);
        const { session_id, user_id, sender_type, message } = req.body;

        if (!session_id || !sender_type || !message) {
            console.error('Thiếu thông tin cần thiết:', { session_id, sender_type, message });
            res.status(400).json({ message: 'Vui lòng cung cấp đầy đủ thông tin: session_id, sender_type, message' });
            return;
        }

        // Kiểm tra phiên chat có tồn tại không
        const session = await ChatSession.findById(session_id);
        if (!session) {
            console.error('Không tìm thấy phiên chat:', session_id);
            res.status(404).json({ message: 'Không tìm thấy phiên chat' });
            return;
        }

        // Kiểm tra phiên chat có đang active không
        if (session.status !== 'active') {
            console.error('Phiên chat đã kết thúc:', session_id);
            res.status(400).json({ message: 'Phiên chat đã kết thúc' });
            return;
        }

        // Tạo tin nhắn mới
        const newMessage = new ChatMessage({
            session_id,
            user_id: user_id || null,
            sender_type,
            message,
            read: sender_type === 'admin', // Tin nhắn từ admin đã được đọc
        });

        await newMessage.save();
        console.log('Đã lưu tin nhắn mới:', newMessage);

        // Cập nhật thời gian tin nhắn cuối cùng
        session.last_message = new Date();
        await session.save();
        console.log('Đã cập nhật thời gian tin nhắn cuối cùng');

        res.status(201).json({
            message: 'Gửi tin nhắn thành công',
            chatMessage: newMessage,
        });
    } catch (err) {
        console.error('Lỗi server khi gửi tin nhắn:', err);
        res.status(500).json({ message: 'Lỗi server khi gửi tin nhắn', error: err });
    }
};

// Lấy tin nhắn theo phiên chat
export const getMessagesBySessionId = async (req: Request, res: Response): Promise<void> => {
    try {
        const { sessionId } = req.params;
        // console.log('Lấy tin nhắn của phiên chat:', sessionId);

        if (!mongoose.Types.ObjectId.isValid(sessionId)) {
            console.error('ID phiên chat không hợp lệ:', sessionId);
            res.status(400).json({ message: 'ID phiên chat không hợp lệ' });
            return;
        }

        const messages = await ChatMessage.find({ session_id: sessionId })
            .sort({ createdAt: 1 });
        
        // console.log(`Đã tìm thấy ${messages.length} tin nhắn`);
        res.status(200).json(messages);
    } catch (err) {
        // console.error('Lỗi server khi lấy tin nhắn chat:', err);
        res.status(500).json({ message: 'Lỗi server khi lấy tin nhắn chat', error: err });
    }
};

// Đánh dấu tin nhắn đã đọc
export const markMessagesAsRead = async (req: Request, res: Response): Promise<void> => {
    try {
        const { sessionId } = req.params;
        const { sender_type } = req.body;

        // Đánh dấu tất cả tin nhắn của phiên gửi đến người gửi đã được đọc
        // Ví dụ: Nếu sender_type là 'user', đánh dấu tất cả tin nhắn từ 'admin' là đã đọc
        const oppositeType = sender_type === 'user' ? 'admin' : 'user';

        await ChatMessage.updateMany(
            { session_id: sessionId, sender_type: oppositeType, read: false },
            { read: true }
        );

        res.status(200).json({ message: 'Đánh dấu tin nhắn đã đọc thành công' });
    } catch (err) {
        console.error('Lỗi server khi đánh dấu tin nhắn đã đọc:', err);
        res.status(500).json({ message: 'Lỗi server khi đánh dấu tin nhắn đã đọc', error: err });
    }
};

// Kết thúc phiên chat
export const closeChatSession = async (req: Request, res: Response): Promise<void> => {
    try {
        const { sessionId } = req.params;

        const session = await ChatSession.findById(sessionId);
        if (!session) {
            res.status(404).json({ message: 'Không tìm thấy phiên chat' });
            return;
        }

        session.status = 'closed';
        await session.save();

        // Thêm tin nhắn thông báo kết thúc phiên chat
        const systemMessage = new ChatMessage({
            session_id: sessionId,
            sender_type: 'system',
            message: 'Phiên chat đã kết thúc. Cảm ơn bạn đã sử dụng dịch vụ của chúng tôi.',
            read: false,
        });

        await systemMessage.save();

        res.status(200).json({ 
            message: 'Kết thúc phiên chat thành công',
            systemMessage
        });
    } catch (err) {
        console.error('Lỗi server khi kết thúc phiên chat:', err);
        res.status(500).json({ message: 'Lỗi server khi kết thúc phiên chat', error: err });
    }
};

// Lấy tất cả phiên chat cho admin
export const getAllChatSessions = async (req: Request, res: Response): Promise<void> => {
    try {
        const { status } = req.query;

        let query = {};
        if (status) {
            query = { status };
        }

        const sessions = await ChatSession.find(query)
            .sort({ last_message: -1 });

        res.status(200).json(sessions);
    } catch (err) {
        console.error('Lỗi server khi lấy danh sách phiên chat:', err);
        res.status(500).json({ message: 'Lỗi server khi lấy danh sách phiên chat', error: err });
    }
};

// Lấy phiên chat của người dùng
export const getUserChatSessions = async (req: Request, res: Response): Promise<void> => {
    try {
        const { userId } = req.params;

        const sessions = await ChatSession.find({ user_id: userId })
            .sort({ last_message: -1 });

        res.status(200).json(sessions);
    } catch (err) {
        console.error('Lỗi server khi lấy phiên chat của người dùng:', err);
        res.status(500).json({ message: 'Lỗi server khi lấy phiên chat của người dùng', error: err });
    }
};

// Gán một admin cho phiên chat
export const assignAdminToSession = async (req: Request, res: Response): Promise<void> => {
    try {
        const { sessionId } = req.params;
        const { adminId } = req.body;

        const session = await ChatSession.findById(sessionId);
        if (!session) {
            res.status(404).json({ message: 'Không tìm thấy phiên chat' });
            return;
        }

        session.assigned_admin = adminId;
        await session.save();

        res.status(200).json({ 
            message: 'Gán admin cho phiên chat thành công',
            session
        });
    } catch (err) {
        console.error('Lỗi server khi gán admin cho phiên chat:', err);
        res.status(500).json({ message: 'Lỗi server khi gán admin cho phiên chat', error: err });
    }
};