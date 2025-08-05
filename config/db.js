const { Client } = require("pg");
const dotenv = require("dotenv");
dotenv.config();

const db = new Client({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 5432,
});

db.connect((err) => {
  if (err) console.error("❌ PostgreSQL connection failed:", err.stack);
  else console.log("✅ Connected to PostgreSQL database");
});

module.exports = db;
