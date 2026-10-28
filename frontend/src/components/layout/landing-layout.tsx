import type { ReactNode } from "react";
import Header from "../Header";

export default function LandingLayout({ children }: { children: ReactNode }) {
    return(
        <main>
           <Header/>

           <div>
                {children}
            </div> 
        </main>
    )
}