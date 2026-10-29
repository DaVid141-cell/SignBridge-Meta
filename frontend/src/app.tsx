import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./css/index.css"
import Route from "./routes/route";
import { BrowserRouter } from "react-router-dom";

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <BrowserRouter>
            <Route/>
        </BrowserRouter>
    </StrictMode>
)