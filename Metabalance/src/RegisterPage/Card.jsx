import RegisterForm from "./Form.jsx";

export default function RegisterCard() {
    return (
        <div className="register-card shadow-sm">
            <h3 className="text-center fw-bold mb-1">Regisztráció</h3>
            <p className="text-center text-secondary mb-4">
                Hozza létre fiókját, és fedezze fel a lehetőségeket.
            </p>

            <RegisterForm />
        </div>
    );
}
