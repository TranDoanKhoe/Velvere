import { useEffect, useState } from 'react';

interface UserType {
    _id: string;
    user_id: number;
    name: string;
    password: string;
    birthDate: string;
    email: string;
    phone: string;
    address: string;
    createdAt: string;
}

function User() {
    const [users, setUsers] = useState<UserType[]>([]);
    const [filteredUsers, setFilteredUsers] = useState<UserType[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [currentPage, setCurrentPage] = useState<number>(1);
    const usersPerPage = 5;

    // Fetch users from API
  useEffect(() => {
       const backendUrl =
           import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
        setLoading(true);
        fetch(`${backendUrl}/api/users`, {
            method: 'GET',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            },
        })
            .then((res) => {
                if (!res.ok) {
                    throw new Error(`HTTP error! Status: ${res.status}`);
                }
                return res.json();
            })
            .then((data) => {
                console.log('Dữ liệu từ API:', data);
                if (Array.isArray(data)) {
                    setUsers(data);
                    setFilteredUsers(data);
                } else {
                    console.warn('Dữ liệu không phải là mảng:', data);
                    setUsers([]);
                    setFilteredUsers([]);
                }
            })
            .catch((err) => {
                console.error('Fetch user error:', err);
                setUsers([]);
                setFilteredUsers([]);
            })
            .finally(() => {
                setLoading(false);
            });
    }, []);

    // Handle search
    useEffect(() => {
        const query = searchQuery.toLowerCase();
        const filtered = users.filter(
            (user) =>
                user.name.toLowerCase().includes(query) ||
                user.email.toLowerCase().includes(query) ||
                user.phone.includes(query),
        );
        setFilteredUsers(filtered);
        setCurrentPage(1); // Reset to first page on search
    }, [searchQuery, users]);

    // Pagination logic
    const indexOfLastUser = currentPage * usersPerPage;
    const indexOfFirstUser = indexOfLastUser - usersPerPage;
    const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
    const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    return (
        <div className="min-h-screen bg-gray-100 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
                    <h1 className="text-3xl font-bold text-gray-800">
                        Quản Lý Người Dùng
                    </h1>
                    <div className="relative flex items-center w-full sm:w-auto">
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Tìm kiếm theo tên, email, SĐT..."
                            className="pl-10 pr-20 py-2 border border-gray-300 rounded-lg w-full sm:w-80 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                        <svg
                            className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                            />
                        </svg>
                        <button
                            onClick={() => setSearchQuery(searchQuery)}
                            className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-blue-500 text-white px-3 py-1 rounded-lg hover:bg-blue-600 transition-colors"
                        >
                            Tìm kiếm
                        </button>
                    </div>
                </div>

                {/* Loading State */}
                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <div className="relative">
                            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-500 border-solid"></div>
                            <span className="absolute inset-0 flex items-center justify-center text-sm text-gray-600">
                                Đang tải...
                            </span>
                        </div>
                    </div>
                ) : filteredUsers.length === 0 ? (
                    <div className="bg-white rounded-lg shadow-md p-8 text-center">
                        <svg
                            className="w-16 h-16 text-gray-400 mx-auto mb-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 17v-6h6v6m-3-6v6m-6 4h12a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                            />
                        </svg>
                        <p className="text-lg text-gray-600 mb-2">
                            Không tìm thấy người dùng nào.
                        </p>
                        <p className="text-sm text-gray-400">
                            Vui lòng kiểm tra lại từ khóa tìm kiếm hoặc thêm
                            người dùng mới.
                        </p>
                    </div>
                ) : (
                    <>
                        {/* User Table */}
                        <div className="bg-white rounded-lg shadow-md overflow-hidden">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
                                            ID
                                        </th>
                                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
                                            Họ Tên
                                        </th>
                                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
                                            Ngày Sinh
                                        </th>
                                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
                                            Email
                                        </th>
                                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
                                            SĐT
                                        </th>
                                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
                                            Địa Chỉ
                                        </th>
                                        <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700 uppercase tracking-wider">
                                            Ngày đăng ký
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {currentUsers.map((user) => (
                                        <tr
                                            key={user._id}
                                            className="hover:bg-gray-50 transition duration-200"
                                        >
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                                                {user.user_id}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                                {user.name}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                                {user.birthDate}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                                {user.email}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                                {user.phone}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-700">
                                                {user.address}
                                            </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                                          {user.createdAt}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="mt-6 flex justify-center">
                                <nav className="flex space-x-2 items-center">
                                    <button
                                        onClick={() =>
                                            handlePageChange(currentPage - 1)
                                        }
                                        disabled={currentPage === 1}
                                        className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-200 text-gray-600 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <svg
                                            className="w-5 h-5"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                            xmlns="http://www.w3.org/2000/svg"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M15 19l-7-7 7-7"
                                            />
                                        </svg>
                                    </button>
                                    {Array.from(
                                        { length: totalPages },
                                        (_, index) => (
                                            <button
                                                key={index + 1}
                                                onClick={() =>
                                                    handlePageChange(index + 1)
                                                }
                                                className={`w-10 h-10 flex items-center justify-center rounded-full ${
                                                    currentPage === index + 1
                                                        ? 'bg-black text-white'
                                                        : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                                                }`}
                                            >
                                                {index + 1}
                                            </button>
                                        ),
                                    )}
                                    <button
                                        onClick={() =>
                                            handlePageChange(currentPage + 1)
                                        }
                                        disabled={currentPage === totalPages}
                                        className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-200 text-gray-600 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <svg
                                            className="w-5 h-5"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                            xmlns="http://www.w3.org/2000/svg"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M9 5l7 7-7 7"
                                            />
                                        </svg>
                                    </button>
                                </nav>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}

export default User;
