import { useEffect } from 'react'; // Import useEffect

interface MessageDialogProps {
    isOpen: boolean;
    title: string;
    description?: string;
    type: 'success' | 'error' | '';
    onClose: () => void;
}

function MessageDialog({
    isOpen,
    title,
    description,
    type,
    onClose,
}: MessageDialogProps) {
    // Effect để tự động đóng dialog sau 3 giây - Đã chuyển sang component này
    useEffect(() => {
        let timer: NodeJS.Timeout;
        if (isOpen) {
            timer = setTimeout(() => {
                onClose(); // Gọi hàm đóng dialog nhận từ prop
            }, 3000);
        }

        return () => {
            clearTimeout(timer);
        };
    }, [isOpen, onClose]);

    if (!isOpen) {
        return null;
    }

    return (
        <div className="fixed inset-0   backdrop-filter  flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-xl shadow-2xl max-w-sm w-full text-center">
                <div
                    className={`mx-auto w-12 h-12 rounded-full flex items-center justify-center ${
                        type === 'success' ? 'bg-green-100' : 'bg-red-100'
                    }`}
                >
                    {type === 'success' ? (
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-6 w-6 text-green-500"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M5 13l4 4L19 7"
                            />
                        </svg>
                    ) : (
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-6 w-6 text-red-500"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M6 18L18 6M6 6l12 12"
                            />
                        </svg>
                    )}
                </div>

                <p className="mt-3 text-lg font-semibold text-gray-900">
                    {title}
                </p>

                {description && (
                    <p className="mt-1 text-sm text-gray-500">{description}</p>
                )}

                <button
                    onClick={onClose}
                    className="mt-4 px-6 py-2 bg-white text-black border rounded-md hover:bg-black hover:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
                >
                    OK
                </button>
            </div>
        </div>
    );
}

export default MessageDialog;
