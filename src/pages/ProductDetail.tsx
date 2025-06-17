'use client';

import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ShowMoreText from 'react-show-more-text';
import MessageDialog from '../component/MessageDialog';
import RelatedProducts from '../component/RelatedProducts';
import { useCart } from '../context/CartContext';

interface Variant {
    size: string;
    color: string;
    stock: number;
}

interface Product {
    _id: string;
    product_id: string;
    product_name: string;
    description: string;
    category_id: string;
    sex: string;
    images: string[];
    price: number;
    xuatXu: string;
    chatLieu: string;
    variants: Variant[];
}

interface User {
    _id: string;
    user_id: number;
    name: string;
    email: string;
    phone: string;
    birthDate?: string;
    address?: string;
    isAdmin: boolean;
}

function ProductDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { addToCart } = useCart();
    const [product, setProduct] = useState<Product | null>(null);
    const [selectedSize, setSelectedSize] = useState<string>('');
    const [selectedColor, setSelectedColor] = useState<string>('');
    const [mainImage, setMainImage] = useState<string>('');
    const [quantity, setQuantity] = useState(1);
    const [dialog, setDialog] = useState({
        isOpen: false,
        title: '',
        description: '',
        type: '' as 'success' | 'error' | '',
    });
    const [isAdmin, setIsAdmin] = useState(false);

    useEffect(() => {
        const userJSON = localStorage.getItem('user');
        if (userJSON) {
            try {
                const user: User = JSON.parse(userJSON);
                setIsAdmin(user.isAdmin === true);
            } catch (error) {
                console.error('Error parsing user JSON:', error);
                setIsAdmin(false);
            }
        } else {
            setIsAdmin(false);
        }
    }, []);

    useEffect(() => {
        const apiBaseUrl =
            import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

        fetch(`${apiBaseUrl}/api/products/${id}`)
            .then((res) => {
                if (!res.ok) {
                    throw new Error(`HTTP error! status: ${res.status}`);
                }
                return res.json();
            })
            .then((data) => {
                setProduct(data);
                if (data.images && data.images.length > 0) {
                    setMainImage(data.images[0]);
                } else {
                    setMainImage('/placeholder.svg');
                }
            })
            .catch((err) => {
                console.error('Error fetching product:', err);
                setDialog({
                    isOpen: true,
                    title: 'Lỗi tải sản phẩm',
                    description:
                        'Không thể tải thông tin sản phẩm. Vui lòng thử lại.',
                    type: 'error',
                });
            });
    }, [id]);

    if (!product) {
        return (
            <div className="container mx-auto my-20 py-8 px-4 text-center">
                <div className="flex flex-col items-center justify-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-t-1 border-b-1 border-gray-400 mb-4"></div>
                    <h2 className="text-xl font-semibold mb-2">
                        Đang tải sản phẩm...
                    </h2>
                </div>
            </div>
        );
    }

    const uniqueSizes = Array.from(
        new Set(product.variants.map((v) => v.size)),
    );
    const uniqueColors = Array.from(
        new Set(product.variants.map((v) => v.color)),
    );

    const selectedVariant = product.variants.find(
        (v) => v.size === selectedSize && v.color === selectedColor,
    );

    const isAvailableInStock = selectedVariant && selectedVariant.stock > 0;

    const checkUserLogin = () => {
        const userJSON = localStorage.getItem('user');
        if (!userJSON) {
            setDialog({
                isOpen: true,
                title: 'Đăng nhập để tiếp tục',
                description:
                    'Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng hoặc mua ngay.',
                type: 'error',
            });
            return false;
        }
        return true;
    };

    const handleAddToCart = async () => {
        if (!checkUserLogin()) return;

        if (!selectedSize || !selectedColor) {
            setDialog({
                isOpen: true,
                title: 'Chưa chọn đủ thông tin',
                description:
                    'Vui lòng chọn size và màu sắc trước khi thêm vào giỏ hàng.',
                type: 'error',
            });
            return;
        }

        if (!isAvailableInStock) {
            setDialog({
                isOpen: true,
                title: 'Sản phẩm hết hàng',
                description:
                    'Rất tiếc, sản phẩm với size và màu sắc đã chọn hiện đã hết hàng.',
                type: 'error',
            });
            return;
        }

        const imageToUse =
            product.images.find((img) => !isVideo(img)) ||
            product.images[0] ||
            '/placeholder.svg';

        try {
            await addToCart({
                product_id: product.product_id,
                product_name: product.product_name,
                image: imageToUse,
                price: product.price,
                quantity: quantity,
                size: selectedSize,
                color: selectedColor,
            });

            setDialog({
                isOpen: true,
                title: 'Thêm vào giỏ hàng thành công',
                description: 'Sản phẩm đã được thêm vào giỏ hàng của bạn.',
                type: 'success',
            });
        } catch (error) {
            console.error('Error adding to cart:', error);
            setDialog({
                isOpen: true,
                title: 'Lỗi',
                description: 'Có lỗi xảy ra khi thêm sản phẩm vào giỏ hàng.',
                type: 'error',
            });
        }
    };

    const handleBuyNow = async () => {
        if (!checkUserLogin()) return;

        if (!selectedSize || !selectedColor) {
            setDialog({
                isOpen: true,
                title: 'Chưa chọn đủ thông tin',
                description:
                    'Vui lòng chọn size và màu sắc trước khi mua ngay.',
                type: 'error',
            });
            return;
        }

        if (!isAvailableInStock) {
            setDialog({
                isOpen: true,
                title: 'Sản phẩm hết hàng',
                description:
                    'Rất tiếc, sản phẩm với size và màu sắc đã chọn hiện đã hết hàng.',
                type: 'error',
            });
            return;
        }

        const imageToUse =
            product.images.find((img) => !isVideo(img)) ||
            product.images[0] ||
            '/placeholder.svg';

        try {
            await addToCart({
                product_id: product.product_id,
                product_name: product.product_name,
                image: imageToUse,
                price: product.price,
                quantity: quantity,
                size: selectedSize,
                color: selectedColor,
            });

            navigate('/cart');
        } catch (error) {
            console.error('Error adding to cart:', error);
            setDialog({
                isOpen: true,
                title: 'Lỗi',
                description: 'Có lỗi xảy ra khi thêm sản phẩm vào giỏ hàng.',
                type: 'error',
            });
        }
    };

    const handleUpdateProduct = () => {
        console.log('Navigating to update product with ID:', product._id);
        navigate(`/admin/products/update/${product._id}`);
    };

    const handleCloseDialog = () => {
        setDialog({ isOpen: false, title: '', description: '', type: '' });
        if (dialog.title === 'Đăng nhập để tiếp tục') {
            navigate('/signin');
        }
    };

    const isVideo = (url: string) => {
        return /\.(mp4|webm|ogg)$/i.test(url);
    };

    const renderActionButtons = () => {
        if (isAdmin) {
            return (
                <button
                    onClick={handleUpdateProduct}
                    className="px-6 py-3 border border-black rounded-full hover:bg-black hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    CẬP NHẬT SẢN PHẨM
                </button>
            );
        }
        return (
            <div className="flex gap-4">
                <button
                    onClick={handleAddToCart}
                    className="px-6 py-3 border border-black rounded-full hover:bg-black hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    THÊM VÀO GIỎ
                </button>
                <button
                    onClick={handleBuyNow}
                    className="px-6 py-3 bg-black text-white rounded-full hover:bg-white hover:text-black hover:border hover:border-black transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    MUA NGAY
                </button>
            </div>
        );
    };

    return (
        <div className="flex flex-col items-center">
            <div className="flex flex-col md:flex-row gap-10 p-6 mt-10">
                <div className="flex p-2 border-r border-gray-200">
                    {isVideo(mainImage) ? (
                        <video
                            src={mainImage}
                            autoPlay
                            muted
                            loop
                            className="w-[40vw] h-[700px] rounded max-w-2xl object-cover"
                        />
                    ) : (
                        <img
                            src={mainImage}
                            alt={product.product_name}
                            className="w-[40vw] h-[700px] rounded max-w-2xl object-cover"
                        />
                    )}
                    <div className="flex flex-col gap-2">
                        {product.images.map((media, idx) => (
                            <div
                                key={idx}
                                className={`w-20 h-20 rounded ml-2 cursor-pointer ${
                                    mainImage === media
                                        ? 'ring-1 ring-gray-400'
                                        : ''
                                }`}
                                onClick={() => setMainImage(media)}
                            >
                                {isVideo(media) ? (
                                    <video
                                        src={media}
                                        className="w-full h-full object-cover rounded"
                                    />
                                ) : (
                                    <img
                                        src={media || '/placeholder.svg'}
                                        alt={`thumbnail-${idx}`}
                                        className="w-full h-full object-cover rounded"
                                    />
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                <div className="flex-1">
                    <h1 className="text-3xl font-semibold uppercase mb-1">
                        {product.product_name}
                    </h1>
                    <p className="text-2xl font-extralight text-gray-800 mb-4">
                        {product.price.toLocaleString()}₫
                    </p>
                    <p className="text-sm text-gray-600 mb-2">
                        Chất liệu: {product.chatLieu}
                    </p>
                    <p className="text-sm text-gray-600 mb-6">
                        Xuất xứ: {product.xuatXu}
                    </p>

                    <div className="mb-6">
                        <p className="font-semibold mb-2">Kích cỡ:</p>
                        <div className="flex gap-2 flex-wrap">
                            {uniqueSizes.map((size, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => setSelectedSize(size)}
                                    className={`w-10 h-10 border rounded-full text-sm ${
                                        selectedSize === size
                                            ? 'bg-black text-white'
                                            : 'hover:bg-black hover:text-white'
                                    }`}
                                >
                                    {size}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="mb-6">
                        <p className="font-semibold mb-2">Màu sắc:</p>
                        <div className="flex gap-2 flex-wrap">
                            {uniqueColors.map((color, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => setSelectedColor(color)}
                                    className={`px-4 py-2 border rounded-full text-sm ${
                                        selectedColor === color
                                            ? 'bg-black text-white'
                                            : 'hover:bg-black hover:text-white'
                                    }`}
                                >
                                    {color}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="mb-6">
                        <p className="font-semibold mb-2">Số lượng:</p>
                        <div className="flex items-center gap-2 border w-fit px-3 py-1 rounded">
                            <button
                                onClick={() =>
                                    setQuantity(Math.max(1, quantity - 1))
                                }
                                className="px-2"
                                disabled={quantity <= 1}
                            >
                                -
                            </button>
                            <span className="px-2">{quantity}</span>
                            <button
                                onClick={() => setQuantity(quantity + 1)}
                                className="px-2"
                                disabled={
                                    selectedVariant &&
                                    quantity >= selectedVariant.stock
                                }
                            >
                                +
                            </button>
                        </div>
                    </div>

                    {selectedSize && selectedColor && selectedVariant && (
                        <div className="mb-4">
                            <p
                                className={`text-sm ${
                                    selectedVariant.stock > 0
                                        ? 'text-green-600'
                                        : 'text-red-600'
                                }`}
                            >
                                {selectedVariant.stock > 0
                                    ? `Còn hàng (${selectedVariant.stock} sản phẩm)`
                                    : 'Hết hàng'}
                            </p>
                        </div>
                    )}

                    {renderActionButtons()}

                    <div>
                        <p className="font-semibold mt-5 mb-2">Mô tả: </p>
                        <ShowMoreText
                            lines={3}
                            more="Xem thêm"
                            less="Thu gọn"
                            anchorClass="text-gray-500 cursor-pointer"
                            expanded={false}
                            className="text-justify"
                            truncatedEndingComponent="..."
                        >
                            {product.description}
                        </ShowMoreText>
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

            {product.category_id && product._id && (
                <div className="flex flex-row items-center w-full justify-center mt-10 mb-10">
                    <RelatedProducts
                        currentProductId={product._id}
                        categoryId={product.category_id}
                    />
                </div>
            )}
        </div>
    );
}

export default ProductDetail;
