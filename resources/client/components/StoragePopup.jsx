import { useState } from 'react';
import { FaCheck } from 'react-icons/fa';
import { RiCloseFill } from 'react-icons/ri';
import storage from "../../../public/images/storage.png"
const StoragePopup = () => {
    const [isOpen, setIsOpen] = useState(false);
    const features = [
        {
            title: '20GB of secure, high-quality storage',
            description: 'No compression. No clutter. Just reliable cloud storage built for your biggest ideas.',
        },
        {
            title: 'Custom share links with full control',
            description: 'Set passwords, expiration dates, and track every document you share.',
        },
        {
            title: 'PDF-ready. Feedback-ready.',
            description: 'Fill, sign, edit and comment, all in one place, no tool switching.',
        },
    ];
    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className="bg-indigo-500 text-white px-6 py-2 rounded-full hover:bg-indigo-700 transition-colors"
            >
                Open Popup
            </button>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-0 md:p-4 bg-black/50">
                    <div className="bg-white rounded-none md:rounded-3xl shadow-2xl w-full h-full md:max-w-4xl md:h-auto flex flex-col lg:flex-row overflow-auto">
                        {/* Left image section */}
                        <div className="flex-1 flex flex-col relative h-1/3 md:h-auto">
                            <button
                                className="absolute top-4 left-4 text-black hover:text-red-500 z-10"
                                onClick={() => setIsOpen(false)}
                            >
                                <RiCloseFill size={32} />
                            </button>
                            <img
                                src={storage}
                                alt="A visual representation of cloud storage"
                                className="w-full h-full object-cover"
                            />
                        </div>

                        {/* Right content section */}
                        <div className="bg-white text-black p-4 md:p-8 flex-1 flex flex-col justify-center space-y-6 overflow-auto">
                            <h2 className="text-3xl md:text-4xl font-bold mb-3 md:mb-6">Want to store your content?</h2>
                            {features.map((item, idx) => (
                                <div key={idx} className="flex items-start space-x-3">
                                    <FaCheck className="w-6 h-6 text-green-400 mt-1" />
                                    <div>
                                        <h3 className="font-semibold text-lg md:text-xl">{item.title}</h3>
                                        <p className="text-gray-600 mt-1 text-sm md:text-base">{item.description}</p>
                                    </div>
                                </div>
                            ))}
                            <button className="button-sm md:button-md lg:button-lg w-full md:w-auto">
                                Get started for free
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </>
    );
};

export default StoragePopup;