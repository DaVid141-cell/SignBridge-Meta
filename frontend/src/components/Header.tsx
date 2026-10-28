export default function header() {
    return (
        <header className="flex items-center justify-between px-6 py-8 md:px-12 font-iceland">
            {/*logo position */}
            <a href="/" className="text-5xl text-[#464FFF]">
                {'<'}SignBridge/{'>'}
            </a>

            <nav className="flex items-center gap-8">
                <ul className="hidden items-center gap-8 text-sm md:flex">
                    <li>
                        <a href="#features" className="text-[#464FFF] transition hover:text-white text-2xl">Features</a>
                    </li>
                    <li>
                        <a href="#how-it-works" className="text-[#464FFF] transition hover:text-white text-2xl">How it works</a>
                    </li>
                    <li>
                        <a href="#privacy" className="text-[#464FFF] transition hover:text-white text-2xl">Privacy</a>
                    </li>
                </ul>

                <div className="bg-[#4F5DFF] rounded-full px-8 py-1 ">
                    <a href="/demo" className="bg=[#4F5DFF] text-3xl text-white transition hover:text-black">Demo</a>
                </div>
            </nav>

            
        </header>
    )
}