import { BrowserRouter, Routes, Route } from "react-router-dom";

/* LANDING PAGE */
import Navbar from "./LandingPage/Navbar";
import Hero from "./LandingPage/Hero";
import Features from "./LandingPage/Features";
import Why from "./LandingPage/Why";
import Testimonial from "./LandingPage/Testimonial";
import Footer from "./components/Footer";

/* LOGIN PAGE */
import LoginPage from "./LoginPage/LoginPage";

/* REGISTER PAGE */
import RegisterPage from "./RegisterPage/RegisterPage";

/* DASHBOARD */
import DashboardPage from "./MainPage/MainPage";
import WaterPage from "./WaterPage/WaterPage";
import CaloriesPage from "./CaloriesPage/CaloriesPage";
import SleepPage from "./SleepPage/SleepPage";
// MoodPage and WeightPage removed

/* STYLES */
import "./LandingPage/LandingPage.css";

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
                <Route path="/water" element={<WaterPage />} />
                <Route path="/calories" element={<CaloriesPage />} />
                <Route path="/sleep" element={<SleepPage />} />

            </Routes>
        </BrowserRouter>
    );
}
