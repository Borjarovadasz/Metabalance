import { BrowserRouter, Routes, Route } from "react-router-dom";

/* LANDING PAGE */
import Navbar from "./LandingPage/Navbar";
import Hero from "./LandingPage/Hero";
import Features from "./LandingPage/Features";
import Why from "./LandingPage/Why";
import Testimonial from "./LandingPage/Testimonial";
import Footer from "./LandingPage/Footer";

/* LOGIN PAGE */
import LoginPage from "./LoginPage/LoginPage";

/* REGISTER PAGE */
import RegisterPage from "./RegisterPage/RegisterPage";

/* DASHBOARD */
import DashboardPage from "./MainPage/MainPage";

/* STYLES */
import "./styles/LandingPage.css";

export default function App() {
    return (
        <BrowserRouter>
            <Routes>

                {/* LANDING PAGE */}
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

                {/* LOGIN */}
                <Route path="/login" element={<LoginPage />} />

                {/* REGISTER */}
                <Route path="/register" element={<RegisterPage />} />

                {/* DASHBOARD / MAINPAGE */}
                <Route path="/mainpage" element={<DashboardPage />} />

            </Routes>
        </BrowserRouter>
    );
}
