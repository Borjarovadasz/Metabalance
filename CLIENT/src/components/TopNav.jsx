import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import "./TopNav.css";
import logo from "../styles/Pictures/logo-removebg-preview.png";
import iconApple from "../styles/Pictures/calorie.png";
import iconHeart from "../styles/Pictures/mood.png";
import iconWeight from "../styles/Pictures/weight.png";
import iconWater from "../styles/Pictures/water.png";
import iconSleep from "../styles/Pictures/sleep.png";
import iconLogout from "../styles/Pictures/logout.png";
import iconHome from "../styles/Pictures/homepage.png";
import defaultProfile from "../styles/Pictures/profilepicture.png";
import { apiFetch } from "../api";

export default function TopNav({ adminOnly = false }) {
  const navigate = useNavigate();
  const [profileImage, setProfileImage] = useState(defaultProfile);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const user = await apiFetch("/api/users/me");
        if (user.profile_image) {
          setProfileImage(user.profile_image);
        } else {
          setProfileImage(defaultProfile);
        }
      } catch {
        setProfileImage(defaultProfile);
      }
    };
    if (!adminOnly) {
      loadProfile();
    }
  }, [adminOnly]);

  const logout = () => {
    apiFetch("/api/auth/logout", { method: "POST" }).finally(() => {
      navigate("/login");
    });
  };

  return (
    <div className="topnav">
      {!adminOnly ? (
        <div className="topnav-left">
          <Link to="/mainpage" className="brand">
            <img src={logo} alt="Metabalance" className="brand-logo" />
            <span className="brand-text">Metabalance</span>
          </Link>
        </div>
      ) : (
        <div className="topnav-left" />
      )}
      {!adminOnly ? (
        <div className="topnav-center">
          <div className="topnav-links">
            <Link to="/mainpage" className="topnav-link">
              <img src={iconHome} alt="Kezelőpult" className="nav-img" />
              Kezelőpult
            </Link>
            <Link to="/sleep" className="topnav-link">
              <img src={iconSleep} alt="Alvás" className="nav-img" />
              Alvás
            </Link>
            <Link to="/calories" className="topnav-link">
              <img src={iconApple} alt="Kalória" className="nav-img" />
              Kalória
            </Link>
            <Link to="/water" className="topnav-link">
              <img src={iconWater} alt="Víz" className="nav-img" />
              Víz
            </Link>
            <Link to="/mood" className="topnav-link">
              <img src={iconHeart} alt="Hangulat" className="nav-img" />
              Hangulat
            </Link>
            <Link to="/weight" className="topnav-link">
              <img src={iconWeight} alt="Súly" className="nav-img" />
              Súly
            </Link>
          </div>
        </div>
      ) : (
        <div className="topnav-center" />
      )}
      <div className="topnav-right">
        <button className="logout-btn" onClick={logout}>
          <img src={iconLogout} alt="logout" className="nav-img" />
          Kijelentkezés
        </button>
        {!adminOnly ? (
          <button
            className="avatar-btn"
            onClick={() => navigate("/profile")}
            aria-label="Profil"
            title="Profil"
          >
            <img src={profileImage} alt="Profil" className="avatar-img" />
          </button>
        ) : null}
      </div>
    </div>
  );
}
