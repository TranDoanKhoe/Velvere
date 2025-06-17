import { useState } from 'react';

function Footer() {
    const [email, setEmail] = useState('');
    const [showButton, setShowButton] = useState(false);
    const [error, setError] = useState('');

    const handleInputClick = () => {
        setShowButton(true);
    };

    const handleSubscribe = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (email.trim() === '') {
            setError('The email address field is required');
        } else {
            setError('');
            alert('Đăng ký thành công!');
            // thực hiện logic gửi email nếu cần
        }
    };

    return (
        <div className="relative z-20 bg-white text-[13px] lg:text-[15px]">
            <div className="bg-gray-100 pt-20 pb-10">
                <div className=" max-w-sm mx-auto text-center">
                    <h2 className="uppercase tracking-widest font-semibold text-gray-800 text-xl">
                        Newsletter
                    </h2>
                    <p className="mt-5 text-gray-700">
                        Our newsletter keeps you updated on all our news, <br />
                        collections and access to exclusive offers.
                    </p>

                    <form
                        className="relative mt-10 w-full"
                        onSubmit={handleSubscribe}
                    >
                        <div className="relative w-full text-left">
                            <input
                                type="email"
                                id="email"
                                value={email}
                                onClick={handleInputClick}
                                onChange={(e) => setEmail(e.target.value)}
                                className="peer w-full border-0 border-b border-gray-300 bg-transparent pt-6 pb-2 text-sm focus:outline-none focus:border-gray-500"
                                placeholder=" "
                            />
                            <label
                                htmlFor="email"
                                className="absolute left-0 top-1 text-sm text-gray-500 transition-all duration-200 
                            peer-placeholder-shown:top-5 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 
                            peer-focus:top-1 peer-focus:text-sm peer-focus:text-gray-400"
                            >
                                Email address *
                            </label>

                            <div className="mt-2 h-5  mb-2">
                                {/* Thông báo lỗi */}
                                {error && (
                                    <p className="text-red-600 text-xs ">
                                        {error}
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Nút SUBSCRIBE hiển thị khi đã click vào input */}
                        <div className=" h-25">
                            {showButton && (
                                <div>
                                    <p className="text-sm text-gray-600 text-left">
                                        I agree that Vélvere may collect my
                                        personal data in order to send Vélvere
                                        newsletters.
                                    </p>

                                    <button
                                        type="submit"
                                        className="font-extralight text-sm border w-full py-2 mt-3 hover:bg-black hover:text-white transition duration-300"
                                    >
                                        SUBSCRIBE
                                    </button>
                                </div>
                            )}
                        </div>
                    </form>
                </div>
            </div>
            <div className="bg-black text-white pt-20">
                <p className="text-6xl text-center font-serif tracking-widest mb-10 pb-10">
                    VÉLVERE
                </p>

                {/* Footer Info Grid */}
                <div className="max-w-[90vw] mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 text-sm ">
                    {/* Dịch vụ */}
                    <div>
                        <h3 className="font-semibold uppercase text-white mb-2">
                            Store services
                        </h3>
                        <hr className="w-10 border-white mb-2" />
                        <ul className="space-y-1 text-gray-400">
                            <li>
                                <a href="#" className="hover:underline">
                                    Home
                                </a>
                            </li>
                            <li>
                                <a href="#" className="hover:underline">
                                    Cart
                                </a>
                            </li>
                            <li>
                                <a href="#" className="hover:underline">
                                    Contact
                                </a>
                            </li>
                            <li>
                                <a href="#" className="hover:underline">
                                    Product
                                </a>
                            </li>
                            <li>
                                <a href="#" className="hover:underline">
                                    F&Q
                                </a>
                            </li>
                            <li>
                                <a href="#" className="hover:underline">
                                    Dịch vụ bảo hành
                                </a>
                            </li>
                            <li>
                                <a href="#" className="hover:underline">
                                    Dịch vụ cá nhân hóa
                                </a>
                            </li>
                            <li>
                                <a href="#" className="hover:underline">
                                    Nghệ thuật tặng quà
                                </a>
                            </li>
                        </ul>
                    </div>
                    {/* Hỗ trợ */}
                    <div>
                        <h3 className="font-semibold uppercase text-white mb-2">
                            Help
                        </h3>
                        <hr className="w-10 border-white mb-2" />
                        <p className="text-gray-400 mb-2">
                            Quý khách có thể liên hệ với chúng tôi qua Hotline{' '}
                            <span className="text-white">+84 2838614107</span>,{' '}
                            <a href="#" className="underline">
                                Zalo
                            </a>
                            ,{' '}
                            <a href="#" className="underline">
                                Email
                            </a>
                            , hoặc{' '}
                            <a href="#" className="underline">
                                các phương thức liên hệ khác
                            </a>
                            .
                        </p>
                        <ul className="space-y-1 text-gray-400">
                            <li>
                                <a href="#" className="hover:underline">
                                    Câu hỏi thường gặp
                                </a>
                            </li>
                            <li>
                                <a href="#" className="hover:underline">
                                    Chăm sóc sản phẩm
                                </a>
                            </li>
                            <li>
                                <a href="#" className="hover:underline">
                                    Cửa hàng
                                </a>
                            </li>
                        </ul>
                    </div>

                    {/* Về Vélvere */}
                    <div>
                        <h3 className="font-semibold uppercase text-white mb-2">
                            About Vélvere
                        </h3>
                        <hr className="w-10 border-white mb-2" />
                        <ul className="space-y-1 text-gray-400">
                            <li>
                                <a href="#" className="hover:underline">
                                    Buổi trình diễn thời trang
                                </a>
                            </li>
                            <li>
                                <a href="#" className="hover:underline">
                                    Nghệ thuật & Văn hóa
                                </a>
                            </li>
                            <li>
                                <a href="#" className="hover:underline">
                                    La Maison
                                </a>
                            </li>
                            <li>
                                <a href="#" className="hover:underline">
                                    Phát triển bền vững
                                </a>
                            </li>
                            <li>
                                <a href="#" className="hover:underline">
                                    Tin mới nhất
                                </a>
                            </li>
                            <li>
                                <a href="#" className="hover:underline">
                                    Nghề nghiệp
                                </a>
                            </li>
                            <li>
                                <a href="#" className="hover:underline">
                                    Foundation Vélvere
                                </a>
                            </li>
                        </ul>
                    </div>

                    {/* TIME */}
                    <div>
                        <h3 className="font-semibold uppercase text-white mb-2">
                            TIME
                        </h3>
                        <hr className="w-10 border-white mb-2" />
                        <p className="text-gray-400">Monday to Friday:</p>
                        <p className="text-gray-400 mb-2">08:00am - 08:00pm</p>
                        <p className="text-gray-400">Saturday & Sunday:</p>
                        <p className="text-gray-400">10:00am - 04:00pm</p>
                    </div>
                    {/* Kết nối với chúng tôi */}
                    <div>
                        <h3 className="font-semibold uppercase text-white mb-2">
                            Connect with us
                        </h3>
                        <hr className="w-10 border-white mb-2" />
                        <p className="text-gray-400 mb-2 text-">
                            Đăng ký nhận thư điện tử để cập nhật những tin tức
                            mới nhất từ Vélvere, bao gồm các buổi ra mắt độc
                            quyền trực tuyến và bộ sưu tập mới.
                        </p>
                        <p className="text-gray-400">Theo dõi chúng tôi</p>
                        <div className="flex gap-3 mt-2">
                            <a
                                href="#"
                                className="text-white hover:text-gray-400"
                            >
                                <i className="fab fa-facebook-f text-2xl"></i>
                            </a>
                            <a
                                href="#"
                                className="text-white hover:text-gray-400"
                            >
                                <i className="fab fa-instagram text-2xl"></i>
                            </a>
                            <a
                                href="#"
                                className="text-white hover:text-gray-400"
                            >
                                <i className="fab fa-tiktok text-2xl"></i>
                            </a>
                            <a
                                href="#"
                                className="text-white hover:text-gray-400"
                            >
                                <i className="fab fa-youtube text-2xl"></i>
                            </a>
                            <a
                                href="#"
                                className="text-white hover:text-gray-400"
                            >
                                <i className="fab fa-snapchat text-2xl"></i>
                            </a>
                            <a
                                href="#"
                                className="text-white hover:text-gray-400"
                            >
                                <i className="fab fa-podcast text-2xl"></i>
                            </a>
                            <a
                                href="#"
                                className="text-white hover:text-gray-400"
                            >
                                <i className="fab fa-pinterest text-2xl"></i>
                            </a>
                            <a
                                href="#"
                                className="text-white hover:text-gray-400"
                            >
                                <i className="fab fa-twitter text-2xl"></i>
                            </a>
                        </div>
                    </div>
                </div>
                <div className="border-t border-gray-600 mt-10 pt-6 pb-6 text-center text-gray-500 text-xs">
                    <p>
                        © 2025 Vélvere | Terms | Privacy | Accessibility |
                        Website feedback | Complaints | ABN 49 781 030 034
                    </p>
                    <p>
                        Vélvere Pty Ltd, trading as Vélvere Fashion Co., CRICOS
                        Provider Code: 01912G
                    </p>
                </div>
            </div>
        </div>
    );
}

export default Footer;
