const db = require("../db");

const allowedTypes = ["VIZ", "ALVAS", "KALORIA", "HANGULAT", "TESTSULY", "LEPES"];

exports.createGoal = async (req, res) => {
  try {
    const userId = req.userId;
    const { tipus, celErtek, mertekegyseg, aktiv } = req.body;

    if (!allowedTypes.includes(tipus)) {
      return res.status(400).json({ message: "Ervenytelen tipus" });
    }
    if (celErtek === undefined || mertekegyseg === undefined) {
      return res.status(400).json({ message: "celErtek es mertekegyseg kotelezo" });
    }

    const [result] = await db.query(
      "INSERT INTO goals (user_id, type, target_value, unit, active) VALUES (?, ?, ?, ?, ?)",
      [userId, tipus, celErtek, mertekegyseg, aktiv !== undefined ? aktiv : 1]
    );

    return res.status(201).json({
      id: result.insertId,
      felhasznaloId: userId,
      tipus,
      celErtek,
      mertekegyseg,
      aktiv: aktiv !== undefined ? !!aktiv : true,
      uzenet: "Cel sikeresen letrehozva"
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Szerver hiba" });
  }
};

exports.listGoals = async (req, res) => {
  try {
    const userId = req.userId;
    const { tipus, aktiv } = req.query;
    const conditions = ["user_id = ?"]; 
    const params = [userId];

    if (tipus && allowedTypes.includes(tipus)) {
      conditions.push("type = ?");
      params.push(tipus);
    }
    if (aktiv !== undefined) {
      conditions.push("active = ?");
      params.push(Number(aktiv) === 1 ? 1 : 0);
    }

    const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
    const [rows] = await db.query(`SELECT * FROM goals ${where} ORDER BY created_at DESC`, params);

    return res.json(rows.map((g) => ({
      id: g.id,
      tipus: g.type,
      celErtek: Number(g.target_value),
      mertekegyseg: g.unit,
      aktiv: !!g.active
    })));
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Szerver hiba" });
  }
};

exports.updateGoal = async (req, res) => {
  try {
    const userId = req.userId;
    const goalId = req.params.id;
    const { celErtek, aktiv, mertekegyseg } = req.body;

    const [rows] = await db.query("SELECT * FROM goals WHERE id = ? AND user_id = ?", [goalId, userId]);
    if (rows.length === 0) {
      return res.status(404).json({ message: "Cel nem talalhato" });
    }

    await db.query(
      "UPDATE goals SET target_value = COALESCE(?, target_value), active = COALESCE(?, active), unit = COALESCE(?, unit) WHERE id = ? AND user_id = ?",
      [celErtek, aktiv, mertekegyseg, goalId, userId]
    );

    return res.json({
      id: Number(goalId),
      tipus: rows[0].type,
      celErtek: celErtek !== undefined ? celErtek : Number(rows[0].target_value),
      aktiv: aktiv !== undefined ? !!aktiv : !!rows[0].active,
      uzenet: "Cel sikeresen frissitve"
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Szerver hiba" });
  }
};

exports.deleteGoal = async (req, res) => {
  try {
    const userId = req.userId;
    const goalId = req.params.id;
    const [rows] = await db.query("SELECT id FROM goals WHERE id = ? AND user_id = ?", [goalId, userId]);
    if (rows.length === 0) {
      return res.status(404).json({ message: "Cel nem talalhato" });
    }
    await db.query("DELETE FROM goals WHERE id = ? AND user_id = ?", [goalId, userId]);
    return res.json({ sikeres: true, uzenet: "Cel torolve" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Szerver hiba" });
  }
};
