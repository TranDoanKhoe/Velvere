import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

interface UserFormData {
    name: string;
    email: string;
    phone: string;
    address: string;
    birthDate: string;
    isAdmin: boolean;
}

const EditUser: React.FC = () => {
    const { userId } = useParams<{ userId: string }>();
    const navigate = useNavigate();
    const [loading, setLoading] = useState<boolean>(true);
    const [submitting, setSubmitting] = useState<boolean>(false);
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
    const [formData, setFormData] = useState<UserFormData>({
        name: '',
        email: '',
        phone: '',
        address: '',
        birthDate: '',
        isAdmin: false,
    });

    // Kiểm tra xác thực
    useEffect(() => {
        const checkAuth = async () => {
            try {
                const apiBaseUrl =
                    import.meta.env.VITE_API_BASE_URL ||
                    'http://localhost:3000';
                const response = await axios.get(
                    `${apiBaseUrl}/api/users/check-session`,
                    {
                        withCredentials: true,
                    },
                );

                console.log('Auth check response:', response.data);

                if (response.data && response.data.authenticated) {
                    if (!response.data.user.isAdmin) {
                        // Nếu không phải admin, chuyển hướng về trang chủ
                        toast.error('Bạn không có quyền truy cập trang này');
                        navigate('/');
                        return;
                    }
                    setIsAuthenticated(true);
                } else {
                    toast.error('Vui lòng đăng nhập với tài khoản admin');
                    navigate('/signin');
                }
            } catch (error) {
                console.error('Authentication error:', error);
                toast.error('Vui lòng đăng nhập để tiếp tục');
                navigate('/signin');
            }
        };

        checkAuth();
    }, [navigate]);

    useEffect(() => {
        if (!isAuthenticated || !userId) return;

        const fetchUserData = async () => {
            try {
                const apiBaseUrl =
                    import.meta.env.VITE_API_BASE_URL ||
                    'http://localhost:3000';

                // Lấy token từ localStorage nếu có
                const user = localStorage.getItem('user');
                let token = '';
                if (user) {
                    try {
                        const userData = JSON.parse(user);
                        if (userData.token) {
                            token = userData.token;
                        }
                    } catch (e) {
                        console.error(
                            'Error parsing user data from localStorage:',
                            e,
                        );
                    }
                }
                // eslint-disable-next-line
                const headers: any = {
                    'Content-Type': 'application/json',
                };

                if (token) {
                    headers['Authorization'] = `Bearer ${token}`;
                }

                const response = await axios.get(
                    `${apiBaseUrl}/api/users/${userId}`,
                    {
                        withCredentials: true,
                        headers,
                    },
                );

                const userData = response.data;
                console.log('Fetched user data:', userData);

                // Format date to YYYY-MM-DD for the date input
                const birthDate = new Date(userData.birthDate)
                    .toISOString()
                    .split('T')[0];

                setFormData({
                    name: userData.name,
                    email: userData.email,
                    phone: userData.phone,
                    address: userData.address,
                    birthDate: birthDate,
                    isAdmin: userData.isAdmin,
                });
            } catch (error) {
                console.error('Error fetching user data:', error);
                toast.error('Không thể tải thông tin người dùng');
            } finally {
                setLoading(false);
            }
        };

        fetchUserData();
    }, [userId, isAuthenticated]);

    const handleInputChange = (
        e: React.ChangeEvent<
            HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
        >,
    ) => {
        const { name, value, type } = e.target as HTMLInputElement;

        if (type === 'checkbox') {
            const { checked } = e.target as HTMLInputElement;
            setFormData({
                ...formData,
                [name]: checked,
            });
        } else {
            setFormData({
                ...formData,
                [name]: value,
            });
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);

        try {
            const apiBaseUrl =
                import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

            // Lấy token từ localStorage nếu có
            const user = localStorage.getItem('user');
            let token = '';
            if (user) {
                try {
                    const userData = JSON.parse(user);
                    if (userData.token) {
                        token = userData.token;
                    }
                } catch (e) {
                    console.error(
                        'Error parsing user data from localStorage:',
                        e,
                    );
                }
            }
            // eslint-disable-next-line
            const headers: any = {
                'Content-Type': 'application/json',
            };

            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }

            await axios.put(`${apiBaseUrl}/api/users/${userId}`, formData, {
                withCredentials: true,
                headers,
            });

            toast.success('Cập nhật thông tin người dùng thành công');
            navigate('/admin/users');
            // eslint-disable-next-line
        } catch (error: any) {
            console.error('Error updating user:', error);
            const errorMessage =
                error.response?.data?.message ||
                'Có lỗi xảy ra khi cập nhật thông tin';
            toast.error(errorMessage);
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow-md">
                <h1 className="text-2xl font-bold mb-6">
                    Chỉnh Sửa Thông Tin Người Dùng
                </h1>

                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label
                            className="block text-gray-700 text-sm font-bold mb-2"
                            htmlFor="name"
                        >
                            Họ tên
                        </label>
                        <input
                            type="text"
                            id="name"
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            required
                        />
                    </div>

                    <div className="mb-4">
                        <label
                            className="block text-gray-700 text-sm font-bold mb-2"
                            htmlFor="email"
                        >
                            Email
                        </label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            required
                        />
                    </div>

                    <div className="mb-4">
                        <label
                            className="block text-gray-700 text-sm font-bold mb-2"
                            htmlFor="phone"
                        >
                            Số điện thoại
                        </label>
                        <input
                            type="text"
                            id="phone"
                            name="phone"
                            value={formData.phone}
                            onChange={handleInputChange}
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            required
                        />
                    </div>

                    <div className="mb-4">
                        <label
                            className="block text-gray-700 text-sm font-bold mb-2"
                            htmlFor="address"
                        >
                            Địa chỉ
                        </label>
                        <textarea
                            id="address"
                            name="address"
                            value={formData.address}
                            onChange={handleInputChange}
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            rows={3}
                            required
                        />
                    </div>

                    <div className="mb-4">
                        <label
                            className="block text-gray-700 text-sm font-bold mb-2"
                            htmlFor="birthDate"
                        >
                            Ngày sinh
                        </label>
                        <input
                            type="date"
                            id="birthDate"
                            name="birthDate"
                            value={formData.birthDate}
                            onChange={handleInputChange}
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            required
                        />
                    </div>

                    <div className="mb-6">
                        <label className="flex items-center">
                            <input
                                type="checkbox"
                                name="isAdmin"
                                checked={formData.isAdmin}
                                onChange={handleInputChange}
                                className="mr-2"
                            />
                            <span className="text-gray-700 text-sm font-bold">
                                Quyền Admin
                            </span>
                        </label>
                    </div>

                    <div className="flex items-center justify-between">
                        <button
                            type="submit"
                            disabled={submitting}
                            className={`px-6 py-3 border border-black rounded-full hover:bg-black hover:text-white disabled:opacity-50 disabled:cursor-not-allowed ${
                                submitting
                                    ? 'opacity-50 cursor-not-allowed'
                                    : ''
                            }`}
                        >
                            {submitting ? 'Đang lưu...' : 'Lưu thay đổi'}
                        </button>
                        <button
                            type="button"
                            onClick={() => navigate('/admin/users')}
                            className="px-6 py-3 border border-black rounded-full hover:bg-black hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Quay lại
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditUser;
