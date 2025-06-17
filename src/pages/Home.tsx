import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';

const cn = (...classes: string[]) => classes.filter(Boolean).join(' ');

const Home: React.FC = () => {
    const [isScrolled, setIsScrolled] = useState(false);
    const [, setIsFirstImageVisible] = useState(false);
    const [, setIsSecondImageVisible] = useState(false);
    const [, setIsTextVisible] = useState(false);
    const videoRef = useRef<HTMLVideoElement>(null);
    const firstImageRef = useRef<HTMLDivElement>(null);
    const secondImageRef = useRef<HTMLDivElement>(null);
    const textRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 10);

            // Check if first image is in viewport
            if (firstImageRef.current) {
                const rect = firstImageRef.current.getBoundingClientRect();
                setIsFirstImageVisible(rect.top < window.innerHeight * 0.8);
            }

            // Check if second image is in viewport
            if (secondImageRef.current) {
                const rect = secondImageRef.current.getBoundingClientRect();
                setIsSecondImageVisible(rect.top < window.innerHeight * 0.8);
            }

            // Check if text is in viewport
            if (textRef.current) {
                const rect = textRef.current.getBoundingClientRect();
                setIsTextVisible(rect.top < window.innerHeight * 0.9);
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, []);

    const getRectangleSize = () => {
        const screenWidth = window.innerWidth;
        const screenHeight = window.innerHeight;

        const rectangleWidth = screenWidth * 0.28;
        const rectangleHeight = screenHeight * 0.86;

        return { width: rectangleWidth, height: rectangleHeight };
    };

    const rectangleSize = getRectangleSize();

    const commonStyle = {
        width: isScrolled ? `${rectangleSize.width}px` : '0px',
        height: isScrolled ? `${rectangleSize.height}px` : 'auto',
        transition: 'width 1.5s ease-in-out, height 1.5s ease-in-out',
    };

    return (
        <div className="flex flex-col items-center contact-us-container">
            <div
                className="flex justify-center items-start transition-[align-items] duration-1500"
                style={{
                    alignItems: isScrolled ? 'center' : 'normal',
                }}
            >
                {/* Left Image */}
                <div
                    className={cn(
                        'flex relative transition-opacity duration-1500',
                        isScrolled ? 'opacity-100' : 'opacity-0',
                    )}
                    style={commonStyle}
                >
                    <img
                        src="https://res.cloudinary.com/dvsg1fr4g/image/upload/v1745318873/Betterimage.ai_1745318839409_e777tj.jpg"
                        alt="Left Bag"
                        className="object-cover w-full h-full"
                    />
                </div>

                {/* Video */}
                <div
                    className={cn(
                        'flex relative justify-center items-center transition-all duration-2000 ease-in-out',
                    )}
                    style={{
                        width: isScrolled
                            ? `${rectangleSize.width}px`
                            : ' 99.2vw',
                        height: isScrolled
                            ? `${rectangleSize.height}px`
                            : '100vh',
                        marginTop: isScrolled ? '0' : '-6vw',
                        transition:
                            'width 1.5s ease-in-out, height 1.5s ease-in-out',
                    }}
                >
                    <video
                        ref={videoRef}
                        src="https://res.cloudinary.com/dvsg1fr4g/video/upload/v1744715417/0415_mpcwmy.mp4"
                        autoPlay
                        muted
                        loop
                        playsInline
                        className="object-cover w-full h-full"
                    />
                    {/* Mother's Day Gifts Title and Discover button overlay */}
                    <div className="absolute flex flex-col items-center justify-center text-white">
                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif mb-4">
                            Mother's Day Gifts
                        </h1>
                        <Link
                            to="/productPage"
                            className="mt-4 inline-block text-center border-b border-white hover:border-opacity-70 transition-all duration-300 text-sm md:text-base tracking-wider"
                        >
                            Discover
                        </Link>
                    </div>
                </div>

                {/* Right Image */}
                <div
                    className={cn(
                        'flex relative transition-opacity duration-1500 ease-in-out',
                        isScrolled ? 'opacity-100' : 'opacity-0',
                    )}
                    style={commonStyle}
                >
                    <img
                        src="https://res.cloudinary.com/dvsg1fr4g/image/upload/v1745318874/Betterimage.ai_1745318813398_b0czhb.jpg"
                        alt="Right Bag"
                        className="object-cover w-full h-full"
                    />
                </div>
            </div>

            {/* Scroll Content */}
            <div className="mt-[2.5vw] text-center">
                <h2 className="text-[1.5vw] w-[40vw] text-gray-600  tracking-[.1em] font-medium font-serif">
                    Tỏa sáng khác biệt, định đoạt phong cách
                </h2>
            </div>
            <div className="mt-[8vw] text-center">
                <h2
                    className="text-[2.5vw] w-[50vw] tracking-widest font-medium text-gray-800"
                    style={{ fontFamily: 'Didot, "Times New Roman", serif' }}
                >
                    Bộ Sưu Tập Thời Trang May Sẵn 2025
                </h2>
                <p className=" text-gray-600">
                    Thời gian Quý giá, Trải nghiệm Tinh hoa: Nhanh, Tiện, Thoải
                    mái
                </p>
            </div>

            <div className="flex flex-row items-center mt-[2.5vw] gap-3 p-[1vw]">
                {/* Men Fashion */}
                <div
                    className="relative group block overflow-hidden"
                    style={{
                        width: `${rectangleSize.width}px`,
                        height: `${rectangleSize.height}px`,
                    }}
                >
                    <img
                        src="https://res.cloudinary.com/dvsg1fr4g/image/upload/v1745322207/Betterimage.ai_1745322188608_p3illl.jpg"
                        alt="Men fashion"
                        className="object-cover w-full h-full"
                    />
                    {/* Gradient overlay - darker at bottom */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent"></div>
                    <a
                        href="/productPage?sex=Nam"
                        className="absolute inset-0 flex flex-col items-center justify-end pb-[4vw] transition font-serif cursor-pointer"
                    >
                        <div className="flex flex-col items-center justify-center">
                            <span
                                className="text-white text-5xl font-bold"
                                style={{
                                    textShadow: '0 2px 4px rgba(0, 0, 0, 0.5)',
                                }}
                            >
                                Men Fashion
                            </span>
                        </div>
                        <div className="mt-4 px-6 py-2 text-white text-2xl tracking-widest group relative hover:text-gray-200 transition-colors duration-300">
                            Explore
                            <span className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-0 h-[1px] bg-white transition-all duration-500 group-hover:w-full" />
                        </div>
                    </a>
                </div>

                {/* Women Fashion */}
                <div
                    className="relative group block overflow-hidden"
                    style={{
                        width: `${rectangleSize.width}px`,
                        height: `${rectangleSize.height}px`,
                    }}
                >
                    <img
                        src="https://res.cloudinary.com/dvsg1fr4g/image/upload/v1745321978/_ONA0428_b7btez.jpg"
                        alt="Women fashion"
                        className="object-cover w-full h-full"
                    />
                    {/* Gradient overlay - darker at bottom */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent"></div>

                    <a
                        href="/productPage?sex=Nữ"
                        className="absolute inset-0 flex flex-col items-center justify-end pb-[4vw] transition font-serif cursor-pointer"
                    >
                        <div className="flex flex-col items-center justify-center">
                            <span
                                className="text-white text-5xl font-bold"
                                style={{
                                    textShadow: '0 2px 4px rgba(0, 0, 0, 0.5)',
                                }}
                            >
                                Women Fashion
                            </span>
                        </div>
                        <div className="mt-4 px-6 py-2 text-white text-2xl tracking-widest group relative hover:text-gray-200 transition-colors duration-300">
                            Explore
                            <span className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-0 h-[1px] bg-white transition-all duration-500 group-hover:w-full" />
                        </div>
                    </a>
                </div>
            </div>

            <div className="mt-[8vw] text-center">
                <h2
                    className="text-[2.5vw] w-[50vw] tracking-widest font-medium text-gray-800"
                    style={{ fontFamily: 'Didot, "Times New Roman", serif' }}
                >
                    Bộ Sưu Tập Xuân Hè 2025
                </h2>
                <p className=" text-gray-600">
                    Biểu tượng phong cách đương đại
                </p>
            </div>

            <div className="w-full h-auto flex justify-center items-center mt-[2.5vw]">
                <img
                    src="https://res.cloudinary.com/dvsg1fr4g/image/upload/v1744783167/Betterimage.ai_1744782971571_kp9shu.jpg"
                    alt=""
                />
            </div>
            {/* <div className="w-full h-auto flex justify-center items-center mt-[10vw]">
                <img
                    src="https://res.cloudinary.com/dvsg1fr4g/image/upload/v1745318587/Betterimage.ai_1745318572622_axueow.jpg"
                    alt=""
                />
            </div> */}
        </div>
    );
};

export default Home;
