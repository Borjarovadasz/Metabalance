import { useEffect, useState } from "react";
import TopNav from "../components/TopNav";
import { apiFetch } from "../api";
import { useAuthGuard } from "../hooks/useAuthGuard";
import Footer from "../components/Footer";
import "./ProfilePage.css";
import defaultProfile from "../styles/Pictures/profilepicture.png";

const splitName = (full = "") => {
  const parts = full.trim().split(" ");
  if (parts.length <= 1) return { firstName: full, lastName: "" };
  return { firstName: parts.slice(1).join(" "), lastName: parts[0] };
};

export default function ProfilePage() {
  useAuthGuard();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [gender, setGender] = useState("unknown");
  const [image, setImage] = useState(defaultProfile);

  useEffect(() => {
    const load = async () => {
      try {
        const user = await apiFetch("/api/users/me");
        const name = splitName(user.nev || "");
        setFirstName(name.firstName || "");
        setLastName(name.lastName || "");
        setEmail(user.email || "");
        setPhone(user.phone || "");
        setGender(user.gender || "unknown");
        setImage(user.profile_image || defaultProfile);
      } catch (err) {
        console.error(err.message);
      }
    };
    load();
  }, []);

  const onImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = String(reader.result || "");
      setImage(dataUrl);
    };
    reader.readAsDataURL(file);
  };

  const saveProfile = async () => {
    try {
      await apiFetch("/api/users/me", {
        method: "PUT",
        body: JSON.stringify({
          keresztnev: firstName,
          vezeteknev: lastName,
          phone,
          gender,
          profileImage: image
        })
      });
      alert("Profil elmentve");
    } catch (err) {
      console.error(err.message);
      alert("Nem sikerült menteni");
    }
  };

  return (
    <div className="profile-page">
      <TopNav />
      <div className="profile-container">
        <aside className="profile-side">
          <div className="profile-card">
            <div className="profile-avatar">
              <img src={image} alt="Profil" />
            </div>
            <div className="profile-name">{lastName} {firstName}</div>
            <div className="profile-email">{email}</div>
          </div>
        </aside>

        <main className="profile-main">
          <h2>Profil szerkesztése</h2>

          <section className="profile-section">
            <div className="profile-section-title">Profilkép</div>
            <div className="profile-photo-row">
              <div className="profile-photo">
                <img src={image} alt="Profil" />
              </div>
              <label className="profile-upload">
                Kép feltöltése
                <input type="file" accept="image/*" onChange={onImageChange} />
              </label>
            </div>
          </section>

          <section className="profile-section">
            <div className="profile-section-title">Alapvető információk</div>
            <div className="profile-form">
              <label>
                Név
                <div className="profile-name-row">
                  <input
                    type="text"
                    placeholder="Vezetéknév"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                  />
                  <input
                    type="text"
                    placeholder="Keresztnév"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                  />
                </div>
              </label>
              <label>
                E-mail
                <input type="email" value={email} disabled />
              </label>
              <label>
                Telefonszám
                <input
                  type="text"
                  placeholder="+36 30 123 4567"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/[^0-9+ ]/g, ""))}
                  inputMode="tel"
                  maxLength={20}
                />
              </label>
              <label>
                Nem
                <select value={gender} onChange={(e) => setGender(e.target.value)}>
                  <option value="male">Férfi</option>
                  <option value="female">Nő</option>
                  <option value="other">Egyéb</option>
                  <option value="unknown">Nem adom meg</option>
                </select>
              </label>
            </div>
          </section>

          <div className="profile-actions">
            <button className="profile-save" onClick={saveProfile}>Változtatások mentése</button>
          </div>
        </main>
      </div>
      <Footer />
    </div>
  );
}
