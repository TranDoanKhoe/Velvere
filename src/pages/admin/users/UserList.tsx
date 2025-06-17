import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

interface User {
    _id: string;
    user_id: number;
    name: string;
    email: string;
    phone: string;
    address: string;
    isAdmin: boolean;
    birthDate: string;
    createdAt: string;
}

const UserList: React.FC = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [totalPages, setTotalPages] = useState<number>(1);
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
    const usersPerPage = 10;
    const navigate = useNavigate();

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

    // Fetch users data
    useEffect(() => {
        if (!isAuthenticated) return;

        const fetchUsers = async () => {
            setLoading(true);
            try {
                // Sử dụng biến môi trường VITE_API_BASE_URL nếu có, nếu không sử dụng localhost:3000
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
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const headers: any = {
                    'Content-Type': 'application/json',
                };

                if (token) {
                    headers['Authorization'] = `Bearer ${token}`;
                }

                const response = await axios.get(
                    `${apiBaseUrl}/api/users?page=${currentPage}&limit=${usersPerPage}&search=${searchTerm}`,
                    {
                        withCredentials: true,
                        headers,
                    },
                );

                console.log('API response:', response.data);

                if (response.data && response.data.users) {
                    setUsers(response.data.users);
                    setTotalPages(
                        Math.ceil(response.data.total / usersPerPage),
                    );
                } else {
                    console.error('Invalid response format:', response.data);
                    setUsers([]);
                    setTotalPages(0);
                    toast.error('Dữ liệu không đúng định dạng');
                }
            } catch (error) {
                console.error('Error fetching users:', error);
                toast.error('Không thể tải danh sách người dùng');
            } finally {
                setLoading(false);
            }
        };

        fetchUsers();
    }, [currentPage, searchTerm, isAuthenticated]);

    // Handle search
    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setCurrentPage(1);
        // Fetch with the search term will happen due to dependency change
    };

    // Format date for display
    const formatDate = (dateString: string) => {
        if (!dateString) return '';
        try {
            const date = new Date(dateString);
            return new Intl.DateTimeFormat('vi-VN', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
            }).format(date);
        } catch (error) {
            console.error('Error formatting date:', error);
            return '';
        }
    };

    // Pagination controls
    const goToPage = (page: number) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
        }
    };

    // Toggle admin status
    const toggleAdminStatus = async (
        userId: string,
        currentStatus: boolean,
    ) => {
        try {
            const apiBaseUrl =
                import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

            // Lấy token nếu có
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
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const headers: any = {
                'Content-Type': 'application/json',
            };

            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }

            await axios.patch(
                `${apiBaseUrl}/api/users/${userId}`,
                {
                    isAdmin: !currentStatus,
                },
                {
                    withCredentials: true,
                    headers,
                },
            );

            // Update local state
            setUsers(
                users.map((user) =>
                    user._id === userId
                        ? { ...user, isAdmin: !currentStatus }
                        : user,
                ),
            );

            toast.success(`Đã ${!currentStatus ? 'cấp' : 'hủy'} quyền Admin`);
        } catch (error) {
            console.error('Error updating user:', error);
            toast.error('Không thể cập nhật quyền người dùng');
        }
    };

    // Delete user
    const deleteUser = async (userId: string) => {
        if (!window.confirm('Bạn có chắc chắn muốn xóa người dùng này?'))
            return;

        try {
            const apiBaseUrl =
                import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

            // Lấy token nếu có
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
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const headers: any = {
                'Content-Type': 'application/json',
            };

            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }

            await axios.delete(`${apiBaseUrl}/api/users/${userId}`, {
                withCredentials: true,
                headers,
            });

            // Update local state
            setUsers(users.filter((user) => user._id !== userId));

            toast.success('Đã xóa người dùng');
        } catch (error) {
            console.error('Error deleting user:', error);
            toast.error('Không thể xóa người dùng');
        }
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-4xl mt-10 text-center font-serif mb-10">Quản Lý Người Dùng</h1>

            {/* Search and Filter */}
            <div className="mb-6">
                <form onSubmit={handleSearch} className="flex">
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Tìm kiếm theo tên, email hoặc số điện thoại..."
                        className="border border-gray-300 p-2 rounded-2xl flex-1 pl-4 outline-0 hover:bg-gray-100"
                    />
                    <button
                        type="submit"
                        className="bg-black text-white px-6 py-2 rounded-3xl ml-2 hover:bg-gray-800"
                    >
                        Tìm kiếm
                    </button>
                </form>
            </div>

            {loading ? (
                <div className="flex justify-center items-center h-60">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
                </div>
            ) : (
                <>
                    {/* Users Table */}
                    <div className="overflow-x-auto rounded-xl shadow-sm">
                        <table className="min-w-full bg-white border border-gray-200">
                            <thead>
                                <tr className="bg-gray-100">
                                    <th className="py-3 px-4 text-left">ID</th>
                                    <th className="py-3 px-4 text-left">Tên</th>
                                    <th className="py-3 px-4 text-left">
                                        Email
                                    </th>
                                    <th className="py-3 px-4 text-left">
                                        Số điện thoại
                                    </th>
                                    <th className="py-3 px-4 text-left">
                                        Ngày sinh
                                    </th>
                                    <th className="py-3 px-4 text-left">
                                        Ngày đăng ký
                                    </th>
                                    <th className="py-3 px-4 text-left">
                                        Vai trò
                                    </th>
                                    <th className="py-3 px-4 text-center">
                                        Thao tác
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.length > 0 ? (
                                    users.map((user) => (
                                        <tr
                                            key={user._id}
                                            className="border-b hover:bg-gray-50"
                                        >
                                            <td className="py-3 px-4">
                                                {user.user_id}
                                            </td>
                                            <td className="py-3 px-4">
                                                {user.name}
                                            </td>
                                            <td className="py-3 px-4">
                                                {user.email}
                                            </td>
                                            <td className="py-3 px-4">
                                                {user.phone}
                                            </td>
                                            <td className="py-3 px-4">
                                                {formatDate(user.birthDate)}
                                            </td>
                                            <td className="py-3 px-4">
                                                {formatDate(user.createdAt)}
                                            </td>
                                            <td className="py-3 px-4">
                                                {user.isAdmin ? (
                                                    <span className="text-center inline-block w-[5vw] bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-medium">
                                                        Admin
                                                    </span>
                                                ) : (
                                                    <span className=" text-center inline-block w-[5vw] bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-medium">
                                                        Người dùng
                                                    </span>
                                                )}
                                            </td>
                                            <td className="py-3 px-4">
                                                <div className="flex justify-center space-x-3">
                                                    <button
                                                        onClick={() =>
                                                            navigate(
                                                                `/admin/users/edit/${user._id}`,
                                                            )
                                                        }
                                                        className="text-gray-500 hover:text-black transition-colors duration-200"
                                                        title="Sửa"
                                                    >
                                                        <i className="fa-solid fa-edit text-lg"></i>
                                                    </button>
                                                    <button
                                                        onClick={() =>
                                                            toggleAdminStatus(
                                                                user._id,
                                                                user.isAdmin,
                                                            )
                                                        }
                                                        className="text-gray-500 hover:text-black transition-colors duration-200"
                                                        title={
                                                            user.isAdmin
                                                                ? 'Hủy quyền Admin'
                                                                : 'Cấp quyền Admin'
                                                        }
                                                    >
                                                        <i
                                                            className={`fa-solid ${
                                                                user.isAdmin
                                                                    ? 'fa-user'
                                                                    : 'fa-user-shield'
                                                            } text-lg`}
                                                        ></i>
                                                    </button>
                                                    <button
                                                        onClick={() =>
                                                            deleteUser(user._id)
                                                        }
                                                        className="text-gray-500 hover:text-black transition-colors duration-200"
                                                        title="Xóa"
                                                    >
                                                        <i className="fa-solid fa-trash text-lg"></i>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td
                                            colSpan={8}
                                            className="py-8 text-center text-gray-500"
                                        >
                                            Không tìm thấy người dùng nào
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="flex justify-center mt-6">
                            <nav className="flex items-center space-x-2">
                                <button
                                    onClick={() => goToPage(currentPage - 1)}
                                    disabled={currentPage === 1}
                                    className={`px-4 py-2 rounded-full ${
                                        currentPage === 1
                                            ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                    }`}
                                >
                                    <i className="fa-solid fa-chevron-left"></i>
                                </button>

                                {Array.from(
                                    { length: totalPages },
                                    (_, i) => i + 1,
                                ).map((page) => (
                                    <button
                                        key={page}
                                        onClick={() => goToPage(page)}
                                        className={`px-4 py-2 rounded-full ${
                                            page === currentPage
                                                ? 'bg-blue-600 text-white'
                                                : 'bg-gray-200 hover:bg-gray-300'
                                        }`}
                                    >
                                        {page}
                                    </button>
                                ))}

                                <button
                                    onClick={() => goToPage(currentPage + 1)}
                                    disabled={currentPage === totalPages}
                                    className={`px-4 py-2 rounded-full ${
                                        currentPage === totalPages
                                            ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                    }`}
                                >
                                    <i className="fa-solid fa-chevron-right"></i>
                                </button>
                            </nav>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default UserList;
