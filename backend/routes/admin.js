const express = require("express");
const pool = require("../config/db");
const { authenticate, requireRole } = require("../middleware/auth");

const router = express.Router();

// All admin routes require admin role
router.use(authenticate, requireRole("admin"));

// ─── GET /api/admin/stats ─── (platform overview)
router.get("/stats", async (req, res) => {
  try {
    const stats = await pool.query("SELECT * FROM v_platform_stats");
    const monthly = await pool.query("SELECT * FROM v_monthly_revenue LIMIT 12");
    res.json({ platform: stats.rows[0], monthly_revenue: monthly.rows });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// ─── GET /api/admin/users ─── (all users)
router.get("/users", async (req, res) => {
  try {
    const { role, search, limit = 50, offset = 0 } = req.query;
    let query = `
      SELECT id, email, name, role, avatar, wallet_balance, store_name,
             is_active, is_verified, created_at
      FROM users WHERE 1=1
    `;
    const params = [];
    let idx = 1;
    if (role) { query += ` AND role = $${idx}`; params.push(role); idx++; }
    if (search) { query += ` AND (name ILIKE $${idx} OR email ILIKE $${idx})`; params.push(`%${search}%`); idx++; }
    query += ` ORDER BY created_at DESC LIMIT $${idx} OFFSET $${idx + 1}`;
    params.push(parseInt(limit), parseInt(offset));

    const result = await pool.query(query, params);
    const count = await pool.query("SELECT COUNT(*) FROM users");
    res.json({ users: result.rows, total: parseInt(count.rows[0].count) });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// ─── PATCH /api/admin/users/:id ─── (suspend/activate user)
router.patch("/users/:id", async (req, res) => {
  try {
    const { is_active } = req.body;
    const result = await pool.query(
      "UPDATE users SET is_active = $1 WHERE id = $2 RETURNING id, name, email, role, is_active",
      [is_active, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: "User not found" });

    await pool.query(
      `INSERT INTO audit_log (user_id, action, entity_type, entity_id, details)
       VALUES ($1, $2, 'user', $3, $4)`,
      [req.user.id, is_active ? "user_activated" : "user_suspended", req.params.id,
       JSON.stringify({ target_user: result.rows[0].email })]
    );

    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// ─── GET /api/admin/sellers ─── (seller performance)
router.get("/sellers", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM v_seller_stats ORDER BY total_revenue DESC");
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// ─── GET /api/admin/orders ─── (all orders)
router.get("/orders", async (req, res) => {
  try {
    const { status, limit = 50, offset = 0 } = req.query;
    let query = `
      SELECT o.*, buyer.name AS buyer_name, buyer.email AS buyer_email,
             json_agg(json_build_object(
               'product_name', p.name, 'quantity', oi.quantity,
               'subtotal', oi.subtotal, 'seller_name', seller.store_name
             )) AS items
      FROM orders o
      JOIN users buyer ON buyer.id = o.buyer_id
      JOIN order_items oi ON oi.order_id = o.id
      JOIN products p ON p.id = oi.product_id
      JOIN users seller ON seller.id = oi.seller_id
    `;
    const params = [];
    let idx = 1;
    if (status) { query += ` WHERE o.status = $${idx}`; params.push(status); idx++; }
    query += ` GROUP BY o.id, buyer.name, buyer.email ORDER BY o.created_at DESC LIMIT $${idx} OFFSET $${idx + 1}`;
    params.push(parseInt(limit), parseInt(offset));

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// ─── GET /api/admin/finance ─── (complete financial overview)
router.get("/finance", async (req, res) => {
  try {
    // Total revenue
    const revenue = await pool.query(`
      SELECT COALESCE(SUM(total), 0) AS total_revenue,
             COALESCE(SUM(tax), 0) AS total_tax,
             COALESCE(SUM(total) * 0.05, 0) AS platform_fees,
             COUNT(*) AS total_orders
      FROM orders WHERE status != 'Cancelled'
    `);

    // Revenue by seller
    const bySeller = await pool.query(`
      SELECT u.store_name, u.name AS seller_name, u.wallet_balance,
             COALESCE(SUM(oi.subtotal), 0) AS gross_sales,
             COALESCE(SUM(oi.subtotal) * 0.05, 0) AS platform_fee,
             COALESCE(SUM(oi.subtotal) * 0.95, 0) AS net_to_seller,
             COUNT(DISTINCT oi.order_id) AS order_count
      FROM users u
      LEFT JOIN order_items oi ON oi.seller_id = u.id
      WHERE u.role = 'seller'
      GROUP BY u.id, u.store_name, u.name, u.wallet_balance
      ORDER BY gross_sales DESC
    `);

    // Revenue by category
    const byCategory = await pool.query(`
      SELECT c.name AS category, COALESCE(SUM(oi.subtotal), 0) AS revenue,
             COUNT(DISTINCT oi.order_id) AS order_count
      FROM categories c
      LEFT JOIN products p ON p.category_id = c.id
      LEFT JOIN order_items oi ON oi.product_id = p.id
      LEFT JOIN orders o ON o.id = oi.order_id AND o.status != 'Cancelled'
      GROUP BY c.name
      ORDER BY revenue DESC
    `);

    // All wallet balances
    const wallets = await pool.query(`
      SELECT role, COUNT(*) AS user_count,
             SUM(wallet_balance) AS total_balance,
             AVG(wallet_balance) AS avg_balance
      FROM users GROUP BY role
    `);

    // Platform ledger totals
    const ledger = await pool.query(`
      SELECT type, COALESCE(SUM(amount), 0) AS total
      FROM platform_ledger GROUP BY type
    `);

    // Total money in system (all top-ups ever)
    const totalTopups = await pool.query("SELECT COALESCE(SUM(amount), 0) AS total FROM wallet_transactions WHERE type = 'topup'");

    // Monthly trend
    const monthly = await pool.query("SELECT * FROM v_monthly_revenue LIMIT 12");

    res.json({
      summary: revenue.rows[0],
      by_seller: bySeller.rows,
      by_category: byCategory.rows,
      wallet_summary: wallets.rows,
      platform_ledger: ledger.rows,
      total_money_deposited: parseFloat(totalTopups.rows[0].total),
      monthly_trend: monthly.rows,
    });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// ─── GET /api/admin/audit ─── (audit log)
router.get("/audit", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT al.*, u.name AS user_name, u.email AS user_email
      FROM audit_log al
      LEFT JOIN users u ON u.id = al.user_id
      ORDER BY al.created_at DESC
      LIMIT 100
    `);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
