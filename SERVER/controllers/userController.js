const bcrypt = require("bcryptjs");
const db = require("../db");

const buildName = (firstName, lastName) => `${lastName} ${firstName}`.trim();

exports.getOwnProfile = async (req, res) => {
  try {
    const userId = req.userId;
    const [rows] = await db.query(
      `SELECT u.*, p.start_weight_kg, p.current_weight_kg, p.daily_goal_count
       FROM users u
       LEFT JOIN profiles p ON p.user_id = u.id
       WHERE u.id = ?`,
      [userId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "Felhasznalo nem talalhato" });
    }

    const user = rows[0];

    const [dailyStats] = await db.query(
      `SELECT type, SUM(value) as total, MIN(unit) as unit
       FROM measurements
       WHERE user_id = ? AND DATE(recorded_at) = CURDATE()
       GROUP BY type`,
      [userId]
    );

    const statsMap = dailyStats.reduce((acc, row) => {
      acc[row.type] = `${row.total || 0}${row.unit ? " " + row.unit : ""}`.trim();
      return acc;
    }, {});

    return res.json({
      azonosito: user.id,
      nev: buildName(user.first_name, user.last_name),
      email: user.email,
      szerepkor: user.role,
      regisztracio_datum: user.created_at,
      profil: {
        kezdo_suly: user.start_weight_kg,
        aktualis_suly: user.current_weight_kg,
        napi_celok_szama: user.daily_goal_count || 0,
        ossz_statisztikak: {
          viz: statsMap.VIZ || "0",
          alvas: statsMap.ALVAS || "0",
          kaloria: statsMap.KALORIA || "0",
          testsuly: statsMap.TESTSULY || "0",
          hangulat: statsMap.HANGULAT || "0"
        }
      }
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Szerver hiba" });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const userId = req.userId;
    const firstName = req.body.keresztnev || req.body.firstName;
    const lastName = req.body.vezeteknev || req.body.lastName;
    const { email, phone, gender, suly, startSuly } = req.body;

    const [userRows] = await db.query("SELECT * FROM users WHERE id = ?", [userId]);
    if (userRows.length === 0) {
      return res.status(404).json({ message: "Felhasznalo nem talalhato" });
    }

    await db.query(
      "UPDATE users SET first_name = COALESCE(?, first_name), last_name = COALESCE(?, last_name), email = COALESCE(?, email), phone = COALESCE(?, phone), gender = COALESCE(?, gender) WHERE id = ?",
      [firstName, lastName, email, phone, gender, userId]
    );

    if (suly !== undefined || startSuly !== undefined) {
      await db.query(
        `INSERT INTO profiles (user_id, start_weight_kg, current_weight_kg)
         VALUES (?, ?, ?)
         ON DUPLICATE KEY UPDATE
            start_weight_kg = COALESCE(VALUES(start_weight_kg), start_weight_kg),
            current_weight_kg = COALESCE(VALUES(current_weight_kg), current_weight_kg)`
        , [userId, startSuly || null, suly || null]
      );
    }

    return res.json({
      uzenet: "Profil sikeresen frissitve",
      sikeres: true
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Szerver hiba" });
  }
};

exports.deleteAccount = async (req, res) => {
  try {
    const userId = req.userId;
    const { jelszo } = req.body;
    if (!jelszo) {
      return res.status(400).json({ message: "Jelszo kotelezo a torleshez" });
    }

    const [rows] = await db.query("SELECT password FROM users WHERE id = ?", [userId]);
    if (rows.length === 0) {
      return res.status(404).json({ message: "Felhasznalo nem talalhato" });
    }

    const valid = await bcrypt.compare(jelszo, rows[0].password);
    if (!valid) {
      return res.status(400).json({ message: "Hibas jelszo" });
    }

    await db.query("DELETE FROM users WHERE id = ?", [userId]);
    return res.json({ sikeres: true, uzenet: "Felhasznalo torolve" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Szerver hiba" });
  }
};
