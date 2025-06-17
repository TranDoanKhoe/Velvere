import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext'; // Đường dẫn đúng đến CartContext.tsx


export interface User {
    _id: string;
    user_id: number;
    name: string;
    email: string;
    phone: string;
    birthDate?: string;
    address?: string;
    isAdmin: boolean;
}

interface Props {
    user: User | null;
    setUser: React.Dispatch<React.SetStateAction<User | null>>;
    setShowUserMenu: (show: boolean) => void;
}

const UserDropdownMenu: React.FC<Props> = ({
    user,
    setUser,
    setShowUserMenu,
}) => {
    const { clearCart } = useCart(); // 👈 Lấy clearCart từ context
    const navigate = useNavigate();

    const handleLogout = async () => {
      try {
          const backendUrl =
              import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
            const response = await fetch(`${backendUrl}/api/users/logout`, {
                method: 'POST',
                credentials: 'include',
            });

            if (response.ok) {
                localStorage.removeItem('user');
                setUser(null);
                setShowUserMenu(false);

                await clearCart(); // Reset giỏ hàng khi logout
                window.location.reload(); // Tải lại trang

                navigate('/');
            } else {
                console.error('Lỗi khi đăng xuất:', await response.text());
            }
        } catch (error) {
            console.error('Lỗi khi gửi yêu cầu đăng xuất:', error);
        }
    };

    const isAdmin = user?.isAdmin ?? false;

    return (
        <div className="absolute -right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-50">
            {user ? (
                <>
                    <div className="px-4 py-2 border-b">
                        <p className="text-sm font-medium">{user.name}</p>
                        <p className="text-xs text-gray-500">{user.email}</p>
                    </div>

                    <Link
                        to="/profile"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setShowUserMenu(false)}
                    >
                        Thông tin tài khoản
                    </Link>

                    {!isAdmin && (
                        <Link
                            to="/orders"
                            className="block px-4 py-2 text-sm text-gray-700 rounded-t-md hover:bg-gray-100"
                            onClick={() => setShowUserMenu(false)}
                        >
                            Đơn hàng của tôi
                        </Link>
                    )}

                    <Link to="/">
                        <button
                            onClick={handleLogout}
                            className="block w-full rounded-b-md text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                        >
                            Đăng xuất
                        </button>
                    </Link>
                </>
            ) : (
                <>
                    <Link
                        to="/signin"
                        className="block px-4 rounded-t-md py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setShowUserMenu(false)}
                    >
                        Đăng nhập
                    </Link>
                    <Link
                        to="/signup"
                        className="block px-4 rounded-b-md py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setShowUserMenu(false)}
                    >
                        Đăng ký
                    </Link>
                </>
            )}
        </div>
    );
};

export default UserDropdownMenu;
