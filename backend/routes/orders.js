const express = require("express");
const pool = require("../config/db");
const { authenticate, requireRole } = require("../middleware/auth");
const router = express.Router();

// ─── POST /api/orders ───
router.post("/", authenticate, async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const { items, payment_method, card_id, contact_phone, ship_address, ship_city, ship_zip, ship_country } = req.body;
    if (!items || items.length === 0) return res.status(400).json({ error: "Order must have at least one item." });
    if (!contact_phone) return res.status(400).json({ error: "Contact phone number is required." });

    let subtotal = 0;
    const orderItems = [];
    for (const item of items) {
      const product = await client.query("SELECT * FROM products WHERE id = $1 AND is_active = TRUE", [item.product_id]);
      if (product.rows.length === 0) { await client.query("ROLLBACK"); return res.status(400).json({ error: `Product ${item.product_id} not found.` }); }
      const p = product.rows[0];
      if (p.quantity < item.quantity) { await client.query("ROLLBACK"); return res.status(400).json({ error: `Insufficient stock for ${p.name}.` }); }
      const s = p.price * item.quantity;
      subtotal += s;
      orderItems.push({ product_id: p.id, seller_id: p.seller_id, quantity: item.quantity, unit_price: p.price, subtotal: s });
    }
    const tax = +(subtotal * 0.08).toFixed(2);
    const total = +(subtotal + tax).toFixed(2);

    // Payment
    let payMethodLabel = "";
    if (payment_method === "wallet") {
      const u = await client.query("SELECT wallet_balance FROM users WHERE id = $1", [req.user.id]);
      if (parseFloat(u.rows[0].wallet_balance) < total) { await client.query("ROLLBACK"); return res.status(400).json({ error: `Insufficient wallet balance ($${parseFloat(u.rows[0].wallet_balance).toFixed(2)}). Top up first.` }); }
      const r = await client.query("UPDATE users SET wallet_balance = wallet_balance - $1 WHERE id = $2 RETURNING wallet_balance", [total, req.user.id]);
      payMethodLabel = "Wallet";
      await client.query(
        `INSERT INTO wallet_transactions (user_id, type, amount, balance_after, reference_type, description) VALUES ($1, 'purchase', $2, $3, 'order', 'Purchase payment')`,
        [req.user.id, -total, parseFloat(r.rows[0].wallet_balance)]
      );
    } else if (payment_method === "card") {
      if (!card_id) { await client.query("ROLLBACK"); return res.status(400).json({ error: "Card ID required." }); }
      const card = await client.query("SELECT * FROM cards WHERE id = $1 AND user_id = $2", [card_id, req.user.id]);
      if (card.rows.length === 0) { await client.query("ROLLBACK"); return res.status(400).json({ error: "Card not found." }); }
      await client.query("UPDATE cards SET total_spent = total_spent + $1 WHERE id = $2", [total, card_id]);
      payMethodLabel = `Card ${card.rows[0].masked_number}`;
    } else {
      await client.query("ROLLBACK"); return res.status(400).json({ error: "Invalid payment method." });
    }

    // Create order
    const orderResult = await client.query(
      `INSERT INTO orders (buyer_id, subtotal, tax, total, payment_method, contact_phone, ship_address, ship_city, ship_zip, ship_country)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING *`,
      [req.user.id, subtotal, tax, total, payMethodLabel, contact_phone, ship_address, ship_city, ship_zip, ship_country]
    );
    const order = orderResult.rows[0];

    // Order items + seller credits
    for (const item of orderItems) {
      await client.query(`INSERT INTO order_items (order_id, product_id, seller_id, quantity, unit_price, subtotal) VALUES ($1,$2,$3,$4,$5,$6)`,
        [order.id, item.product_id, item.seller_id, item.quantity, item.unit_price, item.subtotal]);
      await client.query("UPDATE products SET quantity = quantity - $1, total_sold = total_sold + $1 WHERE id = $2", [item.quantity, item.product_id]);
      const commission = +(item.subtotal * 0.05).toFixed(2);
      const sellerCredit = +(item.subtotal - commission).toFixed(2);
      const sr = await client.query("UPDATE users SET wallet_balance = wallet_balance + $1 WHERE id = $2 RETURNING wallet_balance", [sellerCredit, item.seller_id]);
      await client.query(`INSERT INTO wallet_transactions (user_id, type, amount, balance_after, reference_type, reference_id, description) VALUES ($1,'sale_credit',$2,$3,'order',$4,$5)`,
        [item.seller_id, sellerCredit, parseFloat(sr.rows[0].wallet_balance), order.id, `Sale credit — gross $${item.subtotal.toFixed(2)}, fee -$${commission.toFixed(2)}`]);
      await client.query(`INSERT INTO platform_ledger (type, amount, order_id, description) VALUES ('commission',$1,$2,$3)`,
        [commission, order.id, `5% from seller ${item.seller_id}`]);
    }
    await client.query(`INSERT INTO platform_ledger (type, amount, order_id, description) VALUES ('tax_collected',$1,$2,'Sales tax 8%')`, [tax, order.id]);
    await client.query(`INSERT INTO audit_log (user_id, action, entity_type, entity_id, details) VALUES ($1,'order_placed','order',$2,$3)`,
      [req.user.id, order.id, JSON.stringify({ total, items: items.length, payment: payMethodLabel })]);

    await client.query("COMMIT");

    const fullOrder = await pool.query(`
      SELECT o.*, json_agg(json_build_object('product_id',oi.product_id,'name',p.name,'emoji_icon',p.emoji_icon,'quantity',oi.quantity,'unit_price',oi.unit_price,'subtotal',oi.subtotal,'seller_name',u.store_name)) AS items
      FROM orders o JOIN order_items oi ON oi.order_id=o.id JOIN products p ON p.id=oi.product_id JOIN users u ON u.id=oi.seller_id WHERE o.id=$1 GROUP BY o.id`, [order.id]);
    res.status(201).json(fullOrder.rows[0]);
  } catch (err) { await client.query("ROLLBACK"); console.error("Order error:", err); res.status(500).json({ error: "Server error" }); }
  finally { client.release(); }
});

