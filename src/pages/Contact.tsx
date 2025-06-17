import React, { useState } from 'react';

const Contact: React.FC = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        message: '',
    });

    const [status, setStatus] = useState<string | null>(null);

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    ) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Giả lập gửi dữ liệu
        console.log('Form data:', formData);

        // Giả lập thành công
        setStatus('success');
        setTimeout(() => setStatus(null), 3000);

        // Reset form
        setFormData({
            name: '',
            email: '',
            message: '',
        });
    };

    return (
        <div className=" bg-gray-50">
            <div className="text-center mb-8 fixed top-0 left-0 right-0 z-10">
                <img
                    src={
                        'https://res.cloudinary.com/duongofji/image/upload/v1744732669/bgContact_h4cnbq.jpg'
                    }
                    alt="Contact Us"
                    className="mx-auto w-full h-auto object-cover brightness-50 contact-us-container "
                />
            </div>

            <div className="relative h-full mt-[30vw] z-20 bg-white items-center justify-items-center ">
                <h1 className="text-center font-semibold text-5xl mb-4 absolute top-[-150px] left-1/2 -translate-x-1/2 text-white">
                    CONTACT US
                </h1>
                <p className="text-center py-8 text-gray-500">
                    Dior Client Service Center is available from Monday
                    <br /> to Sunday from 10 AM to 9 PM.
                    <br />
                    Our Client Advisors will be delighted to assist you and
                    provide personalized advice
                    <br />
                    For support regarding services, please fill out the form
                    below.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-5  w-full mt-10 max-w-[60vw] ">
                    <div className="items-center pr-10">
                        <p className="text-lg font-semibold">Write us</p>
                        <form onSubmit={handleSubmit}>
                            {/* Full name */}
                            <div className="relative w-full">
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    required
                                    className="peer w-full border-0 border-b border-gray-300 bg-transparent pt-6 pb-2 text-sm focus:outline-none focus:border-gray-500"
                                    placeholder=" "
                                />
                                <label
                                    htmlFor="name"
                                    className="absolute left-0 top-1 text-sm text-gray-500 transition-all duration-200 
                peer-placeholder-shown:top-5 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 
                peer-focus:top-1 peer-focus:text-sm peer-focus:text-gray-400"
                                >
                                    Full name
                                </label>
                            </div>

                            {/* Email */}
                            <div className="relative w-full mt-7">
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                    className="peer w-full border-0 border-b border-gray-300 bg-transparent pt-6 pb-2 text-sm focus:outline-none focus:border-gray-500"
                                    placeholder=" "
                                />
                                <label
                                    htmlFor="email"
                                    className="absolute left-0 top-1 text-sm text-gray-500 transition-all duration-200 
                peer-placeholder-shown:top-5 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 
                peer-focus:top-1 peer-focus:text-sm peer-focus:text-gray-400"
                                >
                                    Email
                                </label>
                            </div>

                            {/* Message */}
                            <div className="relative w-full mt-7 mb-6">
                                <textarea
                                    name="message"
                                    value={formData.message}
                                    onChange={handleChange}
                                    rows={5}
                                    required
                                    className="peer w-full border-0 border-b border-gray-300 bg-transparent pt-6 pb-2 text-sm focus:outline-none focus:border-gray-500"
                                    placeholder=" "
                                ></textarea>
                                <label
                                    htmlFor="message"
                                    className="absolute left-0 top-1 text-sm text-gray-500 transition-all duration-200 
                peer-placeholder-shown:top-5 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 
                peer-focus:top-1 peer-focus:text-sm peer-focus:text-gray-400"
                                >
                                    Nội dung
                                </label>
                            </div>

                            <button
                                type="submit"
                                className="w-full px-5 py-3 mb-5 text-lg text-white rounded-md hover:bg-opacity-90"
                                style={{ backgroundColor: '#B6C99B' }}
                            >
                                Send
                            </button>
                        </form>

                        <p className="h-10">
                            {status === 'success' && (
                                <div className="max-w-4xl mx-auto pt 3 text-center text-green-600">
                                    Gửi thành công! Chúng tôi sẽ liên hệ với bạn
                                    sớm nhất.
                                </div>
                            )}
                        </p>
                    </div>
                    <div>
                        <div>
                            <p className="text-lg font-medium">Contact us</p>
                            <p className="text-gray-500 mt-3">
                                Our Client Advisors would be delighted to assist
                                you. <br />
                                You may contact us at (00) 399 778 8390. <br />
                                Service available from Monday to Sunday from
                                10am to 9pm.
                            </p>
                        </div>
                        <div className="mt-5">
                            <div className="flex py-2">
                                <i className="fa-solid fa-phone mt-1"></i>
                                <p className="ml-2 text-gray-500">
                                    (00) 399 778 8390
                                </p>
                            </div>
                            <div className="flex py-2">
                                <i className="fa-solid fa-location-dot mt-1"></i>
                                <p className="ml-3 text-gray-500">
                                    365 Nguyen Van Bao Street, District Go Vap,
                                    HCM
                                </p>
                            </div>

                            <div className="flex py-2">
                                <i className="fa-solid fa-envelope text-black text-lg mt-1"></i>
                                <p className="ml-2 text-gray-500">
                                    Velvere@gmail.com.vn
                                </p>
                            </div>
                        </div>

                        <div className="mt-10">
                            <p className="text-gray-500 text-justify">
                                By clicking "Send", you confirm that you have
                                read the Privacy Statement and agree to
                                Vélvere's processing of your personal data. You
                                can also request that we do not send you
                                personalized communications about our products
                                and services. You can exercise this right at any
                                time, by sending us a message by referring to
                                the contact section.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Contact;
