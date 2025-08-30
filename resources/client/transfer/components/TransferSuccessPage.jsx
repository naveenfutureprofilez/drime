// Your consolidated component file: TransferSuccessPage.jsx

import React, { useState } from 'react';
import { AiOutlineCopy } from 'react-icons/ai';
import Shared from "../../../../public/images/Shared.png"
import Mail from "../../../../public/images/Mail.png"
import { EmailIcon } from '@ui/icons/material/Email';

// Helper function to calculate and format expiry message
const getExpiryMessage = (files, expiresInHours) => {
    // Try to get expiry date from files data (from server response)
    if (files && files.length > 0 && files[0]?.expires_at) {
        const expiryDate = new Date(files[0].expires_at);
        const currentDate = new Date();
        const timeDiff = expiryDate.getTime() - currentDate.getTime();
        const daysRemaining = Math.ceil(timeDiff / (1000 * 3600 * 24));
        
        const formattedDate = expiryDate.toLocaleDateString('en-US');
        
        if (daysRemaining <= 0) {
            return `The download link has expired.`;
        } else if (daysRemaining === 1) {
            return `The download link expires tomorrow (${formattedDate}).`;
        } else {
            return `The download link expires in ${daysRemaining} days (${formattedDate}).`;
        }
    }
    
    // Fallback: calculate expiry based on expiresInHours if files data not available
    if (expiresInHours) {
        const currentDate = new Date();
        const expiryDate = new Date(currentDate.getTime() + (expiresInHours * 60 * 60 * 1000));
        const formattedDate = expiryDate.toLocaleDateString('en-US');
        
        if (expiresInHours < 24) {
            const hours = expiresInHours;
            return `The download link expires in ${hours} hour${hours === 1 ? '' : 's'} (${formattedDate}).`;
        } else {
            const days = Math.floor(expiresInHours / 24);
            return `The download link expires in ${days} day${days === 1 ? '' : 's'} (${formattedDate}).`;
        }
    }
    
    // Ultimate fallback
    return `The download link for your transfer is available for a limited time.`;
};

const TransferSuccessPage = ({ type = 'Link', downloadLink, onEmailTransfer, onNewTransfer, files, expiresInHours }) => {
    const headingText = type === 'Link'
        ? 'Your link is ready'
        : 'Your transfer has been sent to your recipient(s)';

    const [copied, setCopied] = useState(false);
    const copyToClipboard = async () => {
        try {
            await navigator.clipboard.writeText(downloadLink);
            // toast.success("Copied successfully!");
            setCopied(true)
        } catch (err) {
            console.error("Failed to copy: ", err);
            // toast.error("Failed to copy text.");
            setCopied(true)
        }
    };

    return (
    <>
        <div className="center-align">
            <div className="manage-col p-4 md:p-[40px]">
                <div className="center-align mb-6">
                    {type === "Link" ? (
                        <img src={Shared} alt='' className='h-32 w-32' />
                    ) : (
                        <img src={Mail} alt='' className='h-32 w-32' />
                    )}
                </div>

                <div className="mb-2 text-center">
                    <h2 className="normal-heading">{headingText}</h2>
                </div>

                {type === 'Link' && (
                    <>
                        <p className="normal-para mb-4 md:p-3">
                            {getExpiryMessage(files, expiresInHours)}
                        </p>
                        <div className="center-align ">
                            <div className="w-full max-w-xl">
                                <div className="relative flex items-center">
                                    <input
                                        type="text"
                                        readOnly
                                        value={downloadLink}
                                        className="w-full pr-12 pl-4 py-3 rounded-[13px] border border-gray-300 bg-gray-50 font-mono text-sm text-gray-700 pe-[60px] focus:outline-none transition"
                                    />
                                    <button
                                        onClick={copyToClipboard}
                                        className="absolute right-0 p-3 px-4 rounded-[13px] bg-[#08CF65] text-white hover:bg-green-600 transition-colors flex items-center justify-center"
                                    >
                                        <AiOutlineCopy className="h-5 w-5" />
                                    </button>
                                </div>
                            </div>

                        </div>
                        {copied && (
                            <p className="normal-para text-[13px] mt-1">
                                Link copied to clipboard!
                            </p>
                        )}
                    </>
                )}
                {type === 'Email' && (
                    <div className="manage-col mt-3 mb-4 md:mb-8 p-1 md:p-3">
                        <button className="button-sm sm:button-md md:button-lg ">
                            View transfer
                        </button>
                    </div>
                )}


            </div>
        </div>

            <div className="justify-center  pt-4">
                <p className='text-black font-semibold text-center'>Need to send more files? <button onClick={onNewTransfer} className=" text-black underline">
                    Start new transfer
                </button> </p>
                {/* <button onClick={() => window.open(downloadLink, '_blank')}>
                    Open download page
                </button> */}

                
            </div>
            {/* <p className="pt-[30px] md:pt-[69px] text-[14px] md:text-[16px] text-black font-[600] leading-5 text-center">
                            Need to send more files?{' '}
                            <Link to="#" onClick={() => { setStep(4) }} className="underline">
                                Start new transfer
                            </Link> 
                        </p> */}
    </>
    );
};

export default TransferSuccessPage;