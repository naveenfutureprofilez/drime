// Your consolidated component file: TransferSuccessPage.jsx

import React, { useState } from 'react';
import { AiOutlineCopy } from 'react-icons/ai';
import Shared from "../../../../public/images/Shared.png"
import Mail from "../../../../public/images/Mail.png"
import { EmailIcon } from '@ui/icons/material/Email';

const TransferSuccessPage = ({ type = 'Link', downloadLink, onEmailTransfer , onNewTransfer  }) => {
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

                <div className="mb-3 md:mb-6 text-center">
                    <h2 className="normal-heading">{headingText}</h2>
                </div>

                {type === 'Link' && (
                    <>
                        <p className="normal-para mb-4 md:mb-8 p-1 md:p-3">
                            The download link for your transfer is available for X days.
                        </p>
                        <div className="center-align space-x-2 p-2 md:p-5 ">
                            <div className="w-full max-w-xl">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Share this link
                                </label>

                                <div className="relative flex items-center">
                                    {/* Input */}
                                    <input
                                        type="text"
                                        readOnly
                                        value={downloadLink}
                                        className="w-full pr-12 pl-4 py-3 rounded-lg border border-gray-300 bg-gray-50 font-mono text-sm text-gray-700 focus:ring-2 focus:ring-[#08CF65] focus:border-[#08CF65] transition"
                                    />

                                    {/* Copy button */}
                                    <button
                                        onClick={copyToClipboard}
                                        className="absolute right-2 p-2 rounded-md bg-[#08CF65] text-white hover:bg-green-600 transition-colors flex items-center justify-center"
                                    >
                                        <AiOutlineCopy className="h-5 w-5" />
                                    </button>
                                </div>
                            </div>

                        </div>
                        {copied && (
                            <p className="normal-para mb-4 md:mb-8 p-1 md:p-3">
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

            <div className="between-align  gap-1  pt-4">
                <button onClick={() => window.open(downloadLink, '_blank')}>
                    Open download page
                </button>

                <button onClick={onNewTransfer} className=" text-primary">
                    Send another transfer
                </button>
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