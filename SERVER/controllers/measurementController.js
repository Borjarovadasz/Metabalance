const db = require("../db");

const allowedTypes = ["VIZ", "ALVAS", "KALORIA", "HANGULAT", "TESTSULY", "LEPES"];

exports.createMeasurement = async (req, res) => {
  try {
    const userId = req.userId;
    const { tipus, ertek, mertekegyseg, datum, megjegyzes } = req.body;

    if (!allowedTypes.includes(tipus)) {
      return res.status(400).json({ message: "Ervenytelen tipus" });
    }
    if (ertek === undefined) {
      return res.status(400).json({ message: "Ertek kotelezo" });
    }

    const recordedAt = datum ? new Date(datum) : new Date();
    const [result] = await db.query(
      "INSERT INTO measurements (user_id, type, value, unit, recorded_at, note) VALUES (?, ?, ?, ?, ?, ?)",
      [userId, tipus, ertek, mertekegyseg || null, recordedAt, megjegyzes || null]
    );

    return res.status(201).json({
      id: result.insertId,
      felhasznalo_id: userId,
      tipus,
      ertek,
      mertekegyseg,
      datum: recordedAt,
      megjegyzes: megjegyzes || null,
      uzenet: "Meres sikeresen rogzitve"
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Szerver hiba" });
  }
};

exports.listMeasurements = async (req, res) => {
  try {
    const userId = req.userId;
    const { tipus, datum, datum_tol, datum_ig, limit } = req.query;

    const conditions = ["user_id = ?"];
    const params = [userId];

    if (tipus && allowedTypes.includes(tipus)) {
      conditions.push("type = ?");
      params.push(tipus);
    }
    if (datum) {
      conditions.push("DATE(recorded_at) = ?");
      params.push(datum);
    } else {
      if (datum_tol) {
        conditions.push("recorded_at >= ?");
        params.push(datum_tol);
      }
      if (datum_ig) {
        conditions.push("recorded_at <= ?");
        params.push(datum_ig);
      }
    }

    const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
    const lim = limit ? `LIMIT ${Number(limit)}` : "";

    const [rows] = await db.query(`SELECT * FROM measurements ${where} ORDER BY recorded_at DESC ${lim}`, params);

    return res.json(rows.map((m) => ({
      id: m.id,
      tipus: m.type,
      ertek: Number(m.value),
      mertekegyseg: m.unit,
      datum: m.recorded_at,
      megjegyzes: m.note
    })));
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Szerver hiba" });
  }
};

exports.updateMeasurement = async (req, res) => {
  try {
    const userId = req.userId;
    const id = req.params.id;
    const { ertek, mertekegyseg, datum, megjegyzes } = req.body;

    const [rows] = await db.query("SELECT * FROM measurements WHERE id = ? AND user_id = ?", [id, userId]);
    if (rows.length === 0) {
      return res.status(404).json({ message: "Meres nem talalhato" });
    }

    await db.query(
      "UPDATE measurements SET value = COALESCE(?, value), unit = COALESCE(?, unit), recorded_at = COALESCE(?, recorded_at), note = COALESCE(?, note) WHERE id = ? AND user_id = ?",
      [ertek, mertekegyseg, datum, megjegyzes, id, userId]
    );

    return res.json({ sikeres: true, uzenet: "Meres frissitve" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Szerver hiba" });
  }
};

exports.deleteMeasurement = async (req, res) => {
  try {
    const userId = req.userId;
    const id = req.params.id;

    const [rows] = await db.query("SELECT id FROM measurements WHERE id = ? AND user_id = ?", [id, userId]);
    if (rows.length === 0) {
      return res.status(404).json({ message: "Meres nem talalhato" });
    }

    await db.query("DELETE FROM measurements WHERE id = ? AND user_id = ?", [id, userId]);
    return res.json({ sikeres: true, uzenet: "Meres torolve" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Szerver hiba" });
  }
};
