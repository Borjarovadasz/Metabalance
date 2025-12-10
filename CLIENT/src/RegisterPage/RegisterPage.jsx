import { useState } from "react";

export default function RegisterForm() {

    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        confirmPassword: "",
        phone: "",
        gender: "Férfi"
    });

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (formData.password !== formData.confirmPassword) {
            alert("A két jelszó nem egyezik!");
            return;
        }

        const res = await fetch("http://localhost:5000/api/auth/register", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                name: formData.firstName + " " + formData.lastName,
                email: formData.email,
                password: formData.password,
                phone: formData.phone,
                gender: formData.gender
            })
        });

        const data = await res.json();

        if (res.ok) {
            alert("Sikeres regisztráció!");
        } else {
            alert(data.message || "Hiba történt!");
        }
    };

    return (
        <form className="px-4" onSubmit={handleSubmit}>

            {/* Keresztnév + Vezetéknév */}
            <div className="row mb-3">
                <div className="col">
                    <label className="fw-bold small mb-1">Keresztnév</label>
                    <input
                        type="text"
                        className="form-control"
                        placeholder="Keresztnév"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleChange}
                    />
                </div>

                <div className="col">
                    <label className="fw-bold small mb-1">Vezetéknév</label>
                    <input
                        type="text"
                        className="form-control"
                        placeholder="Vezetéknév"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleChange}
                    />
                </div>
            </div>

            {/* Email */}
            <label className="fw-bold small mb-1">E-mail</label>
            <input
                type="email"
                className="form-control mb-3"
                placeholder="valaki@pelda.hu"
                name="email"
                value={formData.email}
                onChange={handleChange}
            />

            {/* Jelszó */}
            <label className="fw-bold small mb-1">Jelszó</label>
            <input
                type="password"
                className="form-control mb-3"
                placeholder="********"
                name="password"
                value={formData.password}
                onChange={handleChange}
            />

            {/* Jelszó megerősítése */}
            <label className="fw-bold small mb-1">Jelszó megerősítése</label>
            <input
                type="password"
                className="form-control mb-3"
                placeholder="********"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
            />

            {/* Telefonszám */}
            <label className="fw-bold small mb-1">Telefonszám</label>
            <input
                type="text"
                className="form-control mb-3"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
            />

            {/* Nem */}
            <label className="fw-bold small mb-1">Nem</label>
            <select
                className="form-control mb-4"
                name="gender"
                value={formData.gender}
                onChange={handleChange}
            >
                <option>Férfi</option>
                <option>Nő</option>
            </select>

            {/* Gomb */}
            <button type="submit" className="btn btn-danger w-100 rounded-pill fw-bold">
                Regisztráció
            </button>

        </form>
    );
}
