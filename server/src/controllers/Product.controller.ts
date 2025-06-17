import { Request, Response } from 'express';
import mongoose from 'mongoose';
import Product, { ProductDocument } from '../models/Product.model'; // Đảm bảo đường dẫn đúng
import Order from '../models/Order.model';

// Interface for best-selling product stats
interface BestSellingProduct {
    id: string;
    name: string;
    category: string;
    price: number;
    sold: number;
    revenue: number;
    stock: number;
    image: string | null;
}

// Interface for category stats
interface CategoryStat {
    name: string;
    value: number;
}

// Interface for summary stats
interface SummaryStats {
    totalProducts: number;
    totalSold: number;
    totalRevenue: number;
    totalCategories: number;
}

const generateProductId = async (): Promise<string> => {
    // Tìm sản phẩm có product_id lớn nhất
    const lastProduct = await Product.findOne({})
        .sort({ product_id: -1 }) // sắp xếp giảm dần theo product_id
        .lean();

    let nextNumber = 1;

    if (lastProduct && lastProduct.product_id) {
        const match = lastProduct.product_id.match(/PROD(\d+)/);
        if (match && match[1]) {
            nextNumber = parseInt(match[1], 10) + 1;
        }
    }

    // Format lại với padding 0: PROD0001
    return `PROD${nextNumber.toString().padStart(4, '0')}`;
};

// Get all products
export const getAllProducts = async (
    req: Request,
    res: Response,
): Promise<void> => {
    try {
        const products = await Product.find();
        res.status(200).json(products);
    } catch (err: unknown) {
        console.error('Lỗi server khi lấy sản phẩm:', err);
        res.status(500).json({
            message: 'Lỗi server khi lấy sản phẩm',
            error: err instanceof Error ? err.message : 'Unknown error',
        });
    }
};

// Get product by ID
export const getProductById = async (
    req: Request,
    res: Response,
): Promise<void> => {
    try {
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            res.status(400).json({ message: 'ID sản phẩm không hợp lệ' });
            return;
        }
        const product = await Product.findById(id);
        if (!product || !product.variants || product.variants.length === 0) {
            res.status(400).json({
                message:
                    'Vui lòng cung cấp đầy đủ thông tin hợp lệ, bao gồm ít nhất một biến thể hợp lệ.',
            });
        }
        res.status(200).json(product);
    } catch (err: unknown) {
        console.error('Lỗi server khi lấy sản phẩm theo ID:', err);
        res.status(500).json({
            message: 'Lỗi server',
            error: err instanceof Error ? err.message : 'Unknown error',
        });
    }
};

// Add a new product
export const addProduct = async (
    req: Request,
    res: Response,
): Promise<void> => {
    try {
        const {
            product_name,
            description,
            category_id,
            sex,
            images,
            price,
            xuatXu,
            chatLieu,
            variants,
        } = req.body;

        // Validate required fields
        if (
            !product_name?.trim() ||
            !description?.trim() ||
            !category_id ||
            !sex ||
            !price ||
            price <= 0 ||
            !xuatXu?.trim() ||
            !chatLieu?.trim() ||
            !variants ||
            !Array.isArray(variants) ||
            variants.length === 0 ||
            variants.some(
                (v: { size: string; color: string; stock: number }) =>
                    !v.size || !v.color || v.stock < 0,
            ) ||
            !images ||
            !Array.isArray(images) ||
            images.filter((img: string) => img.trim() !== '').length === 0
        ) {
            res.status(400).json({
                message:
                    'Vui lòng cung cấp đầy đủ thông tin hợp lệ, bao gồm ít nhất một ảnh và một size hợp lệ.',
            });
            return;
        }

        // Generate a unique product_id
        const product_id = generateProductId();

        // Create a new product
        const newProduct = new Product({
            product_id,
            product_name,
            description,
            category_id,
            sex,
            images: images.filter((img: string) => img.trim() !== ''),
            price: Number(price),
            xuatXu,
            chatLieu,
            variants: variants.map(
                (v: { size: string; color: string; stock: number }) => ({
                    size: v.size,
                    color: v.color,
                    stock: Number(v.stock),
                }),
            ),
        });

        // Save the product
        const savedProduct = await newProduct.save();

        res.status(201).json({
            message: 'Sản phẩm đã được thêm thành công',
            product: savedProduct,
        });
    } catch (err: unknown) {
        console.error('Lỗi khi thêm sản phẩm:', err);
        res.status(500).json({
            message: 'Lỗi server khi thêm sản phẩm',
            error: err instanceof Error ? err.message : 'Unknown error',
        });
    }
};

// Update an existing product

