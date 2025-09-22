import Header from "./Header";

export default function Layout({ children }) {

    return (
        <div className="hero_bg">
            <div className="flex justify-center items-center mx-auto container h-screen sm:container md:container lg:container xl:max-w-[1440px] px-4">
                <Header />
                <div className="w-full boxmodel     m-auto">
                    <div className="mt-[7vh] md:mt-0 box shadow-lg max-w-[435px] relative bg-white h-[576px] ">
                        {children} 
                    </div>
                </div>
            </div>
        </div>
    );
}