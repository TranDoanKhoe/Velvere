import { useState, useEffect } from 'react';
import {
    Edit,
    User,
    MapPin,
    Mail,
    Phone,
    Calendar,
    X,
    Eye,
    EyeOff,
} from 'lucide-react';
import { Link } from 'react-router-dom';

// Định nghĩa kiểu dữ liệu cho User
type User = {
    _id: string;
    user_id: number;
    name: string;
    birthDate: string;
    email: string;
    phone: string;
    address: string;
    isAdmin: boolean; // This property determines if the user is an admin
    createdAt: string;
    updatedAt: string;
};

export default function UserProfile() {
    const [user, setUser] = useState<User | null>(null);
    const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [formData, setFormData] = useState<Partial<User>>({});
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
    });
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    useEffect(() => {
        const checkUserSession = async () => {
            try {
                console.log('Kiểm tra session từ server...');
                const apiBaseUrl =
                    import.meta.env.VITE_API_BASE_URL ||
                    'http://localhost:3000';
                const response = await fetch(
                    `${apiBaseUrl}/api/users/check-session`,
                    {
                        method: 'GET',
                        credentials: 'include',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                    },
                );

                if (response.ok) {
                    const userData = await response.json();
                    if (userData.authenticated) {
                        console.log('Session hợp lệ:', userData.user);
                        setUser(userData.user);
                        // Initialize formData with fetched user data
                        setFormData(userData.user);
                        localStorage.setItem(
                            'user',
                            JSON.stringify(userData.user),
                        );
                    } else {
                        console.log('Session không hợp lệ:', userData.message);
                        setUser(null);
                        localStorage.removeItem('user');
                    }
                } else {
                    console.log(
                        'Lỗi response từ check-session:',
                        await response.text(),
                    );
                    const savedUser = localStorage.getItem('user');
                    if (savedUser) {
                        try {
                            const parsedUser: User = JSON.parse(savedUser);
                            setUser(parsedUser);
                            setFormData(parsedUser); // Initialize formData from localStorage
                            console.log(
                                'Sử dụng user từ localStorage:',
                                parsedUser,
                            );
                        } catch (parseError) {
                            console.error(
                                'Lỗi khi parse user từ localStorage:',
                                parseError,
                            );
                            localStorage.removeItem('user');
                            setUser(null);
                        }
                    } else {
                        localStorage.removeItem('user');
                        setUser(null);
                    }
                }
            } catch (error) {
                console.error('Lỗi khi kiểm tra session:', error);
                const savedUser = localStorage.getItem('user');
                if (savedUser) {
                    try {
                        const parsedUser: User = JSON.parse(savedUser);
                        setUser(parsedUser);
                        setFormData(parsedUser); // Initialize formData from localStorage
                        console.log(
                            'Sử dụng user từ localStorage:',
                            parsedUser,
                        );
                    } catch (parseError) {
                        console.error(
                            'Lỗi khi parse user từ localStorage:',
                            parseError,
                        );
                        localStorage.removeItem('user');
                        setUser(null);
                    }
                } else {
                    setUser(null);
                }
            }
        };

        checkUserSession();
    }, []); // Empty dependency array means this effect runs only once on mount

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setPasswordData({ ...passwordData, [name]: value });
    };

    const handleSaveChanges = async () => {
        try {
            const apiBaseUrl =
                import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
            // Use the _id from the user state for updates
            const userId = user?._id;

            if (!userId) {
                console.error('Không tìm thấy userId');
                alert('Không thể cập nhật thông tin người dùng.');
                return;
            }

            const response = await fetch(`${apiBaseUrl}/api/users/${userId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
                credentials: 'include',
            });

            if (response.ok) {
                const updatedUserData = await response.json();
                console.log('Cập nhật thành công:', updatedUserData);

                // Update the user state with the data from the server response
                setUser(updatedUserData);
                // Also update localStorage to keep it in sync
                localStorage.setItem('user', JSON.stringify(updatedUserData));

                setIsEditDialogOpen(false); // Close the edit dialog

                // Instead of reloading, you can optionally show a success message
                // alert('Thông tin đã được cập nhật thành công!');
            } else {
                const error = await response.json();
                const errorMessage =
                    error.message || 'Đã xảy ra lỗi, vui lòng thử lại sau.';
                alert(`Cập nhật không thành công: ${errorMessage}`);
            }
        } catch (error) {
            console.error('Lỗi khi gửi yêu cầu:', error);
            alert('Có lỗi xảy ra khi cập nhật, vui lòng thử lại.');
        }
    };

    const handlePasswordSave = async () => {
        try {
            if (passwordData.newPassword !== passwordData.confirmPassword) {
                alert('Mật khẩu mới và mật khẩu xác nhận không trùng khớp.');
                return;
            }

            const apiBaseUrl =
                import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

            const response = await fetch(
                `${apiBaseUrl}/api/users/change-password`,
                {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    credentials: 'include',
                    body: JSON.stringify({
                        currentPassword: passwordData.currentPassword,
                        newPassword: passwordData.newPassword,
                    }),
                },
            );

            if (response.ok) {
                alert('Mật khẩu đã được thay đổi thành công.');
                // Optionally clear password fields on success
                setPasswordData({
                    currentPassword: '',
                    newPassword: '',
                    confirmPassword: '',
                });
            } else {
                const errorData = await response.json();
                alert(
                    `Thay đổi mật khẩu không thành công: ${errorData.message}`,
                );
            }
        } catch (error) {
            console.error('Lỗi khi thay đổi mật khẩu:', error);
            alert('Có lỗi xảy ra, vui lòng thử lại.');
        } finally {
            setIsPasswordDialogOpen(false); // Always close the dialog
        }
    };

    const formatDate = (dateString: string) => {
        // Check if dateString is valid before formatting
        if (!dateString) return '';
        try {
            return new Date(dateString).toLocaleDateString('vi-VN');
        } catch (e) {
            console.error('Error formatting date:', e);
            return dateString; // Return original string if formatting fails
        }
    };

    // Format the date for the input field in the edit dialog
    const formatInputDate = (dateString?: string) => {
        if (!dateString) return '';
        try {
            const date = new Date(dateString);
            if (!isNaN(date.getTime())) {
                return date.toISOString().split('T')[0];
            }
            return ''; // Return empty string for invalid dates
        } catch (e) {
            console.error('Error formatting date for input:', e);
            return '';
        }
    };

    return (
        <div className="max-w-4xl mx-auto p-4 mt-10">
            {/* Card chính */}
            <div className="bg-white rounded-md shadow-sm border border-gray-100 overflow-hidden">
                {/* Header với avatar và thông tin cơ bản */}
                <div className="p-6 bg-gray-50 flex items-center">
                    <div className="flex-shrink-0 mr-4">
                        <div className="h-24 w-24 rounded-full bg-gray-900 flex items-center justify-center text-white text-3xl font-bold">
                            {user?.name?.charAt(0).toUpperCase() || 'N'}{' '}
                            {/* Added .toUpperCase() */}
                        </div>
                    </div>
                    <div className="flex-1">
                        <h1 className="text-2xl font-medium text-gray-900">
                            {user?.name}
                        </h1>
                        {/* <p className="text-gray-500">
                            Thành viên từ{' '}
                            {user?.createdAt
                                ? formatMemberSince(user.createdAt)
                                : ''}
                        </p> */}
                    </div>
                    <button
                        onClick={() => {
                            setIsEditDialogOpen(true);
                            // Ensure formData is populated with current user data when opening edit dialog
                            if (user) {
                                setFormData(user);
                            }
                        }}
                        className="px-4 py-2 flex items-center hover:bg-black hover:text-white disabled:opacity-50 text-gray-600 border border-gray-300 rounded  transition"
                    >
                        <Edit className="w-4 h-4 mr-2 " />
                        Chỉnh sửa thông tin
                    </button>
                </div>

                {/* Thông tin cá nhân */}
                <div className="p-6">
                    <h2 className="text-lg font-medium mb-6">
                        Thông tin cá nhân
                    </h2>

                    <div className="flex flex-wrap -mx-4">
                        {' '}
                        {/* Added flex-wrap for better mobile layout */}
                        {/* Cột bên trái */}
                        <div className="w-full md:w-1/2 px-4 mb-6 md:mb-0">
                            {' '}
                            {/* Adjusted width and added padding */}
                            <div className="space-y-6">
                                <div className="flex items-start">
                                    <div className="text-gray-400 mt-0.5 mr-3">
                                        <User className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="text-gray-500 text-sm">
                                            Họ và tên
                                        </p>
                                        <p className="font-medium">
                                            {user?.name}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-start">
                                    <div className="text-gray-400 mt-0.5 mr-3">
                                        <Calendar className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="text-gray-500 text-sm">
                                            Ngày sinh
                                        </p>
                                        <p className="font-medium">
                                            {user?.birthDate
                                                ? formatDate(user.birthDate)
                                                : ''}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-start">
                                    <div className="text-gray-400 mt-0.5 mr-3">
                                        <Mail className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="text-gray-500 text-sm">
                                            Email
                                        </p>
                                        <p className="font-medium">
                                            {user?.email}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        {/* Cột bên phải */}
                        <div className="w-full md:w-1/2 px-4">
                            {' '}
                            {/* Adjusted width and added padding */}
                            <div className="space-y-6">
                                <div className="flex items-start">
                                    <div className="text-gray-400 mt-0.5 mr-3">
                                        <Phone className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="text-gray-500 text-sm">
                                            Số điện thoại
                                        </p>
                                        <p className="font-medium">
                                            {user?.phone}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-start">
                                    <div className="text-gray-400 mt-0.5 mr-3">
                                        <MapPin className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="text-gray-500 text-sm">
                                            Địa chỉ
                                        </p>
                                        <p className="font-medium">
                                            {user?.address}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-start">
                                    <div className="text-gray-400 mt-0.5 mr-3">
                                        <User className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="text-gray-500 text-sm">
                                            ID Tài khoản
                                        </p>
                                        <p className="font-medium">
                                            #{user?.user_id}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="mt-8 flex justify-end space-x-4">
                        <button
                            onClick={() => setIsPasswordDialogOpen(true)}
                            className="px-6 py-3 border border-black rounded-full hover:bg-black hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Đổi mật khẩu
                        </button>
                    </div>
                </div>
            </div>

            {/* Card lịch sử mua hàng - Conditionally rendered */}
            {/* Render this section only if the user is NOT an admin */}
            {user && !user.isAdmin && (
                <div className="mt-8 bg-white rounded-md shadow-sm border border-gray-100 p-6">
                    <h2 className="text-lg font-medium mb-4">
                        Lịch sử mua hàng
                    </h2>
                    <p className="text-gray-500 mb-4">
                        Xem lịch sử đơn hàng và trạng thái giao hàng của bạn.
                    </p>
                    <Link to="/orders">
                        <button className="w-full py-2 border border-gray-300 rounded text-center hover:bg-gray-50 transition">
                            Xem đơn hàng
                        </button>
                    </Link>
                </div>
            )}

            {/* Dialog đổi mật khẩu */}
            {isPasswordDialogOpen && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-30 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg max-w-md w-full p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-lg font-medium">
                                Đổi mật khẩu
                            </h3>
                            <button
                                onClick={() => setIsPasswordDialogOpen(false)}
                                className="text-gray-500 hover:text-gray-700"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label
                                    htmlFor="currentPassword"
                                    className="block text-sm font-medium text-gray-700 mb-1"
                                >
                                    Mật khẩu hiện tại
                                </label>
                                <div className="relative">
                                    <input
                                        type={
                                            showCurrentPassword
                                                ? 'text'
                                                : 'password'
                                        }
                                        id="currentPassword"
                                        name="currentPassword"
                                        value={passwordData.currentPassword}
                                        onChange={handlePasswordChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                                    />
                                    <button
                                        type="button"
                                        className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                                        onClick={() =>
                                            setShowCurrentPassword(
                                                !showCurrentPassword,
                                            )
                                        }
                                    >
                                        {showCurrentPassword ? (
                                            <EyeOff className="w-5 h-5" />
                                        ) : (
                                            <Eye className="w-5 h-5" />
                                        )}
                                    </button>
                                </div>
                            </div>

                            <div>
                                <label
                                    htmlFor="newPassword"
                                    className="block text-sm font-medium text-gray-700 mb-1"
                                >
                                    Mật khẩu mới
                                </label>
                                <div className="relative">
                                    <input
                                        type={
                                            showNewPassword
                                                ? 'text'
                                                : 'password'
                                        }
                                        id="newPassword"
                                        name="newPassword"
                                        value={passwordData.newPassword}
                                        onChange={handlePasswordChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                                    />
                                    <button
                                        type="button"
                                        className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                                        onClick={() =>
                                            setShowNewPassword(!showNewPassword)
                                        }
                                    >
                                        {showNewPassword ? (
                                            <EyeOff className="w-5 h-5" />
                                        ) : (
                                            <Eye className="w-5 h-5" />
                                        )}
                                    </button>
                                </div>
                            </div>

                            <div>
                                <label
                                    htmlFor="confirmPassword"
                                    className="block text-sm font-medium text-gray-700 mb-1"
                                >
                                    Xác nhận mật khẩu mới
                                </label>
                                <div className="relative">
                                    <input
                                        type={
                                            showConfirmPassword
                                                ? 'text'
                                                : 'password'
                                        }
                                        id="confirmPassword"
                                        name="confirmPassword"
                                        value={passwordData.confirmPassword}
                                        onChange={handlePasswordChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                                    />
                                    <button
                                        type="button"
                                        className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                                        onClick={() =>
                                            setShowConfirmPassword(
                                                !showConfirmPassword,
                                            )
                                        }
                                    >
                                        {showConfirmPassword ? (
                                            <EyeOff className="w-5 h-5" />
                                        ) : (
                                            <Eye className="w-5 h-5" />
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="mt-6 flex justify-end space-x-3">
                            <button
                                onClick={() => setIsPasswordDialogOpen(false)}
                                className="px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50"
                            >
                                Hủy
                            </button>
                            <button
                                onClick={handlePasswordSave}
                                className="px-4 py-2 bg-black text-white rounded hover:bg-gray-800"
                            >
                                Lưu thay đổi
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Dialog chỉnh sửa thông tin */}
            {/* Added backdrop-filter to the edit dialog */}
            {isEditDialogOpen && (
                <div className="fixed inset-0 bg-black/40 backdrop-filter  flex items-center justify-center z-50 overflow-y-auto">
                    <div className="bg-white rounded-lg max-w-lg w-full p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-lg font-medium">
                                Chỉnh sửa thông tin
                            </h3>
                            <button
                                onClick={() => setIsEditDialogOpen(false)}
                                className="text-gray-500 hover:text-gray-700"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label
                                    htmlFor="name"
                                    className="block text-sm font-medium text-gray-700 mb-1"
                                >
                                    Họ và tên
                                </label>
                                <input
                                    type="text"
                                    id="name"
                                    name="name"
                                    value={formData.name || ''}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                                />
                            </div>

                            <div>
                                <label
                                    htmlFor="phone"
                                    className="block text-sm font-medium text-gray-700 mb-1"
                                >
                                    Số điện thoại
                                </label>
                                <input
                                    type="tel"
                                    id="phone"
                                    name="phone"
                                    value={formData.phone || ''}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                                />
                            </div>

                            <div>
                                <label
                                    htmlFor="email"
                                    className="block text-sm font-medium text-gray-700 mb-1"
                                >
                                    Email
                                </label>
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    value={formData.email || ''}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                                />
                            </div>

                            <div>
                                <label
                                    htmlFor="birthDate"
                                    className="block text-sm font-medium text-gray-700 mb-1"
                                >
                                    Ngày sinh
                                </label>
                                <input
                                    type="date"
                                    id="birthDate"
                                    name="birthDate"
                                    value={formatInputDate(formData.birthDate)} // Use the new formatInputDate helper
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                                />
                            </div>

                            <div className="md:col-span-2">
                                <label
                                    htmlFor="address"
                                    className="block text-sm font-medium text-gray-700 mb-1"
                                >
                                    Địa chỉ
                                </label>
                                <input
                                    type="text"
                                    id="address"
                                    name="address"
                                    value={formData.address || ''}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                                />
                            </div>
                        </div>

                        <div className="mt-6 flex justify-end space-x-3">
                            <button
                                onClick={() => setIsEditDialogOpen(false)}
                                className="px-6 py-2 border border-black rounded-full hover:bg-black hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Hủy
                            </button>
                            <button
                                onClick={handleSaveChanges}
                                className="px-6 py-2 border border-black rounded-full hover:bg-black hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Lưu thay đổi
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
