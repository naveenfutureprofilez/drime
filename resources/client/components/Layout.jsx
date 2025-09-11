import Header from "./Header";

export default function Layout({ children }) {

    return (
        <div className="hero_bg">
            <div className="mx-auto container h-screen sm:container md:container lg:container xl:max-w-[1440px] px-4">
                <Header />
                <div className="boxmodel max-w-[400px] m-auto">
                    <div className="box">
                        {children} 
                    </div>
                </div>
            </div>
        </div>
    );
}