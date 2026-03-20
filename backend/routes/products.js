const express = require("express");
const pool = require("../config/db");
const { authenticate, requireRole } = require("../middleware/auth");

const router = express.Router();

// ─── GET /api/products ─── (public)
router.get("/", async (req, res) => {
  try {
    const { search, category, minPrice, maxPrice, condition, sort, limit = 50, offset = 0 } = req.query;

    let query = `
      SELECT p.*, c.name AS category_name, c.slug AS category_slug,
             u.store_name AS seller_name, u.avatar AS seller_avatar,
             COALESCE(AVG(r.rating), 0) AS avg_rating,
             COUNT(r.id) AS review_count
      FROM products p
      JOIN categories c ON c.id = p.category_id
      JOIN users u ON u.id = p.seller_id
      LEFT JOIN reviews r ON r.product_id = p.id
      WHERE p.is_active = TRUE
    `;
    const params = [];
    let paramIdx = 1;

    if (search) {
      query += ` AND to_tsvector('english', p.name || ' ' || COALESCE(p.description, '')) @@ plainto_tsquery('english', $${paramIdx})`;
      params.push(search);
      paramIdx++;
    }
    if (category && category !== "All") {
      query += ` AND c.name = $${paramIdx}`;
      params.push(category);
      paramIdx++;
    }
    if (minPrice) {
      query += ` AND p.price >= $${paramIdx}`;
      params.push(parseFloat(minPrice));
      paramIdx++;
    }
    if (maxPrice) {
      query += ` AND p.price <= $${paramIdx}`;
      params.push(parseFloat(maxPrice));
      paramIdx++;
    }
    if (condition) {
      query += ` AND p.condition = $${paramIdx}`;
      params.push(condition);
      paramIdx++;
    }

    query += ` GROUP BY p.id, c.name, c.slug, u.store_name, u.avatar`;

    // Sorting
    const sortMap = {
      "price_asc": "p.price ASC",
      "price_desc": "p.price DESC",
      "newest": "p.created_at DESC",
      "popular": "p.total_sold DESC",
      "rating": "avg_rating DESC",
    };
    query += ` ORDER BY ${sortMap[sort] || "p.created_at DESC"}`;
    query += ` LIMIT $${paramIdx} OFFSET $${paramIdx + 1}`;
    params.push(parseInt(limit), parseInt(offset));

    const result = await pool.query(query, params);

    // Get total count for pagination
    let countQuery = `SELECT COUNT(*) FROM products p JOIN categories c ON c.id = p.category_id WHERE p.is_active = TRUE`;
    const countParams = [];
    let cIdx = 1;
    if (search) { countQuery += ` AND to_tsvector('english', p.name || ' ' || COALESCE(p.description, '')) @@ plainto_tsquery('english', $${cIdx})`; countParams.push(search); cIdx++; }
    if (category && category !== "All") { countQuery += ` AND c.name = $${cIdx}`; countParams.push(category); cIdx++; }

    const countResult = await pool.query(countQuery, countParams);

    res.json({
      products: result.rows,
      total: parseInt(countResult.rows[0].count),
      limit: parseInt(limit),
      offset: parseInt(offset),
    });
  } catch (err) {
    console.error("Get products error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// ─── GET /api/products/deals ─── (products with discounts)
router.get("/deals", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT p.*, c.name AS category_name, u.store_name AS seller_name,
             COALESCE(AVG(r.rating), 0) AS avg_rating, COUNT(r.id) AS review_count
      FROM products p
      JOIN categories c ON c.id = p.category_id
      JOIN users u ON u.id = p.seller_id
      LEFT JOIN reviews r ON r.product_id = p.id
      WHERE p.is_active = TRUE AND p.original_price IS NOT NULL
      GROUP BY p.id, c.name, u.store_name
      ORDER BY (1 - p.price / p.original_price) DESC
      LIMIT 8
    `);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// ─── GET /api/products/trending ───
router.get("/trending", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT p.*, c.name AS category_name, u.store_name AS seller_name,
             COALESCE(AVG(r.rating), 0) AS avg_rating, COUNT(r.id) AS review_count
      FROM products p
      JOIN categories c ON c.id = p.category_id
      JOIN users u ON u.id = p.seller_id
      LEFT JOIN reviews r ON r.product_id = p.id
      WHERE p.is_active = TRUE AND p.is_trending = TRUE
      GROUP BY p.id, c.name, u.store_name
      ORDER BY p.total_sold DESC
      LIMIT 8
    `);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// ─── GET /api/products/:id ───
router.get("/:id", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT p.*, c.name AS category_name, u.store_name AS seller_name, u.avatar AS seller_avatar,
             COALESCE(AVG(r.rating), 0) AS avg_rating, COUNT(r.id) AS review_count
      FROM products p
      JOIN categories c ON c.id = p.category_id
      JOIN users u ON u.id = p.seller_id
      LEFT JOIN reviews r ON r.product_id = p.id
      WHERE p.id = $1
      GROUP BY p.id, c.name, u.store_name, u.avatar
    `, [req.params.id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Product not found" });
    }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// ─── POST /api/products ─── (seller creates product)
router.post("/", authenticate, requireRole("seller"), async (req, res) => {
  try {
    const { category_id, name, description, price, original_price, condition, quantity, emoji_icon, free_shipping } = req.body;

    const result = await pool.query(
      `INSERT INTO products (seller_id, category_id, name, description, price, original_price, condition, quantity, emoji_icon, free_shipping)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING *`,
      [req.user.id, category_id, name, description, price, original_price || null, condition || "New", quantity || 1, emoji_icon, free_shipping || false]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("Create product error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// ─── GET /api/products/seller/mine ─── (seller's own products)
router.get("/seller/mine", authenticate, requireRole("seller"), async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT p.*, c.name AS category_name,
              COALESCE(AVG(r.rating), 0) AS avg_rating, COUNT(r.id) AS review_count
       FROM products p
       JOIN categories c ON c.id = p.category_id
       LEFT JOIN reviews r ON r.product_id = p.id
       WHERE p.seller_id = $1
       GROUP BY p.id, c.name
       ORDER BY p.created_at DESC`,
      [req.user.id]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
