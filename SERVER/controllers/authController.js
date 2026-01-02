const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../db");
require("dotenv").config();

exports.registerUser = async (req, res) => {
  try {
    const { name, email, password, phone, gender } = req.body;
    if (!name || !email || !password)
      return res.status(400).json({ message: "Hiányzó mezők" });

    const [existing] = await db.query("SELECT id FROM users WHERE email = ?", [email]);
    if (existing.length > 0) return res.status(400).json({ message: "Email már létezik" });

    const hashed = await bcrypt.hash(password, 10);

    await db.query(
      "INSERT INTO users (name, email, password, phone, gender) VALUES (?, ?, ?, ?, ?)",
      [name, email, hashed, phone || null, gender || null]
    );

    res.json({ message: "Sikeres regisztráció" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Adatbázis hiba" });
  }
};

exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const [users] = await db.query("SELECT * FROM users WHERE email = ?", [email]);

    if (users.length === 0) return res.status(400).json({ message: "Hibás email vagy jelszó" });

    const user = users[0];
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(400).json({ message: "Hibás email vagy jelszó" });

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: "1h" });
    res.json({ token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Szerver hiba" });
  }
};

exports.getUserData = async (req, res) => {
  try {
    const [users] = await db.query(
      "SELECT id, name, email, phone, gender FROM users WHERE id = ?",
      [req.userId]
    );

    if (users.length === 0) return res.status(404).json({ message: "Felhasználó nem található" });

    res.json(users[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Szerver hiba" });
  }
};
