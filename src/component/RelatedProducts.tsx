import { useEffect, useState } from 'react';
import ProductCard from './ProductCard';

interface Product {
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

interface RelatedProductsProps {
    currentProductId: string;
    categoryId: string;
}

function RelatedProducts({
    currentProductId,
    categoryId,
}: RelatedProductsProps) {
    const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);

  useEffect(() => {
      const backendUrl =
          import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
         fetch(`${backendUrl}/api/products`)
             .then((res) => {
                 if (!res.ok) {
                     throw new Error('Failed to fetch products');
                 }
                 return res.json();
             })
             .then((data: Product[]) => {
                 const currentProduct = data.find(
                     (p) => p._id === currentProductId,
                 );

                 if (!currentProduct) {
                     console.warn('Không tìm thấy sản phẩm hiện tại.');
                     return;
                 }

                 const filtered = data.filter(
                     (product) =>
                         product.category_id === categoryId &&
                         product.sex === currentProduct.sex &&
                         product._id !== currentProductId,
                 );

                 setRelatedProducts(filtered);
             })
             .catch((err) => console.error('Error fetching products:', err));
    }, [categoryId, currentProductId]);

    if (relatedProducts.length === 0) {
        return null;
    }

    return (
        <div className="flex flex-col items-center w-full justify-center mt-10">
            <p className="text-gray-700 text-2xl font-sans mb-4">
                Sản phẩm liên quan
            </p>
            <div className="flex flex-wrap justify-center gap-4">
                {relatedProducts.map((product) => (
                    <ProductCard key={product._id} {...product} />
                ))}
            </div>
        </div>
    );
}

export default RelatedProducts;
