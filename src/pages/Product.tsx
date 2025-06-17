import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom'; // useLocation to get search query
import ProductCard from '../component/ProductCard'; // Import the ProductCard component

interface Variant {
    size: string;
    color: string;
    stock: number;
}

interface Product {
    _id: string; // Use _id for key and linking as per ProductCard
    product_id: number; // Still keep this if needed elsewhere, but _id is common for unique keys from DBs
    product_name: string;
    description: string;
    category_id: string;
    sex: string; // Used for filtering
    images: string[];
    price: number; // Used for sorting
    xuatXu: string; // Used for search
    chatLieu: string; // Used for search
    variants: Variant[]; // Used for stock check (though we'll move stock check logic)
}

function Product() {
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const searchQuery = queryParams.get('search') || '';

    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeFilter, setActiveFilter] = useState('all'); // 'all', 'male', 'female'
    const [sortOption, setSortOption] = useState(''); // '', 'price-asc', 'price-desc', 'name'

    // Fetch products on component mount
    useEffect(() => {
        setLoading(true);
        const apiBaseUrl =
            import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

        // Ensure the API endpoint is correct for your backend
        fetch(`${apiBaseUrl}/api/products`)
            .then((res) => {
                if (!res.ok) {
                    throw new Error(`HTTP error! status: ${res.status}`);
                }
                return res.json();
            })
            .then((data) => {
                setProducts(data);
                setLoading(false);
            })
            .catch((err) => {
                console.error('Fetch error:', err);
                setLoading(false); // Set loading to false even on error
                // Optionally show an error message to the user
            });
    }, []); // Empty dependency array means this effect runs only once after the initial render

    // Function to filter products based on activeFilter and searchQuery
    const getFilteredProducts = () => {
        let filtered = products;

        // Filter by gender
        if (activeFilter !== 'all') {
            filtered = filtered.filter(
                (product) => product.sex === activeFilter,
            );
        }

        // Filter by search query
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(
                (product) =>
                    product.product_name.toLowerCase().includes(query) ||
                    product.chatLieu.toLowerCase().includes(query) ||
                    product.xuatXu.toLowerCase().includes(query),
            );
        }

        return filtered;
    };

    // Function to sort products based on sortOption
    const getSortedProducts = () => {
        const filtered = getFilteredProducts(); // Get filtered products first
        const sorted = [...filtered]; // Create a mutable copy for sorting

        if (sortOption === 'price-asc') {
            sorted.sort((a, b) => a.price - b.price);
        } else if (sortOption === 'price-desc') {
            sorted.sort((a, b) => b.price - a.price);
        } else if (sortOption === 'name') {
            sorted.sort((a, b) => a.product_name.localeCompare(b.product_name));
        }
        // If sortOption is '', return the filtered list without sorting

        return sorted;
    };

    // Products to be displayed after filtering and sorting
    const displayedProducts = getSortedProducts();

    return (
        <div className="bg-white min-h-screen">
            {/* Banner */}
            <div className="bg-gray-100 py-12 px-4 mb-8">
                <div className="container mx-auto text-center">
                    <h1 className="text-4xl md:text-5xl font-serif tracking-tight mb-2">
                        BỘ SƯU TẬP
                    </h1>
                    {searchQuery ? (
                        <p className="text-gray-600 max-w-2xl mx-auto">
                            Kết quả tìm kiếm cho: "{searchQuery}"
                        </p>
                    ) : (
                        <p className="text-gray-600 max-w-2xl mx-auto">
                            Khám phá những thiết kế độc đáo và đẳng cấp từ bộ
                            sưu tập mới nhất của Vélvere
                        </p>
                    )}
                </div>
            </div>

            {/* Main Content Container */}
            <div className="container mx-auto px-4 max-w-7xl">
                {/* Filter and sorting */}
                <div className="flex flex-col md:flex-row justify-between items-center mb-8 border-b pb-4">
                    <div className="flex space-x-4 mb-4 md:mb-0">
                        <button
                            onClick={() => setActiveFilter('all')}
                            className={`px-4 py-2 text-sm font-medium transition-colors ${
                                activeFilter === 'all'
                                    ? 'text-black border-b-2 border-black'
                                    : 'text-gray-500 hover:text-black'
                            }`}
                        >
                            Tất cả
                        </button>
                        <button
                            onClick={() => setActiveFilter('Nam')}
                            className={`px-4 py-2 text-sm font-medium transition-colors ${
                                activeFilter === 'male'
                                    ? 'text-black border-b-2 border-black'
                                    : 'text-gray-500 hover:text-black'
                            }`}
                        >
                            Nam
                        </button>
                        <button
                            onClick={() => setActiveFilter('Nữ')}
                            className={`px-4 py-2 text-sm font-medium transition-colors ${
                                activeFilter === 'female'
                                    ? 'text-black border-b-2 border-black'
                                    : 'text-gray-500 hover:text-black'
                            }`}
                        >
                            Nữ
                        </button>
                    </div>
                    <div className="flex items-center">
                        <span className="text-sm text-gray-500 mr-2">
                            Sắp xếp theo:
                        </span>
                        <select
                            value={sortOption}
                            onChange={(e) => setSortOption(e.target.value)}
                            className="border border-gray-200 rounded py-1 px-2 text-sm focus:outline-none focus:ring-1 focus:ring-black"
                        >
                            <option value="">Mặc định</option>
                            <option value="price-asc">Giá: Thấp đến cao</option>
                            <option value="price-desc">
                                Giá: Cao đến thấp
                            </option>
                            <option value="name">Tên sản phẩm (A-Z)</option>
                        </select>
                    </div>
                </div>

                {/* Display number of products */}
                <div className="text-sm text-gray-500 mb-6">
                    Hiển thị {displayedProducts.length} sản phẩm
                </div>

                {/* Product List */}
                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-black"></div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {displayedProducts.length > 0 ? (
                            displayedProducts.map((product) => (
                                // Use the imported ProductCard component here
                                <ProductCard
                                    key={product._id} // Use _id as the unique key
                                    _id={product._id}
                                    product_name={product.product_name}
                                    images={product.images}
                                    price={product.price}
                                    // Pass other required props if ProductCard needed them
                                    description={product.description}
                                    category_id={product.category_id}
                                    sex={product.sex}
                                    xuatXu={product.xuatXu}
                                    chatLieu={product.chatLieu}
                                    variants={product.variants}
                                />
                            ))
                        ) : (
                            <div className="col-span-full text-center py-10">
                                {searchQuery ? (
                                    <div>
                                        <p className="text-gray-500 mb-2">
                                            Không tìm thấy sản phẩm nào phù hợp
                                            với từ khóa "{searchQuery}"
                                        </p>
                                        <p className="text-sm text-gray-400">
                                            Vui lòng thử lại với từ khóa khác
                                            hoặc xem tất cả sản phẩm của chúng
                                            tôi
                                        </p>
                                    </div>
                                ) : (
                                    <p className="text-gray-500">
                                        Không tìm thấy sản phẩm nào phù hợp với
                                        bộ lọc.
                                    </p>
                                )}
                            </div>
                        )}
                    </div>
                )}

                {/* Pagination (Placeholder) - Replace with actual pagination logic if needed */}
                {/* Note: Actual pagination would require changes to the API fetch to get paginated data */}
                {displayedProducts.length > 0 && (
                    <div className="flex justify-center mt-12 mb-8">
                        <div className="flex space-x-1">
                            <button className="w-10 h-10 flex items-center justify-center rounded-full bg-black text-white">
                                1
                            </button>
                            {/* Add more pagination buttons as needed */}
                            {/* These buttons currently do nothing */}
                            <button className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100">
                                2
                            </button>
                            <button className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100">
                                3
                            </button>
                            <button className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100">
                                <span className="sr-only">Next</span>
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
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default Product;