export const updateProduct = async (
    req: Request,
    res: Response,
): Promise<void> => {
    try {
        const { id } = req.params;
        const {
            product_name,
            description,
            category_id,
            sex,
            images,
            price,
            xuatXu,
            chatLieu,
            variants,
        } = req.body;

        // Validate required fields
        if (
            !product_name?.trim() ||
            !description?.trim() ||
            !category_id ||
            !sex ||
            !price ||
            price <= 0 ||
            !xuatXu?.trim() ||
            !chatLieu?.trim() ||
            !variants ||
            !Array.isArray(variants) ||
            variants.length === 0 ||
            variants.some(
                (v: { size: string; color: string; stock: number }) =>
                    !v.size || !v.color || v.stock < 0,
            ) ||
            !images ||
            !Array.isArray(images) ||
            images.filter((img: string) => img.trim() !== '').length === 0
        ) {
            res.status(400).json({
                message:
                    'Vui lòng cung cấp đầy đủ thông tin hợp lệ, bao gồm ít nhất một ảnh và một biến thể hợp lệ.',
            });
            return;
        }

        // Find the product by _id instead of product_id
        const product = await Product.findById(id);
        if (!product) {
            res.status(404).json({ message: 'Không tìm thấy sản phẩm' });
            return;
        }

        // Update the product fields
        product.product_name = product_name;
        product.description = description;
        product.category_id = category_id;
        product.sex = sex;
        product.images = images.filter((img: string) => img.trim() !== '');
        product.price = Number(price);
        product.xuatXu = xuatXu;
        product.chatLieu = chatLieu;
        product.variants = variants.map(
            (v: { size: string; color: string; stock: number }) => ({
                size: v.size,
                color: v.color,
                stock: Number(v.stock),
            }),
        );

        // Save the updated product
        const updatedProduct = await product.save();

        res.status(200).json({
            message: 'Sản phẩm đã được cập nhật thành công',
            product: updatedProduct,
        });
    } catch (err: unknown) {
        console.error('Lỗi khi cập nhật sản phẩm:', err);
        res.status(500).json({
            message: 'Lỗi server khi cập nhật sản phẩm',
            error: err instanceof Error ? err.message : 'Unknown error',
        });
    }
};
export const updateVariantStock = async (
    req: Request,
    res: Response,
): Promise<void> => {
    try {
        const { product_id, size, color, quantity } = req.body; // Sử dụng quantity thay vì stock

        // Kiểm tra dữ liệu đầu vào
        if (!product_id || !size || !color || quantity === undefined) {
            res.status(400).json({
                message:
                    'Vui lòng cung cấp đầy đủ thông tin: product_id, size, color và quantity.',
            });
            return;
        }

        const product = await Product.findOne({ product_id });

        if (!product) {
            res.status(404).json({
                message: `Không tìm thấy sản phẩm với product_id: ${product_id}`,
            });
            return;
        }

        const variant = product.variants.find(
            (v) => v.size === size && v.color === color,
        );

        if (!variant) {
            res.status(404).json({
                message: `Không tìm thấy biến thể với size: ${size} và color: ${color}`,
            });
            return;
        }

        // Kiểm tra số lượng tồn kho
        if (variant.stock < quantity) {
            res.status(400).json({
                message: `Số lượng trong kho không đủ. Còn ${variant.stock} sản phẩm.`,
            });
            return;
        }

        // Giảm số lượng tồn kho
        variant.stock -= Number(quantity);
        await product.save();

        res.status(200).json({
            message: 'Cập nhật số lượng tồn kho thành công',
            product_id,
            size,
            color,
            stock: variant.stock,
        });
    } catch (err) {
        console.error('Lỗi khi cập nhật số lượng tồn kho:', err);
        res.status(500).json({
            message: 'Lỗi server khi cập nhật số lượng tồn kho',
            error: err instanceof Error ? err.message : 'Unknown error',
        });
    }
};

// Place an order
export const placeOrder = async (
    req: Request,
    res: Response,
): Promise<void> => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        // eslint-disable-next-line
        const { items } = req.body; // items: [{ productId, size, color, quantity }]
        for (const item of req.body.items) {
            const product = await Product.findById(item.productId);

            if (!product) {
                res.status(404).json({
                    message: `Sản phẩm với ID ${item.productId} không tồn tại.`,
                });
                return;
            }

            // Tìm biến thể phù hợp
            const variant = product.variants.find(
                (v) => v.size === item.size && v.color === item.color,
            );

            if (!variant) {
                res.status(400).json({
                    message: `Không tìm thấy biến thể với size ${item.size} và color ${item.color}.`,
                });
                return;
            }

            // Kiểm tra tồn kho
            if (variant.stock < item.quantity) {
                res.status(400).json({
                    message: `Sản phẩm ${product.product_name} với size ${item.size} và color ${item.color} không đủ hàng tồn kho.`,
                });
                return;
            }

            // Giảm số lượng tồn kho
            variant.stock -= item.quantity;
            await product.save();
        }

        // Commit transaction
        await session.commitTransaction();
        session.endSession();

        res.status(200).json({ message: 'Đặt hàng thành công' });
    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        res.status(400).json({
            message:
                error instanceof Error ? error.message : 'Lỗi không xác định',
        });
    }
};

