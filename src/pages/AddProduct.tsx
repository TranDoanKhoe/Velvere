import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
// Import the MessageDialog component
import MessageDialog from '../component/MessageDialog'; // Make sure this path is correct

// Assuming ProductPage is meant for preview or is included in the same route,
// otherwise, you might not need to import/render it here.
// import ProductPage from './ProductPage';

// Define interfaces for type safety
interface Variant {
    size: string;
    color: string;
    stock: number;
}

interface Product {
    _id?: string;
    product_id?: string;
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

function AddProduct() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    // State management
    const [isEditMode, setIsEditMode] = useState(false);
    const [formData, setFormData] = useState<Product>({
        product_name: '',
        description: '',
        category_id: 'aothun', // Changed default to lowercase slug for consistency
        sex: 'Nam',
        images: ['', '', ''],
        price: 0,
        xuatXu: '',
        chatLieu: '',
        variants: [{ size: 'S', color: 'Đen', stock: 0 }], // Changed default stock
    });
    const [formError, setFormError] = useState(''); // Use a separate state for form validation errors
    const [loading, setLoading] = useState(true);

    // State for Message Dialog
    const [isMessageDialogOpen, setIsMessageDialogOpen] = useState(false);
    const [messageDialogTitle, setMessageDialogTitle] = useState('');
    const [messageDialogDescription, setMessageDialogDescription] =
        useState('');
    const [messageDialogType, setMessageDialogType] = useState<
        'success' | 'error' | ''
    >('');

    // Fetch product data for edit mode
    useEffect(() => {
        // Reset form data when ID changes or is removed
        if (!id) {
            setIsEditMode(false);
            setFormData({
                product_name: '',
                description: '',
                category_id: 'aothun',
                sex: 'Nam',
                images: ['', '', ''],
                price: 0,
                xuatXu: '',
                chatLieu: '',
                variants: [{ size: 'S', color: 'Đen', stock: 0 }],
            });
            setFormError(''); // Clear form error on page change
            setLoading(false);
            // Close any open message dialog when navigating away or to add mode
            setIsMessageDialogOpen(false);
            return; // Exit early if not in edit mode
        }

        setIsEditMode(true);
        setLoading(true);
        console.log(`Workspaceing product with ID: ${id}`);
        const apiBaseUrl =
            import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

        fetch(`${apiBaseUrl}/api/products/${id}`)
            .then((res) => {
                if (!res.ok) {
                    // Attempt to read error message from response body
                    return res.json().then((err) => {
                        throw new Error(
                            err.message || 'Không thể tải thông tin sản phẩm',
                        );
                    });
                }
                return res.json();
            })
            .then((data: Product) => {
                console.log('Fetched product data:', data);
                // Ensure images array has at least 3 elements for the inputs, filling with empty strings
                const images = data.images ? [...data.images] : [];
                while (images.length < 3) images.push('');

                // Ensure variants array has at least 1 element
                const variants = data.variants?.length
                    ? data.variants
                    : [{ size: 'S', color: 'Đen', stock: 0 }];

                setFormData({
                    ...data,
                    // Use default values if data properties are missing
                    product_id: data.product_id || '',
                    product_name: data.product_name || '',
                    description: data.description || '',
                    category_id: data.category_id || 'aothun', // Default category
                    sex: data.sex || 'Nam', // Default sex
                    images, // Use the processed images array
                    price: data.price || 0,
                    xuatXu: data.xuatXu || '',
                    chatLieu: data.chatLieu || '',
                    variants: variants.map((v) => ({
                        // Ensure stock is treated as number
                        ...v,
                        stock: Number(v.stock) || 0,
                    })),
                });
                setFormError(''); // Clear any previous errors
            })
            .catch((err) => {
                console.error('Error fetching product:', err);
                // Set the error message to display within the form
                setFormError(
                    err.message ||
                        'Không thể tải dữ liệu sản phẩm. Vui lòng thử lại.',
                );
                // Optionally, you could also show a dialog here for critical fetch errors
                // showMessageDialog('Lỗi', err.message || 'Không thể tải dữ liệu sản phẩm.', 'error');
            })
            .finally(() => setLoading(false));
    }, [id]); // Dependency array includes 'id' so effect reruns when ID changes

