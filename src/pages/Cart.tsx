'use client';

import { useCart } from '../context/CartContext';
import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import MessageDialog from '../component/MessageDialog';
import axios from 'axios';

function Cart() {
    const { cartItems, removeFromCart, updateQuantity, totalPrice, clearCart } =
        useCart();
    const navigate = useNavigate();

    const [isProcessing, setIsProcessing] = useState(false);
    const [paymentSuccess, setPaymentSuccess] = useState(false);
    const [selectedPaymentMethod, setSelectedPaymentMethod] =
        useState<string>('');
    const [orderInfo, setOrderInfo] = useState({
        orderId: '',
        orderDate: '',
        estimatedDelivery: '',
        totalAmount: 0,
    });

    const [dialog, setDialog] = useState({
        isOpen: false,
        title: '',
        description: '',
        type: '' as 'success' | 'error' | '',
    }); // Generate random order ID

    const generateOrderId = () => {
        return (
            'VLV' +
            Math.floor(Math.random() * 1000000)
                .toString()
                .padStart(6, '0')
        );
    }; // Calculate delivery date (7 days from today)

    const getEstimatedDelivery = () => {
        const date = new Date();
        date.setDate(date.getDate() + 7);
        return date.toLocaleDateString('vi-VN');
    };

    const parseDateVN = (dateStr: string) => {
        const parts = dateStr.split('/');
        return new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);
    };

    const handleCheckout = async () => {
        const userJSON = localStorage.getItem('user');

        if (!userJSON) {
            setDialog({
                isOpen: true,
                title: 'Vui lòng đăng nhập',
                description: 'Bạn cần đăng nhập để tiến hành thanh toán.',
                type: 'error',
            });
            return;
        }

        if (cartItems.length === 0) {
            setDialog({
                isOpen: true,
                title: 'Giỏ hàng trống',
                description:
                    'Vui lòng thêm sản phẩm vào giỏ hàng trước khi thanh toán.',
                type: 'error',
            });
            return;
        }

        if (!selectedPaymentMethod) {
            setDialog({
                isOpen: true,
                title: 'Chưa chọn phương thức thanh toán',
                description:
                    'Vui lòng chọn một phương thức thanh toán để tiếp tục.',
                type: 'error',
            });
            return;
        }

        setIsProcessing(true);

        try {
            const user = JSON.parse(userJSON);

            const newOrderId = generateOrderId();
            const orderDate = new Date().toLocaleDateString('vi-VN');
            const estimatedDelivery = getEstimatedDelivery();
            const currentTotal = totalPrice;

            const orderData = {
                order_id: newOrderId,
                user_id: user._id,
                user_name: user.name,
                phone: user.phone,
                address: user.address,
                items: cartItems.map((item) => ({
                    product_id: item.product_id,
                    product_name: item.product_name,
                    image: item.image,
                    price: item.price,
                    quantity: item.quantity,
                    size: item.size,
                    color: item.color,
                })),
                totalAmount: currentTotal,
                payment_method: selectedPaymentMethod,
                estimatedDelivery: parseDateVN(estimatedDelivery),
            };
            const apiBaseUrl =
                import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

            await axios.post(`${apiBaseUrl}/api/orders`, orderData);

            setOrderInfo({
                orderId: newOrderId,
                orderDate: orderDate,
                estimatedDelivery: estimatedDelivery,
                totalAmount: currentTotal,
            });

            setIsProcessing(false);
            setPaymentSuccess(true);
            clearCart();
        } catch (error) {
            console.error('Lỗi khi tạo đơn hàng:', error);
            setIsProcessing(false);

            const axiosError = error as {
                response?: { data?: { message?: string } };
            };
            const errorMessage =
                axiosError.response?.data?.message ||
                'Có lỗi xảy ra trong quá trình thanh toán. Vui lòng thử lại.';

            setDialog({
                isOpen: true,
                title: 'Lỗi thanh toán',
                description: errorMessage,
                type: 'error',
            });
        }
    };

    const handleCloseDialog = () => {
        setDialog({ isOpen: false, title: '', description: '', type: '' });

        if (dialog.title === 'Vui lòng đăng nhập') {
            navigate('/signin');
        }
    };

    const handleContinueShopping = () => {
        setPaymentSuccess(false);
        navigate('/productPage');
    };

    if (isProcessing) {
        return (
            <div className="container mx-auto my-20 py-8 px-4 text-center">
                <div className="flex flex-col items-center justify-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-t-1 border-b-1 border-gray-400 mb-4"></div>

                    <h2 className="text-xl font-semibold mb-2">
                        Đang xử lý thanh toán...
                    </h2>

                    <p className="text-gray-500">
                        Vui lòng không tải lại trang.
                    </p>
                </div>
            </div>
        );
    }

    if (paymentSuccess) {
        return (
            <div className="container mx-auto my-20 py-8 px-4 max-w-2xl">
                <div className="bg-white border rounded-lg shadow-lg p-8">
                    <h1 className="text-3xl font-semibold text-center text-gray-800 mb-6">
                        Thanh toán thành công!
                    </h1>
                    <div className="border-t border-b py-4 my-4">
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-gray-600">Mã đơn hàng:</span>
                            <span className="font-semibold">
                                {orderInfo.orderId}
                            </span>
                        </div>
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-gray-600">
                                Ngày đặt hàng:
                            </span>
                            <span>{orderInfo.orderDate}</span>
                        </div>
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-gray-600">
                                Tổng thanh toán:
                            </span>

                            <span className="font-semibold">
                                {orderInfo.totalAmount.toLocaleString()}₫
                            </span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-gray-600">
                                Ngày giao hàng dự kiến:
                            </span>

                            <span>{orderInfo.estimatedDelivery}</span>
                        </div>
                    </div>

                    <button
                        onClick={handleContinueShopping}
                        className="px-6 py-3 bg-black text-white rounded-full hover:bg-gray-800 transition"
                    >
                        Tiếp tục mua sắm
                    </button>
                </div>
            </div>
        );
    }

    if (cartItems.length === 0) {
        return (
            <div className="container mx-auto my-20 py-8 px-4 text-center">
                <h1 className="text-3xl font-semibold uppercase mb-6">
                    Giỏ hàng của bạn
                </h1>

                <p className="text-gray-500 mb-6">
                    Giỏ hàng của bạn hiện đang trống.
                </p>

                <Link
                    to="/productPage"
                    className="inline-block px-6 py-3 bg-black text-white rounded-full hover:bg-gray-800"
                >
                    Tiếp tục mua sắm
                </Link>
            </div>
        );
    }

    return (
        <div className="container mx-auto my-20 py-8 px-4">
            <h1 className="text-3xl font-semibold uppercase mb-6">
                Giỏ hàng của bạn
            </h1>
            {/* Cart details */}
            <div className="flex flex-col lg:flex-row gap-8">
                <div className="lg:w-2/3">
                    <div className="border rounded-lg overflow-hidden">
                        <table className="min-w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="py-3 px-4 text-left">
                                        Sản phẩm
                                    </th>

                                    <th className="py-3 px-4 text-center">
                                        Số lượng
                                    </th>

                                    <th className="py-3 px-4 text-right">
                                        Thành tiền
                                    </th>

                                    <th className="py-3 px-4 text-right">
                                        Xóa
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {cartItems.map((item) => (
                                    <tr
                                        key={`${item.product_id}-${item.size}-${item.color}`}
                                        className="border-t"
                                    >
                                        <td className="py-4 px-4">
                                            <div className="flex items-center">
                                                <img
                                                    src={
                                                        item.image ||
                                                        '/placeholder.svg'
                                                    }
                                                    alt={item.product_name}
                                                    className="w-16 h-16 object-cover rounded mr-4"
                                                />
                                                <div>
                                                    <Link
                                                        to={`/product/${item.product_id}`}
                                                        className="font-medium hover:underline"
                                                    >
                                                        {item.product_name}
                                                    </Link>

                                                    <p className="text-sm text-gray-500">
                                                        Size: {item.size} | Màu:{' '}
                                                        {item.color}
                                                    </p>

                                                    <p className="text-sm">
                                                        {item.price.toLocaleString()}
                                                        ₫
                                                    </p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-4 px-4 text-center">
                                            <div className="flex justify-center">
                                                <button
                                                    onClick={() =>
                                                        item.quantity > 1 &&
                                                        updateQuantity(
                                                            item.product_id,
                                                            item.size,
                                                            item.color,
                                                            item.quantity - 1,
                                                        )
                                                    }
                                                    className="px-3 py-1 hover:bg-gray-100"
                                                ></button>

                                                <span className="px-3">
                                                    {item.quantity}
                                                </span>

                                                <button
                                                    onClick={() =>
                                                        updateQuantity(
                                                            item.product_id,
                                                            item.size,
                                                            item.color,
                                                            item.quantity + 1,
                                                        )
                                                    }
                                                    className="px-3 py-1 hover:bg-gray-100"
                                                ></button>
                                            </div>
                                        </td>
                                        <td className="py-4 px-4 text-right font-medium">
                                            {(
                                                item.price * item.quantity
                                            ).toLocaleString()}
                                            ₫
                                        </td>
                                        <td className="py-4 px-4 text-right">
                                            <button
                                                onClick={() =>
                                                    removeFromCart(
                                                        item.product_id,
                                                        item.size,
                                                        item.color,
                                                    )
                                                }
                                                className="text-red-500 hover:text-red-700"
                                            >
                                                <i className="fa-solid fa-trash"></i>
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <div className="flex justify-between mt-6">
                        <Link
                            to="/productPage"
                            className="px-6 py-2 border border-black rounded-full hover:bg-black hover:text-white transition"
                        >
                            Tiếp tục mua sắm
                        </Link>

                        <button
                            onClick={clearCart}
                            className="px-6 py-2 border border-red-500 text-red-500 rounded-full hover:bg-red-500 hover:text-white transition"
                        >
                            Xóa giỏ hàng
                        </button>
                    </div>
                </div>
                <div className="lg:w-1/3">
                    <div className="border rounded-lg p-6">
                        <h2 className="text-xl font-semibold mb-4">
                            Tóm tắt đơn hàng
                        </h2>
                        <div className="flex justify-between mb-2">
                            <span>Số lượng sản phẩm:</span>
                            <span>
                                {cartItems.reduce(
                                    (sum, item) => sum + item.quantity,
                                    0,
                                )}
                            </span>
                        </div>
                        <div className="flex justify-between mb-2">
                            <span>Tạm tính:</span>
                            <span>{totalPrice.toLocaleString()}₫</span>
                        </div>
                        <div className="flex justify-between mb-2">
                            <span>Phí vận chuyển:</span>
                            <span>Miễn phí</span>
                        </div>
                        <div className="mb-4">
                            <h3 className="font-semibold mb-2">
                                Phương thức thanh toán:
                            </h3>
                            <div className="flex flex-col gap-2">
                                <label className="flex items-center">
                                    <input
                                        type="radio"
                                        name="paymentMethod"
                                        value="COD"
                                        checked={
                                            selectedPaymentMethod === 'COD'
                                        }
                                        onChange={(e) =>
                                            setSelectedPaymentMethod(
                                                e.target.value,
                                            )
                                        }
                                        className="mr-2"
                                    />
                                    Thanh toán khi nhận hàng (COD)
                                </label>
                                <label className="flex items-center">
                                    <input
                                        type="radio"
                                        name="paymentMethod"
                                        value="MOMO"
                                        checked={
                                            selectedPaymentMethod === 'MOMO'
                                        }
                                        onChange={(e) =>
                                            setSelectedPaymentMethod(
                                                e.target.value,
                                            )
                                        }
                                        className="mr-2"
                                    />
                                    MOMO
                                </label>
                                <label className="flex items-center">
                                    <input
                                        type="radio"
                                        name="paymentMethod"
                                        value="VNPAY"
                                        checked={
                                            selectedPaymentMethod === 'VNPAY'
                                        }
                                        onChange={(e) =>
                                            setSelectedPaymentMethod(
                                                e.target.value,
                                            )
                                        }
                                        className="mr-2"
                                    />
                                    VNPAY
                                </label>
                            </div>
                        </div>

                        <div className="flex justify-between font-semibold text-lg mb-6">
                            <span>Tổng cộng:</span>

                            <span>{totalPrice.toLocaleString()}₫</span>
                        </div>

                        <button
                            onClick={handleCheckout}
                            className="w-full py-3 bg-black text-white rounded-full hover:bg-gray-800 transition"
                        >
                            Thanh toán
                        </button>
                    </div>
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

export default Cart;
