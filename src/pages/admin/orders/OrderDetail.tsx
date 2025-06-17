import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ScrollToTop from '../../../component/ScrollToTop';

interface OrderItem {
    _id?: string;
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
    cancelledAt?: string;
    createdAt?: string;
    updatedAt?: string;
}

const OrderDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [order, setOrder] = useState<Order | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [processing, setProcessing] = useState<boolean>(false);
    const [showActionModal, setShowActionModal] = useState<boolean>(false);
    const [actionType, setActionType] = useState<string>('');
    const [cancellationReason, setCancellationReason] = useState<string>('');

    useEffect(() => {
        const fetchOrderDetail = async () => {
            try {
                setLoading(true);
                const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
                const response = await fetch(`${apiBaseUrl}/api/orders/${id}`, {
                    credentials: 'include'
                });

                if (!response.ok) {
                    throw new Error(`Không thể tải thông tin đơn hàng: ${response.status} ${response.statusText}`);
                }

                const data = await response.json();
                setOrder(data);
            } catch (err) {
                console.error('Lỗi khi tải thông tin đơn hàng:', err);
                setError(err instanceof Error ? err.message : 'Đã xảy ra lỗi khi tải dữ liệu');
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchOrderDetail();
        }
    }, [id]);

    const formatDate = (dateString: string | undefined) => {
        if (!dateString) return 'Không xác định';
        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) {
                return 'Không xác định';
            }
            return new Intl.DateTimeFormat('vi-VN', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            }).format(date);
        } catch {
            return 'Không xác định';
        }
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(amount);
    };

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

    const getStatusText = (status: string) => {
        switch (status) {
            case 'pending':
                return 'Chờ duyệt';
            case 'confirmed':
                return 'Đã duyệt';
            case 'shipping':
                return 'Đang giao';
            case 'delivered':
                return 'Đã giao';
            case 'cancelled':
                return 'Đã hủy';
            default:
                return status || 'Không xác định';
        }
    };

    const getNextStatus = (currentStatus: string) => {
        switch (currentStatus) {
            case 'pending':
                return 'confirmed';
            case 'confirmed':
                return 'shipping';
            case 'shipping':
                return 'delivered';
            default:
                return null;
        }
    };

    const getNextStatusText = (currentStatus: string) => {
        switch (currentStatus) {
            case 'pending':
                return 'Duyệt đơn hàng';
            case 'confirmed':
                return 'Chuyển sang đang giao';
            case 'shipping':
                return 'Xác nhận đã giao';
            default:
                return null;
        }
    };

    const handleUpdateStatus = async () => {
        if (!order) return;

        try {
            setProcessing(true);
            const nextStatus = getNextStatus(order.status);
            
            if (!nextStatus) {
                setShowActionModal(false);
                return;
            }

            const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
            const endpoint = actionType === 'cancel' 
                ? `${apiBaseUrl}/api/orders/${order._id}/cancel` 
                : `${apiBaseUrl}/api/orders/${order._id}/status`;

            const response = await fetch(endpoint, {
                method: 'PUT',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(
                    actionType === 'cancel' 
                        ? { reason: cancellationReason }
                        : { status: nextStatus }
                )
            });

            if (!response.ok) {
                throw new Error(`Không thể cập nhật trạng thái đơn hàng: ${response.status} ${response.statusText}`);
            }

            // Reload order data
            const updatedResponse = await fetch(`${apiBaseUrl}/api/orders/${id}`, {
                credentials: 'include'
            });

            if (updatedResponse.ok) {
                const updatedOrder = await updatedResponse.json();
                setOrder(updatedOrder);
            }

            setShowActionModal(false);
            setActionType('');
            setCancellationReason('');
            
        } catch (err) {
            console.error('Lỗi khi cập nhật trạng thái đơn hàng:', err);
        } finally {
            setProcessing(false);
        }
    };

    const handleOpenActionModal = (type: string) => {
        setActionType(type);
        setShowActionModal(true);
    };

    if (loading) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="flex justify-center items-center h-64">
                    <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-current border-r-transparent text-blue-600 motion-reduce:animate-[spin_1.5s_linear_infinite]" role="status">
                        <span className="sr-only">Đang tải...</span>
                    </div>
                </div>
            </div>
        );
    }

    if (error || !order) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="bg-white p-6 rounded-lg shadow-md text-center">
                    <h2 className="text-2xl font-semibold text-red-500 mb-4">Đã xảy ra lỗi</h2>
                    <p className="text-gray-600 mb-4">{error || 'Không thể tải thông tin đơn hàng.'}</p>
                    <button
                        onClick={() => navigate('/admin/orders')}
                        className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md"
                    >
                        Quay lại danh sách đơn hàng
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <ScrollToTop />
            
            {/* Breadcrumbs */}
            <div className="flex items-center text-sm text-gray-500 mb-6">
                <button onClick={() => navigate('/admin/orders')} className="hover:text-gray-700">
                    Quản lý đơn hàng
                </button>
                <span className="mx-2">/</span>
                <span className="font-medium text-gray-700">Chi tiết đơn hàng #{order.order_id}</span>
            </div>
            
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-semibold">Chi tiết đơn hàng #{order.order_id}</h1>
                <div className="flex space-x-2">
                    {order.status !== 'cancelled' && order.status !== 'delivered' && (
                        <>
                            {order.status === 'pending' && (
                                <button
                                    onClick={() => handleOpenActionModal('cancel')}
                                    className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-md"
                                    disabled={processing}
                                >
                                    Hủy đơn hàng
                                </button>
                            )}
                            {getNextStatusText(order.status) && (
                                <button
                                    onClick={() => handleOpenActionModal('update')}
                                    className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md"
                                    disabled={processing}
                                >
                                    {getNextStatusText(order.status)}
                                </button>
                            )}
                        </>
                    )}
                    <button
                        onClick={() => navigate('/admin/orders')}
                        className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                    >
                        Quay lại
                    </button>
                </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                {/* Order Info */}
                <div className="bg-white p-6 rounded-lg shadow-md col-span-2">
                    <h2 className="text-lg font-semibold mb-4 pb-2 border-b">Thông tin đơn hàng</h2>
                    
                    <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                            <p className="text-sm text-gray-500">Mã đơn hàng</p>
                            <p className="font-medium">#{order.order_id}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Trạng thái</p>
                            <span className={`px-3 py-1 text-xs font-semibold rounded-full inline-block ${getStatusClass(order.status)}`}>
                                {getStatusText(order.status)}
                            </span>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Ngày đặt hàng</p>
                            <p>{formatDate(order.orderDate)}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Ngày giao dự kiến</p>
                            <p>{formatDate(order.estimatedDelivery)}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Phương thức thanh toán</p>
                            <p>{order.payment_method === 'COD' ? 'Thanh toán khi nhận hàng (COD)' : order.payment_method}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Tổng tiền</p>
                            <p className="font-bold text-lg">{formatCurrency(order.totalAmount)}</p>
                        </div>
                    </div>
                    
                    {order.status === 'cancelled' && order.cancellationReason && (
                        <div className="mt-4 p-3 bg-red-50 rounded-md">
                            <p className="text-sm font-medium text-red-800">Lý do hủy:</p>
                            <p className="text-red-700">{order.cancellationReason}</p>
                            {order.cancelledAt && (
                                <p className="text-xs text-red-600 mt-1">Thời gian hủy: {formatDate(order.cancelledAt)}</p>
                            )}
                        </div>
                    )}
                </div>
                
                {/* Customer Info */}
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h2 className="text-lg font-semibold mb-4 pb-2 border-b">Thông tin khách hàng</h2>
                    <div className="space-y-3">
                        <div>
                            <p className="text-sm text-gray-500">Tên khách hàng</p>
                            <p className="font-medium">{order.user_name}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Số điện thoại</p>
                            <p>{order.phone}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Địa chỉ giao hàng</p>
                            <p>{order.address}</p>
                        </div>
                    </div>
                </div>
            </div>
            
            {/* Order Items */}
            <div className="bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-lg font-semibold mb-4 pb-2 border-b">Sản phẩm đặt mua</h2>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead>
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Sản phẩm</th>
                                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Số lượng</th>
                                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Đơn giá</th>
                                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Thành tiền</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {order.items.map((item, index) => (
                                <tr key={item._id || index}>
                                    <td className="px-4 py-4">
                                        <div className="flex items-center">
                                            <img 
                                                src={item.image} 
                                                alt={item.product_name}
                                                className="h-16 w-16 object-cover rounded-md mr-4"
                                            />
                                            <div>
                                                <p className="font-medium">{item.product_name}</p>
                                                <p className="text-sm text-gray-500">
                                                    Size: {item.size}, Màu: {item.color}
                                                </p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-4 py-4 text-center">{item.quantity}</td>
                                    <td className="px-4 py-4 text-right">{formatCurrency(item.price)}</td>
                                    <td className="px-4 py-4 text-right font-medium">{formatCurrency(item.price * item.quantity)}</td>
                                </tr>
                            ))}
                        </tbody>
                        <tfoot>
                            <tr className="bg-gray-50">
                                <td colSpan={3} className="px-4 py-3 text-right font-medium">Tổng cộng:</td>
                                <td className="px-4 py-3 text-right font-bold">{formatCurrency(order.totalAmount)}</td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
            </div>
            
            {/* Activity Log */}
            {(order.createdAt || order.updatedAt) && (
                <div className="bg-white p-6 rounded-lg shadow-md mt-6">
                    <h2 className="text-lg font-semibold mb-4 pb-2 border-b">Nhật ký đơn hàng</h2>
                    <div className="space-y-3">
                        {order.createdAt && (
                            <div className="flex items-center">
                                <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center mr-3">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-600" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <div>
                                    <p className="text-sm font-medium">Đơn hàng được tạo</p>
                                    <p className="text-xs text-gray-500">{formatDate(order.createdAt)}</p>
                                </div>
                            </div>
                        )}
                        {order.updatedAt && order.updatedAt !== order.createdAt && (
                            <div className="flex items-center">
                                <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-blue-600" viewBox="0 0 20 20" fill="currentColor">
                                        <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                                    </svg>
                                </div>
                                <div>
                                    <p className="text-sm font-medium">Đơn hàng được cập nhật</p>
                                    <p className="text-xs text-gray-500">{formatDate(order.updatedAt)}</p>
                                </div>
                            </div>
                        )}
                        {order.cancelledAt && (
                            <div className="flex items-center">
                                <div className="h-8 w-8 rounded-full bg-red-100 flex items-center justify-center mr-3">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-red-600" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <div>
                                    <p className="text-sm font-medium">Đơn hàng đã bị hủy</p>
                                    <p className="text-xs text-gray-500">{formatDate(order.cancelledAt)}</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
            
            {/* Action Modal */}
            {showActionModal && (
                <div className="fixed inset-0 bg-black/40 bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full">
                        <h3 className="text-xl font-semibold mb-4">
                            {actionType === 'cancel' ? 'Xác nhận hủy đơn hàng' : `Cập nhật trạng thái đơn hàng`}
                        </h3>
                        
                        {actionType === 'cancel' ? (
                            <div className="mb-4">
                                <label className="block text-gray-700 text-sm font-bold mb-2">
                                    Lý do hủy đơn hàng
                                </label>
                                <textarea 
                                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                    value={cancellationReason}
                                    onChange={(e) => setCancellationReason(e.target.value)}
                                    rows={3}
                                    placeholder="Nhập lý do hủy đơn hàng..."
                                    required
                                />
                                {!cancellationReason.trim() && (
                                    <p className="text-red-500 text-xs italic mt-1">Vui lòng nhập lý do hủy đơn hàng</p>
                                )}
                            </div>
                        ) : (
                            <p className="mb-4">
                                Bạn có chắc chắn muốn cập nhật trạng thái đơn hàng từ 
                                <span className="font-medium"> {getStatusText(order.status)} </span> 
                                sang 
                                <span className="font-medium"> {getStatusText(getNextStatus(order.status) || '')} </span>?
                            </p>
                        )}
                        
                        <div className="flex justify-end space-x-2">
                            <button
                                onClick={() => {
                                    setShowActionModal(false);
                                    setActionType('');
                                    setCancellationReason('');
                                }}
                                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-md"
                            >
                                Hủy bỏ
                            </button>
                            <button
                                onClick={handleUpdateStatus}
                                className={`px-4 py-2 text-white rounded-md ${actionType === 'cancel' ? 'bg-red-500 hover:bg-red-600' : 'bg-blue-500 hover:bg-blue-600'}`}
                                disabled={processing || (actionType === 'cancel' && !cancellationReason.trim())}
                            >
                                {processing ? 'Đang xử lý...' : 'Xác nhận'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default OrderDetail;