import { BrowserRouter, Routes, Route } from "react-router-dom";

// Landing page részei
import Navbar from "./LandingPage/Navbar";
import Hero from "./LandingPage/Hero";
import Features from "./LandingPage/Features";
import Why from "./LandingPage/Why";
import Testimonial from "./LandingPage/Testimonial";
import Footer from "./LandingPage/Footer";

// Login page
import LoginPage from "./LoginPage/Footer.jsx";

import "./styles/LandingPage.css";

export default function App() {
    return (
        <BrowserRouter>
            <Routes>
                {/* FŐ OLDAL */}
                <Route
                    path="/"
                    element={
                        <>
                            <Navbar />
                            <Hero />
                            <Features />
                            <Why />
                            <Testimonial />
                            <Footer />
                        </>
                    }
                />

                {/* BEJELENTKEZÉS OLDAL */}
                <Route path="/login" element={<LoginPage />} />
            </Routes>
        </BrowserRouter>
    );
}