// Update stock for a single product
export const updateProductStock = async (
    req: Request,
    res: Response,
): Promise<void> => {
    try {
        const { productId, size, color, quantity } = req.body;

        if (
            !productId ||
            !size ||
            !color ||
            quantity === undefined ||
            quantity === null
        ) {
            res.status(400).json({
                message:
                    'Thiếu thông tin cần thiết: productId, size, color, quantity',
            });
            return;
        }

        if (!mongoose.Types.ObjectId.isValid(productId)) {
            res.status(400).json({ message: 'ID sản phẩm không hợp lệ' });
            return;
        }

        const product = (await Product.findById(
            productId,
        )) as ProductDocument | null;
        if (!product) {
            res.status(404).json({ message: 'Không tìm thấy sản phẩm' });
            return;
        }

        const variantIndex = product.variants.findIndex(
            (variant: { size: string; color: string; stock: number }) =>
                variant.size === size && variant.color === color,
        );

        if (variantIndex === -1) {
            res.status(404).json({
                message:
                    'Không tìm thấy biến thể của sản phẩm với size và color đã chọn',
            });
            return;
        }

        if (quantity > 0 && product.variants[variantIndex].stock < quantity) {
            res.status(400).json({
                message: 'Số lượng trong kho không đủ',
                available: product.variants[variantIndex].stock,
            });
            return;
        }

        product.variants[variantIndex].stock -= quantity;
        await product.save();

        res.status(200).json({
            message: 'Cập nhật số lượng sản phẩm thành công',
            updatedStock: product.variants[variantIndex].stock,
        });
    } catch (err: unknown) {
        console.error('Lỗi khi cập nhật số lượng sản phẩm:', err);
        res.status(500).json({
            message: 'Lỗi server khi cập nhật số lượng sản phẩm',
            error: err instanceof Error ? err.message : 'Unknown error',
        });
    }
};

// Update stock for multiple products
export const updateMultipleProductsStock = async (
    req: Request,
    res: Response,
): Promise<void> => {
    try {
        const { items } = req.body;
        if (!items || !Array.isArray(items) || items.length === 0) {
            res.status(400).json({
                message: 'Danh sách sản phẩm không hợp lệ',
            });
            return;
        }

        const updateResults: Array<{
            productId: string;
            success: boolean;
            message?: string;
            updatedStock?: number;
            available?: number;
        }> = [];
        let hasError = false;

        for (const item of items) {
            const { productId, size, color, quantity } = item;
            if (
                !productId ||
                !size ||
                !color ||
                quantity === undefined ||
                quantity === null
            ) {
                updateResults.push({
                    productId: productId || 'unknown',
                    success: false,
                    message:
                        'Thiếu thông tin cần thiết cho sản phẩm trong danh sách',
                });
                hasError = true;
                continue;
            }

            if (!mongoose.Types.ObjectId.isValid(productId)) {
                updateResults.push({
                    productId,
                    success: false,
                    message: 'ID sản phẩm không hợp lệ',
                });
                hasError = true;
                continue;
            }

            try {
                const product = (await Product.findById(
                    productId,
                )) as ProductDocument | null;
                if (!product) {
                    updateResults.push({
                        productId,
                        success: false,
                        message: 'Không tìm thấy sản phẩm',
                    });
                    hasError = true;
                    continue;
                }

                const variantIndex = product.variants.findIndex(
                    (variant: { size: string; color: string; stock: number }) =>
                        variant.size === size && variant.color === color,
                );

                if (variantIndex === -1) {
                    updateResults.push({
                        productId,
                        success: false,
                        message:
                            'Không tìm thấy biến thể sản phẩm với size và color đã chọn',
                    });
                    hasError = true;
                    continue;
                }

                if (
                    quantity > 0 &&
                    product.variants[variantIndex].stock < quantity
                ) {
                    updateResults.push({
                        productId,
                        success: false,
                        message: `Số lượng trong kho không đủ (${product.variants[variantIndex].stock} có sẵn)`,
                        available: product.variants[variantIndex].stock,
                    });
                    hasError = true;
                    continue;
                }

                product.variants[variantIndex].stock -= quantity;
                await product.save();

                updateResults.push({
                    productId,
                    success: true,
                    updatedStock: product.variants[variantIndex].stock,
                });
            } catch (err: unknown) {
                console.error(
                    `Lỗi khi cập nhật sản phẩm ${item.productId}:`,
                    err,
                );
                updateResults.push({
                    productId,
                    success: false,
                    message: 'Lỗi server khi xử lý sản phẩm',
                });
                hasError = true;
            }
        }

        if (hasError) {
            res.status(207).json({
                message:
                    'Đã xử lý yêu cầu, nhưng có lỗi xảy ra với một số sản phẩm',
                results: updateResults,
            });
        } else {
            res.status(200).json({
                message: 'Cập nhật số lượng tất cả sản phẩm thành công',
                results: updateResults,
            });
        }
    } catch (err: unknown) {
        console.error('Lỗi server khi cập nhật số lượng nhiều sản phẩm:', err);
        res.status(500).json({
            message: 'Lỗi server khi xử lý yêu cầu cập nhật số lượng',
            error: err instanceof Error ? err.message : 'Unknown error',
        });
    }
};

