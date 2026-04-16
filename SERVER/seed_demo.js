/**
 * Demo seed script – létrehoz egy tesztprofilt 4 hét adattal.
 * Futtatás: node seed_demo.js
 */

const bcrypt = require("bcryptjs");
const db = require("./db");

const DEMO_EMAIL = "demo@metabalance.hu";
const DEMO_PASSWORD = "Demo1234";

// Segéd: véletlenszám min és max között (float)
const rnd = (min, max) => Math.round((Math.random() * (max - min) + min) * 10) / 10;
// Egész véletlenszám
const rndInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

async function run() {
  // --- 1. Demo user létrehozása (ha még nem létezik) ---
  const [existing] = await db.query("SELECT id FROM users WHERE email = ?", [DEMO_EMAIL]);

  let userId;
  if (existing.length > 0) {
    userId = existing[0].id;
    console.log(`Demo user már létezik (id=${userId}), mérések újraszúrása...`);
    await db.query("DELETE FROM measurements WHERE user_id = ?", [userId]);
    await db.query("DELETE FROM goals WHERE user_id = ?", [userId]);
  } else {
    const hashed = await bcrypt.hash(DEMO_PASSWORD, 10);
    const [result] = await db.query(
      "INSERT INTO users (first_name, last_name, email, password, role, active, gender) VALUES (?, ?, ?, ?, ?, ?, ?)",
      ["Péter", "Demo", DEMO_EMAIL, hashed, "user", 1, "male"]
    );
    userId = result.insertId;
    console.log(`Demo user létrehozva (id=${userId})`);
  }

  // --- 2. Célok beállítása ---
  const goals = [
    { tipus: "VIZ",      celErtek: 2.5,  unit: "L"     },
    { tipus: "ALVAS",    celErtek: 8,    unit: "ora"   },
    { tipus: "KALORIA",  celErtek: 2000, unit: "kcal"  },
    { tipus: "HANGULAT", celErtek: 4,    unit: "pont"  },
    { tipus: "TESTSULY", celErtek: 78,   unit: "kg"    },
    { tipus: "LEPES",    celErtek: 10000,unit: "lepes" },
  ];

  for (const g of goals) {
    await db.query(
      "INSERT INTO goals (user_id, type, target_value, unit, active) VALUES (?, ?, ?, ?, 1)",
      [userId, g.tipus, g.celErtek, g.unit]
    );
  }
  console.log("Célok beállítva.");

  // --- 3. Mérések generálása – utóbbi 28 nap ---
  const today = new Date("2026-04-15"); // script írásakor aktuális dátum
  const measurements = [];

  // Testsúly: 28 napra lineárisan 83→79.5 kg, kis zajjal
  for (let i = 27; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const dateStr = d.toISOString().slice(0, 10);

    const progress = (27 - i) / 27; // 0..1

    // VIZ – naponta 1-3 bejegyzés, összesen ~2-3.2 L
    const vizOsszes = rnd(1.4, 3.4);
    const vizReszek = rndInt(1, 3);
    for (let v = 0; v < vizReszek; v++) {
      const reszErtek = Math.round((vizOsszes / vizReszek) * 10) / 10;
      const hour = rndInt(7, 21);
      measurements.push({
        tipus: "VIZ", ertek: reszErtek, unit: "L",
        datum: `${dateStr} ${String(hour).padStart(2,"0")}:${String(rndInt(0,59)).padStart(2,"0")}:00`
      });
    }

    // ALVAS – naponta egyszer, este rögzítve
    const alvas = rnd(5.5, 9.0);
    measurements.push({
      tipus: "ALVAS", ertek: alvas, unit: "ora",
      datum: `${dateStr} 07:${String(rndInt(0,30)).padStart(2,"0")}:00`
    });

    // KALORIA – naponta 2-4 étkezés névvel
    const reggeli = [
      ["Zabkása", 350], ["Tojásrántotta", 420], ["Joghurt granolával", 310],
      ["Sajtos szendvics", 380], ["Banán + mogyoróvaj", 290], ["Müzli tejjel", 340]
    ];
    const ebед = [
      ["Csirkemell rizzsel", 620], ["Tészta bolognai szósszal", 710], ["Lencseleves", 480],
      ["Grillezett lazac salátával", 540], ["Csirkés wrap", 560], ["Húsleves galuskával", 510],
      ["Rántott csirke párolt zöldséggel", 680], ["Töltött paprika", 590]
    ];
    const vacsora = [
      ["Görög saláta fetával", 320], ["Avokádós pirítós", 380], ["Omlett zöldségekkel", 410],
      ["Tonhalas saláta", 350], ["Humusz zöldségekkel", 290], ["Krémlevesek", 300]
    ];
    const snack = [
      ["Banán", 90], ["Alma", 80], ["Mandula", 170], ["Protein szelet", 220],
      ["Narancs", 75], ["Görögdinnye", 85], ["Keksz", 150], ["Dió", 190]
    ];

    const pick = (arr) => arr[rndInt(0, arr.length - 1)];
    const etkezesek = rndInt(2, 4);
    const menusor = [
      pick(reggeli), pick(ebед), pick(vacsora), pick(snack)
    ].slice(0, etkezesek);
    const orák = [8, 13, 17, 20];
    for (let e = 0; e < etkezesek; e++) {
      const [nev, alapKal] = menusor[e];
      const kal = alapKal + rndInt(-40, 40);
      const hour = orák[e];
      measurements.push({
        tipus: "KALORIA", ertek: kal, unit: "kcal", note: nev,
        datum: `${dateStr} ${hour}:${String(rndInt(0,30)).padStart(2,"0")}:00`
      });
    }

    // HANGULAT – naponta egyszer (néha kimarad), 1–5 skála
    if (Math.random() > 0.15) {
      const hangulat = rndInt(1, 5);
      measurements.push({
        tipus: "HANGULAT", ertek: hangulat, unit: "pont",
        datum: `${dateStr} 21:${String(rndInt(0,59)).padStart(2,"0")}:00`
      });
    }

    // TESTSULY – hetente ~2x rögzítve
    if (i % 3 === 0 || i % 4 === 0) {
      const baza = 83 - progress * 3.5; // 83→79.5
      const suly = Math.round((baza + rnd(-0.4, 0.4)) * 10) / 10;
      measurements.push({
        tipus: "TESTSULY", ertek: suly, unit: "kg",
        datum: `${dateStr} 08:00:00`
      });
    }

    // LEPES – naponta egyszer
    const lepesek = rndInt(2500, 14000);
    measurements.push({
      tipus: "LEPES", ertek: lepesek, unit: "lepes",
      datum: `${dateStr} 23:00:00`
    });
  }

  // Batch insert
  for (const m of measurements) {
    await db.query(
      "INSERT INTO measurements (user_id, type, value, unit, recorded_at, note) VALUES (?, ?, ?, ?, ?, ?)",
      [userId, m.tipus, m.ertek, m.unit, m.datum, m.note || null]
    );
  }

  console.log(`${measurements.length} mérés beírva.`);
  console.log("─────────────────────────────────");
  console.log("Demo profil adatok:");
  console.log(`  Email:    ${DEMO_EMAIL}`);
  console.log(`  Jelszó:   ${DEMO_PASSWORD}`);
  console.log(`  User ID:  ${userId}`);
  console.log("─────────────────────────────────");

  await db.end?.();
  process.exit(0);
}

run().catch((err) => {
  console.error("Seed hiba:", err);
  process.exit(1);
});
