import type { ReactNode } from "react";
import Header from "../Header";

export default function DemoLayout({children}: {children: ReactNode}){
    return (
        <main className="bg-linear-to-t from-[#3B45F6] to-[#0B0E1F] min-h-screen">
            <Header/>
            <div>
                {children}
            </div>
        </main>
    )
}