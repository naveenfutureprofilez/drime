// Your consolidated component file: TransferSuccessPage.jsx

import React, { useState } from 'react';
import Mail from "../../../../public/images/Mail.png"
import { CopyIcon, LinkShareIcon } from '@app/components/FigmaIcons';

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
            return `The download link for your transfer will expire in ${daysRemaining} days (${formattedDate}).`;
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

const TransferSuccessPage = ({ type = 'Link', downloadLink, onEmailTransfer, onNewTransfer, files, expiresInHours, uploadResponse }) => {
    // Debug logging
    console.log('🔍 TransferSuccessPage Debug:',  uploadResponse);
    
    // Get form data from upload response (most reliable source)
    const formData = uploadResponse?.formData || {};
    console.log('🔍 Form Data from Response:', formData);
    
    // Get all recipient emails from form data
    const recipientEmails = formData?.emails || [];
    const emailWasSent = recipientEmails.length > 0;
    
    // Get recipient emails from form data (primary) or backup from response
    const allRecipientEmails = recipientEmails.length > 0 
        ? recipientEmails 
        : (uploadResponse?.recipient_emails || []);
    
    const displayType = emailWasSent ? 'Email' : 'Link';
    
    console.log('🎯 Display Logic:', {
        emailWasSent,
        displayType,
        recipientEmails,
        recipientCount: recipientEmails.length,
        allRecipientEmails
    });
    
    const headingText = displayType === 'Link'
        ? 'Your link is ready'
        : allRecipientEmails.length > 0
            ? `Your transfer has been sent to ${allRecipientEmails.length} recipient${allRecipientEmails.length > 1 ? 's' : ''}`
            : 'Your transfer has been sent to your recipient(s)';

    const [copied, setCopied] = useState(false);
    const copyToClipboard = async () => {
        try {
            await navigator.clipboard.writeText(downloadLink);
            // toast.success("Copied successfully!");
            setCopied(true);
            setTimeout(() => setCopied(false), 3000); // Reset after 2 seconds
        } catch (err) {
            console.error("Failed to copy: ", err);
            // toast.error("Failed to copy text.");
            setCopied(true)
        }
    };

    return (
    <>
        <div className="center-align">
            <div className="manage-col px-3 min-h-[370px]">
                <div className="center-align mb-6 ">
                    {displayType === "Link" ? (
                        <LinkShareIcon />
                    ) : (
                        <img src={Mail} alt='' className='h-32 w-32' />
                    )}
                </div>

                <div className="mb-2 text-center pt-[35px]">
                    <h2 className="text-[18px] font-semibold text-black">{headingText}</h2>
                </div>

                {displayType === 'Link' && (
                    <>
                        <p className="text-[16px] mb-4 text-center text-gray-600">
                            {getExpiryMessage(files, expiresInHours)}
                        </p>
                        <div className="center-align ">
                            <div className="w-full max-w-[300px]">
                                <div className="relative flex items-center">
                                    <input
                                        type="text"
                                        readOnly
                                        value={downloadLink}
                                        className="input !my-0 pe-[60px] !py-[10px] !px-[12px]"
                                    />
                                    <button
                                        onClick={copyToClipboard}
                                        className="absolute right-0 min-w-[50px] px-4 h-[45px] rounded-r-[10px] bg-[#08CF65] 
                                        text-white hover:bg-green-600 transition-all h-full  
                                        duration-200 flex items-center justify-center shadow-md hover:shadow-lg"
                                    >
                                        {copied ? 'Copied' : <CopyIcon />}  
                                        
                                    </button>
                                </div>
                            </div>

                        </div>
                    </>
                )}
                {displayType === 'Email' && (
                    <div className="manage-col mt-3 mb-4 md:mb-8 p-1 md:p-3">
                        {/* Show recipient emails list */}
                        {allRecipientEmails.length > 0 && (
                            <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                                {/* <p className="text-sm font-medium text-gray-700 mb-2">
                                    Sent to:
                                </p> */}
                                <div className="space-y-1 ">
                                    {allRecipientEmails.map((email, index) => (
                                        <div key={index} className="text-sm text-gray-600 flex items-center justify-center">
                                            <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                                            {email.trim()}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                        <div className="center-align mb-4 mt-4">
                            <button 
                                className="button-md bg-[#08CF65] text-white hover:bg-green-600 transition-all duration-200 shadow-md hover:shadow-lg"
                                onClick={() => window.open(downloadLink, '_blank')}
                            >
                                View transfer
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>

        <div className="justify-center  absolute bottom-0 mb-6 w-full left-0">
            <p className='text-black font-semibold text-[14px] text-center'>Need to send more files? <button onClick={onNewTransfer} className=" text-black underline">
                Start new transfer
            </button> </p>
        </div>
    </>
    );
};

export default TransferSuccessPage;