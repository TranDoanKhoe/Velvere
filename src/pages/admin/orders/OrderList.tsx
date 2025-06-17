import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ScrollToTop from '../../../component/ScrollToTop';
import * as XLSX from 'xlsx';

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
}

const OrderList: React.FC = () => {
    const navigate = useNavigate();
    const [orders, setOrders] = useState<Order[]>([]);
    const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [dateFilter, setDateFilter] = useState<string>('');
    const [searchQuery, setSearchQuery] = useState<string>('');

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                setLoading(true);
                const apiBaseUrl =
                    import.meta.env.VITE_API_BASE_URL ||
                    'http://localhost:3000';
                console.log('API URL:', `${apiBaseUrl}/api/orders/all`);

                const response = await fetch(`${apiBaseUrl}/api/orders/all`, {
                    credentials: 'include',
                });

                if (!response.ok) {
                    throw new Error(
                        `Không thể tải danh sách đơn hàng: ${response.status} ${response.statusText}`,
                    );
                }

                const data = await response.json();
                console.log('Raw data from API:', data);

                let ordersList: Order[] = [];

                if (Array.isArray(data)) {
                    console.log('Data is an array');
                    ordersList = data;
                } else if (data.orders && Array.isArray(data.orders)) {
                    console.log('Data contains orders array');
                    ordersList = data.orders;
                } else if (data.data && Array.isArray(data.data)) {
                    console.log('Data is wrapped in data property');
                    ordersList = data.data;
                } else {
                    console.error(
                        'Không thể xác định cấu trúc dữ liệu đơn hàng:',
                        data,
                    );
                }

                console.log('Processed orders list:', ordersList);

                if (ordersList.length > 0) {
                    const sampleOrder = ordersList[0];
                    console.log('Sample order structure:', sampleOrder);
                }

                setOrders(ordersList);
                setFilteredOrders(ordersList);
                setLoading(false);
            } catch (err) {
                console.error('Lỗi khi tải danh sách đơn hàng:', err);
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
        let result = [...orders];

        if (statusFilter !== 'all') {
            result = result.filter((order) => order.status === statusFilter);
        }

        if (dateFilter) {
            const filterDate = new Date(dateFilter);
            result = result.filter((order) => {
                const orderDate = new Date(order.orderDate);
                return orderDate.toDateString() === filterDate.toDateString();
            });
        }

        if (searchQuery) {
            result = result.filter(
                (order) =>
                    (order.user_name &&
                        order.user_name
                            .toLowerCase()
                            .includes(searchQuery.toLowerCase())) ||
                    (order.order_id &&
                        order.order_id.toString().includes(searchQuery)) ||
                    (order.phone && order.phone.includes(searchQuery)),
            );
        }

        setFilteredOrders(result);
    }, [orders, statusFilter, dateFilter, searchQuery]);

    const handleExportExcel = () => {
        try {
            // Chuẩn bị dữ liệu để xuất Excel
            const excelData = filteredOrders.map((order) => {
                return {
                    'Mã đơn hàng': `#${order.order_id || ''}`,
                    'Khách hàng': order.user_name || 'Không xác định',
                    'Số điện thoại': order.phone || '',
                    'Ngày đặt': formatDate(order.orderDate),
                    'Tổng tiền': order.totalAmount
                        ? order.totalAmount.toLocaleString('vi-VN') + ' đ'
                        : '0 đ',
                    'Trạng thái': getStatusText(order.status),
                    'Địa chỉ': order.address || '',
                    'Phương thức thanh toán': order.payment_method || '',
                    'Ngày giao hàng dự kiến': formatDate(
                        order.estimatedDelivery,
                    ),
                };
            }); // Tạo một workbook mới

            const worksheet = XLSX.utils.json_to_sheet(excelData);
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(
                workbook,
                worksheet,
                'Danh sách đơn hàng',
            ); // Điều chỉnh độ rộng cột

            const maxWidth = excelData.reduce<Record<string, number>>(
                (acc, row) => {
                    Object.keys(row).forEach((k) => {
                        // Ensure row[k] is treated as a string before accessing length
                        const length = String(
                            (row as Record<string, string>)[k] || '',
                        ).length;
                        acc[k] = Math.max(acc[k] || 0, length);
                    });
                    return acc;
                },
                {} as Record<string, number>,
            ); // <--- Explicitly type the initial value

            worksheet['!cols'] = Object.keys(maxWidth).map((key) => ({
                wch: maxWidth[key] + 5,
            })); // Tạo tên file có thời gian hiện tại

            const dateStr = new Date()
                .toISOString()
                .replace(/[:.]/g, '-')
                .slice(0, 19);
            const fileName = `danh_sach_don_hang_${dateStr}.xlsx`; // Xuất file

            XLSX.writeFile(workbook, fileName); // Thông báo thành công

            alert('Xuất Excel thành công!');
        } catch (error) {
            console.error('Lỗi khi xuất Excel:', error);
            alert('Có lỗi xảy ra khi xuất Excel!');
        }
    };

    const formatDate = (dateString: string | null | undefined) => {
        if (!dateString) return 'Không xác định';

        try {
            const date = new Date(dateString);

            if (isNaN(date.getTime())) {
                console.warn('Định dạng ngày không hợp lệ:', dateString);
                return 'Không xác định';
            }

            return new Intl.DateTimeFormat('vi-VN', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
            }).format(date);
        } catch (error) {
            console.error('Lỗi khi định dạng ngày tháng:', dateString, error);
            return 'Không xác định';
        }
    };

    const formatCurrency = (amount: number | null | undefined) => {
        if (amount === null || amount === undefined || isNaN(amount)) {
            console.warn('Giá trị tiền không hợp lệ:', amount);
            return '0 ₫';
        }

        try {
            return new Intl.NumberFormat('vi-VN', {
                style: 'currency',
                currency: 'VND',
            }).format(amount);
        } catch (error) {
            console.error('Lỗi khi định dạng tiền tệ:', amount, error);
            return '0 ₫';
        }
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

    return (
        <div className="container mx-auto px-4 py-8">
            <ScrollToTop />
            <h1 className="text-4xl text-center mt-10 font-serif mb-6">Quản lý đơn hàng</h1>

            <div className="bg-white p-4 rounded-lg shadow-md mb-6">
                <h2 className="text-xl font-semibold mb-4">Bộ lọc</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Trạng thái đơn hàng
                        </label>
                        <select
                            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                        >
                            <option value="all">Tất cả trạng thái</option>
                            <option value="pending">Chờ duyệt</option>
                            <option value="confirmed">Đã duyệt</option>
                            <option value="shipping">Đang giao</option>
                            <option value="delivered">Đã giao</option>
                            <option value="cancelled">Đã hủy</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Ngày đặt hàng
                        </label>
                        <input
                            type="date"
                            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={dateFilter}
                            onChange={(e) => setDateFilter(e.target.value)}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Tìm kiếm
                        </label>
                        <input
                            type="text"
                            placeholder="Tên khách hàng, số điện thoại hoặc mã đơn hàng"
                            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>

                <div className="mt-4 flex justify-end">
                    <button
                        onClick={() => {
                            setStatusFilter('all');
                            setDateFilter('');
                            setSearchQuery('');
                        }}
                        className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-md mr-2"
                    >
                        Làm Mới
                    </button>

                    <button
                        onClick={handleExportExcel}
                        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md"
                    >
                        Xuất Excel
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-lg shadow-md overflow-hidden">
                {loading ? (
                    <div className="p-8 text-center">
                        <div
                            className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent text-blue-600 motion-reduce:animate-[spin_1.5s_linear_infinite]"
                            role="status"
                        >
                            <span className="sr-only">Đang tải...</span>
                        </div>
                        <p className="mt-2">Đang tải dữ liệu...</p>
                    </div>
                ) : error ? (
                    <div className="p-8 text-center text-red-500">
                        <p>{error}</p>
                        <button
                            onClick={() => window.location.reload()}
                            className="mt-4 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md"
                        >
                            Thử lại
                        </button>
                    </div>
                ) : filteredOrders.length === 0 ? (
                    <div className="p-8 text-center text-gray-500">
                        <p>Không tìm thấy đơn hàng nào phù hợp với bộ lọc.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 table-fixed">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th
                                        scope="col"
                                        className="w-1/6 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sticky top-0 bg-gray-50"
                                    >
                                        Mã đơn hàng
                                    </th>
                                    <th
                                        scope="col"
                                        className="w-1/5 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sticky top-0 bg-gray-50"
                                    >
                                        Khách hàng
                                    </th>
                                    <th
                                        scope="col"
                                        className="w-1/6 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sticky top-0 bg-gray-50"
                                    >
                                        Ngày đặt
                                    </th>
                                    <th
                                        scope="col"
                                        className="w-1/6 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sticky top-0 bg-gray-50"
                                    >
                                        Tổng tiền
                                    </th>
                                    <th
                                        scope="col"
                                        className="w-1/6 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sticky top-0 bg-gray-50"
                                    >
                                        Trạng thái
                                    </th>
                                    <th
                                        scope="col"
                                        className="w-1/6 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sticky top-0 bg-gray-50"
                                    >
                                        Hành động
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {filteredOrders.map((order) => (
                                    <tr
                                        key={order._id}
                                        className="hover:bg-gray-50 transition-colors"
                                    >
                                        <td className="px-6 py-4 whitespace-nowrap w-1/6">
                                            <div className="text-sm font-medium text-gray-900">
                                                {order.order_id
                                                    ? `#${order.order_id}`
                                                    : '#'}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap w-1/5">
                                            <div className="text-sm text-gray-900">
                                                {order.user_name ||
                                                    'Không xác định'}
                                            </div>
                                            <div className="text-xs text-gray-500">
                                                {order.phone || ''}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap w-1/6">
                                            <div className="text-sm text-gray-500">
                                                {formatDate(order.orderDate)}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap w-1/6">
                                            <div className="text-sm font-semibold text-gray-900">
                                                {formatCurrency(
                                                    order.totalAmount,
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap w-1/6">
                                            <span
                                                className={`px-3 py-1 text-xs font-semibold rounded-full ${getStatusClass(
                                                    order.status || '',
                                                )}`}
                                            >
                                                {getStatusText(order.status)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium w-1/6">
                                            <button
                                                onClick={() =>
                                                    navigate(
                                                        `/admin/orders/${order._id}`,
                                                    )
                                                }
                                                className="text-blue-600 hover:text-blue-900 mr-3"
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
            </div>
        </div>
    );
};

export default OrderList;
