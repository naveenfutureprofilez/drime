import React from 'react'
import Logo  from "../../../public/images/logo.png"
import { Link } from 'react-router'

export default function Header() {
    return (
        <div className="w-full py-4">
            <div className="flex justify-between items-center w-full gap-3 md:gap-0">
                <div className="flex items-center max-w-[120px] sm:max-w-[170px]">
                    <Link to={'/'} className=' bg-white rounded-[15px] p-[10px] px-[20px]'>
                    <img src={Logo} alt="Drime Logo" className=" object-cover" />
                    </Link>
                </div>

                {/* Buttons */}
                <a href='https://drime.cloud/' className="flex items-center gap-2 bg-white sm:px-3 sm:py-2 rounded-[15px]">
                    <button className="hidden sm:block font-schi font-[600] text-black rounded-md cursor-pointer px-4 py-2">
                        Learn More
                    </button>
                    <p  className="button-sm text-[15px] sm:text-sm px-4 sm:px-3 whitespace-nowrap">
                        Get Started for Free
                    </p>
                </a>
            </div>
        </div>

    )
}
