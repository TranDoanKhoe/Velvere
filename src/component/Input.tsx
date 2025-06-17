import React from 'react';

// Định nghĩa kiểu cho props của component Input
interface InputProps {
    name: string;
    type: string;
    label: string;
    placeholder?: string; // placeholder không bắt buộc
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onBlur: (e: React.FocusEvent<HTMLInputElement>) => void;
    error?: string; // error không bắt buộc (chỉ có khi có lỗi)
}

// Component Input nhận các prop từ cha
function Input({
    name,
    type,
    label,
    placeholder = ' ',
    value,
    onChange,
    onBlur,
    error,
}: InputProps) {
    return (
        <div className="relative w-full mt-6">
            <input
                type={type}
                name={name}
                value={value}
                onChange={onChange}
                onBlur={onBlur}
                required
                className="peer w-full border-0 border-b border-gray-300 bg-transparent pt-6 pb-2 text-sm focus:outline-none focus:border-gray-500"
                placeholder={placeholder}
            />
            <label
                htmlFor={name}
                className="absolute left-0 top-1 text-sm text-gray-500 transition-all duration-200
                peer-placeholder-shown:top-5 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400
                peer-focus:top-1 peer-focus:text-sm peer-focus:text-gray-400"
            >
                {label}
            </label>
            {/* Hiển thị lỗi nếu có */}
            {error && <p className="text-sm text-red-500 mt-1">{error}</p>}
        </div>
    );
}

export default Input;
