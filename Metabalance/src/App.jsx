import { BrowserRouter, Routes, Route } from "react-router-dom";
import RegisterPage from "./RegisterPage/Page.jsx";




// Landing page részei
import Navbar from "./LandingPage/Navbar";
import Hero from "./LandingPage/Hero";
import Features from "./LandingPage/Features";
import Why from "./LandingPage/Why";
import Testimonial from "./LandingPage/Testimonial";
import Footer from "./LandingPage/Footer";

// LOGIN PAGE
import LoginPage from "./LoginPage/Page.jsx";

import "./styles/LandingPage.css";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* FŐOLDAL */}
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

        {/* LOGIN OLDAL */}
        <Route path="/login" element={<LoginPage />} />
        {/* REGISTER OLDAL */}
        <Route path="/register" element={<RegisterPage />} />
      </Routes>
    </BrowserRouter>
  );
}