// Get best-selling products
export const getBestSellingProduct = async (
    req: Request,
    res: Response,
): Promise<void> => {
    try {
        const {
            timeRange = 'month',
            category = 'all',
            search = '',
        } = req.query as {
            timeRange?: string;
            category?: string;
            search?: string;
        };

        const now = new Date();
        const startDate = new Date();
        switch (timeRange) {
            case 'week':
                startDate.setDate(now.getDate() - 7);
                break;
            case 'year':
                startDate.setFullYear(now.getFullYear() - 1);
                break;
            default:
                startDate.setMonth(now.getMonth() - 1);
        }
        // eslint-disable-next-line
        const orders = await Order.find({
            orderDate: { $gte: startDate, $lte: now },
            status: { $nin: ['cancelled'] },
        }).lean();

        //eslint-disable-next-line @typescript-eslint/no-explicit-any
        const productQuery: Record<string, any> = {};
        if (category !== 'all') {
            productQuery.category_id = category;
        }
        if (search) {
            productQuery.$or = [
                { product_name: { $regex: search, $options: 'i' } },
                { product_id: { $regex: search, $options: 'i' } },
            ];
        }

        const products = await Product.find(productQuery).lean();

        const enrichedProducts = await Promise.all(
            products.map(async (product: ProductDocument) => {
                const id =
                    product.product_id?.toString() ||
                    (product._id as string).toString();
                const stats = await Order.aggregate([
                    { $match: { 'items.product_id': id } },
                    { $unwind: '$items' },
                    { $match: { 'items.product_id': id } },
                    {
                        $group: {
                            _id: '$items.product_id',
                            totalQuantity: { $sum: '$items.quantity' },
                            totalRevenue: {
                                $sum: {
                                    $multiply: [
                                        '$items.quantity',
                                        '$items.price',
                                    ],
                                },
                            },
                        },
                    },
                ]);

                const statsResult =
                    stats.length > 0
                        ? stats[0]
                        : { totalQuantity: 0, totalRevenue: 0 };

                return {
                    id,
                    name: product.product_name,
                    category: product.category_id,
                    price: product.price,
                    sold: statsResult.totalQuantity,
                    revenue: statsResult.totalRevenue,
                    stock: product.variants.reduce(
                        (sum: number, v: { stock?: number }) =>
                            sum + (v.stock || 0),
                        0,
                    ),
                    image: getImage(product.images),
                } as BestSellingProduct;
            }),
        );

        enrichedProducts.sort((a, b) => b.sold - a.sold);

        const categoryStats = enrichedProducts.reduce(
            (acc: Record<string, CategoryStat>, p: BestSellingProduct) => {
                if (!acc[p.category]) {
                    acc[p.category] = { name: p.category, value: 0 };
                }
                acc[p.category].value += p.sold;
                return acc;
            },
            {},
        );
        const categoryData = Object.values(categoryStats).sort(
            (a, b) => b.value - a.value,
        );

        const summary: SummaryStats = {
            totalProducts: products.length,
            totalSold: enrichedProducts.reduce((sum, p) => sum + p.sold, 0),
            totalRevenue: enrichedProducts.reduce(
                (sum, p) => sum + p.revenue,
                0,
            ),
            totalCategories: categoryData.length,
        };

        res.status(200).json({
            products: enrichedProducts,
            categories: categoryData,
            summary,
        });
    } catch (err: unknown) {
        console.error('Lỗi khi lấy sản phẩm bán chạy:', err);
        res.status(500).json({
            message: 'Lỗi server khi lấy sản phẩm bán chạy',
            error: err instanceof Error ? err.message : 'Unknown error',
        });
    }
};

// Helper: Get first non-video image
function getImage(images: string[] | undefined): string | null {
    if (!images || images.length === 0) return null;
    const firstImage = images[0];
    if (isVideo(firstImage)) {
        return images[1] || null;
    }
    return firstImage;
}

// Helper: Check if URL is a video
function isVideo(url: string): boolean {
    const videoExtensions = ['.mp4', '.avi', '.mov', '.mkv'];
    return videoExtensions.some((extension) =>
        url.toLowerCase().endsWith(extension),
    );
}
