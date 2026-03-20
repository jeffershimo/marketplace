const express = require("express");
const pool = require("../config/db");
const { authenticate } = require("../middleware/auth");

const router = express.Router();

// ─── GET /api/wallet ───
router.get("/", authenticate, async (req, res) => {
  try {
    const user = await pool.query("SELECT wallet_balance FROM users WHERE id = $1", [req.user.id]);
    const totalIn = await pool.query("SELECT COALESCE(SUM(amount), 0) AS total FROM wallet_transactions WHERE user_id = $1 AND amount > 0", [req.user.id]);
    const totalOut = await pool.query("SELECT COALESCE(SUM(ABS(amount)), 0) AS total FROM wallet_transactions WHERE user_id = $1 AND amount < 0", [req.user.id]);
    res.json({
      balance: parseFloat(user.rows[0].wallet_balance),
      total_credits: parseFloat(totalIn.rows[0].total),
      total_debits: parseFloat(totalOut.rows[0].total),
    });
  } catch (err) { res.status(500).json({ error: "Server error" }); }
});

// ─── GET /api/wallet/transactions ───
router.get("/transactions", authenticate, async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM wallet_transactions WHERE user_id = $1 ORDER BY created_at DESC LIMIT 50", [req.user.id]
    );
    res.json(result.rows);
  } catch (err) { res.status(500).json({ error: "Server error" }); }
});

// ─── POST /api/wallet/topup ───
router.post("/topup", authenticate, async (req, res) => {
  const client = await pool.connect();
  try {
    const { card_id, amount } = req.body;
    const topupAmount = parseFloat(amount);
    if (!card_id || !topupAmount || topupAmount <= 0) return res.status(400).json({ error: "Card ID and positive amount required." });
    if (topupAmount > 10000) return res.status(400).json({ error: "Maximum top-up is $10,000 per transaction." });

    await client.query("BEGIN");
    const card = await client.query("SELECT * FROM cards WHERE id = $1 AND user_id = $2", [card_id, req.user.id]);
    if (card.rows.length === 0) { await client.query("ROLLBACK"); return res.status(404).json({ error: "Card not found." }); }

    const userResult = await client.query("UPDATE users SET wallet_balance = wallet_balance + $1 WHERE id = $2 RETURNING wallet_balance", [topupAmount, req.user.id]);
    const newBalance = parseFloat(userResult.rows[0].wallet_balance);
    await client.query("UPDATE cards SET total_topped_up = total_topped_up + $1 WHERE id = $2", [topupAmount, card_id]);
    await client.query(
      `INSERT INTO wallet_transactions (user_id, type, amount, balance_after, reference_type, reference_id, description)
       VALUES ($1, 'topup', $2, $3, 'card', $4, $5)`,
      [req.user.id, topupAmount, newBalance, card_id, `Top-up from card ${card.rows[0].masked_number}`]
    );
    await client.query("COMMIT");
    res.json({ balance: newBalance, message: `$${topupAmount.toFixed(2)} added to wallet` });
  } catch (err) { await client.query("ROLLBACK"); console.error("Top-up error:", err); res.status(500).json({ error: "Server error" }); }
  finally { client.release(); }
});

// ─── GET /api/wallet/cards ───
router.get("/cards", authenticate, async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT id, masked_number, cardholder_name, expiry, total_topped_up, total_spent, created_at FROM cards WHERE user_id = $1 ORDER BY created_at DESC", [req.user.id]
    );
    res.json(result.rows);
  } catch (err) { res.status(500).json({ error: "Server error" }); }
});

// ─── POST /api/wallet/cards ───
router.post("/cards", authenticate, async (req, res) => {
  try {
    const { card_number, cardholder_name, expiry } = req.body;
    if (!card_number || card_number.length !== 16) return res.status(400).json({ error: "Card number must be 16 digits." });
    if (!cardholder_name || !expiry) return res.status(400).json({ error: "Cardholder name and expiry required." });
    const masked = "•••• " + card_number.slice(-4);
    const result = await pool.query(
      `INSERT INTO cards (user_id, card_number, masked_number, cardholder_name, expiry, balance, total_topped_up, total_spent)
       VALUES ($1, $2, $3, $4, $5, 50000, 0, 0) RETURNING id, masked_number, cardholder_name, expiry, total_topped_up, total_spent`,
      [req.user.id, card_number, masked, cardholder_name, expiry]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) { console.error("Add card error:", err); res.status(500).json({ error: "Server error" }); }
});

// ─── GET /api/wallet/seller-earnings ───
router.get("/seller-earnings", authenticate, async (req, res) => {
  try {
    if (req.user.role !== "seller") return res.status(403).json({ error: "Sellers only." });
    const earnings = await pool.query("SELECT * FROM v_seller_earnings WHERE seller_id = $1", [req.user.id]);
    const transactions = await pool.query("SELECT * FROM wallet_transactions WHERE user_id = $1 ORDER BY created_at DESC LIMIT 20", [req.user.id]);
    const byProduct = await pool.query(
      `SELECT p.name, p.emoji_icon, p.price, SUM(oi.quantity) AS units_sold,
              SUM(oi.subtotal) AS gross_revenue, SUM(oi.subtotal)*0.05 AS commission_paid, SUM(oi.subtotal)*0.95 AS net_revenue
       FROM order_items oi JOIN products p ON p.id=oi.product_id JOIN orders o ON o.id=oi.order_id AND o.status!='Cancelled'
       WHERE oi.seller_id=$1 GROUP BY p.id,p.name,p.emoji_icon,p.price ORDER BY gross_revenue DESC`, [req.user.id]
    );
    res.json({
      summary: earnings.rows[0] || { gross_sales:0, total_commission:0, net_earnings:0, total_orders:0, items_sold:0, wallet_balance:0, avg_order_value:0 },
      transactions: transactions.rows,
      by_product: byProduct.rows,
    });
  } catch (err) { console.error("Seller earnings error:", err); res.status(500).json({ error: "Server error" }); }
});

module.exports = router;
