const mysql = require("mysql2/promise");
require("dotenv").config();

const pool = mysql.createPool({
  host: process.env.DB_HOST,       // pl. localhost
  user: process.env.DB_USER,       // pl. root
  password: process.env.DB_PASSWORD, // pl. üres XAMPP
  database: process.env.DB_NAME,   // <-- most már a helyes név
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10
});

// Teszt kapcsolat
(async () => {
  try {
    await pool.query("SELECT 1");
    console.log("MySQL kapcsolat OK");
  } catch (err) {
    console.error("MySQL HIBA:", err.code, err.message);
  }
})();

module.exports = pool;
