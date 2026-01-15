import { Link, useNavigate } from "react-router-dom";
import "./TopNav.css";
import logo from "../styles/Pictures/logo-removebg-preview.png";
import iconApple from "../styles/Pictures/calorie.png";
import iconHeart from "../styles/Pictures/mood.png";
import iconWeight from "../styles/Pictures/weight.png";
import iconWater from "../styles/Pictures/water.png";
import iconSleep from "../styles/Pictures/sleep.png";
import iconLogout from "../styles/Pictures/logout.png";
import iconHome from "../styles/Pictures/homepage.png";

const links = [
  { to: "/mainpage", label: "Kezelőpult", img: iconHome },
  { to: "/sleep", label: "Alvás", img: iconSleep },
  { to: "/calories", label: "Kalória", img: iconApple },
  { to: "/water", label: "Víz", img: iconWater },
  { to: "/mood", label: "Hangulat", img: iconHeart },
  { to: "/weight", label: "Súly", img: iconWeight }
];

export default function TopNav() {
  const navigate = useNavigate();

  const logout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <div className="topnav">
      <div className="topnav-left">
        <Link to="/mainpage" className="brand">
          <img src={logo} alt="Metabalance" className="brand-logo" />
          <span className="brand-text">Metabalance</span>
        </Link>
      </div>
      <div className="topnav-center">
        <div className="topnav-links">
          {links.map((link) => (
            <Link key={link.to} to={link.to} className="topnav-link">
              {link.img ? <img src={link.img} alt={link.label} className="nav-img" /> : null}
              {link.label}
            </Link>
          ))}
        </div>
      </div>
      <div className="topnav-right">
        <button className="logout-btn" onClick={logout}>
          <img src={iconLogout} alt="logout" className="nav-img" />
          Kijelentkezés
        </button>
        <div className="avatar" title="Profil" />
      </div>
    </div>
  );
}
