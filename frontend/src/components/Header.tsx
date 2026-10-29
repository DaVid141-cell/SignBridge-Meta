import { Link, useLocation } from "react-router-dom";

export default function header() {
    const {pathname} = useLocation();
    const isDemo = pathname === "/demo"
    return (
        <header className="flex items-center justify-between px-6 py-8 md:px-12 font-iceland">
            {/*logo position */}
            <Link to="/" className="text-5xl text-[#464FFF]">
                {'<'}SignBridge/{'>'}
            </Link>

            <nav className="flex items-center gap-8">
                <ul className="hidden items-center gap-8 text-sm md:flex">
                    <li>
                        <Link to="/#features" className="text-[#464FFF] transition hover:text-white text-2xl">Features</Link>
                    </li>
                    <li>
                        <Link to="/#how-it-works" className="text-[#464FFF] transition hover:text-white text-2xl">How it works</Link>
                    </li>
                    <li>
                        <Link to="/#privacy" className="text-[#464FFF] transition hover:text-white text-2xl">Privacy</Link>
                    </li>
                </ul>

                {!isDemo && (
                    <div className="bg-[#4F5DFF] rounded-full px-8 py-1 ">
                    <Link to="/demo" className="bg=[#4F5DFF] text-3xl text-white transition hover:text-black">Demo</Link>
                </div>
                )}
            </nav>

            
        </header>
    )
}