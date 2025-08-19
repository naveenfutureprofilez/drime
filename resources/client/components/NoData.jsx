import React from "react";
import { MdFolderOff } from "react-icons/md";

const NoData = ({ message = "No data available" }) => {
    return (
        <div className="manage-col py-12 text-gray-400">
            <MdFolderOff size={60} className="mb-4" />
            <p className="text-lg">{message}</p>
        </div>
    );
};

export default NoData;
