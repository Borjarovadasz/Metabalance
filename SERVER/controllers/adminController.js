const bcrypt = require("bcryptjs");
const db = require("../db");

exports.listUsers = async (_req, res) => {
  try {
    const [rows] = await db.query("SELECT id, first_name, last_name, email, role, active FROM users ORDER BY created_at DESC");
    return res.json(rows.map((u) => ({
      azonosito: u.id,
      nev: `${u.last_name} ${u.first_name}`.trim(),
      email: u.email,
      szerepkor: u.role,
      aktiv: !!u.active
    })));
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Szerver hiba" });
  }
};

exports.createUser = async (req, res) => {
  try {
    const { email, jelszo, szerepkor, aktiv, keresztnev, vezeteknev } = req.body;
    if (!email || !jelszo || !keresztnev || !vezeteknev) {
      return res.status(400).json({ message: "Hianyzo kotelezo mezok" });
    }
    const [existing] = await db.query("SELECT id FROM users WHERE email = ?", [email]);
    if (existing.length) {
      return res.status(409).json({ message: "Email mar letezik" });
    }
    const hashed = await bcrypt.hash(jelszo, 10);
    const [result] = await db.query(
      "INSERT INTO users (first_name, last_name, email, password, role, active) VALUES (?, ?, ?, ?, ?, ?)",
      [keresztnev, vezeteknev, email, hashed, szerepkor || "user", aktiv !== undefined ? aktiv : 1]
    );

    return res.status(201).json({
      azonosito: result.insertId,
      email,
      szerepkor: szerepkor || "user",
      aktiv: aktiv !== undefined ? !!aktiv : true,
      uzenet: "Felhasznalo letrehozva"
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Szerver hiba" });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const userId = req.params.id;
    const { email, jelszo, aktiv } = req.body;

    const [rows] = await db.query("SELECT * FROM users WHERE id = ?", [userId]);
    if (!rows.length) {
      return res.status(404).json({ message: "Felhasznalo nem talalhato" });
    }

    let hashed = null;
    if (jelszo) {
      hashed = await bcrypt.hash(jelszo, 10);
    }

    await db.query(
      "UPDATE users SET email = COALESCE(?, email), password = COALESCE(?, password), active = COALESCE(?, active) WHERE id = ?",
      [email, hashed, aktiv, userId]
    );

    return res.json({ felhasznalo_id: Number(userId), email: email || rows[0].email, aktiv: aktiv !== undefined ? !!aktiv : !!rows[0].active, uzenet: "Felhasznalo frissitve" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Szerver hiba" });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const userId = req.params.id;
    const [rows] = await db.query("SELECT id FROM users WHERE id = ?", [userId]);
    if (!rows.length) {
      return res.status(404).json({ message: "Felhasznalo nem talalhato" });
    }
    await db.query("DELETE FROM users WHERE id = ?", [userId]);
    return res.json({ sikeres: true, uzenet: "Felhasznalo torolve" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Szerver hiba" });
  }
};

exports.updateRole = async (req, res) => {
  try {
    const userId = req.params.id;
    const { szerepkor } = req.body;
    if (!szerepkor) {
      return res.status(400).json({ message: "szerepkor kotelezo" });
    }
    const [rows] = await db.query("SELECT role FROM users WHERE id = ?", [userId]);
    if (!rows.length) {
      return res.status(404).json({ message: "Felhasznalo nem talalhato" });
    }
    const currentRole = rows[0].role;
    if (currentRole === "admin" && szerepkor === "user") {
      return res.status(400).json({ message: "Admin szerepkor nem valtoztathato userre" });
    }
    await db.query("UPDATE users SET role = ? WHERE id = ?", [szerepkor, userId]);
    return res.json({ felhasznalo_id: Number(userId), uj_szerepkor: szerepkor, sikeres: true, uzenet: "Szerepkor modositva" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Szerver hiba" });
  }
};
