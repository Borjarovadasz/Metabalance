import RegisterCard from "./Card";
import Footer from "../LandingPage/Footer";
import "../styles/Register.css"

export default function RegisterPage() {
    return (
        <>
            <div className="register-page">
                <RegisterCard />
            </div>

            <Footer />
        </>
    );
}
