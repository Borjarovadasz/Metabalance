import LoginForm from "./Form";
import LoginFooter from "./Footer";

export default function LoginCard() {
    return (
        <div className="login-card shadow-sm">
            <h3 className="text-center fw-bold mb-1">Üdv újra!</h3>
            <p className="text-center text-secondary mb-4">Jelentkezz be fiókodba</p>

            <LoginForm />
            <LoginFooter />
        </div>
    );
}
