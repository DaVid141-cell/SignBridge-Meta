import type { ReactNode } from "react";
import Header from "../Header";

export default function LandingLayout({ children }: { children: ReactNode }) {
    return(
        <main className="min-h-screen bg-[#171616] text-white bg-[linear-gradient(rgba(91,108,255,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(91,108,255,0.08)_1px,transparent_1px)] bg-[size:48px_48px]">
           <Header/>
           <div>
                {children}
            </div> 
        </main>
    )
}