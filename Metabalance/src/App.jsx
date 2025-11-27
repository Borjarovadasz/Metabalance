import Navbar from "./LandingPage/Navbar";
import Hero from "./LandingPage/Hero";
import Features from "./LandingPage/Features";
import Why from "./LandingPage/Why";
import Testimonial from "./LandingPage/Testimonial";
import Footer from "./LandingPage/Footer";

import "./styles/LandingPage.css";

export default function App() {
  return (
    <>
      <Navbar />
      <Hero />
      <Features />
      <Why />
      <Testimonial />
      <Footer />
    </>
  );
}
