import { useState, useEffect } from 'react';
import ScrollToTop from '../../../component/ScrollToTop';

import { toast } from 'react-toastify';

interface OrderItem {
    product_id: string;
    product_name: string;
    image: string;
    price: number;
    quantity: number;
    size: string;
    color: string;
}

interface Order {
    _id: string;
    order_id: string;
    user_id: string;
    user_name: string;
    phone: string;
    address: string;
    items: OrderItem[];
    totalAmount: number;
    status: 'pending' | 'confirmed' | 'shipping' | 'delivered' | 'cancelled';
    payment_method: string;
    orderDate: string;
    estimatedDelivery: string;
    cancellationReason?: string;
}

export default function OrderApproval() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [processing, setProcessing] = useState<boolean>(false);
    const [showCancelModal, setShowCancelModal] = useState<boolean>(false);
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [cancellationReason, setCancellationReason] = useState<string>('');
    const [selectedOrders, setSelectedOrders] = useState<string[]>([]);
    const [selectAll, setSelectAll] = useState<boolean>(false);
    const [showApproveAllModal, setShowApproveAllModal] =
        useState<boolean>(false);

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                setLoading(true);
                const apiBaseUrl =
                    import.meta.env.VITE_API_BASE_URL ||
                    'http://localhost:3000';
                const response = await fetch(`${apiBaseUrl}/api/orders/all`, {
                    credentials: 'include',
                });

                if (!response.ok) {
                    throw new Error(
                        `Không thể tải danh sách đơn hàng: ${response.status} ${response.statusText}`,
                    );
                }

                const data = await response.json();
                const allOrders: Order[] = Array.isArray(data)
                    ? data
                    : data.data || [];
                const pendingOrders = allOrders.filter(
                    (order) => order.status === 'pending',
                );
                setOrders(pendingOrders);
                setLoading(false);
            } catch (err) {
                setError(
                    err instanceof Error
                        ? err.message
                        : 'Đã xảy ra lỗi khi tải dữ liệu',
                );
                setLoading(false);
            }
        };

        fetchOrders();
    }, []);

    useEffect(() => {
        if (selectAll) {
            setSelectedOrders(orders.map((order) => order._id));
        } else {
            setSelectedOrders([]);
        }
    }, [selectAll, orders]);

    const showCancelConfirmation = (order: Order) => {
        setSelectedOrder(order);
        setShowCancelModal(true);
        setCancellationReason('');
    };

    const closeCancelModal = () => {
        setShowCancelModal(false);
        setSelectedOrder(null);
        setCancellationReason('');
    };

    const handleApproveOrder = async (orderId: string) => {
        try {
            setProcessing(true);
            const apiBaseUrl =
                import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
            const response = await fetch(
                `${apiBaseUrl}/api/orders/${orderId}/status`,
                {
                    method: 'PUT',
                    credentials: 'include',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ status: 'confirmed' }),
                },
            );

            if (!response.ok) {
                throw new Error(
                    `Không thể duyệt đơn hàng: ${response.status} ${response.statusText}`,
                );
            }

            setOrders((prevOrders) =>
                prevOrders.filter((order) => order._id !== orderId),
            );
            setSuccessMessage(`Đơn hàng #${orderId} đã được duyệt thành công`);
            setTimeout(() => setSuccessMessage(null), 3000);
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : 'Đã xảy ra lỗi khi duyệt đơn hàng',
            );
        } finally {
            setProcessing(false);
        }
    };

    const handleCancelOrder = async () => {
        if (!selectedOrder) return;

        try {
            setProcessing(true);
            const apiBaseUrl =
                import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
            const response = await fetch(
                `${apiBaseUrl}/api/orders/${selectedOrder._id}/cancel`,
                {
                    method: 'PUT',
                    credentials: 'include',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ reason: cancellationReason }),
                },
            );

            if (!response.ok) {
                throw new Error(
                    `Không thể hủy đơn hàng: ${response.status} ${response.statusText}`,
                );
            }

            toast.success('Đơn hàng đã được hủy thành công!');
            setOrders((prevOrders) =>
                prevOrders.filter((order) => order._id !== selectedOrder._id),
            );
            setShowCancelModal(false);
        } catch (error) {
            console.error('Error cancelling order:', error);
            toast.error('Có lỗi xảy ra khi hủy đơn hàng!');
        } finally {
            setProcessing(false);
            setShowCancelModal(false);
        }
    };

    const handleSelectOrder = (orderId: string) => {
        if (selectedOrders.includes(orderId)) {
            setSelectedOrders(selectedOrders.filter((id) => id !== orderId));
        } else {
            setSelectedOrders([...selectedOrders, orderId]);
        }
    };

    const handleApproveSelectedOrders = async () => {
        try {
            setProcessing(true);
            const apiBaseUrl =
                import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

            const results = await Promise.allSettled(
                selectedOrders.map((orderId) =>
                    fetch(`${apiBaseUrl}/api/orders/${orderId}/status`, {
                        method: 'PUT',
                        credentials: 'include',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ status: 'confirmed' }),
                    }),
                ),
            );

            const successCount = results.filter(
                (result) => result.status === 'fulfilled',
            ).length;

            setOrders((prevOrders) =>
                prevOrders.filter(
                    (order) => !selectedOrders.includes(order._id),
                ),
            );
            setSelectedOrders([]);
            setSelectAll(false);

            toast.success(`Đã duyệt thành công ${successCount} đơn hàng!`);
            setShowApproveAllModal(false);
        } catch (error) {
            console.error('Lỗi khi duyệt nhiều đơn hàng:', error);
            toast.error('Có lỗi xảy ra khi duyệt đơn hàng!');
        } finally {
            setProcessing(false);
        }
    };

    return (
        <div className="container mx-auto p-6">
            <ScrollToTop />

            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-semibold">Duyệt Đơn Hàng</h1>
                    {!loading && (
                        <p className="text-gray-600 mt-2">
                            Có{' '}
                            <span className="font-semibold text-blue-600">
                                {orders.length}
                            </span>{' '}
                            đơn hàng đang chờ duyệt
                        </p>
                    )}
                </div>

                {orders.length > 0 && (
                    <div className="flex space-x-4">
                        <button
                            onClick={() => setSelectAll(!selectAll)}
                            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                        >
                            {selectAll ? 'Bỏ chọn tất cả' : 'Chọn tất cả'}
                        </button>

                        <button
                            onClick={() => setShowApproveAllModal(true)}
                            disabled={selectedOrders.length === 0 || processing}
                            className={`px-4 py-2 rounded-md text-white ${
                                selectedOrders.length === 0 || processing
                                    ? 'bg-gray-400 cursor-not-allowed'
                                    : 'bg-green-600 hover:bg-green-700'
                            }`}
                        >
                            {processing
                                ? 'Đang xử lý...'
                                : `Duyệt (${selectedOrders.length})`}
                        </button>
                    </div>
                )}
            </div>

            {successMessage && (
                <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
                    {successMessage}
                </div>
            )}

            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                    {error}
                </div>
            )}

            {loading ? (
                <div className="flex justify-center items-center h-40">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
                </div>
            ) : orders.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-lg shadow-sm border">
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
                            strokeWidth="2"
                            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                        ></path>
                    </svg>
                    <p className="text-xl text-gray-600">
                        Tất cả đơn hàng đã được duyệt!
                    </p>
                    <p className="text-gray-500 mt-2">
                        Không có đơn hàng nào đang chờ duyệt.
                    </p>
                </div>
            ) : (
                <div className="space-y-6">
                    {orders.map((order) => (
                        <div
                            key={order._id}
                            className="border rounded-lg p-6 shadow-sm bg-white relative"
                        >
                            <div className="absolute top-4 left-4">
                                <input
                                    type="checkbox"
                                    checked={selectedOrders.includes(order._id)}
                                    onChange={() =>
                                        handleSelectOrder(order._id)
                                    }
                                    className="h-5 w-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                                />
                            </div>

                            <div className="flex justify-between items-center mb-4 ml-8">
                                <h2 className="text-xl font-medium">
                                    Đơn hàng #{order.order_id}
                                </h2>
                                <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium">
                                    Chờ duyệt
                                </span>
                            </div>

                            <div className="grid md:grid-cols-2 gap-6 mb-4 ml-8">
                                <div>
                                    <h3 className="font-medium mb-2">
                                        Thông tin khách hàng
                                    </h3>
                                    <p>
                                        <span className="font-medium">
                                            Tên:
                                        </span>{' '}
                                        {order.user_name}
                                    </p>
                                    <p>
                                        <span className="font-medium">
                                            Số điện thoại:
                                        </span>{' '}
                                        {order.phone}
                                    </p>
                                    <p>
                                        <span className="font-medium">
                                            Địa chỉ:
                                        </span>{' '}
                                        {order.address}
                                    </p>
                                </div>
                                <div>
                                    <h3 className="font-medium mb-2">
                                        Thông tin đơn hàng
                                    </h3>
                                    <p>
                                        <span className="font-medium">
                                            Ngày đặt:
                                        </span>{' '}
                                        {new Date(
                                            order.orderDate,
                                        ).toLocaleDateString('vi-VN')}
                                    </p>
                                    <p>
                                        <span className="font-medium">
                                            Phương thức thanh toán:
                                        </span>{' '}
                                        {order.payment_method}
                                    </p>
                                    <p>
                                        <span className="font-medium">
                                            Tổng tiền:
                                        </span>{' '}
                                        {order.totalAmount.toLocaleString(
                                            'vi-VN',
                                        )}{' '}
                                        đ
                                    </p>
                                </div>
                            </div>

                            <div className="mb-4 ml-8">
                                <h3 className="font-medium mb-2">Sản phẩm</h3>
                                <div className="space-y-3">
                                    {order.items.map((item, index) => (
                                        <div
                                            key={index}
                                            className="flex items-center p-3 border rounded"
                                        >
                                            <div className="w-16 h-16 bg-gray-200 mr-4">
                                                <img
                                                    src={item.image}
                                                    alt={item.product_name}
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                            <div className="flex-1">
                                                <h4 className="font-medium">
                                                    {item.product_name}
                                                </h4>
                                                <div className="text-sm text-gray-600">
                                                    <span>
                                                        Kích thước: {item.size}
                                                    </span>
                                                    <span className="mx-2">
                                                        |
                                                    </span>
                                                    <span>
                                                        Màu: {item.color}
                                                    </span>
                                                    <span className="mx-2">
                                                        |
                                                    </span>
                                                    <span>
                                                        Số lượng:{' '}
                                                        {item.quantity}
                                                    </span>
                                                </div>
                                                <p className="mt-1">
                                                    {item.price.toLocaleString(
                                                        'vi-VN',
                                                    )}{' '}
                                                    đ
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="flex justify-end space-x-4 mt-6">
                                <button
                                    onClick={() =>
                                        showCancelConfirmation(order)
                                    }
                                    className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                                    disabled={processing}
                                >
                                    Hủy đơn hàng
                                </button>
                                <button
                                    onClick={() =>
                                        handleApproveOrder(order._id)
                                    }
                                    className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                                    disabled={processing}
                                >
                                    Duyệt đơn hàng
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {showCancelModal && selectedOrder && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md">
                        <h3 className="text-xl font-semibold mb-4">
                            Xác nhận hủy đơn hàng
                        </h3>
                        <p className="mb-4">
                            Bạn có chắc chắn muốn hủy đơn hàng #
                            {selectedOrder.order_id}?
                        </p>

                        <div className="mb-4">
                            <label className="block text-gray-700 text-sm font-medium mb-2">
                                Lý do hủy đơn hàng{' '}
                                <span className="text-red-500">*</span>
                            </label>
                            <textarea
                                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                rows={3}
                                value={cancellationReason}
                                onChange={(e) =>
                                    setCancellationReason(e.target.value)
                                }
                                placeholder="Vui lòng nhập lý do hủy đơn hàng..."
                            />
                            {!cancellationReason.trim() && (
                                <p className="text-red-500 text-xs italic mt-1">
                                    Vui lòng nhập lý do hủy đơn hàng
                                </p>
                            )}
                        </div>

                        <div className="flex justify-end space-x-3">
                            <button
                                onClick={closeCancelModal}
                                className="px-4 py-2 border text-gray-600 rounded hover:bg-gray-100"
                                disabled={processing}
                            >
                                Hủy bỏ
                            </button>
                            <button
                                onClick={handleCancelOrder}
                                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                                disabled={
                                    processing || !cancellationReason.trim()
                                }
                            >
                                {processing ? 'Đang xử lý...' : 'Xác nhận hủy'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {showApproveAllModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md">
                        <h3 className="text-xl font-semibold mb-4">
                            Xác nhận duyệt đơn hàng
                        </h3>
                        <p className="mb-4">
                            Bạn có chắc chắn muốn duyệt{' '}
                            <span className="font-semibold">
                                {selectedOrders.length}
                            </span>{' '}
                            đơn hàng đã chọn?
                        </p>
                        <p className="text-gray-600 mb-6">
                            Khi duyệt, trạng thái của các đơn hàng sẽ chuyển
                            sang "Đã duyệt" và sẽ được đưa vào quy trình giao
                            hàng.
                        </p>

                        <div className="flex justify-end space-x-3">
                            <button
                                onClick={() => setShowApproveAllModal(false)}
                                className="px-4 py-2 border text-gray-600 rounded hover:bg-gray-100"
                                disabled={processing}
                            >
                                Hủy bỏ
                            </button>
                            <button
                                onClick={handleApproveSelectedOrders}
                                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                                disabled={processing}
                            >
                                {processing
                                    ? 'Đang xử lý...'
                                    : 'Xác nhận duyệt'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
