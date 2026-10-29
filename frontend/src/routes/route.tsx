import LandingPage from "@/page/landing-page";
import { Routes, Route as RouterRoute } from "react-router-dom"
import DemoPage from "@/page/demo";

export default function Route() {
    return (
        <Routes>
            <RouterRoute path="/" element={<LandingPage />} />
            <RouterRoute path="/demo" element={<DemoPage/>} />
        </Routes>
    )
}