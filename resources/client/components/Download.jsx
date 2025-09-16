import Vector from "../../../public/images/Vector.png"

// Helper function to format expiry date and time
const formatExpiry = (expiresAt, totalSize) => {
    const sizeText = totalSize ? formatFileSize(totalSize) : '4.5 KB';
    
    if (!expiresAt) {
        return `${sizeText} - No expiry date`;
    }
    
    try {
        const expiryDate = new Date(expiresAt);
        const formattedDate = expiryDate.toLocaleDateString('en-US'); // MM/DD/YYYY format
        const formattedTime = expiryDate.toLocaleTimeString('en-US', { 
            hour12: false, 
            hour: '2-digit', 
            minute: '2-digit' 
        }); // 24-hour format
        
        return `${sizeText} - Expires on ${formattedDate} at ${formattedTime}`;
    } catch (error) {
        return `${sizeText} - Invalid expiry date`;
    }
};

// Helper function to format file size
const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 B';
    
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
};

export default function Download({ expiresAt, totalSize, itemCount = 1 }) {
    return (
        <div className="column-center border-apply p-4">
            <img src={Vector} alt="" className="h-12 w-12 object-cover" />
            <h3 className="mt-2 normal-heading text-sm md:!text-[18px] mt-1 ">
                You received {itemCount} {itemCount === 1 ? 'item' : 'items'}
            </h3>
            <p className="normal-para text-sm md:!text-[16px] mt-1">{formatExpiry(expiresAt, totalSize)}</p>
        </div>
    )
}
