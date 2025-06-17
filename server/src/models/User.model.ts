import mongoose, { type Document, type Schema } from 'mongoose';

// Định nghĩa interface cho User Document
export interface IUser extends Document {
    user_id: number;
    name: string;
    password: string;
    birthDate: Date;
    email: string;
    phone: string;
    address: string;
    isAdmin: boolean;
    currentSessionId: string | null; // Cho phép cả string và null
    createdAt: Date;
    updatedAt: Date;
}

const userSchema: Schema = new mongoose.Schema(
    {
        user_id: { type: Number, required: true, unique: true, index: true },
        name: { type: String, required: true },
        password: { type: String, required: true },
        birthDate: { type: Date, required: true },
        email: { type: String, required: true, unique: true , index: true },
        phone: { type: String, required: true, unique: true, index: true },
        address: { type: String, required: true },
        isAdmin: { type: Boolean, default: false },
        currentSessionId: { type: String, default: null, index: true },
    },
    { timestamps: true },
);


const User = mongoose.model<IUser>('User', userSchema, 'Users');

export default User;
