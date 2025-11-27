import LoginCard from "./Card";
import Footer from "../LandingPage/Footer"; // ugyanazt használhatod
import "../styles/LoginPage.css"

export default function LoginPage() {
    return (
        <div className="login-page-container">
            <div className="login-page">
                <LoginCard />
            </div>
            <Footer />
        </div>
    );
}
