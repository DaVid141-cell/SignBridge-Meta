import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import '../css/index.css'
import LandingPage from "../page/landing-page.tsx"

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <LandingPage/>
    </StrictMode>
)