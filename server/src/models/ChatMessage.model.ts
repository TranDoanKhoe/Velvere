import mongoose from 'mongoose';

const chatMessageSchema = new mongoose.Schema(
    {
        session_id: {
            type: String,
            required: true,
            index: true,
        },
        user_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: false, // Có thể null nếu là khách không đăng nhập
        },
        sender_type: {
            type: String,
            enum: ['user', 'admin', 'system'],
            required: true,
        },
        message: {
            type: String,
            required: true,
        },
        read: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true, // Tự động tạo createdAt và updatedAt
    },
);

export default mongoose.model('ChatMessage', chatMessageSchema, 'ChatMessages');