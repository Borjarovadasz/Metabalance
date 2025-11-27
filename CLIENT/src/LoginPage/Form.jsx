import { useNavigate } from "react-router-dom";
import { useState } from "react";

export default function LoginForm() {

    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!email.trim() || !password.trim()) {
            alert("Kérjük, töltsd ki az összes mezőt!");
            return;
        }

        navigate("/mainpage");
    };

    return (
        <form className="px-4" onSubmit={handleSubmit}>

            {/* Email */}
            <label className="fw-bold small mb-1">E-mail cím</label>
            <input
                type="email"
                className="form-control mb-3"
                placeholder="pelda@email.hu"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
            />

            {/* Password */}
            <div className="d-flex justify-content-between align-items-center">
                <label className="fw-bold small mb-1">Jelszó</label>
                <a href="#" className="small text-danger text-decoration-none">
                    Elfelejtetted a jelszavad?
                </a>
            </div>

            <input
                required
                type="password"
                className="form-control mb-3"
                placeholder="********"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
            />

            {/* Remember me */}
            <div className="d-flex align-items-center mb-3">
                <input type="checkbox" className="form-check-input me-2" />
                <label className="small">Emlékezz rám</label>
            </div>

            {/* Button */}
            <button 
                type="submit"
                className="btn btn-danger w-100 rounded-pill fw-bold text-white"
            >
                Bejelentkezés
            </button>
        </form>
    );
}
