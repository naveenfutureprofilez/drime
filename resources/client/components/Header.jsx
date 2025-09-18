import React from 'react'
import Logo  from "../../../public/images/logo.png"
import { Link } from 'react-router'

export default function Header() {
    return (
        <div className="w-full fixed top-0 left-0 px-4 py-4">
            <div className="flex justify-between items-center w-full gap-3 md:gap-0">
                <div className="flex items-center max-w-[120px] sm:max-w-[170px]">
                    <Link to={'/'} className=' bg-white rounded-[15px] p-[10px] px-[20px]'>
                    <img src={Logo} alt="Drime Logo" className=" object-cover" />
                    </Link>
                </div>

                {/* Buttons */}
                <a href='https://drime.cloud/' className="flex items-center gap-2 bg-white sm:px-3 sm:py-2 rounded-[15px]">
                    <button className="hidden sm:block font-schi font-[600] text-black rounded-md cursor-pointer px-2 py-2">
                        Learn More
                    </button>
                    <p className="button-sm  whitespace-nowrap ">
                        Get Started for free
                    </p>
                </a>
            </div>
        </div>

    )
}