    // Helper function to show the message dialog
    const showMessageDialog = (
        title: string,
        description: string,
        type: 'success' | 'error',
    ) => {
        setMessageDialogTitle(title);
        setMessageDialogDescription(description);
        setMessageDialogType(type);
        setIsMessageDialogOpen(true);
    };

    // Handler to close the message dialog
    const handleCloseMessageDialog = () => {
        const type = messageDialogType;
        setIsMessageDialogOpen(false);
        setMessageDialogTitle('');
        setMessageDialogDescription('');
        setMessageDialogType('');

        // If it was a success message, navigate after closing
        if (type === 'success') {
            navigate('/admin/productPage'); 
        }
        // For error messages, the dialog just closes, no navigation
    };

    // Handle input changes
    const handleInputChange = (
        e: React.ChangeEvent<
            HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
        >,
    ) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: name === 'price' ? Number(value) : value,
        }));
    };

    // Handle image changes
    const handleImageChange = (index: number, value: string) => {
        const newImages = [...formData.images];
        newImages[index] = value;
        setFormData({ ...formData, images: newImages });
    };

    const handleAddImage = () => {
        setFormData((prev) => ({
            ...prev,
            images: [...prev.images, ''],
        }));
    };

    const handleRemoveImage = (index: number) => {
        const currentImages = formData.images.filter(
            (img) => img.trim() !== '',
        );
        const imageToRemove = formData.images[index].trim();

        if (currentImages.length <= 1 && imageToRemove !== '') {
            setFormError('Sản phẩm phải có ít nhất một ảnh.');
            return;
        }

        if (formData.images.length <= 1) {
            setFormData((prev) => ({ ...prev, images: [''] })); // Reset to one empty image field
        } else {
            setFormData((prev) => ({
                ...prev,
                images: prev.images.filter((_, i) => i !== index),
            }));
        }

        setFormError(''); // Clear form error if it was related to min images
    };

    // Handle variant changes
    const handleVariantChange = (
        index: number,
        field: keyof Variant,
        value: string | number,
    ) => {
        const newVariants = [...formData.variants];
        if (newVariants[index]) {
            newVariants[index] = {
                ...newVariants[index],
                [field]: field === 'stock' ? Number(value) : value,
            };
            setFormData({ ...formData, variants: newVariants });
        }
    };

    const handleAddVariant = () => {
        setFormData((prev) => ({
            ...prev,
            variants: [...prev.variants, { size: '', color: '', stock: 0 }], // Start with empty size/color for new variants
        }));
    };

    const handleRemoveVariant = (index: number) => {
        if (formData.variants.length <= 1) {
            setFormError('Sản phẩm phải có ít nhất một biến thể.');
            return;
        }
        setFormData((prev) => ({
            ...prev,
            variants: prev.variants.filter((_, i) => i !== index),
        }));
        setFormError(''); // Clear form error if it was related to min variants
    };

    // Handle form submission
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormError(''); // Clear previous form errors

        // Validation
        const cleanedImages = formData.images.filter(
            (img) => img.trim() !== '',
        );
        const cleanedVariants = formData.variants.map((v) => ({
            ...v,
            stock: Number(v.stock), // Ensure stock is a number for validation
        }));

        if (
            !formData.product_name.trim() ||
            !formData.description.trim() ||
            !formData.category_id ||
            !formData.sex ||
            formData.price <= 0 ||
            isNaN(formData.price) || // Validate price
            !formData.xuatXu.trim() ||
            !formData.chatLieu.trim() ||
            cleanedVariants.length === 0 || // Check cleaned variants
            cleanedVariants.some(
                (v) =>
                    !v.size?.trim() ||
                    !v.color?.trim() ||
                    v.stock < 0 ||
                    isNaN(v.stock),
            ) || // Validate variants (check if size/color are empty after trim)
            cleanedImages.length === 0 // Check cleaned images
        ) {
            setFormError(
                'Vui lòng điền đầy đủ thông tin, thêm ít nhất một ảnh, và đảm bảo các biến thể (kích cỡ, màu, số lượng >= 0) hợp lệ.',
            );
            return;
        }

        setLoading(true);
        try {
            const apiBaseUrl =
                import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
            const url = isEditMode
                ? `${apiBaseUrl}/api/products/${id}`
                : `${apiBaseUrl}/api/products`;
            const method = isEditMode ? 'PUT' : 'POST';

            const dataToSend = {
                ...formData,
                images: cleanedImages, // Send only non-empty image URLs
                price: Number(formData.price),
                variants: cleanedVariants, // Send validated variants
            };

            // On create, the server should generate the _id, so remove it if present
            if (!isEditMode) {
                // delete dataToSend._id; // Mongoose handles _id creation
                // Optionally, you might also not send product_id on create if the server generates it
                delete dataToSend.product_id;
            }

            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(dataToSend),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(
                    errorData.message ||
                        `Lỗi khi ${
                            isEditMode ? 'cập nhật' : 'thêm mới'
                        } sản phẩm`,
                );
            }

            // Success! Show success message dialog
            showMessageDialog(
                'Thành công',
                `Sản phẩm đã được ${
                    isEditMode ? 'cập nhật' : 'thêm mới'
                } thành công!`,
                'success',
            );

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (err: any) {
            console.error('Error submitting product:', err); // Detailed error log
            // Show error message dialog
            showMessageDialog(
                'Lỗi',
                err.message ||
                    `Có lỗi xảy ra khi ${
                        isEditMode ? 'cập nhật' : 'thêm mới'
                    } sản phẩm. Vui lòng thử lại.`,
                'error',
            );
            // Also set form error state for display below the form (optional, but good for visibility)
            setFormError(err.message || 'Có lỗi xảy ra. Vui lòng thử lại.');
        } finally {
            setLoading(false);
        }
    };

    // Render loading state for edit mode fetch
    if (loading && isEditMode && !formData.product_name) {
        // Only show full page loading if fetching data for edit
        return (
            <div className="container mx-auto my-20 py-8 px-4 text-center">
                <div className="flex flex-col items-center justify-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-gray-900 mb-4"></div>
                    <h2 className="text-xl font-semibold mb-2 text-gray-700">
                        Đang tải dữ liệu sản phẩm...
                    </h2>
                </div>
            </div>
        );
    }

    // Render error state for failed initial fetch in edit mode
    if (!loading && formError && isEditMode && !formData.product_name) {
        // Only show full page error if fetch failed
        return (
            <div className="container mx-auto my-20 py-8 px-4 text-center">
                <div className="p-4 bg-red-100 text-red-700 rounded-lg max-w-md mx-auto">
                    <h2 className="text-xl font-semibold mb-2">
                        Lỗi tải dữ liệu
                    </h2>
                    <p>{formError}</p>
                    <button
                        onClick={() => navigate('/admin/products')} // Navigating to /admin/products
                        className="mt-4 px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
                    >
                        Quay lại danh sách sản phẩm
                    </button>
                </div>
            </div>
        );
    }

    // Main form UI
    return (
        <div className="container mx-auto p-4 md:p-6">
            <h1 className="text-5xl font-serif my-10 md:my-20 text-center">
                {' '}
                {/* Adjusted margin */}
                {isEditMode ? 'Cập nhật Sản Phẩm' : 'Thêm Sản Phẩm Mới'}
            </h1>

            {/* Form validation error message displayed within the form */}
            {formError && (
                <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-lg">
                    {formError}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
                {isEditMode && formData.product_id && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Product ID
                            </label>
                            <input
                                type="text"
                                name="product_id"
                                value={formData.product_id}
                                className="w-full p-2 border border-gray-300 rounded-md bg-gray-100 cursor-not-allowed"
                                disabled
                            />
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Tên sản phẩm
                        </label>
                        <input
                            type="text"
                            name="product_name"
                            value={formData.product_name}
                            onChange={handleInputChange}
                            className="w-full p-2 border border-gray-300 rounded-md"
                            placeholder="Áo len cashmere màu đen"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Xuất xứ
                        </label>
                        <input
                            type="text"
                            name="xuatXu"
                            value={formData.xuatXu}
                            onChange={handleInputChange}
                            className="w-full p-2 border border-gray-300 rounded-md"
                            placeholder="Ý, Việt Nam, v.v."
                            required
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Mô tả
                    </label>
                    <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        className="w-full p-2 border border-gray-300 rounded-md h-32 md:h-40" // Adjusted height
                        rows={3}
                        placeholder="Chiếc áo len là hiện thân của sự thanh lịch..."
                        required
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Chất liệu
                        </label>
                        <input
                            type="text"
                            name="chatLieu"
                            value={formData.chatLieu}
                            onChange={handleInputChange}
                            className="w-full p-2 border border-gray-300 rounded-md"
                            placeholder="Len, Cotton, Jean..."
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Giá (VNĐ)
                        </label>
                        <input
                            type="number"
                            name="price"
                            value={formData.price}
                            onChange={handleInputChange}
                            className="w-full p-2 border border-gray-300 rounded-md"
                            placeholder="9000000"
                            required
                            min="0"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Danh mục
                        </label>
                        <select
                            name="category_id"
                            value={formData.category_id}
                            onChange={handleInputChange}
                            className="w-full p-2 border border-gray-300 rounded-md"
                            required
                        >
                            {/* Use actual category IDs/values that your backend expects */}
                            <option value="aothun">Áo thun</option>
                            <option value="aosomi">Áo sơ mi</option>
                            <option value="aokhoac">Áo khoác</option>
                            <option value="aolen">Áo len</option>
                            <option value="vest">Áo vest</option>
                            <option value="damcongso">Đầm công sở</option>
                            <option value="damdahoi">Đầm dạ hội</option>
                            <option value="dambody">Đầm body</option>
                            <option value="vay">Váy</option>
                            <option value="hat">Mũ</option>
                            <option value="belt">Thắt lưng</option>
                            <option value="khanchoang">Khăn choàng</option>
                            <option value="quanau">Quần âu</option>
                            <option value="quanjean">Quần jean</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Giới tính
                        </label>
                        <select
                            name="sex"
                            value={formData.sex}
                            onChange={handleInputChange}
                            className="w-full p-2 border border-gray-300 rounded-md"
                            required
                        >
                            <option value="Nam">Nam</option>
                            <option value="Nữ">Nữ</option>
                            <option value="Unisex">Unisex</option>
                        </select>
                    </div>
                </div>

                <div>
                    <div className="flex items-center justify-between mb-3">
                        <label className="block text-sm font-medium text-gray-700">
                            Hình ảnh sản phẩm (URL)
                        </label>
                        <button
                            type="button"
                            onClick={handleAddImage}
                            className="px-3 py-1 bg-gray-100 text-gray-800 rounded-md flex items-center text-sm hover:bg-gray-200"
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-4 w-4 mr-1"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                            >
                                <path
                                    fillRule="evenodd"
                                    d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"
                                    clipRule="evenodd"
                                />
                            </svg>
                            Thêm ảnh
                        </button>
                    </div>
                    <div className="space-y-2">
                        {formData.images.map((image, index) => (
                            <div
                                key={index}
                                className="flex items-center space-x-2"
                            >
                                <input
                                    type="text"
                                    value={image}
                                    onChange={(e) =>
                                        handleImageChange(index, e.target.value)
                                    }
                                    className="flex-grow p-2 border border-gray-300 rounded-md"
                                    placeholder={`URL hình ảnh ${index + 1}`}
                                    // Require the first image input if no images are added yet
                                    required={
                                        formData.images.filter(
                                            (img) => img.trim() !== '',
                                        ).length === 0 && index === 0
                                    }
                                />
                                {formData.images.length > 1 ||
                                (formData.images.length === 1 &&
                                    formData.images[0].trim() !== '') ? ( // Allow removing if there's more than one input field or if the only field is not empty
                                    <button
                                        type="button"
                                        onClick={() => handleRemoveImage(index)}
                                        className={`p-2 border border-black text-red-600 rounded-md hover:bg-red-100 ${
                                            formData.images.filter(
                                                (img) => img.trim() !== '',
                                            ).length <= 1 &&
                                            formData.images[index].trim() !== ''
                                                ? 'opacity-50 cursor-not-allowed'
                                                : ''
                                        }`}
                                        disabled={
                                            formData.images.filter(
                                                (img) => img.trim() !== '',
                                            ).length <= 1 &&
                                            formData.images[index].trim() !== ''
                                        } // Disable if trying to remove the last non-empty image
                                    >
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            className="h-4 w-4"
                                            viewBox="0 0 20 20"
                                            fill="currentColor"
                                        >
                                            <path
                                                fillRule="evenodd"
                                                d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.725-1.447A1 1 0 0011 2H9zM7 8a1 1 0 011 1v6a1 1 0 11-2 0V9a1 1 0 011-1zm7 0a1 1 0 011 1v6a1 1 0 11-2 0V9a1 1 0 011-1z"
                                                clipRule="evenodd"
                                            />
                                        </svg>
                                    </button>
                                ) : null}{' '}
                                {/* Don't render remove button if only one empty input remains */}
                            </div>
                        ))}
                    </div>
                    {/* Image previews */}
                    {formData.images.filter((img) => img.trim() !== '').length >
                        0 && (
                        <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                            {formData.images
                                .filter((img) => img.trim() !== '')
                                .map((image, index) => (
                                    <div
                                        key={`preview-${index}`}
                                        className="relative w-full h-32 bg-gray-100 rounded overflow-hidden flex items-center justify-center" // Added flex for centering placeholder
                                    >
                                        <img
                                            src={image}
                                            alt={`Image preview ${index + 1}`}
                                            className="h-full w-full object-cover"
                                            onError={(e) => {
                                                (
                                                    e.target as HTMLImageElement
                                                ).src = '/placeholder.svg'; // Use a local placeholder if image fails
                                                (
                                                    e.target as HTMLImageElement
                                                ).classList.add('p-4'); // Add padding to placeholder
                                            }}
                                        />
                                    </div>
                                ))}
                        </div>
                    )}
                </div>

                <div>
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="text-lg font-medium text-gray-900">
                            Kích thước sản phẩm & Tồn kho
                        </h3>
                        <button
                            type="button"
                            onClick={handleAddVariant}
                            className="px-3 py-1 bg-gray-100 text-gray-800 rounded-md flex items-center text-sm hover:bg-gray-200"
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-4 w-4 mr-1"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                            >
                                <path
                                    fillRule="evenodd"
                                    d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"
                                    clipRule="evenodd"
                                />
                            </svg>
                            Thêm biến thể
                        </button>
                    </div>
                    <div className="space-y-4">
                        {formData.variants.map((variant, index) => (
                            <div
                                key={index}
                                className="border rounded-md p-4 bg-gray-50"
                            >
                                {' '}
                                {/* Added background color */}
                                <div className="flex items-center justify-between mb-3">
                                    <h4 className="text-sm font-semibold text-gray-700">
                                        {' '}
                                        {/* Bold font */}
                                        Biến thể {index + 1}
                                    </h4>
                                    {formData.variants.length > 1 && (
                                        <button
                                            type="button"
                                            onClick={() =>
                                                handleRemoveVariant(index)
                                            }
                                            className={`p-1 border border-black text-red-500 rounded-md hover:bg-red-100 text-xs ${
                                                formData.variants.length <= 1
                                                    ? 'opacity-50 cursor-not-allowed'
                                                    : ''
                                            }`}
                                            disabled={
                                                formData.variants.length <= 1
                                            } // Disable if only one variant remains
                                        >
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                className="h-4 w-4"
                                                viewBox="0 0 20 20"
                                                fill="currentColor"
                                            >
                                                <path
                                                    fillRule="evenodd"
                                                    d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.725-1.447A1 1 0 0011 2H9zM7 8a1 1 0 011 1v6a1 1 0 11-2 0V9a1 1 0 011-1zm7 0a1 1 0 011 1v6a1 1 0 11-2 0V9a1 1 0 011-1z"
                                                    clipRule="evenodd"
                                                />
                                            </svg>
                                        </button>
                                    )}
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                    {' '}
                                    {/* Responsive grid */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Kích cỡ
                                        </label>
                                        <select
                                            name="size"
                                            value={variant.size}
                                            onChange={(e) =>
                                                handleVariantChange(
                                                    index,
                                                    'size',
                                                    e.target.value,
                                                )
                                            }
                                            className="w-full p-2 border border-gray-300 rounded-md"
                                            required
                                        >
                                            {/* Add common sizes. Consider fetching these from an API if they are dynamic. */}
                                            <option value="">
                                                -- Chọn kích cỡ --
                                            </option>
                                            <option value="S">S</option>
                                            <option value="M">M</option>
                                            <option value="L">L</option>
                                            <option value="XL">XL</option>
                                            <option value="XXL">XXL</option>
                                            {/* Add more sizes as needed */}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Màu sắc
                                        </label>
                                        <select
                                            name="color"
                                            value={variant.color}
                                            onChange={(e) =>
                                                handleVariantChange(
                                                    index,
                                                    'color',
                                                    e.target.value,
                                                )
                                            }
                                            className="w-full p-2 border border-gray-300 rounded-md"
                                            required
                                        >
                                            {/* Add common colors. Consider fetching these from an API if they are dynamic. */}
                                            <option value="">
                                                -- Chọn màu --
                                            </option>
                                            <option value="Đen">Đen</option>
                                            <option value="Trắng">Trắng</option>
                                            <option value="Xanh dương">
                                                Xanh dương
                                            </option>
                                            <option value="Đỏ">Đỏ</option>
                                            <option value="Xám">Xám</option>
                                            {/* Add more colors as needed */}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Số lượng tồn kho
                                        </label>
                                        <input
                                            type="number"
                                            name="stock"
                                            value={variant.stock}
                                            onChange={(e) =>
                                                handleVariantChange(
                                                    index,
                                                    'stock',
                                                    e.target.value,
                                                )
                                            }
                                            className="w-full p-2 border border-gray-300 rounded-md"
                                            min="0"
                                            placeholder="1000"
                                            required
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="flex justify-end space-x-3">
                    <button
                        type="button"
                        onClick={() => navigate('/admin/products')} // Navigating to /admin/products
                        className="px-6 py-3 border border-black rounded-full hover:bg-black hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={loading}
                    >
                        Hủy
                    </button>
                    <button
                        type="submit"
                        className="px-6 py-3 border border-black rounded-full bg-black text-white hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed" // Styled submit button
                        disabled={loading}
                    >
                        {loading ? (
                            <svg
                                className="animate-spin h-5 w-5 text-white mx-auto"
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                            >
                                <circle
                                    className="opacity-25"
                                    cx="12"
                                    cy="12"
                                    r="10"
                                    stroke="currentColor"
                                    strokeWidth="4"
                                ></circle>
                                <path
                                    className="opacity-75"
                                    fill="currentColor"
                                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l2-2.647z"
                                ></path>
                            </svg>
                        ) : isEditMode ? (
                            'Cập nhật sản phẩm'
                        ) : (
                            'Thêm sản phẩm'
                        )}
                    </button>
                </div>
            </form>

            {/* Render the MessageDialog */}
            <MessageDialog
                isOpen={isMessageDialogOpen}
                title={messageDialogTitle}
                description={messageDialogDescription}
                type={messageDialogType}
                onClose={handleCloseMessageDialog} // Pass the handler to close the dialog and potentially navigate
            />

            {/* <ProductPage />  -- Remove this if ProductPage is a separate route/component */}
        </div>
    );
}

export default AddProduct;
