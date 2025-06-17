import type React from 'react';
import { useState } from 'react';
import Input from '../component/Input';
import MessageDialog from '../component/MessageDialog';
import type mongoose from 'mongoose';
import type { Session, SessionData } from 'express-session';

declare module 'express-serve-static-core' {
    interface Request {
        session: Session &
            Partial<
                SessionData & {
                    userId?: mongoose.Types.ObjectId;
                    isAdmin?: boolean;
                }
            >;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        user?: any;
    }
}

function Signin() {
    const [formData, setFormData] = useState({
        phone: '',
        password: '',
    });

    const [errors, setErrors] = useState<Record<string, string>>({});

    const [dialog, setDialog] = useState({
        isOpen: false,
        title: '',
        description: '',
        type: '' as 'success' | 'error' | '',
    });

    const inputFields = [
        { name: 'phone', type: 'text', label: 'Số điện thoại' },
        { name: 'password', type: 'password', label: 'Mật khẩu' },
    ];

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setErrors({ ...errors, [e.target.name]: '' });
    };

    const validateField = (name: string, value: string) => {
        let error = '';
        switch (name) {
            case 'phone':
                if (!value.trim()) {
                    error = 'Vui lòng nhập số điện thoại';
                } else if (!/^\d{10,11}$/.test(value)) {
                    error = 'Số điện thoại không hợp lệ';
                }
                break;
            case 'password':
                if (!value) {
                    error = 'Vui lòng nhập mật khẩu';
                }
                break;
        }
        return error;
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        const error = validateField(name, value);
        setErrors((prev) => ({ ...prev, [name]: error }));
    };

    const validate = () => {
        const newErrors: Record<string, string> = {};
        inputFields.forEach((field) => {
            const error = validateField(
                field.name,
                formData[field.name as keyof typeof formData],
            );
            if (error) newErrors[field.name] = error;
        });
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleCloseDialog = () => {
        setDialog({ isOpen: false, title: '', description: '', type: '' });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        const backendUrl =
            import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
        e.preventDefault();

        if (!validate()) {
            setDialog({
                isOpen: true,
                title: 'Lỗi Validation',
                description: 'Vui lòng kiểm tra lại thông tin nhập.',
                type: 'error',
            });
            return;
        }

        const payload = {
            phone: formData.phone,
            password: formData.password,
        };

        try {
            // Xóa session cũ trước khi đăng nhập
            await fetch(`${backendUrl}/api/users/logout`, {
                method: 'POST',
                credentials: 'include',
            });

            const res = await fetch(`${backendUrl}/api/users/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
                credentials: 'include',
            });

            if (res.ok) {
                const result = await res.json();
                if (result.user && result.user._id) {
                    localStorage.setItem('user', JSON.stringify(result.user));
                }
                setDialog({
                    isOpen: true,
                    title: 'Đăng nhập thành công!',
                    description: 'Chào mừng bạn trở lại.',
                    type: 'success',
                });
                setTimeout(() => {
                    setDialog({
                        isOpen: false,
                        title: '',
                        description: '',
                        type: '',
                    });
                    window.location.href = '/'; // Chuyển hướng sang trang chủ
                }, 1500);
            } else {
                const error = await res.json();
                setDialog({
                    isOpen: true,
                    title: error.message || 'Lỗi đăng nhập',
                    description: error.detail
                        ? Array.isArray(error.detail)
                            ? error.detail.join(', ')
                            : error.detail
                        : 'Vui lòng kiểm tra lại số điện thoại và mật khẩu.',
                    type: 'error',
                });
            }
        } catch (err) {
            console.error('Lỗi gửi yêu cầu:', err);
            setDialog({
                isOpen: true,
                title: 'Lỗi kết nối',
                description:
                    'Không thể kết nối đến máy chủ. Vui lòng thử lại sau.',
                type: 'error',
            });
        }
    };

    return (
        <div className="mt-[3vw]">
            <p className="text-5xl uppercase font-serif text-center">Sign In</p>
            <div className="mx-[34vw]">
                <div className="max-w-[30vw]">
                    <form
                        onSubmit={handleSubmit}
                        className="bg-white rounded px-8 pt-6 pb-8 w-full"
                    >
                        {inputFields.map((field) => (
                            <Input
                                key={field.name}
                                name={field.name}
                                type={field.type}
                                label={field.label}
                                value={
                                    formData[
                                        field.name as keyof typeof formData
                                    ]
                                }
                                onChange={handleChange}
                                onBlur={handleBlur}
                                error={errors[field.name]}
                            />
                        ))}
                        <div className="flex items-center justify-between mt-6">
                            <button
                                className="font-light uppercase text-lg border w-full py-2 mt-3 hover:bg-black hover:text-white transition duration-300"
                                type="submit"
                            >
                                Sign In
                            </button>
                        </div>
                        <div className="mt-4 text-center text-sm">
                            <a
                                href="/forgot-password"
                                className="text-blue-600 hover:underline mr-4"
                            >
                                Quên mật khẩu?
                            </a>
                            <a
                                href="/signup"
                                className="text-blue-600 hover:underline"
                            >
                                Đăng ký?
                            </a>
                        </div>
                    </form>
                </div>
            </div>
            <MessageDialog
                isOpen={dialog.isOpen}
                title={dialog.title}
                description={dialog.description}
                type={dialog.type}
                onClose={handleCloseDialog}
            />
        </div>
    );
}

export default Signin;
