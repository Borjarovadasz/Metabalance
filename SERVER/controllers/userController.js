const db = require("../db");

exports.updateProfile = async (req, res) => {
  try {
    const { name, phone, gender } = req.body;
    await db.query(
      "UPDATE users SET name = ?, phone = ?, gender = ? WHERE id = ?",
      [name, phone, gender, req.userId]
    );
    res.json({ message: "Profil frissítve" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Szerver hiba" });
  }
};