// ─── GET /api/orders ───
router.get("/", authenticate, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT o.*, json_agg(json_build_object('product_id',oi.product_id,'name',p.name,'emoji_icon',p.emoji_icon,'quantity',oi.quantity,'unit_price',oi.unit_price,'subtotal',oi.subtotal,'seller_name',u.store_name)) AS items,
      (SELECT json_build_object('id',cr.id,'status',cr.status,'reason',cr.reason,'seller_response',cr.seller_response,'created_at',cr.created_at) FROM cancel_requests cr WHERE cr.order_id=o.id ORDER BY cr.created_at DESC LIMIT 1) AS cancel_request
      FROM orders o JOIN order_items oi ON oi.order_id=o.id JOIN products p ON p.id=oi.product_id JOIN users u ON u.id=oi.seller_id
      WHERE o.buyer_id=$1 GROUP BY o.id ORDER BY o.created_at DESC`, [req.user.id]);
    res.json(result.rows);
  } catch (err) { res.status(500).json({ error: "Server error" }); }
});

// ─── POST /api/orders/:id/cancel ─── (buyer requests cancel)
router.post("/:id/cancel", authenticate, async (req, res) => {
  try {
    const { reason } = req.body;
    if (!reason) return res.status(400).json({ error: "Please provide a reason for cancellation." });
    const order = await pool.query("SELECT * FROM orders WHERE id = $1 AND buyer_id = $2", [req.params.id, req.user.id]);
    if (order.rows.length === 0) return res.status(404).json({ error: "Order not found." });
    if (!["Processing", "Confirmed"].includes(order.rows[0].status)) return res.status(400).json({ error: "This order can no longer be cancelled." });
    const existing = await pool.query("SELECT id FROM cancel_requests WHERE order_id = $1 AND status = 'pending'", [req.params.id]);
    if (existing.rows.length > 0) return res.status(400).json({ error: "A cancel request is already pending." });

    await pool.query(`INSERT INTO cancel_requests (order_id, buyer_id, reason) VALUES ($1, $2, $3)`, [req.params.id, req.user.id, reason]);
    await pool.query("UPDATE orders SET status = 'Cancel Requested' WHERE id = $1", [req.params.id]);
    await pool.query(`INSERT INTO audit_log (user_id, action, entity_type, entity_id, details) VALUES ($1,'cancel_requested','order',$2,$3)`,
      [req.user.id, req.params.id, JSON.stringify({ reason })]);
    res.json({ message: "Cancel request submitted. Waiting for seller approval." });
  } catch (err) { console.error(err); res.status(500).json({ error: "Server error" }); }
});

// ─── GET /api/orders/seller ─── (seller's incoming orders)
router.get("/seller", authenticate, requireRole("seller"), async (req, res) => {
  try {
    // First get all order IDs that contain this seller's products
    const orderIds = await pool.query(
      "SELECT DISTINCT order_id FROM order_items WHERE seller_id = $1", [req.user.id]
    );
    if (orderIds.rows.length === 0) return res.json([]);

    const ids = orderIds.rows.map(r => r.order_id);
    const result = await pool.query(`
      SELECT o.*, buyer.name AS buyer_name, buyer.email AS buyer_email,
             (SELECT json_agg(json_build_object('name',p2.name,'emoji_icon',p2.emoji_icon,'quantity',oi2.quantity,'unit_price',oi2.unit_price,'subtotal',oi2.subtotal))
              FROM order_items oi2 JOIN products p2 ON p2.id=oi2.product_id WHERE oi2.order_id=o.id AND oi2.seller_id=$1) AS items,
             (SELECT json_build_object('id',cr.id,'status',cr.status,'reason',cr.reason,'seller_response',cr.seller_response)
              FROM cancel_requests cr WHERE cr.order_id=o.id ORDER BY cr.created_at DESC LIMIT 1) AS cancel_request
      FROM orders o
      JOIN users buyer ON buyer.id=o.buyer_id
      WHERE o.id = ANY($2)
      ORDER BY o.created_at DESC
    `, [req.user.id, ids]);
    res.json(result.rows);
  } catch (err) { console.error(err); res.status(500).json({ error: "Server error" }); }
});

// ─── POST /api/orders/:id/cancel-respond ─── (seller approves/rejects)
router.post("/:id/cancel-respond", authenticate, requireRole("seller", "admin"), async (req, res) => {
  const client = await pool.connect();
  try {
    const { action, response } = req.body;
    if (!["approve", "reject"].includes(action)) return res.status(400).json({ error: "Action must be approve or reject." });

    const cr = await client.query("SELECT cr.*, o.total, o.payment_method, o.buyer_id FROM cancel_requests cr JOIN orders o ON o.id=cr.order_id WHERE cr.order_id=$1 AND cr.status='pending'", [req.params.id]);
    if (cr.rows.length === 0) return res.status(404).json({ error: "No pending cancel request found." });
    const req_data = cr.rows[0];

    await client.query("BEGIN");
    await client.query("UPDATE cancel_requests SET status=$1, seller_response=$2, responded_at=NOW() WHERE id=$3",
      [action === "approve" ? "approved" : "rejected", response || null, req_data.id]);

    if (action === "approve") {
      await client.query("UPDATE orders SET status='Refunded' WHERE id=$1", [req.params.id]);
      const total = parseFloat(req_data.total);

      // Refund buyer
      if (req_data.payment_method === "Wallet") {
        const br = await client.query("UPDATE users SET wallet_balance = wallet_balance + $1 WHERE id = $2 RETURNING wallet_balance", [total, req_data.buyer_id]);
        await client.query(`INSERT INTO wallet_transactions (user_id, type, amount, balance_after, reference_type, reference_id, description) VALUES ($1,'refund',$2,$3,'order',$4,'Order refund')`,
          [req_data.buyer_id, total, parseFloat(br.rows[0].wallet_balance), req.params.id]);
      }

      // Deduct from sellers
      const ois = await client.query("SELECT seller_id, subtotal FROM order_items WHERE order_id=$1", [req.params.id]);
      for (const oi of ois.rows) {
        const credit = +(parseFloat(oi.subtotal) * 0.95).toFixed(2);
        await client.query("UPDATE users SET wallet_balance = wallet_balance - $1 WHERE id = $2", [credit, oi.seller_id]);
      }

      await client.query(`INSERT INTO audit_log (user_id, action, entity_type, entity_id, details) VALUES ($1,'cancel_approved','order',$2,$3)`,
        [req.user.id, req.params.id, JSON.stringify({ refund: total })]);
    } else {
      await client.query("UPDATE orders SET status='Processing' WHERE id=$1", [req.params.id]);
      await client.query(`INSERT INTO audit_log (user_id, action, entity_type, entity_id, details) VALUES ($1,'cancel_rejected','order',$2,$3)`,
        [req.user.id, req.params.id, JSON.stringify({ reason: response })]);
    }
    await client.query("COMMIT");
    res.json({ message: action === "approve" ? "Cancel approved. Buyer has been refunded." : "Cancel request rejected." });
  } catch (err) { await client.query("ROLLBACK"); console.error(err); res.status(500).json({ error: "Server error" }); }
  finally { client.release(); }
});

// ─── PATCH /api/orders/:id/status ───
router.patch("/:id/status", authenticate, requireRole("seller", "admin"), async (req, res) => {
  try {
    const { status } = req.body;
    const valid = ["Processing", "Confirmed", "Shipped", "Delivered", "Cancelled"];
    if (!valid.includes(status)) return res.status(400).json({ error: "Invalid status." });
    const result = await pool.query("UPDATE orders SET status=$1 WHERE id=$2 RETURNING *", [status, req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: "Order not found." });
    res.json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: "Server error" }); }
});

module.exports = router;
