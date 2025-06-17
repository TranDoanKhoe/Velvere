import { useState, useEffect } from 'react';
import MessageDialog from '../component/MessageDialog';
import Input from '../component/Input';

function Signup() {
    const [formData, setFormData] = useState({
        name: '',
        mail: '',
        phone: '',
        birth: '',
        address: '',
        password: '',
        confirmPassword: '',
    });

    const [errors, setErrors] = useState<Record<string, string>>({});
    const [dialog, setDialog] = useState({
        isOpen: false,
        title: '',
        description: '',
        type: '' as 'success' | 'error' | '',
    });

    // Định nghĩa mảng cấu hình cho các input
    const inputFields = [
        { name: 'name', type: 'text', label: 'Full name' },
        { name: 'mail', type: 'email', label: 'Email' },
        { name: 'phone', type: 'text', label: 'Số điện thoại' },
        { name: 'birth', type: 'date', label: 'Ngày sinh' },
        { name: 'address', type: 'text', label: 'Địa chỉ' },
        { name: 'password', type: 'password', label: 'Mật khẩu' },
        {
            name: 'confirmPassword',
            type: 'password',
            label: 'Xác nhận mật khẩu',
        },
    ];

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setErrors({ ...errors, [e.target.name]: '' });
    };

    const validateField = (name: string, value: string) => {
        let error = '';
        switch (name) {
            case 'name':
                if (!value.trim()) error = 'Vui lòng nhập họ tên';
                break;
            case 'mail':
                if (!value.trim()) {
                    error = 'Vui lòng nhập email';
                } else if (!/\S+@\S+\.\S+/.test(value)) {
                    error = 'Email không hợp lệ';
                }
                break;
            case 'phone':
                if (!value.trim()) {
                    error = 'Vui lòng nhập số điện thoại';
                } else if (!/^\d{10,11}$/.test(value)) {
                    error = 'Số điện thoại không hợp lệ';
                }
                break;
            case 'birth':
                if (!value.trim()) error = 'Vui lòng chọn ngày sinh';
                break;
            case 'address':
                if (!value.trim()) error = 'Vui lòng nhập địa chỉ';
                break;
            case 'password':
                if (!value) {
                    error = 'Vui lòng nhập mật khẩu';
                } else if (value.length < 6) {
                    error = 'Mật khẩu tối thiểu 6 ký tự';
                }
                break;
            case 'confirmPassword':
                if (value !== formData.password) {
                    error = 'Mật khẩu không khớp';
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
        Object.entries(formData).forEach(([key, value]) => {
            const error = validateField(key, value);
            if (error) newErrors[key] = error;
        });
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleCloseDialog = () => {
        setDialog({ isOpen: false, title: '', description: '', type: '' });
    };

    useEffect(() => {
        let timer: NodeJS.Timeout;
        if (dialog.isOpen) {
            timer = setTimeout(() => {
                handleCloseDialog();
            }, 3000);
        }

        return () => {
            clearTimeout(timer);
        };
    }, [dialog.isOpen]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate()) return;

        const payload = {
            name: formData.name,
            email: formData.mail,
            phone: formData.phone,
            birthDate: formData.birth,
            address: formData.address,
            password: formData.password,
        };

      try {
          const backendUrl =
              import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
            const res = await fetch(`${backendUrl}/api/users`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
                credentials: 'include', // Đảm bảo cookies được gửi kèm
            });

            if (res.ok) {
                setDialog({
                    isOpen: true,
                    title: 'Đăng ký thành công!',
                    description: 'Tài khoản của bạn đã được tạo thành công.',
                    type: 'success',
                });
                setFormData({
                    name: '',
                    mail: '',
                    phone: '',
                    birth: '',
                    address: '',
                    password: '',
                    confirmPassword: '',
                });
                setErrors({});

                // Chuyển hướng đến trang đăng nhập sau khi đăng ký thành công
                setTimeout(() => {
                    window.location.href = '/signin';
                }, 2000);
            } else {
                const error = await res.json();
                // Sử dụng error.message từ backend làm tiêu đề, thêm mô tả mặc định hoặc chi tiết nếu có
                setDialog({
                    isOpen: true,
                    title: `${
                        error.message || 'Đã xảy ra lỗi không xác định.'
                    }`,
                    // Kiểm tra nếu backend có trả về chi tiết lỗi (ví dụ: trong mảng 'detail')
                    description: Array.isArray(error.detail)
                        ? error.detail.join(', ')
                        : typeof error.detail === 'string'
                        ? error.detail
                        : 'Vui lòng kiểm tra lại thông tin.',
                    type: 'error',
                });
            }
        } catch (err: unknown) {
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
        <div className="mt-[5vw]">
            <p className="text-5xl uppercase font-serif text-center">Sign Up</p>
            <div className="mx-[34vw]">
                <div className="max-w-[30vw]">
                    <form
                        onSubmit={handleSubmit}
                        className="bg-white rounded px-8 pt-6 pb-8 w-full"
                    >
                        {inputFields.map((field) => (
                            <Input
                                key={field.name} // Key rất quan trọng khi render list
                                name={field.name}
                                type={field.type}
                                label={field.label}
                                value={
                                    formData[
                                        field.name as keyof typeof formData
                                    ]
                                } // Lấy value từ formData
                                onChange={handleChange} // Sử dụng cùng hàm handler
                                onBlur={handleBlur} // Sử dụng cùng hàm handler
                                error={errors[field.name]} // Lấy lỗi từ errors
                            />
                        ))}

                        <div className="flex items-center justify-between mt-6">
                            <button
                                className="font-light uppercase text-lg border w-full py-2 mt-3 hover:bg-black hover:text-white transition duration-300"
                                type="submit"
                            >
                                Sign Up
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            {/* Dialog thông báo */}
            <MessageDialog
                isOpen={dialog.isOpen}
                title={dialog.title}
                description={dialog.description}
                type={dialog.type}
                onClose={handleCloseDialog} // Truyền hàm đóng dialog xuống
            />
        </div>
    );
}

export default Signup;
