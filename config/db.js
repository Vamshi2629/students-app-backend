const { Client } = require("pg");
const dotenv = require("dotenv");
dotenv.config();

const db = new Client({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
});

db.connect((err) => {
  if (err) console.error("❌ PostgreSQL connection failed:", err.stack);
  else console.log("✅ Connected to PostgreSQL database");
});

module.exports = db;

// const { Client } = require("pg");
// const dotenv = require("dotenv");
// dotenv.config();

// const targetDbName = process.env.DB_NAME;

// const adminClient = new Client({
//   host: process.env.DB_HOST,
//   user: process.env.DB_USER,
//   password: process.env.DB_PASS,
//   database: "postgres",
//   port: process.env.DB_PORT || 5432,
// });

// async function ensureDatabase() {
//   try {
//     await adminClient.connect();

//     const checkDbRes = await adminClient.query(
//       `SELECT 1 FROM pg_database WHERE datname = $1`,
//       [targetDbName]
//     );

//     if (checkDbRes.rowCount === 0) {
//       console.log(`⚠️ Database '${targetDbName}' not found. Creating...`);
//       await adminClient.query(`CREATE DATABASE "${targetDbName}"`);
//       console.log(`✅ Database '${targetDbName}' created.`);
//     } else {
//       console.log(`✅ Database '${targetDbName}' already exists.`);
//     }

//     await adminClient.end();
//   } catch (err) {
//     console.error("❌ Error checking/creating database:", err);
//     process.exit(1);
//   }
// }

// // 🔥 Create the client
// const db = new Client({
//   host: process.env.DB_HOST,
//   user: process.env.DB_USER,
//   password: process.env.DB_PASS,
//   database: targetDbName,
//   port: process.env.DB_PORT || 5432,
// });

// // 🔥 Connect and export
// ensureDatabase()
//   .then(async () => {
//     await db.connect();
//     console.log("✅ Connected to PostgreSQL database:", targetDbName);
//   })
//   .catch((err) => {
//     console.error("❌ Database setup failed:", err);
//     process.exit(1);
//   });

// module.exports = db;
