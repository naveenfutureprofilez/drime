import { useState, useCallback, memo } from "react";
import { MdClose, MdDashboard, MdLogout, MdSettings, MdPerson, MdTransferWithinAStation, MdSecurity } from "react-icons/md";
import { IoReorderThreeOutline } from "react-icons/io5";
import { AdminSidebarAuthUserItem } from "./AdminSidebarAuthUserItem";
import { useLogout } from "@common/auth/requests/logout";
import { Link } from "react-router";

const AdminSidebars = memo(function AdminSidebars() {
    const [isOpen, setIsOpen] = useState(false);

    const toggleSidebar = useCallback(() => setIsOpen(!isOpen), []);

    const handleLinkClick = useCallback(() => {
        if (isOpen) {
            setIsOpen(false);
        }
    }, [isOpen]);

    const logout = useLogout();

    const handleLogout = useCallback(() => {
        logout.mutate();
    }, [logout]);

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
                        <Link
                            to="/admin"
                            onClick={handleLinkClick}
                            className="flex items-center gap-3 p-3 rounded-lg 
                         text-black hover:bg-[#e5e7eb] transition"
                        >
                            <MdDashboard className="text-pink-500 text-xl" />
                            <span>Dashboard </span>
                        </Link>
                        <Link
                            to="/admin/profile"
                            onClick={handleLinkClick}
                            className="flex items-center gap-3 p-3 rounded-lg 
                         text-black hover:bg-[#e5e7eb] transition"
                        >
                            <MdPerson className="text-pink-500 text-xl" />
                            <span>Profile</span>
                        </Link>
                        <Link
                            to="/admin/transfer-files"
                            onClick={handleLinkClick}
                            className="flex items-center gap-3 p-3 rounded-lg 
                         text-black hover:bg-[#e5e7eb] transition"
                        >
                            <MdTransferWithinAStation className="text-pink-500 text-xl" />
                            <span>Transfer Files</span>
                        </Link>
                        {/* <Link
                            to="/admin/settings"
                            onClick={handleLinkClick}
                            className="flex items-center gap-3 p-3 rounded-lg 
                         text-black hover:bg-[#e5e7eb] transition"
                        >
                            <MdSettings className="text-pink-500 text-xl" />
                            <span>Settings</span>
                        </Link> */}
                        <Link
                            to="/admin/2fa"
                            onClick={handleLinkClick}
                            className="flex items-center gap-3 p-3 rounded-lg 
                         text-black hover:bg-[#e5e7eb] transition"
                        >
                            <MdSecurity className="text-pink-500 text-xl" />
                            <span>Two-Factor Authentication</span>
                        </Link>
                    </nav>
                </div>
                {/* Bottom Auth/User Item */}
                <div className="mt-auto">
                    <div
                        onClick={handleLogout}
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
});

export default AdminSidebars;
