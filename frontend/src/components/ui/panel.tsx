import type { ReactNode } from "react";

export default function Panel({children, className = ""}: {children? :ReactNode; className?: string}){
    return (
        <div className={`rounded-2xl border border-[#7B89FF]/20 bg-[#0B0E1F]/70 backdrop-blur-sm ${className}`}>
            {children}
        </div>
    )
}