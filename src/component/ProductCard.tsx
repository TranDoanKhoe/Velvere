import { useState } from 'react';
import { Link } from 'react-router-dom'; // Import Link
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Card, CardFooter } from '../components_bonus/my-card/components/ui/card';

interface ProductCardProps {
    _id: string;
    product_name: string;
    description: string;
    category_id: string;
    sex: string;
    images: string[];
    price: number;
    xuatXu: string;
    chatLieu: string;
    variants: {
        size: string;
        color: string;
        stock: number;
    }[];
}

export default function ProductCard({
    _id,
    product_name,
    images,
    price,
}: ProductCardProps) {
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    const nextImage = () => {
        setCurrentImageIndex((prev) => (prev + 1) % images.length);
    };

    const prevImage = () => {
        setCurrentImageIndex(
            (prev) => (prev - 1 + images.length) % images.length,
        );
    };

    // Định dạng giá tiền
    const formattedPrice = new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
    }).format(price);
    const isVideo = (url: string) => {
        return /\.(mp4|webm|ogg)$/i.test(url);
    };

    return (
        <Link
            to={`/product/${_id}`} // Sử dụng product_id để tạo đường dẫn
        >
            <Card className="w-full max-w-md items-center mx-auto overflow-hidden border-0 rounded-xl hover:shadow-lg transition-shadow duration-300 ease-in-out mb-5">
                <div className="relative">
                    <div className="relative h-[450px] w-[400px] ">
                        {isVideo(images[currentImageIndex]) ? (
                            <video
                                src={images[currentImageIndex]}
                                autoPlay
                                muted
                                loop
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <img
                                src={
                                    images[currentImageIndex] ||
                                    '/placeholder.svg'
                                }
                                alt={product_name}
                                className="w-full h-full object-cover"
                            />
                        )}
                        {images.length > 1 && (
                            <>
                                <button
                                    onClick={(e) => {
                                        e.preventDefault(); // Ngăn chặn điều hướng khi nhấp vào nút
                                        e.stopPropagation(); // Ngăn chặn sự kiện lan truyền
                                        prevImage();
                                    }}
                                    className="absolute left-4 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center text-gray-700"
                                    aria-label="Previous image"
                                >
                                    <ChevronLeft size={24} />
                                </button>
                                <button
                                    onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        nextImage();
                                    }}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center text-gray-700"
                                    aria-label="Next image"
                                >
                                    <ChevronRight size={24} />
                                </button>
                            </>
                        )}
                    </div>
                </div>

                <CardFooter className="flex flex-col items-center pt-4 pb-6">
                    <h3 className="text-lg font-stretch-50% text-center">
                        {product_name}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                        {formattedPrice}
                    </p>
                </CardFooter>
            </Card>
        </Link>
    );
}
