import { useState } from "react";
import { MdClose, MdDashboard, MdFileOpen, MdLogout, MdSettings } from "react-icons/md";
import { IoReorderThreeOutline } from "react-icons/io5";
import { AdminSidebarAuthUserItem } from "./AdminSidebarAuthUserItem";
import { useLogout } from "@common/auth/requests/logout";
import { FaFile } from "react-icons/fa";

function AdminSidebars() {
    const [isOpen, setIsOpen] = useState(false);

    const toggleSidebar = () => setIsOpen(!isOpen);

    const handleLinkClick = () => {
        if (isOpen) {
            setIsOpen(false);
        }
    };

    const logout = useLogout();

    return (
        <>
            {/* Mobile Top Bar */}
            <div className="xl:hidden fixed top-0 left-0 w-full bg-[#f6f8fa] text-black flex items-center justify-between px-4 py-3 z-50 shadow-md">
                <h2 className="text-lg font-bold">Logo</h2>
                <button onClick={toggleSidebar} className="text-2xl">
                    {isOpen ? <MdClose /> : <IoReorderThreeOutline />}
                </button>
            </div>

            {/* Sidebar */}
            <div
                className={`fixed top-0 left-0 h-screen bg-[#f6f8fa] border-r border-[#ddd] flex flex-col px-4 py-6 z-40 transition-all duration-300  w-[260px]   ${isOpen ? "translate-x-0" : "-translate-x-full"} xl:translate-x-0 xl:static`}
            >
                <div>
                    {/* Logo (desktop) */}
                    <div className="hidden xl:flex justify-start mb-10">
                        <h2 className="text-black text-xl font-bold">Logo</h2>
                    </div>

                    {/* Menu Items */}
                    <nav className="flex flex-col space-y-2 mt-10 xl:mt-0">
                        <a
                            href="/admin"
                            onClick={handleLinkClick}
                            className="flex items-center gap-3 p-3 rounded-lg 
                         text-black hover:bg-[#e5e7eb] transition"
                        >
                            <MdDashboard className="text-pink-500 text-xl" />
                            <span>Dashboard </span>
                        </a>
                        <a
                            href="/admin/transfer-files"
                            onClick={handleLinkClick}
                            className="flex items-center gap-3 p-3 rounded-lg 
                         text-black hover:bg-[#e5e7eb] transition"
                        >
                            <FaFile className="text-pink-500 text-xl" />
                            <span>Transfer Files</span>
                        </a>
                        <a
                            href="/account-settings"
                            onClick={handleLinkClick}
                            className="flex items-center gap-3 p-3 rounded-lg 
                         text-black hover:bg-[#e5e7eb] transition"
                        >
                            <MdSettings className="text-pink-500 text-xl" />
                            <span>Account Settings</span>
                        </a>
                    </nav>
                </div>
                {/* Bottom Auth/User Item */}
                <div className="mt-auto">
                    <div
                        onClick={() => {
                            logout.mutate();
                        }}
                        className="flex items-center gap-3 p-3 rounded-lg 
             text-black hover:bg-[#e5e7eb] transition cursor-pointer"
                    >
                        <MdLogout className="text-pink-500 text-xl" />
                        <span>Logout</span>
                    </div>

                </div>
            </div>
        </>
    );
}

export default AdminSidebars;
