import Header from "./Header";

export default function Layout({ children }) {

    return (
        <div className="hero_bg">
            <div className="flex justify-center items-center mx-auto container h-screen sm:container md:container lg:container xl:max-w-[1440px] px-4">
                <Header />
                <div className="w-full boxmodel max-w-[435px] m-auto">
                    <div className="box shadow-lg">
                        {children} 
                    </div>
                </div>
            </div>
        </div>
    );
}