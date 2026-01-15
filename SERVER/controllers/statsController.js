const db = require("../db");

const typeKey = {
  VIZ: "viz",
  KALORIA: "kaloria",
  ALVAS: "alvas",
  LEPES: "lepes",
  TESTSULY: "testsuly",
  HANGULAT: "hangulat"
};

const getDateParam = (datum) => {
  if (!datum) return new Date();
  const d = new Date(datum);
  return Number.isNaN(d.getTime()) ? new Date() : d;
};

exports.dailyStats = async (req, res) => {
  try {
    const userId = req.userId;
    const targetDate = getDateParam(req.query.datum);
    const dateStr = targetDate.toISOString().slice(0, 10);

    const [agg] = await db.query(
      `SELECT type, SUM(value) as total, MIN(unit) as unit
       FROM measurements
       WHERE user_id = ? AND DATE(recorded_at) = ?
       GROUP BY type`,
      [userId, dateStr]
    );

    const [goals] = await db.query(
      "SELECT type, target_value, unit FROM goals WHERE user_id = ? AND active = 1",
      [userId]
    );

    const totals = {};
    agg.forEach((row) => {
      totals[row.type] = { total: Number(row.total), unit: row.unit };
    });

    const goalMap = {};
    goals.forEach((g) => {
      goalMap[g.type] = { value: Number(g.target_value), unit: g.unit };
    });

    const [lastWeightRows] = await db.query(
      `SELECT value FROM measurements
       WHERE user_id = ? AND type = 'TESTSULY' AND recorded_at <= ?
       ORDER BY recorded_at DESC LIMIT 1`,
      [userId, dateStr + " 23:59:59"]
    );

    const weightValue = lastWeightRows.length ? Number(lastWeightRows[0].value) : null;

    const hangulat = totals.HANGULAT ? totals.HANGULAT.total : null;

    return res.json({
      felhasznalo_id: userId,
      datum: dateStr,
      viz_liter: totals.VIZ ? totals.VIZ.total : 0,
      viz_cel_liter: goalMap.VIZ ? goalMap.VIZ.value : null,
      kaloria_kcal: totals.KALORIA ? totals.KALORIA.total : 0,
      kaloria_keret_kcal: goalMap.KALORIA ? goalMap.KALORIA.value : null,
      alvas_ora: totals.ALVAS ? totals.ALVAS.total : 0,
      lepes: totals.LEPES ? totals.LEPES.total : 0,
      testsuly_kg: weightValue,
      hangulat_atlag: hangulat
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Szerver hiba" });
  }
};

exports.weeklyStats = async (req, res) => {
  try {
    const userId = req.userId;
    const tipus = req.query.tipus;
    if (!tipus) {
      return res.status(400).json({ message: "tipus kotelezo" });
    }

    const from = getDateParam(req.query.datum_tol || new Date(Date.now() - 6 * 24 * 60 * 60 * 1000));
    const to = getDateParam(req.query.datum_ig || new Date());

    const [rows] = await db.query(
      `SELECT DATE(recorded_at) as nap, ${tipus === "HANGULAT" ? "AVG(value)" : "SUM(value)"} as osszeg
       FROM measurements
       WHERE user_id = ? AND type = ? AND recorded_at BETWEEN ? AND ?
       GROUP BY DATE(recorded_at)
       ORDER BY DATE(recorded_at)`
      , [userId, tipus, from, new Date(to.getTime() + 24 * 60 * 60 * 1000)]
    );

    return res.json({
      tipus,
      intervallum: {
        datum_tol: from.toISOString().slice(0, 10),
        datum_ig: to.toISOString().slice(0, 10)
      },
      napok: rows.map((r) => ({ datum: r.nap, osszeg: Number(r.osszeg) }))
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Szerver hiba" });
  }
};

exports.summaryStats = async (req, res) => {
  try {
    const userId = req.userId;
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const fourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

    const [recent] = await db.query(
      `SELECT type, AVG(value) as avg_value
       FROM measurements
       WHERE user_id = ? AND recorded_at >= ?
       GROUP BY type`,
      [userId, sevenDaysAgo]
    );

    const [previous] = await db.query(
      `SELECT type, AVG(value) as avg_value
       FROM measurements
       WHERE user_id = ? AND recorded_at >= ? AND recorded_at < ?
       GROUP BY type`,
      [userId, fourteenDaysAgo, sevenDaysAgo]
    );

    const recentMap = {};
    recent.forEach((r) => { recentMap[r.type] = Number(r.avg_value); });
    const prevMap = {};
    previous.forEach((r) => { prevMap[r.type] = Number(r.avg_value); });

    const trendValue = (type) => {
      const current = recentMap[type] || 0;
      const prev = prevMap[type] || 0;
      const diff = current - prev;
      const sign = diff > 0 ? "+" : "";
      return `${sign}${diff.toFixed(2)}`;
    };

    return res.json({
      felhasznalo_id: userId,
      napi_atlag: {
        viz: recentMap.VIZ ? `${recentMap.VIZ.toFixed(2)} L` : "0",
        alvas: recentMap.ALVAS ? `${recentMap.ALVAS.toFixed(2)} ora` : "0",
        kaloria: recentMap.KALORIA ? `${recentMap.KALORIA.toFixed(0)} kcal` : "0",
        testsuly: recentMap.TESTSULY ? `${recentMap.TESTSULY.toFixed(2)} kg` : "0",
        hangulat_atlag: recentMap.HANGULAT ? recentMap.HANGULAT.toFixed(2) : "0"
      },
      heti_trend: {
        viz: trendValue("VIZ"),
        alvas: trendValue("ALVAS"),
        kaloria: trendValue("KALORIA"),
        testsuly: trendValue("TESTSULY"),
        hangulat: trendValue("HANGULAT")
      }
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Szerver hiba" });
  }
};
