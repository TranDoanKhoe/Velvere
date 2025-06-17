/* eslint-disable */
import { useState, useEffect } from 'react';
import {
    BarChart,
    Bar,
    PieChart,
    Pie,
    Cell,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from 'recharts';
import { FileSpreadsheet, FileText, Search, Loader2 } from 'lucide-react';
import { Button } from '../../../components_bonus/my-button/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '../../../components_bonus/my-card/components/ui/card';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '../../../components_bonus/my-select/components/ui/select';
import { Input } from '../../../components_bonus/my-input/components/ui/input';
import * as XLSX from 'xlsx';
import pdfMake from 'pdfmake/build/pdfmake';

// Đăng ký fonts mặc định
pdfMake.vfs = pdfMake.vfs;

const COLORS = [
    '#0088FE',
    '#00C49F',
    '#FFBB28',
    '#FF8042',
    '#8884D8',
    '#82CA9D',
    '#FFC658',
    '#8DD1E1',
    '#A4DE6C',
    '#D0ED57',
];

const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
    }).format(value);
};

export default function BestSellingPage() {
    const [products, setProducts] = useState([]);
    interface Product {
        id: number;
        name: string;
        category: string;
        price: number;
        sold: number;
        revenue: number;
        stock: number;
        image?: string;
    }

    const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
    const [categoryData, setCategoryData] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('all');
    const [timeRange, setTimeRange] = useState('month');
    const [isLoading, setIsLoading] = useState(false);
    const [, setError] = useState<string | null>(null);
    const [summary, setSummary] = useState({
        totalProducts: 0,
        totalSold: 0,
        totalRevenue: 0,
        totalCategories: 0,
    });

    // Top 10 products for charts
    const top10Products = products.slice(0, 10);

    const fetchProductData = async () => {
        setIsLoading(true);
        setError(null);

        try {
            // Build query parameters
            const params = new URLSearchParams();
            params.append('timeRange', timeRange);

            if (categoryFilter !== 'all') {
                params.append('category', categoryFilter);
            }

            if (searchTerm) {
                params.append('search', searchTerm);
            }
            const apiBaseUrl =
                import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
            const response = await fetch(
                `${apiBaseUrl}/api/products/best-selling?${params.toString()}`,
            );

            if (!response.ok) {
                throw new Error('Failed to fetch product data');
            }

            const result = await response.json();

            setProducts(result.products);
            setFilteredProducts(result.products);
            setCategoryData(result.categories);
            setSummary(result.summary);
        } catch (err) {
            console.error('Error fetching product data:', err);
            setError('Failed to load product data. Please try again later.');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchProductData();
    }, [timeRange]);

    useEffect(() => {
        let result = products;

        // Apply search filter
        if (searchTerm) {
            result = result.filter(
                (p: any) =>
                    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    p.id
                        .toString()
                        .toLowerCase()
                        .includes(searchTerm.toLowerCase()),
            );
        }

        // Apply category filter
        if (categoryFilter !== 'all') {
            result = result.filter((p: any) => p.category === categoryFilter);
        }

        setFilteredProducts(result);
    }, [searchTerm, categoryFilter, products]);

    const handleSearch = () => {
        fetchProductData();
    };

    const exportToPDF = () => {
        // Định nghĩa màu sắc
        const colors = {
            primary: '#1e3a8a', // Xanh navy đậm
            secondary: '#0ea5e9', // Xanh dương nhạt
            accent: '#f59e0b', // Cam vàng
            success: '#10b981', // Xanh lá
            danger: '#ef4444', // Đỏ
            warning: '#f97316', // Cam
            dark: '#1e293b', // Xám đen
            light: '#f8fafc', // Trắng xám
            muted: '#64748b', // Xám trung tính
            border: '#f1f5f9', // Xám nhạt cho viền
        };

        // Định nghĩa period
        const period =
            timeRange === 'week'
                ? 'Tuần'
                : timeRange === 'month'
                ? 'Tháng'
                : 'Năm';

        // Lấy ngày hiện tại
        const today = new Date().toLocaleDateString('vi-VN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });

        // Tạo mã báo cáo
        const reportCode = `BC-${Math.floor(Math.random() * 9000) + 1000}`;

        // Sắp xếp sản phẩm theo số lượng đã bán giảm dần
        const sortedProducts = [...filteredProducts].sort(
            (a, b) => b.sold - a.sold,
        );

        // Tính toán tổng doanh thu và số lượng đã bán
        let totalRevenue = 0;
        let totalSold = 0;
        let bestSellingProduct = { name: '', sold: 0, revenue: 0 };
        let bestRevenueProduct = { name: '', sold: 0, revenue: 0 };

        // Nếu có sản phẩm, lấy sản phẩm bán chạy nhất làm bestSellingProduct
        if (sortedProducts.length > 0) {
            bestSellingProduct = {
                name: sortedProducts[0].name,
                sold: sortedProducts[0].sold,
                revenue: sortedProducts[0].revenue,
            };
        }

        // Tính toán các thống kê khác
        sortedProducts.forEach((product) => {
            totalRevenue += product.revenue;
            totalSold += product.sold;

            // Tìm sản phẩm bán chạy nhất (số lượng)
            // Tìm sản phẩm có doanh thu cao nhất
            if (product.revenue > bestRevenueProduct.revenue) {
                bestRevenueProduct = {
                    name: product.name,
                    sold: product.sold,
                    revenue: product.revenue,
                };
            }
        });

        // Lấy top 20 sản phẩm bán chạy nhất (đã được sắp xếp theo số lượng bán)
        const top10Products = sortedProducts.slice(0, 10);

        // Tính phân bố danh mục
        const categoryDistribution: Record<
            string,
            { count: number; revenue: number }
        > = {};
        sortedProducts.forEach((product) => {
            if (!categoryDistribution[product.category]) {
                categoryDistribution[product.category] = {
                    count: 0,
                    revenue: 0,
                };
            }
            categoryDistribution[product.category].count += 1;
            categoryDistribution[product.category].revenue += product.revenue;
        });

        // Lấy top 5 danh mục theo doanh thu
        const topCategories = Object.entries(categoryDistribution)
            .map(([name, data]) => ({
                name,
                count: data.count,
                revenue: data.revenue,
            }))
            .sort((a, b) => b.revenue - a.revenue)
            .slice(0, 5);

        // Tạo dữ liệu cho bảng
        const tableBody = top10Products.map((product, index) => {
            // Xác định xu hướng (giả định)
            const trendIndex = index % 3;

            let trendSymbol = '';
            let trendColor = '';

            switch (trendIndex) {
                case 0:
                    trendSymbol = 'Tăng'; // Tăng
                    trendColor = colors.success;
                    break;
                case 1:
                    trendSymbol = 'Giảm'; // Giảm
                    trendColor = colors.danger;
                    break;
                default:
                    trendSymbol = 'Không'; // Không đổi
                    trendColor = colors.muted;
                    break;
            }

            // Xác định màu cho top 3
            let rankStyle = {};
            if (index < 3) {
                const rankColors = [colors.accent, '#94a3b8', '#d97706']; // Gold, Silver, Bronze
                rankStyle = {
                    text: (index + 1).toString(),
                    fillColor: rankColors[index],
                    color: index === 0 ? colors.dark : 'white',
                    bold: true,
                    alignment: 'center',
                };
            } else {
                rankStyle = {
                    text: (index + 1).toString(),
                    color: colors.muted,
                    alignment: 'center',
                };
            }

            // Cắt ngắn tên sản phẩm dài
            const productName =
                product.name.length > 35
                    ? product.name.substring(0, 32) + '...'
                    : product.name;

            return [
                rankStyle,
                { text: product.id.toString(), alignment: 'center' },
                { text: productName },
                { text: product.category },
                { text: product.sold.toString(), alignment: 'right' },
                { text: formatCurrency(product.revenue), alignment: 'right' },
                {
                    text: trendSymbol,
                    color: trendColor,
                    alignment: 'center',
                    bold: true,
                },
            ];
        });

        // Thêm header vào bảng
        tableBody.unshift([
            { text: '#', style: 'tableHeader', alignment: 'center' },
            { text: 'Mã SP', style: 'tableHeader', alignment: 'center' },
            { text: 'Tên sản phẩm', style: 'tableHeader' },
            { text: 'Danh mục', style: 'tableHeader' },
            { text: 'Đã bán', style: 'tableHeader', alignment: 'right' },
            { text: 'Doanh thu', style: 'tableHeader', alignment: 'right' },
            { text: 'Xu hướng', style: 'tableHeader', alignment: 'center' },
        ]);

        // Định nghĩa document
        const docDefinition = {
            pageSize: 'A4',
            pageOrientation: 'landscape',
            pageMargins: [30, 100, 30, 60],

            // Định nghĩa fonts
            defaultStyle: {
                font: 'Roboto',
            },

            // Định nghĩa header

            header: function (_: any) {
                return {
                    stack: [
                        // Nền header
                        {
                            canvas: [
                                {
                                    type: 'rect',
                                    x: 0,
                                    y: 0,
                                    w: 842,
                                    h: 80,
                                    color: colors.primary,
                                },
                                {
                                    type: 'rect',
                                    x: 0,
                                    y: 80,
                                    w: 842,
                                    h: 4,
                                    color: colors.secondary,
                                },
                            ],
                        },

                        // Logo và tiêu đề
                        {
                            columns: [
                                // Logo placeholder
                                {
                                    stack: [
                                        {
                                            text: 'LOGO',
                                            color: 'white',
                                            fontSize: 20,
                                            bold: true,
                                            alignment: 'center',
                                            margin: [0, 25, 0, 0],
                                        },
                                    ],
                                    width: 100,
                                },

                                // Tiêu đề báo cáo
                                {
                                    stack: [
                                        {
                                            text: 'BÁO CÁO SẢN PHẨM BÁN CHẠY',
                                            color: 'white',
                                            fontSize: 22,
                                            bold: true,
                                            alignment: 'center',
                                            margin: [0, 20, 0, 0],
                                        },
                                        {
                                            text: `Thống kê theo ${period.toUpperCase()}`,
                                            color: 'white',
                                            fontSize: 14,
                                            alignment: 'center',
                                            margin: [0, 5, 0, 0],
                                        },
                                    ],
                                    width: '*',
                                },

                                // Thông tin báo cáo
                                {
                                    stack: [
                                        {
                                            canvas: [
                                                {
                                                    type: 'rect',
                                                    x: 0,
                                                    y: 0,
                                                    w: 150,
                                                    h: 60,
                                                    r: 4,
                                                    color: 'white',
                                                    shadowOffsetX: 1,
                                                    shadowOffsetY: 1,
                                                    shadowBlur: 4,
                                                    shadowColor:
                                                        'rgba(0, 0, 0, 0.3)',
                                                },
                                            ],
                                            margin: [0, 10, 20, 0],
                                        },
                                        {
                                            columns: [
                                                {
                                                    stack: [
                                                        {
                                                            text: 'Ngày báo cáo:',
                                                            fontSize: 9,
                                                            color: colors.dark,
                                                            margin: [
                                                                10, -50, 0, 0,
                                                            ],
                                                        },
                                                        {
                                                            text: today,
                                                            fontSize: 10,
                                                            bold: true,
                                                            color: colors.primary,
                                                            margin: [
                                                                10, 2, 0, 0,
                                                            ],
                                                        },
                                                        {
                                                            text: 'Mã báo cáo:',
                                                            fontSize: 9,
                                                            color: colors.dark,
                                                            margin: [
                                                                10, 5, 0, 0,
                                                            ],
                                                        },
                                                        {
                                                            text: reportCode,
                                                            fontSize: 10,
                                                            bold: true,
                                                            color: colors.primary,
                                                            margin: [
                                                                10, 2, 0, 0,
                                                            ],
                                                        },
                                                    ],
                                                    width: '*',
                                                },
                                            ],
                                            margin: [0, 0, 20, 0],
                                        },
                                    ],
                                    width: 170,
                                },
                            ],
                        },
                    ],
                };
            },
            // Định nghĩa footer

            footer: function (currentPage: any, pageCount: any) {
                return {
                    stack: [
                        {
                            canvas: [
                                {
                                    type: 'rect',
                                    x: 0,
                                    y: 0,
                                    w: 842,
                                    h: 40,
                                    color: colors.primary,
                                },
                            ],
                        },
                        {
                            columns: [
                                {
                                    text: 'CÔNG TY TNHH VÉLVERE',
                                    color: 'white',
                                    fontSize: 10,
                                    bold: true,
                                    margin: [30, -30, 0, 0],
                                },
                                {
                                    text: 'Địa chỉ: 123 Đường Lê Lợi, Quận 1, TP.HCM | +84 283861410 | welcome@velveremail.com',
                                    color: 'white',
                                    fontSize: 8,
                                    alignment: 'center',
                                    margin: [0, -30, 0, 0],
                                },
                                {
                                    text: `Trang ${currentPage}/${pageCount}`,
                                    color: 'white',
                                    fontSize: 8,
                                    alignment: 'right',
                                    margin: [0, -30, 30, 0],
                                },
                            ],
                        },
                    ],
                };
            },

            // Nội dung chính
            content: [
                // Phần tóm tắt
                {
                    columns: [
                        // Tổng quan
                        {
                            stack: [
                                {
                                    text: 'TỔNG QUAN',
                                    fontSize: 14,
                                    bold: true,
                                    color: colors.primary,
                                    margin: [0, 0, 0, 10],
                                },
                                {
                                    canvas: [
                                        {
                                            type: 'rect',
                                            x: 0,
                                            y: 0,
                                            w: 250,
                                            h: 1,
                                            color: colors.border,
                                        },
                                    ],
                                    margin: [0, 0, 0, 10],
                                },

                                // Thẻ tổng quan
                                {
                                    columns: [
                                        // Biểu tượng
                                        {
                                            stack: [
                                                {
                                                    canvas: [
                                                        {
                                                            type: 'rect',
                                                            x: 0,
                                                            y: 0,
                                                            w: 40,
                                                            h: 40,
                                                            r: 20,
                                                            color: colors.primary,
                                                        },
                                                    ],
                                                },
                                            ],
                                            width: 40,
                                        },

                                        // Thông tin
                                        {
                                            stack: [
                                                {
                                                    text: 'Tổng sản phẩm',
                                                    fontSize: 10,
                                                    color: colors.muted,
                                                },
                                                {
                                                    text: sortedProducts.length.toString(),
                                                    fontSize: 18,
                                                    bold: true,
                                                    color: colors.primary,
                                                },
                                            ],
                                            margin: [10, 0, 0, 0],
                                            width: '*',
                                        },
                                    ],
                                    margin: [0, 0, 0, 15],
                                },

                                // Thẻ đã bán
                                {
                                    columns: [
                                        // Biểu tượng
                                        {
                                            stack: [
                                                {
                                                    canvas: [
                                                        {
                                                            type: 'rect',
                                                            x: 0,
                                                            y: 0,
                                                            w: 40,
                                                            h: 40,
                                                            r: 20,
                                                            color: colors.secondary,
                                                        },
                                                    ],
                                                },
                                            ],
                                            width: 40,
                                        },

                                        // Thông tin
                                        {
                                            stack: [
                                                {
                                                    text: 'Tổng đã bán',
                                                    fontSize: 10,
                                                    color: colors.muted,
                                                },
                                                {
                                                    text:
                                                        totalSold.toString() +
                                                        ' sản phẩm',
                                                    fontSize: 18,
                                                    bold: true,
                                                    color: colors.secondary,
                                                },
                                            ],
                                            margin: [10, 0, 0, 0],
                                            width: '*',
                                        },
                                    ],
                                    margin: [0, 0, 0, 15],
                                },

                                // Thẻ doanh thu
                                {
                                    columns: [
                                        // Biểu tượng
                                        {
                                            stack: [
                                                {
                                                    canvas: [
                                                        {
                                                            type: 'rect',
                                                            x: 0,
                                                            y: 0,
                                                            w: 40,
                                                            h: 40,
                                                            r: 20,
                                                            color: colors.success,
                                                        },
                                                    ],
                                                },
                                            ],
                                            width: 40,
                                        },

                                        // Thông tin
                                        {
                                            stack: [
                                                {
                                                    text: 'Tổng doanh thu',
                                                    fontSize: 10,
                                                    color: colors.muted,
                                                },
                                                {
                                                    text: formatCurrency(
                                                        totalRevenue,
                                                    ),
                                                    fontSize: 18,
                                                    bold: true,
                                                    color: colors.success,
                                                },
                                            ],
                                            margin: [10, 0, 0, 0],
                                            width: '*',
                                        },
                                    ],
                                    margin: [0, 0, 0, 0],
                                },
                            ],
                            width: 250,
                            margin: [0, 0, 20, 0],
                        },

                        // Sản phẩm nổi bật
                        {
                            stack: [
                                {
                                    text: 'SẢN PHẨM NỔI BẬT',
                                    fontSize: 14,
                                    bold: true,
                                    color: colors.primary,
                                    margin: [0, 0, 0, 10],
                                },
                                {
                                    canvas: [
                                        {
                                            type: 'rect',
                                            x: 0,
                                            y: 0,
                                            w: 250,
                                            h: 1,
                                            color: colors.border,
                                        },
                                    ],
                                    margin: [0, 0, 0, 10],
                                },

                                // Sản phẩm bán chạy nhất
                                {
                                    stack: [
                                        {
                                            canvas: [
                                                {
                                                    type: 'rect',
                                                    x: 0,
                                                    y: 0,
                                                    w: 250,
                                                    h: 60,
                                                    r: 4,
                                                    color: colors.light,
                                                    shadowOffsetX: 1,
                                                    shadowOffsetY: 1,
                                                    shadowBlur: 3,
                                                    shadowColor:
                                                        'rgba(0, 0, 0, 0.1)',
                                                },
                                                {
                                                    type: 'rect',
                                                    x: 0,
                                                    y: 0,
                                                    w: 5,
                                                    h: 60,
                                                    color: colors.accent,
                                                },
                                            ],
                                        },
                                        {
                                            columns: [
                                                {
                                                    stack: [
                                                        {
                                                            text: 'Bán chạy nhất',
                                                            fontSize: 9,
                                                            color: colors.muted,
                                                            margin: [
                                                                15, -50, 0, 0,
                                                            ],
                                                        },
                                                        {
                                                            text:
                                                                bestSellingProduct
                                                                    .name
                                                                    .length > 25
                                                                    ? bestSellingProduct.name.substring(
                                                                          0,
                                                                          22,
                                                                      ) + '...'
                                                                    : bestSellingProduct.name,
                                                            fontSize: 12,
                                                            bold: true,
                                                            color: colors.dark,
                                                            margin: [
                                                                15, 2, 0, 0,
                                                            ],
                                                        },
                                                        {
                                                            columns: [
                                                                {
                                                                    text: `${bestSellingProduct.sold} sản phẩm`,
                                                                    fontSize: 10,
                                                                    color: colors.accent,
                                                                    width: '*',
                                                                },
                                                                {
                                                                    text: formatCurrency(
                                                                        bestSellingProduct.revenue,
                                                                    ),
                                                                    fontSize: 10,
                                                                    color: colors.success,
                                                                    alignment:
                                                                        'right',
                                                                    width: '*',
                                                                },
                                                            ],
                                                            margin: [
                                                                15, 5, 15, 0,
                                                            ],
                                                        },
                                                    ],
                                                    width: '*',
                                                },
                                            ],
                                        },
                                    ],
                                    margin: [0, 0, 0, 15],
                                },

                                // Sản phẩm doanh thu cao nhất
                                {
                                    stack: [
                                        {
                                            canvas: [
                                                {
                                                    type: 'rect',
                                                    x: 0,
                                                    y: 0,
                                                    w: 250,
                                                    h: 60,
                                                    r: 4,
                                                    color: colors.light,
                                                    shadowOffsetX: 1,
                                                    shadowOffsetY: 1,
                                                    shadowBlur: 3,
                                                    shadowColor:
                                                        'rgba(0, 0, 0, 0.1)',
                                                },
                                                {
                                                    type: 'rect',
                                                    x: 0,
                                                    y: 0,
                                                    w: 5,
                                                    h: 60,
                                                    color: colors.success,
                                                },
                                            ],
                                        },
                                        {
                                            columns: [
                                                {
                                                    stack: [
                                                        {
                                                            text: 'Doanh thu cao nhất',
                                                            fontSize: 9,
                                                            color: colors.muted,
                                                            margin: [
                                                                15, -50, 0, 0,
                                                            ],
                                                        },
                                                        {
                                                            text:
                                                                bestRevenueProduct
                                                                    .name
                                                                    .length > 25
                                                                    ? bestRevenueProduct.name.substring(
                                                                          0,
                                                                          22,
                                                                      ) + '...'
                                                                    : bestRevenueProduct.name,
                                                            fontSize: 12,
                                                            bold: true,
                                                            color: colors.dark,
                                                            margin: [
                                                                15, 2, 0, 0,
                                                            ],
                                                        },
                                                        {
                                                            columns: [
                                                                {
                                                                    text: `${bestRevenueProduct.sold} sản phẩm`,
                                                                    fontSize: 10,
                                                                    color: colors.accent,
                                                                    width: '*',
                                                                },
                                                                {
                                                                    text: formatCurrency(
                                                                        bestRevenueProduct.revenue,
                                                                    ),
                                                                    fontSize: 10,
                                                                    color: colors.success,
                                                                    alignment:
                                                                        'right',
                                                                    width: '*',
                                                                },
                                                            ],
                                                            margin: [
                                                                15, 5, 15, 0,
                                                            ],
                                                        },
                                                    ],
                                                    width: '*',
                                                },
                                            ],
                                        },
                                    ],
                                    margin: [0, 0, 0, 0],
                                },
                            ],
                            width: 250,
                            margin: [0, 0, 20, 0],
                        },

                        // Phân bố danh mục
                        {
                            stack: [
                                {
                                    text: 'PHÂN BỐ DANH MỤC',
                                    fontSize: 14,
                                    bold: true,
                                    color: colors.primary,
                                    margin: [0, 0, 0, 10],
                                },
                                {
                                    canvas: [
                                        {
                                            type: 'rect',
                                            x: 0,
                                            y: 0,
                                            w: 250,
                                            h: 1,
                                            color: colors.border,
                                        },
                                    ],
                                    margin: [0, 0, 0, 10],
                                },

                                // Danh mục top 1-5
                                ...topCategories.map((category, index) => {
                                    const categoryColors = [
                                        colors.primary,
                                        colors.secondary,
                                        colors.accent,
                                        colors.success,
                                        colors.warning,
                                    ];

                                    return {
                                        stack: [
                                            {
                                                columns: [
                                                    {
                                                        text:
                                                            category.name
                                                                .length > 20
                                                                ? category.name.substring(
                                                                      0,
                                                                      17,
                                                                  ) + '...'
                                                                : category.name,
                                                        fontSize: 10,
                                                        width: '*',
                                                    },
                                                    {
                                                        text: formatCurrency(
                                                            category.revenue,
                                                        ),
                                                        fontSize: 10,
                                                        alignment: 'right',
                                                        width: 80,
                                                    },
                                                ],
                                                margin: [0, 0, 0, 5],
                                            },
                                            {
                                                canvas: [
                                                    {
                                                        type: 'rect',
                                                        x: 0,
                                                        y: 0,
                                                        w: 250,
                                                        h: 10,
                                                        r: 5,
                                                        color: '#f1f5f9',
                                                    },
                                                    {
                                                        type: 'rect',
                                                        x: 0,
                                                        y: 0,
                                                        w: Math.min(
                                                            250 *
                                                                (category.revenue /
                                                                    topCategories[0]
                                                                        .revenue),
                                                            250,
                                                        ),
                                                        h: 10,
                                                        r: 5,
                                                        color: categoryColors[
                                                            index
                                                        ],
                                                    },
                                                ],
                                            },
                                        ],
                                        margin: [0, 0, 0, 15],
                                    };
                                }),
                            ],
                            width: 250,
                        },
                    ],
                    margin: [0, 0, 0, 20],
                },

                // Bảng sản phẩm
                {
                    stack: [
                        {
                            text: 'DANH SÁCH SẢN PHẨM BÁN CHẠY (TOP 10 THEO SỐ LƯỢNG ĐÃ BÁN)',
                            fontSize: 14,
                            bold: true,
                            color: colors.primary,
                            margin: [0, 10, 0, 10],
                        },
                        {
                            canvas: [
                                {
                                    type: 'rect',
                                    x: 0,
                                    y: 0,
                                    w: 780,
                                    h: 1,
                                    color: colors.border,
                                },
                            ],
                            margin: [0, 0, 0, 10],
                        },
                        {
                            table: {
                                headerRows: 1,
                                widths: [30, 40, '*', 80, 60, 80, 40],
                                body: tableBody,
                            },
                            layout: {
                                fillColor: function (rowIndex: number) {
                                    if (rowIndex === 0) {
                                        return colors.primary;
                                    }
                                    return rowIndex % 2 === 0
                                        ? '#f8fafc'
                                        : null;
                                },
                                hLineWidth: function (
                                    i: number,

                                    node: { table: { body: string | any[] } },
                                ) {
                                    return i === 0 ||
                                        i === node.table.body.length
                                        ? 1
                                        : 0.5;
                                },

                                vLineWidth: function () {
                                    return 0;
                                },

                                hLineColor: function () {
                                    return colors.border;
                                },

                                paddingLeft: function () {
                                    return 8;
                                },

                                paddingRight: function () {
                                    return 8;
                                },

                                paddingTop: function () {
                                    return 6;
                                },

                                paddingBottom: function () {
                                    return 6;
                                },
                            },
                        },
                    ],
                },

                // Chú thích và thông tin bổ sung
                {
                    stack: [
                        {
                            columns: [
                                {
                                    stack: [
                                        {
                                            text: 'Chú thích:',
                                            fontSize: 9,
                                            bold: true,
                                            color: colors.muted,
                                            margin: [0, 15, 0, 5],
                                        },
                                        {
                                            text: 'Tăng trưởng so với kỳ trước',
                                            fontSize: 8,
                                            color: colors.success,
                                            margin: [0, 0, 0, 2],
                                        },
                                        {
                                            text: 'Giảm so với kỳ trước',
                                            fontSize: 8,
                                            color: colors.danger,
                                            margin: [0, 0, 0, 2],
                                        },
                                        {
                                            text: 'Không thay đổi so với kỳ trước',
                                            fontSize: 8,
                                            color: colors.muted,
                                            margin: [0, 0, 0, 0],
                                        },
                                    ],
                                    width: '*',
                                },
                                {
                                    stack: [
                                        {
                                            text: 'Thông tin báo cáo:',
                                            fontSize: 9,
                                            bold: true,
                                            color: colors.muted,
                                            margin: [0, 15, 0, 5],
                                        },
                                        {
                                            text: `• Báo cáo được tạo vào ngày ${today}`,
                                            fontSize: 8,
                                            color: colors.dark,
                                            margin: [0, 0, 0, 2],
                                        },
                                        {
                                            text: `• Dữ liệu được thống kê theo ${period.toLowerCase()}`,
                                            fontSize: 8,
                                            color: colors.dark,
                                            margin: [0, 0, 0, 2],
                                        },
                                        {
                                            text: '• Chỉ hiển thị top 10 sản phẩm có doanh thu cao nhất',
                                            fontSize: 8,
                                            color: colors.dark,
                                            margin: [0, 0, 0, 0],
                                        },
                                    ],
                                    width: '*',
                                },
                            ],
                        },
                    ],
                    margin: [0, 10, 0, 0],
                },

                // Phần chữ ký
                {
                    lignment: 'center',
                    columns: [
                        {
                            stack: [
                                {
                                    text: 'Người lập báo cáo',
                                    fontSize: 10,
                                    alignment: 'left',
                                    margin: [20, 30, 0, 15],
                                },
                                {
                                    canvas: [
                                        {
                                            type: 'line',
                                            x1: 20,
                                            y1: 0,
                                            x2: 100,
                                            y2: 0,
                                            dash: { length: 1 },
                                            lineWidth: 1,
                                            lineColor: colors.muted,
                                        },
                                    ],
                                },
                            ],
                            width: '*',
                        },
                        {
                            stack: [
                                {
                                    text: 'Quản lý bộ phận',
                                    fontSize: 10,
                                    alignment: 'left',
                                    margin: [25, 30, 0, 15],
                                },
                                {
                                    canvas: [
                                        {
                                            type: 'line',
                                            x1: 20,
                                            y1: 0,
                                            x2: 100,
                                            y2: 0,
                                            dash: { length: 1 },
                                            lineWidth: 1,
                                            lineColor: colors.muted,
                                        },
                                    ],
                                },
                            ],
                            width: '*',
                        },
                        {
                            stack: [
                                {
                                    text: 'Giám đốc',
                                    fontSize: 10,
                                    alignment: 'left',
                                    margin: [35, 30, 0, 15],
                                },
                                {
                                    canvas: [
                                        {
                                            type: 'line',
                                            x1: 20,
                                            y1: 0,
                                            x2: 100,
                                            y2: 0,
                                            dash: { length: 1 },
                                            lineWidth: 1,
                                            lineColor: colors.muted,
                                        },
                                    ],
                                },
                            ],
                            width: '*',
                        },
                    ],
                },
            ],

            styles: {
                tableHeader: {
                    bold: true,
                    fontSize: 10,
                    color: 'white',
                },
            },
        };

        // Tạo và tải xuống PDF
        pdfMake
            .createPdf(docDefinition as any)
            .download(`bao-cao-san-pham-ban-chay-${period.toLowerCase()}.pdf`);
    };
    const exportToExcel = () => {
        // Prepare data for export

        const exportData = filteredProducts.map((p: any) => ({
            'Mã SP': p.id,
            'Tên sản phẩm': p.name,
            'Danh mục': p.category,
            'Giá bán': formatCurrency(p.price),
            'Số lượng đã bán': p.sold,
            'Doanh thu': formatCurrency(p.revenue),
            'Tồn kho': p.stock,
        }));

        const worksheet = XLSX.utils.json_to_sheet(exportData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Sản Phẩm Bán Chạy');

        // Add category summary sheet

        const categorySummary = categoryData.map((c: any) => ({
            'Danh mục': c.name,
            'Số lượng đã bán': c.value,
            'Tỷ lệ': `${(
                (c.value /
                    categoryData.reduce(
                        (sum: number, cat: any) => sum + cat.value,
                        0,
                    )) *
                100
            ).toFixed(2)}%`,
        }));
        const categorySheet = XLSX.utils.json_to_sheet(categorySummary);
        XLSX.utils.book_append_sheet(
            workbook,
            categorySheet,
            'Thống Kê Danh Mục',
        );

        // Save the Excel file
        const period =
            timeRange === 'week'
                ? 'tuan'
                : timeRange === 'month'
                ? 'thang'
                : 'nam';
        XLSX.writeFile(workbook, `bao-cao-san-pham-ban-chay-${period}.xlsx`);
    };

    return (
        <div className="container mx-auto py-8">
            <div className="flex mb-6 mt-10 justify-end items-end">
                {/* <h1 className="text-3xl font-bold text-gray-800">
          Sản Phẩm Bán Chạy
        </h1> */}
                <div className="flex space-x-2 ">
                    <Button
                        variant="outline"
                        onClick={exportToPDF}
                        disabled={isLoading || filteredProducts.length === 0}
                    >
                        <FileText className="mr-2 h-4 w-4" />
                        Xuất PDF
                    </Button>
                    <Button
                        variant="outline"
                        onClick={exportToExcel}
                        disabled={isLoading || filteredProducts.length === 0}
                    >
                        <FileSpreadsheet className="mr-2 h-4 w-4" />
                        Xuất Excel
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-gray-500">
                            Tổng Sản Phẩm
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {summary.totalProducts}
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-gray-500">
                            Tổng Đã Bán
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {summary.totalSold}
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-gray-500">
                            Doanh Thu
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {formatCurrency(summary.totalRevenue)}
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-gray-500">
                            Danh Mục
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {summary.totalCategories}
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Top 10 Sản Phẩm Bán Chạy</CardTitle>
                        <CardDescription>Số lượng đã bán</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[400px]">
                        {isLoading ? (
                            <div className="flex justify-center items-center h-full">
                                <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
                            </div>
                        ) : top10Products.length === 0 ? (
                            <div className="flex justify-center items-center h-full text-gray-500">
                                Không có dữ liệu
                            </div>
                        ) : (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart
                                    data={top10Products}
                                    layout="vertical"
                                    margin={{
                                        top: 5,
                                        right: 30,
                                        left: 20,
                                        bottom: 5,
                                    }}
                                >
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis type="number" />
                                    <YAxis
                                        type="category"
                                        dataKey="name"
                                        width={150}
                                        tick={{ fontSize: 12 }}
                                    />
                                    <Tooltip
                                        formatter={(value) => [
                                            `${value} sản phẩm`,
                                            'Đã bán',
                                        ]}
                                    />
                                    <Legend />
                                    <Bar
                                        dataKey="sold"
                                        fill="#8884d8"
                                        name="Số lượng đã bán"
                                    />
                                </BarChart>
                            </ResponsiveContainer>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Phân Bố Theo Danh Mục</CardTitle>
                        <CardDescription>
                            Tỷ lệ sản phẩm bán ra theo danh mục
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="h-[400px]">
                        {isLoading ? (
                            <div className="flex justify-center items-center h-full">
                                <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
                            </div>
                        ) : categoryData.length === 0 ? (
                            <div className="flex justify-center items-center h-full text-gray-500">
                                Không có dữ liệu
                            </div>
                        ) : (
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={categoryData}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={false}
                                        outerRadius={120}
                                        fill="#8884d8"
                                        dataKey="value"
                                        label={({ name, percent }) =>
                                            `${name}: ${(percent * 100).toFixed(
                                                0,
                                            )}%`
                                        }
                                    >
                                        {categoryData.map(
                                            (_, index: number) => (
                                                <Cell
                                                    key={`cell-${index}`}
                                                    fill={
                                                        COLORS[
                                                            index %
                                                                COLORS.length
                                                        ]
                                                    }
                                                />
                                            ),
                                        )}
                                    </Pie>
                                    <Tooltip
                                        formatter={(value) => [
                                            `${value} sản phẩm`,
                                            'Đã bán',
                                        ]}
                                    />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        )}
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <div className="flex flex-col md:flex-row justify-between md:items-center space-y-4 md:space-y-0">
                        <CardTitle>Danh Sách Sản Phẩm</CardTitle>
                        <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
                            <div className="flex items-center space-x-2">
                                <Select
                                    value={timeRange}
                                    onValueChange={setTimeRange}
                                >
                                    <SelectTrigger className="w-[180px]">
                                        <SelectValue placeholder="Chọn thời gian" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="week">
                                            Tuần này
                                        </SelectItem>
                                        <SelectItem value="month">
                                            Tháng này
                                        </SelectItem>
                                        <SelectItem value="year">
                                            Năm nay
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="flex items-center space-x-2">
                                <Select
                                    value={categoryFilter}
                                    onValueChange={setCategoryFilter}
                                >
                                    <SelectTrigger className="w-[180px]">
                                        <SelectValue placeholder="Chọn danh mục" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">
                                            Tất cả danh mục
                                        </SelectItem>
                                        {categoryData.map(
                                            (category: any, index: number) => (
                                                <SelectItem
                                                    key={index}
                                                    value={category.name}
                                                >
                                                    {category.name}
                                                </SelectItem>
                                            ),
                                        )}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="relative flex items-center">
                                <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500 outline-0" />
                                <Input
                                    placeholder="Tìm kiếm sản phẩm..."
                                    className="pl-8 outline-0"
                                    value={searchTerm}
                                    onChange={(e) =>
                                        setSearchTerm(e.target.value)
                                    }
                                />
                                <Button
                                    variant="outline"
                                    className="ml-2"
                                    onClick={handleSearch}
                                    disabled={isLoading}
                                >
                                    {isLoading ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                        'Tìm'
                                    )}
                                </Button>
                            </div>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="flex justify-center items-center h-[200px]">
                            <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
                        </div>
                    ) : filteredProducts.length === 0 ? (
                        <div className="flex justify-center items-center h-[200px] text-gray-500">
                            Không có dữ liệu
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full border-collapse">
                                <thead>
                                    <tr className="border-b">
                                        <th className="py-3 px-4 text-left">
                                            Mã SP
                                        </th>
                                        <th className="py-3 px-4 text-left">
                                            Hình ảnh
                                        </th>
                                        <th className="py-3 px-4 text-left">
                                            Tên sản phẩm
                                        </th>
                                        <th className="py-3 px-4 text-left">
                                            Danh mục
                                        </th>
                                        <th className="py-3 px-4 text-left">
                                            Giá bán
                                        </th>
                                        <th className="py-3 px-4 text-left">
                                            Đã bán
                                        </th>
                                        <th className="py-3 px-4 text-left">
                                            Doanh thu
                                        </th>
                                        <th className="py-3 px-4 text-left">
                                            Tồn kho
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredProducts.map(
                                        (product: any, index: number) => (
                                            <tr
                                                key={index}
                                                className="border-b hover:bg-gray-50"
                                            >
                                                <td className="py-3 px-4">
                                                    {product.id}
                                                </td>
                                                <td className="py-3 px-4">
                                                    <img
                                                        src={
                                                            product.image ||
                                                            '/placeholder.svg?height=40&width=40'
                                                        }
                                                        alt={product.name}
                                                        className="w-10 h-10 object-cover rounded"
                                                    />
                                                </td>
                                                <td className="py-3 px-4">
                                                    {product.name}
                                                </td>
                                                <td className="py-3 px-4">
                                                    {product.category}
                                                </td>
                                                <td className="py-3 px-4">
                                                    {formatCurrency(
                                                        product.price,
                                                    )}
                                                </td>
                                                <td className="py-3 px-4">
                                                    {product.sold}
                                                </td>
                                                <td className="py-3 px-4">
                                                    {formatCurrency(
                                                        product.revenue,
                                                    )}
                                                </td>
                                                <td className="py-3 px-4">
                                                    {product.stock}
                                                </td>
                                            </tr>
                                        ),
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
