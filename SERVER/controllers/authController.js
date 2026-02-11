const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const fs = require("fs/promises");
const path = require("path");
const db = require("../db");
require("dotenv").config();

const TOKENS_LOG = path.join(__dirname, "..", "tokens.txt");

const mapUserRow = (row) => ({
  azonosito: row.id,
  nev: `${row.last_name} ${row.first_name}`.trim(),
  email: row.email,
  szerepkor: row.role
});

exports.registerUser = async (req, res) => {
  try {
    const firstName = req.body.keresztnev || req.body.firstName;
    const lastName = req.body.vezeteknev || req.body.lastName;
    const { email, password, phone, gender } = req.body;

    if (!firstName || !lastName || !email || !password || !gender) {
      return res.status(400).json({ message: "Hianyzo kotelezo mezok" });
    }

    const [existing] = await db.query("SELECT id FROM users WHERE email = ?", [email]);
    if (existing.length > 0) {
      return res.status(409).json({ message: "Email mar letezik" });
    }

    const hashed = await bcrypt.hash(password, 10);
    const [result] = await db.query(
      "INSERT INTO users (first_name, last_name, email, password, phone, gender) VALUES (?, ?, ?, ?, ?, ?)",
      [firstName, lastName, email, hashed, phone || null, gender]
    );

    const registeredAt = new Date().toISOString();
    return res.status(201).json({
      azonosito: result.insertId,
      nev: `${lastName} ${firstName}`.trim(),
      email,
      szerepkor: "user",
      regisztracio_datum: registeredAt
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Szerver hiba" });
  }
};

exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const [rows] = await db.query("SELECT * FROM users WHERE email = ?", [email]);

    if (rows.length === 0) {
      return res.status(400).json({ message: "Hibas email vagy jelszo" });
    }

    const user = rows[0];
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return res.status(400).json({ message: "Hibas email vagy jelszo" });
    }

    const expiresInSec = 60 * 60; // 1 ora
    const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: expiresInSec });
    const expDate = new Date(Date.now() + expiresInSec * 1000).toISOString();

    try {
      const line = `[${new Date().toISOString()}] user_id=${user.id} email=${user.email} token=${token}\n`;
      await fs.appendFile(TOKENS_LOG, line, { encoding: "utf8" });
    } catch (logErr) {
      console.error("Token log write failed", logErr.message);
    }

    res.cookie("token", token, {
      httpOnly: true,
      sameSite: "lax",
      secure: false,
      maxAge: expiresInSec * 1000
    });
    return res.json({
      lejarat: expDate,
      felhasznalo: mapUserRow(user)
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Szerver hiba" });
  }
};

exports.logoutUser = async (_req, res) => {
  res.clearCookie("token");
  return res.json({ uzenet: "Sikeres kijelentkezes", sikeres: true });
};

exports.getUserData = async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM users WHERE id = ?", [req.userId]);
    if (rows.length === 0) {
      return res.status(404).json({ message: "Felhasznalo nem talalhato" });
    }
    return res.json(mapUserRow(rows[0]));
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Szerver hiba" });
  }
};
