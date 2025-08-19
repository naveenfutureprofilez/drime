import React from 'react'
import Logo  from "../../../public/images/logo.png"

export default function Header() {
    return (
        <div className="w-full px-4 py-3 md:px-6">
            <div className="flex justify-between items-center w-full gap-3 md:gap-0">
                {/* Logo */}
                <div className="flex items-center space-x-2 bg-white rounded-[15px] px-3 py-2">
                    <img src={Logo} alt="Drime Logo" className="w-15 h-15 object-cover" />
                </div>

                {/* Buttons */}
                <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-[15px]">
                    <button className="hidden sm:block font-schi font-[600] text-black rounded-md cursor-pointer px-4 py-2">
                        Learn More
                    </button>
                    <button className="button-sm md:button-md lg:button-lg whitespace-nowrap">
                        Get Started for Free
                    </button>
                </div>
            </div>
        </div>

    )
}
