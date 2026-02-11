const db = require("../db");

exports.createError = async (req, res) => {
  try {
    const userId = req.userId || null;
    const { message, stack, url } = req.body;
    if (!message) {
      return res.status(400).json({ message: "message kotelezo" });
    }
    await db.query(
      "INSERT INTO errors (user_id, message, stack, url) VALUES (?, ?, ?, ?)",
      [userId, message, stack || null, url || null]
    );
    return res.json({ sikeres: true });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Szerver hiba" });
  }
};

exports.listErrors = async (_req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT e.id, e.message, e.stack, e.url, e.created_at, u.email
       FROM errors e
       LEFT JOIN users u ON u.id = e.user_id
       ORDER BY e.created_at DESC`
    );
    return res.json(rows);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Szerver hiba" });
  }
};
