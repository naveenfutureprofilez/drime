import { useEffect, useState } from 'react';
import { FaCheck } from 'react-icons/fa';
import { RiCloseFill } from 'react-icons/ri';
import storage from "../../../public/images/storage.png"
import { FigmaCheckIcon } from './FigmaIcons';
const StoragePopup = ({isOpen}) => {
    const [Open, setOpen] = useState(false);
    useEffect(() => {
        setOpen(isOpen);
    }, [isOpen]);

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
            description: ' Fill, sign, edit and comment,  all in one place, no tool switching.',
        },
    ];
    return (
        <>
            {Open && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-0 md:p-4 bg-black/50">
                    <div className="bg-white rounded-[20px] shadow-2xl w-full h-full md:max-w-[1100px] md:h-auto flex flex-col lg:flex-row overflow-auto">
                        <div className="  relative bg-[#bbecff] w-full max-w-[55%]  ">
                            <button
                                className="absolute top-4 left-4 text-black hover:text-red-500 z-10"
                                onClick={() => setOpen(false)}
                            >
                                <RiCloseFill size={32} />
                            </button>
                            <img
                                src={storage}
                                alt="A visual representation of cloud storage"
                                className="w-full h-full object-contain"
                            />
                        </div>
                        <div className="bg-white text-black px-[40px] py-[45px]  justify-center space-y-6 overflow-auto w-full max-w-[45%]">
                            <h2 className="text-[20px] lg:text-[36px] font-semibold leading-[36px] pb-4  ">Love how this was shared?</h2>
                            {features.map((item, idx) => (
                                <div key={idx} className="flex items-start space-x-3">
                                    <div className='text-3xl mt-2'>
                                        <FigmaCheckIcon />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-[15px]">{item.title}</h3>
                                        <p className="text-gray-600 mt-1 text[12px]">{item.description}</p>
                                    </div>
                                </div>
                            ))}

                            <div className='pt-[30px]'>
                                <a href='https://drime.cloud/' className="button shadow-none font-normal w-full ">
                                    Get started for free
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default StoragePopup;