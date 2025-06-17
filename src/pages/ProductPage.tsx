// ProductPage.tsx

import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import ProductCard from '../component/ProductCard';

interface Product {
    _id: string;
    product_name: string;
    description: string;
    category_id: string;
    sex: string;
    variants: {
        size: string;
        color: string;
        stock: number;
    }[];
    images: string[];
    price: number;
}

export default function ProductPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [searchParams] = useSearchParams();

    const sex = searchParams.get('sex');
    const category = searchParams.get('category_id');

    useEffect(() => {
        const fetchProducts = async () => {
          try {
              const apiBaseUrl =
                    import.meta.env.VITE_API_BASE_URL ||
                    'http://localhost:3000';

              
                const res = await fetch(`${apiBaseUrl}/api/products`);
                const data: Product[] = await res.json();

                // Lọc sản phẩm theo giới tính và danh mục nếu có
                const filtered = data.filter((product) => {
                    const matchSex = sex ? product.sex === sex : true;
                    const matchCategory = category
                        ? product.category_id
                              .toLowerCase()
                              .includes(category.toLowerCase())
                        : true;
                    return matchSex && matchCategory;
                });

                setProducts(filtered);
            } catch (error) {
                console.error('Error fetching products:', error);
            }
        };

        fetchProducts();
    }, [sex, category]);

    return (
        <div className="p-5">
            <h2 className="text-center text-gray-600 mt-5">
                Tổng sản phẩm: {products.length}
            </h2>
            <div className="flex flex-wrap gap-5 justify-center">
                {products.map((product) => (
                    <ProductCard xuatXu={''} chatLieu={''} key={product._id} {...product} />
                ))}
            </div>
        </div>
    );
}
