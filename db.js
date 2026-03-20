const { Pool } = require("pg");
require("dotenv").config();

let pool;

if (process.env.DATABASE_URL) {
  // Production: Supabase or any cloud PostgreSQL
  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
    max: 10,
    idleTimeoutMillis: 30000,
  });
} else {
  // Local development
  pool = new Pool({
    host: process.env.DB_HOST || "localhost",
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME || "marketplace",
    user: process.env.DB_USER || "postgres",
    password: process.env.DB_PASSWORD || "postgres",
    max: 20,
  });
}

pool.on("error", (err) => {
  console.error("Database error:", err);
});

pool.query("SELECT NOW()")
  .then(() => console.log("PostgreSQL connected"))
  .catch((err) => console.error("PostgreSQL failed:", err.message));

module.exports = pool;
