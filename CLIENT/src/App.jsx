import { BrowserRouter, Routes, Route } from "react-router-dom";


import Navbar from "./LandingPage/Navbar";
import Hero from "./LandingPage/Hero";
import Features from "./LandingPage/Features";
import Why from "./LandingPage/Why";
import Testimonial from "./LandingPage/Testimonial";
import Footer from "./components/Footer";


import LoginPage from "./LoginPage/LoginPage";


import RegisterPage from "./RegisterPage/RegisterPage";


import DashboardPage from "./MainPage/MainPage";
import WaterPage from "./WaterPage/WaterPage";
import CaloriesPage from "./CaloriesPage/CaloriesPage";
import SleepPage from "./SleepPage/SleepPage";
import MoodPage from "./MoodPage/MoodPage";
import WeightPage from "./WeightPage/WeightPage";
import ProfilePage from "./ProfilePage/ProfilePage";
import AdminPage from "./AdminPages/AdminPage";
import ReportsPage from "./AdminPages/ReportsPage";



import "./LandingPage/LandingPage.css";

export default function App() {
    return (
        <BrowserRouter>
            <Routes>

              
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

            
                <Route path="/login" element={<LoginPage />} />

            
                <Route path="/register" element={<RegisterPage />} />

               
                <Route path="/mainpage" element={<DashboardPage />} />
                <Route path="/water" element={<WaterPage />} />
                <Route path="/calories" element={<CaloriesPage />} />
                <Route path="/sleep" element={<SleepPage />} />
                <Route path="/mood" element={<MoodPage />} />
                <Route path="/weight" element={<WeightPage />} />
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="/admin" element={<AdminPage />} />
                <Route path="/admin/reports" element={<ReportsPage />} />

            </Routes>
        </BrowserRouter>
    );
}
