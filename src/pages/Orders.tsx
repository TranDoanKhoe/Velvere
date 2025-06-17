import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import MessageDialog from '../component/MessageDialog';
import { useCart } from '../context/CartContext';

// Định nghĩa các interface cần thiết
interface OrderItem {
    _id: string; // _id là chuỗi ObjectId của sản phẩm
    product_id: string; // product_id là chuỗi ObjectId
    product_name: string;
    image: string;
    price: number;
    quantity: number;
    size: string;
    color: string;
}

interface Order {
    _id: string; // _id là chuỗi ObjectId của đơn hàng
    order_id: string; // Mã đơn hàng tự tạo
    user_id: string; // user_id là chuỗi ObjectId của người dùng
    user_name: string;
    phone: string;
    address: string;
    items: OrderItem[];
    totalAmount: number;
    status: 'pending' | 'confirmed' | 'shipping' | 'delivered' | 'cancelled';
    payment_method: string;
    orderDate: string;
    estimatedDelivery: string;
    createdAt: string;
    updatedAt: string;
    cancellationReason?: string;
    cancelledAt?: string;
}

function Orders() {
    const navigate = useNavigate();
    const { addToCart, clearCart } = useCart();
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [detailsVisible, setDetailsVisible] = useState(false);
    const [processingAction, setProcessingAction] = useState(false);
    const [cancelReason, setCancelReason] = useState(''); // State để lưu lý do hủy
    const [showCancelInput, setShowCancelInput] = useState(false); // Hiển thị input lý do hủy

    const [dialog, setDialog] = useState({
        isOpen: false,
        title: '',
        description: '',
        type: '' as 'success' | 'error' | '',
    });

    useEffect(() => {
        // Kiểm tra đăng nhập
        const userJSON = localStorage.getItem('user');
        if (!userJSON) {
            setDialog({
                isOpen: true,
                title: 'Đăng nhập để xem đơn hàng',
                description: 'Bạn cần đăng nhập để xem lịch sử đơn hàng.',
                type: 'error',
            });
            setLoading(false);
            return;
        }

        const fetchOrders = async () => {
            try {
                const user = JSON.parse(userJSON);
                const apiBaseUrl =
                    import.meta.env.VITE_API_BASE_URL ||
                    'http://localhost:3000';

                const response = await axios.get(
                    `${apiBaseUrl}/api/orders/user/${user._id}`,
                    {
                        withCredentials: true, // Đảm bảo gửi cookie nếu cần
                    },
                );

                // Sắp xếp đơn hàng theo ngày tạo mới nhất
                const sortedOrders = (response.data as Order[]).sort(
                    (a: Order, b: Order) => {
                        return (
                            new Date(b.createdAt).getTime() -
                            new Date(a.createdAt).getTime()
                        );
                    },
                );

                setOrders(sortedOrders);
            } catch (error) {
                console.error('Lỗi khi lấy danh sách đơn hàng:', error);
                setDialog({
                    isOpen: true,
                    title: 'Không thể tải đơn hàng',
                    description:
                        'Đã xảy ra lỗi khi tải danh sách đơn hàng. Vui lòng thử lại sau.',
                    type: 'error',
                });
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();
    }, [navigate]); // Dependency array includes navigate

    // Hàm refresh danh sách đơn hàng sau khi hủy
    const refreshOrders = async () => {
        try {
            const userJSON = localStorage.getItem('user');
            if (!userJSON) return;

            const user = JSON.parse(userJSON);
            const apiBaseUrl =
                import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

            const response = await axios.get(
                `${apiBaseUrl}/api/orders/user/${user._id}`,
                {
                    withCredentials: true,
                },
            );

            // Sắp xếp đơn hàng theo ngày tạo mới nhất
            const sortedOrders = (response.data as Order[]).sort(
                (a: Order, b: Order) => {
                    return (
                        new Date(b.createdAt).getTime() -
                        new Date(a.createdAt).getTime()
                    );
                },
            );

            setOrders(sortedOrders);

            // Nếu đang xem chi tiết đơn hàng, cập nhật thông tin đơn hàng đó
            if (selectedOrder) {
                const updatedOrder = sortedOrders.find(
                    (order) => order._id === selectedOrder._id,
                );
                if (updatedOrder) {
                    setSelectedOrder(updatedOrder);
                }
            }
        } catch (error) {
            console.error('Lỗi khi làm mới danh sách đơn hàng:', error);
        }
    };

    const handleCloseDialog = () => {
        setDialog({ isOpen: false, title: '', description: '', type: '' });
        if (!localStorage.getItem('user')) {
            navigate('/signin'); // Chuyển hướng đến trang đăng nhập nếu chưa đăng nhập
        }
    };

    const handleViewDetails = (order: Order) => {
        setSelectedOrder(order);
        setDetailsVisible(true);
        window.scrollTo({ top: 0, behavior: 'smooth' }); // Cuộn lên đầu trang khi mở chi tiết
    };

    const handleCloseDetails = () => {
        setDetailsVisible(false);
        setSelectedOrder(null);
        setShowCancelInput(false); // Đóng input lý do hủy khi đóng chi tiết
        setCancelReason(''); // Xóa lý do hủy
    };

    // Hàm xử lý việc hủy đơn hàng
    const handleCancelOrder = async () => {
        if (!selectedOrder) return;

        // Chỉ cho phép hủy đơn hàng khi trạng thái là 'pending'
        if (selectedOrder.status !== 'pending') {
            setDialog({
                isOpen: true,
                title: 'Không thể hủy đơn hàng',
                description:
                    'Chỉ có thể hủy đơn hàng khi trạng thái là "Chờ duyệt".',
                type: 'error',
            });
            return;
        }

        if (!cancelReason.trim()) {
            setDialog({
                isOpen: true,
                title: 'Vui lòng nhập lý do hủy',
                description: 'Bạn cần cung cấp lý do để hủy đơn hàng.',
                type: 'error',
            });
            return;
        }

        try {
            setProcessingAction(true);
            const apiBaseUrl =
                import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

            // Gọi API để hủy đơn hàng với lý do và thêm withCredentials
            await axios.put(
                `${apiBaseUrl}/api/orders/${selectedOrder._id}/cancel`,
                { cancellationReason: cancelReason },
                {
                    withCredentials: true, // Đảm bảo gửi cookie (bao gồm XSRF-TOKEN)
                },
            );

            // Làm mới danh sách đơn hàng
            await refreshOrders();

            setDialog({
                isOpen: true,
                title: 'Hủy đơn hàng thành công',
                description: 'Đơn hàng của bạn đã được hủy thành công.',
                type: 'success',
            });

            setShowCancelInput(false); // Đóng input lý do hủy
            setCancelReason(''); // Xóa lý do hủy
        } catch (error) {
            console.error('Lỗi khi hủy đơn hàng:', error);
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const axiosError = error as any;
            const errorMessage =
                axiosError.response?.data?.message ||
                'Đã xảy ra lỗi khi hủy đơn hàng. Vui lòng thử lại sau.';
            setDialog({
                isOpen: true,
                title: 'Lỗi hủy đơn hàng',
                description: errorMessage,
                type: 'error',
            });
        } finally {
            setProcessingAction(false);
        }
    };

    // Hàm xử lý việc mua lại
    const handleReorder = async () => {
        if (!selectedOrder) return;

        try {
            setProcessingAction(true);

            // Xóa giỏ hàng hiện tại
            clearCart();

            // Thêm từng sản phẩm từ đơn hàng vào giỏ hàng mới
            selectedOrder.items.forEach((item) => {
                addToCart({
                    // SỬA LỖI: Sử dụng trực tiếp item.product_id (chuỗi ObjectId)
                    product_id: item._id,
                    product_name: item.product_name,
                    image: item.image,
                    price: item.price,
                    quantity: item.quantity,
                    size: item.size,
                    color: item.color,
                });
            });

            // Hiển thị thông báo thành công
            setDialog({
                isOpen: true,
                title: 'Đã thêm vào giỏ hàng',
                description: 'Các sản phẩm đã được thêm vào giỏ hàng của bạn.',
                type: 'success',
            });

            // Đóng dialog chi tiết đơn hàng
            setDetailsVisible(false);
            setSelectedOrder(null);

            // Chuyển hướng đến trang giỏ hàng
            navigate('/cart');
        } catch (error) {
            console.error('Lỗi khi mua lại:', error);
            setDialog({
                isOpen: true,
                title: 'Lỗi khi mua lại',
                description:
                    'Đã xảy ra lỗi khi thêm sản phẩm vào giỏ hàng. Vui lòng thử lại sau.',
                type: 'error',
            });
        } finally {
            setProcessingAction(false);
        }
    };

    // Hàm lấy text trạng thái hiển thị
    const getStatusText = (status: string) => {
        switch (status) {
            case 'pending':
                return 'Chờ duyệt';
            case 'confirmed':
                return 'Đã duyệt';
            case 'shipping':
                return 'Đang giao hàng';
            case 'delivered':
                return 'Đã giao hàng';
            case 'cancelled':
                return 'Đã hủy';
            default:
                return 'Không xác định';
        }
    };

    // Hàm lấy class CSS cho trạng thái
    const getStatusClass = (status: string) => {
        switch (status) {
            case 'pending':
                return 'bg-yellow-100 text-yellow-800';
            case 'confirmed':
                return 'bg-blue-100 text-blue-800';
            case 'shipping':
                return 'bg-purple-100 text-purple-800';
            case 'delivered':
                return 'bg-green-100 text-green-800';
            case 'cancelled':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    // Format lại ngày giờ
    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
        });
    };

    if (loading) {
        return (
            <div className="container mx-auto my-20 py-8 px-4 text-center">
                <div className="flex flex-col items-center justify-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-t-1 border-b-1 border-gray-400 mb-4"></div>
                    <h2 className="text-xl font-semibold mb-2">
                        Đang tải đơn hàng...
                    </h2>
                </div>
            </div>
        );
    }

    // Hiển thị chi tiết đơn hàng
    if (detailsVisible && selectedOrder) {
        return (
            <div className="container mx-auto my-20 py-8 px-4 max-w-5xl">
                <div className="bg-white border rounded-lg shadow-lg overflow-hidden">
                    {/* Header */}
                    <div className="flex justify-between items-center p-6 border-b">
                        <div>
                            <h1 className="text-2xl font-semibold">
                                Chi tiết đơn hàng #{selectedOrder.order_id}
                            </h1>
                            <p className="text-gray-500">
                                Đặt ngày {formatDate(selectedOrder.orderDate)}
                            </p>
                        </div>
                        <div className="flex items-center">
                            <span
                                className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusClass(
                                    selectedOrder.status,
                                )}`}
                            >
                                {getStatusText(selectedOrder.status)}
                            </span>
                            <button
                                onClick={handleCloseDetails}
                                className="ml-4 text-gray-500 hover:text-gray-700"
                            >
                                <i className="fa-solid fa-xmark text-xl"></i>
                            </button>
                        </div>
                    </div>

                    <div className="p-6">
                        {/* Thông tin giao hàng */}
                        <div className="mb-8">
                            <h2 className="text-lg font-semibold mb-4">
                                Thông tin giao hàng
                            </h2>
                            <div className="bg-gray-50 rounded p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <p className="text-gray-500 text-sm">
                                        Người nhận
                                    </p>
                                    <p className="font-medium">
                                        {selectedOrder.user_name}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-gray-500 text-sm">
                                        Số điện thoại
                                    </p>
                                    <p className="font-medium">
                                        {selectedOrder.phone}
                                    </p>
                                </div>
                                <div className="md:col-span-2">
                                    <p className="text-gray-500 text-sm">
                                        Địa chỉ
                                    </p>
                                    <p className="font-medium">
                                        {selectedOrder.address}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-gray-500 text-sm">
                                        Ngày giao hàng dự kiến
                                    </p>
                                    <p className="font-medium">
                                        {formatDate(
                                            selectedOrder.estimatedDelivery,
                                        )}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-gray-500 text-sm">
                                        Phương thức thanh toán
                                    </p>
                                    <p className="font-medium">
                                        {selectedOrder.payment_method === 'COD'
                                            ? 'Thanh toán khi nhận hàng'
                                            : selectedOrder.payment_method}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Hiển thị thông tin hủy (nếu có) */}
                        {selectedOrder.status === 'cancelled' && (
                            <div className="mb-8">
                                <h2 className="text-lg font-semibold mb-4">
                                    Thông tin hủy đơn hàng
                                </h2>
                                <div className="bg-gray-50 rounded p-4">
                                    <p className="text-gray-500 text-sm">
                                        Lý do hủy
                                    </p>
                                    <p className="font-medium">
                                        {selectedOrder.cancellationReason ||
                                            'Không có lý do cụ thể'}
                                    </p>
                                    <p className="text-gray-500 text-sm mt-2">
                                        Thời gian hủy
                                    </p>
                                    <p className="font-medium">
                                        {selectedOrder.cancelledAt
                                            ? formatDate(
                                                  selectedOrder.cancelledAt,
                                              )
                                            : 'Không xác định'}
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Danh sách sản phẩm */}
                        <div className="mb-8">
                            <h2 className="text-lg font-semibold mb-4">
                                Sản phẩm đã đặt
                            </h2>
                            <div className="border rounded-lg overflow-hidden">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th
                                                scope="col"
                                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                            >
                                                Sản phẩm
                                            </th>
                                            <th
                                                scope="col"
                                                className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider"
                                            >
                                                Số lượng
                                            </th>
                                            <th
                                                scope="col"
                                                className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                                            >
                                                Đơn giá
                                            </th>
                                            <th
                                                scope="col"
                                                className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                                            >
                                                Thành tiền
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {selectedOrder.items.map(
                                            (item, index) => (
                                                <tr key={index}>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="flex items-center">
                                                            <img
                                                                className="h-16 w-16 object-cover rounded"
                                                                src={item.image}
                                                                alt={
                                                                    item.product_name
                                                                }
                                                            />
                                                            <div className="ml-4">
                                                                <div className="text-sm font-medium text-gray-900">
                                                                    {
                                                                        item.product_name
                                                                    }
                                                                </div>
                                                                <div className="text-sm text-gray-500">
                                                                    Size:{' '}
                                                                    {item.size}{' '}
                                                                    | Màu:{' '}
                                                                    {item.color}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-center">
                                                        {item.quantity}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-right">
                                                        {item.price.toLocaleString()}
                                                        ₫
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-right font-medium">
                                                        {(
                                                            item.price *
                                                            item.quantity
                                                        ).toLocaleString()}
                                                        ₫
                                                    </td>
                                                </tr>
                                            ),
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Tổng tiền */}
                        <div className="border-t pt-4">
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-gray-600">
                                    Tổng cộng:
                                </span>
                                <span className="text-xl font-semibold">
                                    {selectedOrder.totalAmount.toLocaleString()}
                                    ₫
                                </span>
                            </div>
                        </div>

                        {/* Input lý do hủy */}
                        {selectedOrder.status === 'pending' &&
                            showCancelInput && (
                                <div className="mt-4">
                                    <label className="block text-sm font-medium text-gray-700">
                                        Lý do hủy đơn hàng
                                    </label>
                                    <textarea
                                        value={cancelReason}
                                        onChange={(e) =>
                                            setCancelReason(e.target.value)
                                        }
                                        className="mt-1 block w-full border rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
                                        rows={3}
                                        placeholder="Nhập lý do hủy đơn hàng..."
                                    />
                                </div>
                            )}

                        {/* Các nút hành động */}
                        <div className="mt-8 flex flex-wrap justify-center gap-4">
                            {/* Nút Hủy đơn hàng - chỉ hiển thị khi đơn hàng có thể hủy */}
                            {selectedOrder.status === 'pending' && (
                                <>
                                    {!showCancelInput ? (
                                        <button
                                            onClick={() =>
                                                setShowCancelInput(true)
                                            }
                                            disabled={processingAction}
                                            className="px-6 py-3 border border-red-500 text-red-500 rounded-full hover:bg-red-500 hover:text-white transition disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            Hủy đơn hàng
                                        </button>
                                    ) : (
                                        <>
                                            <button
                                                onClick={handleCancelOrder}
                                                disabled={processingAction}
                                                className="px-6 py-3 bg-red-500 text-white rounded-full hover:bg-red-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                {processingAction
                                                    ? 'Đang xử lý...'
                                                    : 'Xác nhận hủy'}
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setShowCancelInput(false);
                                                    setCancelReason('');
                                                }}
                                                disabled={processingAction}
                                                className="px-6 py-3 border border-gray-500 text-gray-500 rounded-full hover:bg-gray-500 hover:text-white transition disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                Hủy bỏ
                                            </button>
                                        </>
                                    )}
                                </>
                            )}

                            {/* Nút Mua lại - luôn hiển thị */}
                            <button
                                onClick={handleReorder}
                                disabled={processingAction}
                                className="px-6 py-3 bg-green-500 text-white rounded-full hover:bg-green-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {processingAction ? 'Đang xử lý...' : 'Mua lại'}
                            </button>

                            {/* Nút quay lại */}
                            <button
                                onClick={handleCloseDetails}
                                disabled={processingAction}
                                className="px-6 py-3 bg-black text-white rounded-full hover:bg-gray-800 transition disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Quay lại danh sách đơn hàng
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Hiển thị danh sách đơn hàng
    return (
        <div className="container mx-auto my-20 py-8 px-4">
            <h1 className="text-3xl font-semibold uppercase mb-8 text-center">
                Lịch sử đơn hàng
            </h1>

            {orders.length === 0 ? (
                <div className="text-center py-16 border rounded-lg">
                    <p className="text-gray-500 mb-6">
                        Bạn chưa có đơn hàng nào. Hãy mua sắm để bắt đầu!
                    </p>
                    <Link
                        to="/productPage"
                        className="inline-block px-6 py-3 bg-black text-white rounded-full hover:bg-gray-800"
                    >
                        Tiếp tục mua sắm
                    </Link>
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="min-w-full bg-white border rounded-lg overflow-hidden">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="py-3 px-4 text-left">
                                    Mã đơn hàng
                                </th>
                                <th className="py-3 px-4 text-left">
                                    Ngày đặt
                                </th>
                                <th className="py-3 px-4 text-right">
                                    Tổng tiền
                                </th>
                                <th className="py-3 px-4 text-center">
                                    Trạng thái
                                </th>
                                <th className="py-3 px-4 text-center">
                                    Thao tác
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {orders.map((order) => (
                                <tr
                                    key={order._id} // Sử dụng _id của đơn hàng làm key
                                    className="border-t hover:bg-gray-50"
                                >
                                    <td className="py-4 px-4 font-medium">
                                        {order.order_id}
                                    </td>
                                    <td className="py-4 px-4">
                                        {formatDate(order.orderDate)}
                                    </td>
                                    <td className="py-4 px-4 text-right">
                                        {order.totalAmount.toLocaleString()}₫
                                    </td>
                                    <td className="py-4 px-4">
                                        <div className="flex justify-center">
                                            <span
                                                className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusClass(
                                                    order.status,
                                                )}`}
                                            >
                                                {getStatusText(order.status)}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="py-4 px-4 text-center">
                                        <button
                                            onClick={() =>
                                                handleViewDetails(order)
                                            }
                                            className="text-blue-600 hover:text-blue-800 font-medium"
                                        >
                                            Chi tiết
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

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

export default Orders;
