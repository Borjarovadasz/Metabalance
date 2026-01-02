import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./RegisterPage.css";

export default function RegisterPage() {

  const navigate = useNavigate();

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

    const { firstName, lastName, email, password, confirmPassword, phone, gender } = formData;

    if (!firstName.trim() || !lastName.trim() || !email.trim() || !password.trim() || !confirmPassword.trim() || !phone.trim() || !gender.trim()) {
      alert("Kérlek töltsd ki az összes mezőt!");
      return;
    }

    if (password !== confirmPassword) {
      alert("A két jelszó nem egyezik!");
      return;
    }

    const res = await fetch("http://localhost:5000/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: `${firstName} ${lastName}`,
        email,
        password,
        phone,
        gender
      })
    });

    const data = await res.json();

    if (res.ok) {
      alert("Sikeres regisztráció!");
      navigate("/login");
    } else {
      alert(data.message || "Hiba történt!");
    }
  };

  return (
    <div className="register-page">
      <div className="register-container">

        <h1>Regisztráció</h1>
        <p className="subtitle">Hozza létre fiókját, és fedezze fel a lehetőségeket.</p>

        <form onSubmit={handleSubmit} className="register-form">

          <div className="register-row">
            <div className="register-col">
              <label>Keresztnév</label>
              <input
                type="text"
                placeholder="Keresztnév"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
              />
            </div>

            <div className="register-col">
              <label>Vezetéknév</label>
              <input
                type="text"
                placeholder="Vezetéknév"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
              />
            </div>
          </div>

          <label>E-mail</label>
          <input
            type="email"
            placeholder="valaki@pelda.hu"
            name="email"
            value={formData.email}
            onChange={handleChange}
          />

          <label>Jelszó</label>
          <input
            type="password"
            placeholder="********"
            name="password"
            value={formData.password}
            onChange={handleChange}
          />

          <label>Jelszó megerősítése</label>
          <input
            type="password"
            placeholder="********"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
          />

          <label>Telefonszám</label>
          <input
            type="text"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
          />

          <label>Nem</label>
          <select
            name="gender"
            value={formData.gender}
            onChange={handleChange}
          >
            <option value="Férfi">Férfi</option>
            <option value="Nő">Nő</option>
          </select>

          <button type="submit" className="btn-register">
            Regisztráció
          </button>
        </form>

      </div>

      <footer className="register-footer">
        © 2025 Metabalance. Minden jog fenntartva.
      </footer>
    </div>
  );
}