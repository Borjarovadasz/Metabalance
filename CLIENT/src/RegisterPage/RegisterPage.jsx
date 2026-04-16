import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./RegisterPage.css";
import { apiFetch } from "../api";
import Footer from "../components/Footer";

export default function RegisterPage() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    gender: "male"
  });

  const handleChange = (e) => {
    const isPhone = e.target.name === "phone";
    const value = isPhone
      ? e.target.value.replace(/[^0-9+ ]/g, "")
      : e.target.value;
    setFormData({
      ...formData,
      [e.target.name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const { firstName, lastName, email, password, confirmPassword, phone, gender } = formData;

    if (!firstName.trim() || !lastName.trim() || !email.trim() || !password.trim() || !confirmPassword.trim() || !gender) {
      alert("Kérlek töltsd ki az összes kötelező mezőt!");
      return;
    }

    if (password !== confirmPassword) {
      alert("A két jelszó nem egyezik!");
      return;
    }

    try {
      await apiFetch("/api/auth/register", {
        method: "POST",
        body: JSON.stringify({
          keresztnev: firstName,
          vezeteknev: lastName,
          email,
          password,
          phone,
          gender
        })
      });
      alert("Sikeres regisztráció!");
      navigate("/login");
    } catch (err) {
      alert(err.message || "Hiba történt!");
    }
  };

  return (
    <div className="register-page">
      <div className="register-container">

        <h1>Regisztráció</h1>
        <p className="subtitle">Hozd létre fiókodat, és fedezd fel a lehetőségeket.</p>

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

          <label>Telefonszám (opcionális)</label>
          <input
            type="text"
            placeholder="+36 30 123 4567"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            inputMode="tel"
            maxLength={20}
          />

          <label>Nem</label>
          <select
            name="gender"
            value={formData.gender}
            onChange={handleChange}
          >
            <option value="male">Férfi</option>
            <option value="female">Nő</option>
            <option value="other">Egyéb</option>
            <option value="unknown">Nem adom meg</option>
          </select>

          <button type="submit" className="btn-register">
            Regisztráció
          </button>
        </form>

      </div>

      <Footer />
    </div>
  );
}
