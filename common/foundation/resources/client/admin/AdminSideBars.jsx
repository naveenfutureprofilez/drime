import { useState, useCallback, memo } from "react";
import { MdClose, MdDashboard, MdLogout, MdSettings, MdPerson, MdTransferWithinAStation, MdSecurity } from "react-icons/md";
import { useLogout } from "@common/auth/requests/logout";
import { Link } from "react-router";
import Logo  from "../../../../../public/images/logo.png"
import { RxHamburgerMenu } from "react-icons/rx";

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
            <div className="xl:hidden fixed top-0 left-0 w-full bg-[#f6f8fa] text-black flex items-center justify-between px-4 py-4 z-50 shadow-md">
                <h2 className="text-lg font-bold">
                    <Link to={'/'} className='block max-w-[160px]'>
                        <img src={Logo} alt="Drime Logo" className="  object-cover" />
                    </Link>
                </h2>
                <button onClick={toggleSidebar} className="text-2xl">
                    {isOpen ? <MdClose /> : <RxHamburgerMenu className="text-2xl" />}
                </button>
            </div>

            {/* Sidebar */}
            <div
                className={`fixed top-0 left-0 h-screen bg-[#f6f8fa] border-r border-[#ddd] flex flex-col px-4 py-6 z-40 transition-all duration-300 !p-4  w-[300px] min-w-[300px]   ${isOpen ? "translate-x-0" : "-translate-x-full"} xl:translate-x-0 xl:static`}
            >
                <div>
                    {/* Logo (desktop) */}
                    <div className="hidden xl:flex justify-start mb-10">
                        <h2 className="text-black text-xl font-bold">
                            <img src={Logo} className="p-4 w-full max-w-[180px] " />
                        </h2>
                    </div>

                    {/* Menu Items */}
                    <nav className="flex flex-col  mt-10 xl:mt-0">
                        {/* <Link
                            to="/admin"
                            onClick={handleLinkClick}
                            className="bg-white shadow p-4 rounded-[12px] mb-2 block hover:shadow-sm flex items-center justify-start gap-3 text-[17px]"
                        >
                            <MdDashboard className="text-pink-500 text-2xl" />
                            <span>Dashboard </span>
                        </Link> */}
                        <Link
                            to="/admin/transfer-files"
                            onClick={handleLinkClick}
                            className={` bg-white shadow p-4 rounded-[12px] mb-2 block hover:shadow-sm flex items-center justify-start gap-3 text-[17px] ${window.location.pathname && window.location.pathname.startsWith('/admin/transfer-files') ? 'bg-main text-white' : '' }`} >
                            <MdTransferWithinAStation className="text-pink-500 text-2xl" />
                            <span>Transfer Files</span>
                        </Link>
                        <Link
                            to="/admin/profile"
                            onClick={handleLinkClick}
                            className={`bg-white ${window.location.pathname && window.location.pathname.startsWith('/admin/profile') ? 'bg-main text-white' : '' }
                             shadow p-4 rounded-[12px] mb-2 focus:text-black block hover:shadow-sm flex items-center justify-start gap-3 text-[17px]`}
                        >
                            <MdPerson className="text-pink-500 text-3xl" />
                            <span>Profile</span>
                        </Link>
                        
                        <Link
                            to="/admin/2fa"
                            onClick={handleLinkClick}
                            className={` bg-white shadow p-4 rounded-[12px] mb-2 block hover:shadow-sm flex items-center justify-start gap-3 text-[17px] ${window.location.pathname && window.location.pathname.startsWith('/admin/2fa') ? 'bg-main text-white' : '' }`}
                        >
                            <MdSecurity className="text-pink-500 text-2xl" />
                            <span>2FA Setup</span>
                        </Link>
                    </nav>
                </div>
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
