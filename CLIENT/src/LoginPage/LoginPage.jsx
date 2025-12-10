import { useState } from "react";

export default function LoginForm() {

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();

        const res = await fetch("http://localhost:5000/api/auth/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ email, password })
        });

        const data = await res.json();

        if (res.ok) {
            localStorage.setItem("token", data.token);
            alert("Sikeres bejelentkezés!");

            // Navigáció ha kell:
            window.location.href = "./MainPage/Page"  // változtasd arra az oldalra ami a MainPage
        } else {
            alert(data.message || "Hibás email vagy jelszó!");
        }
    };

    return (
        <form className="px-4" onSubmit={handleSubmit}>

            <label className="fw-bold small mb-1">E-mail</label>
            <input
                type="email"
                className="form-control mb-3"
                placeholder="valaki@pelda.hu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
            />

            <label className="fw-bold small mb-1">Jelszó</label>
            <input
                type="password"
                className="form-control mb-4"
                placeholder="********"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
            />

            <button type="submit" className="btn btn-primary w-100 rounded-pill fw-bold">
                Bejelentkezés
            </button>

        </form>
    );
}
