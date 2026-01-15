const mysql = require("mysql2/promise");
require("dotenv").config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "metabalance",
  port: Number(process.env.DB_PORT) || 3306,
  waitForConnections: true,
  connectionLimit: 10
});

// Simple startup check
(async () => {
  try {
    await pool.query("SELECT 1");
    console.log("MySQL connection OK");
  } catch (err) {
    console.error("MySQL connection error:", err.message);
  }
})();

module.exports = pool;
