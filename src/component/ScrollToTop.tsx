import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const ScrollToTop = () => {
    const { pathname } = useLocation();

    useEffect(() => {
        // Đợi DOM cập nhật xong rồi scroll lên đầu
        const timeout = setTimeout(() => {
            window.scrollTo({ top: 0, behavior: 'auto' }); // không dùng 'smooth' để tránh flicker
        }, 0);

        return () => clearTimeout(timeout);
    }, [pathname]);

    return null;
};

export default ScrollToTop;
