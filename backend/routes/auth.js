const express = require("express");
const bcrypt = require("bcryptjs");
const pool = require("../config/db");
const { signToken, authenticate } = require("../middleware/auth");

const router = express.Router();

// ─── POST /api/auth/register ───
router.post("/register", async (req, res) => {
  try {
    const { email, password, name, role = "buyer", storeName } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({ error: "Name, email, and password are required." });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: "Password must be at least 6 characters." });
    }
    if (!["buyer", "seller"].includes(role)) {
      return res.status(400).json({ error: "Role must be buyer or seller." });
    }

    // Check if email exists
    const existing = await pool.query("SELECT id FROM users WHERE email = $1", [email.toLowerCase()]);
    if (existing.rows.length > 0) {
      return res.status(409).json({ error: "This email is already registered." });
    }

    // Hash password
    const hash = await bcrypt.hash(password, 10);
    const avatar = name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);

    // Insert user
    const result = await pool.query(
      `INSERT INTO users (email, password_hash, name, role, avatar, store_name)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, email, name, role, avatar, wallet_balance, store_name, created_at`,
      [email.toLowerCase(), hash, name, role, avatar, role === "seller" ? (storeName || `${name}'s Store`) : null]
    );

    const user = result.rows[0];
    const token = signToken(user);

    // Audit log
    await pool.query(
      `INSERT INTO audit_log (user_id, action, entity_type, entity_id, details)
       VALUES ($1, 'user_registered', 'user', $1, $2)`,
      [user.id, JSON.stringify({ email: user.email, role: user.role })]
    );

    res.status(201).json({ token, user });
  } catch (err) {
    console.error("Register error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// ─── POST /api/auth/login ───
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required." });
    }

    const result = await pool.query(
      `SELECT id, email, password_hash, name, role, avatar, wallet_balance, store_name, is_active, created_at
       FROM users WHERE email = $1`,
      [email.toLowerCase()]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: "No account found with this email." });
    }

    const user = result.rows[0];

    if (!user.is_active) {
      return res.status(403).json({ error: "This account has been suspended." });
    }

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      return res.status(401).json({ error: "Incorrect password." });
    }

    const token = signToken(user);

    // Remove password hash from response
    delete user.password_hash;

    res.json({ token, user });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// ─── GET /api/auth/me ───
router.get("/me", authenticate, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, email, name, role, avatar, wallet_balance, store_name, store_desc, is_verified, created_at
       FROM users WHERE id = $1`,
      [req.user.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error("Get me error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
