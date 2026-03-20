-- ════════════════════════════════════════════════════════════════
-- MARKETPLACE DATABASE SCHEMA
-- PostgreSQL 14+
-- Run: psql -U postgres -f schema.sql
-- ════════════════════════════════════════════════════════════════

-- Drop existing tables (safe for fresh setup)
DROP TABLE IF EXISTS order_items CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS reviews CASCADE;
DROP TABLE IF EXISTS messages CASCADE;
DROP TABLE IF EXISTS cart_items CASCADE;
DROP TABLE IF EXISTS watchlist CASCADE;
DROP TABLE IF EXISTS cards CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS categories CASCADE;
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS audit_log CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- ────────────────────────────────────────
-- USERS
-- ────────────────────────────────────────
CREATE TABLE users (
    id              SERIAL PRIMARY KEY,
    email           VARCHAR(255) UNIQUE NOT NULL,
    password_hash   VARCHAR(255) NOT NULL,
    name            VARCHAR(255) NOT NULL,
    role            VARCHAR(20) NOT NULL DEFAULT 'buyer'
                    CHECK (role IN ('buyer', 'seller', 'admin')),
    avatar          VARCHAR(10),
    wallet_balance  DECIMAL(12, 2) NOT NULL DEFAULT 10000.00,
    -- Seller-specific fields (NULL for buyers/admins)
    store_name      VARCHAR(255),
    store_desc      TEXT,
    -- Account status
    is_active       BOOLEAN NOT NULL DEFAULT TRUE,
    is_verified     BOOLEAN NOT NULL DEFAULT FALSE,
    -- Timestamps
    created_at      TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Index for login queries
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);

-- ────────────────────────────────────────
-- CATEGORIES
-- ────────────────────────────────────────
CREATE TABLE categories (
    id          SERIAL PRIMARY KEY,
    name        VARCHAR(100) UNIQUE NOT NULL,
    slug        VARCHAR(100) UNIQUE NOT NULL,
    icon        VARCHAR(10),
    sort_order  INT NOT NULL DEFAULT 0,
    created_at  TIMESTAMP NOT NULL DEFAULT NOW()
);

-- ────────────────────────────────────────
-- PRODUCTS
-- ────────────────────────────────────────
CREATE TABLE products (
    id              SERIAL PRIMARY KEY,
    seller_id       INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    category_id     INT NOT NULL REFERENCES categories(id),
    name            VARCHAR(500) NOT NULL,
    description     TEXT,
    price           DECIMAL(10, 2) NOT NULL CHECK (price >= 0),
    original_price  DECIMAL(10, 2),          -- NULL = no discount
    condition       VARCHAR(20) NOT NULL DEFAULT 'New'
                    CHECK (condition IN ('New', 'Like New', 'Used', 'Refurbished')),
    quantity        INT NOT NULL DEFAULT 1 CHECK (quantity >= 0),
    emoji_icon      VARCHAR(10),             -- product visual
    free_shipping   BOOLEAN NOT NULL DEFAULT FALSE,
    is_active       BOOLEAN NOT NULL DEFAULT TRUE,
    is_trending     BOOLEAN NOT NULL DEFAULT FALSE,
    total_sold      INT NOT NULL DEFAULT 0,
    -- Timestamps
    created_at      TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_products_seller ON products(seller_id);
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_active ON products(is_active);
CREATE INDEX idx_products_price ON products(price);
-- Full-text search index
CREATE INDEX idx_products_search ON products USING GIN(to_tsvector('english', name || ' ' || COALESCE(description, '')));

-- ────────────────────────────────────────
-- CARDS (payment simulation)
-- ────────────────────────────────────────
CREATE TABLE cards (
    id              SERIAL PRIMARY KEY,
    user_id         INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    card_number     VARCHAR(16) NOT NULL,    -- stored for demo only (never do this in production!)
    masked_number   VARCHAR(20) NOT NULL,    -- "•••• 3456"
    cardholder_name VARCHAR(255) NOT NULL,
    expiry          VARCHAR(5) NOT NULL,     -- "MM/YY"
    balance         DECIMAL(12, 2) NOT NULL DEFAULT 10000.00,
    created_at      TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_cards_user ON cards(user_id);

-- ────────────────────────────────────────
-- ORDERS
-- ────────────────────────────────────────
CREATE TABLE orders (
    id              SERIAL PRIMARY KEY,
    order_number    VARCHAR(20) UNIQUE NOT NULL,   -- "ORD-ABC123"
    buyer_id        INT NOT NULL REFERENCES users(id),
    subtotal        DECIMAL(10, 2) NOT NULL,
    tax             DECIMAL(10, 2) NOT NULL DEFAULT 0,
    shipping_cost   DECIMAL(10, 2) NOT NULL DEFAULT 0,
    total           DECIMAL(10, 2) NOT NULL,
    status          VARCHAR(30) NOT NULL DEFAULT 'Processing'
                    CHECK (status IN ('Processing', 'Confirmed', 'Shipped', 'Delivered', 'Cancelled', 'Refunded')),
    payment_method  VARCHAR(50) NOT NULL,     -- "Wallet" or "Card •••• 3456"
    -- Shipping address
    ship_address    VARCHAR(500),
    ship_city       VARCHAR(100),
    ship_zip        VARCHAR(20),
    ship_country    VARCHAR(100),
    -- Timestamps
    created_at      TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_orders_buyer ON orders(buyer_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_date ON orders(created_at DESC);

-- ────────────────────────────────────────
-- ORDER ITEMS (links orders to products)
-- ────────────────────────────────────────
CREATE TABLE order_items (
    id          SERIAL PRIMARY KEY,
    order_id    INT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id  INT NOT NULL REFERENCES products(id),
    seller_id   INT NOT NULL REFERENCES users(id),
    quantity    INT NOT NULL DEFAULT 1 CHECK (quantity > 0),
    unit_price  DECIMAL(10, 2) NOT NULL,
    subtotal    DECIMAL(10, 2) NOT NULL
);

CREATE INDEX idx_order_items_order ON order_items(order_id);
CREATE INDEX idx_order_items_seller ON order_items(seller_id);
CREATE INDEX idx_order_items_product ON order_items(product_id);

-- ────────────────────────────────────────
-- REVIEWS
-- ────────────────────────────────────────
CREATE TABLE reviews (
    id          SERIAL PRIMARY KEY,
    product_id  INT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    buyer_id    INT NOT NULL REFERENCES users(id),
    order_id    INT REFERENCES orders(id),   -- optional link to verify purchase
    rating      INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment     TEXT,
    created_at  TIMESTAMP NOT NULL DEFAULT NOW(),
    UNIQUE(product_id, buyer_id)             -- one review per buyer per product
);

CREATE INDEX idx_reviews_product ON reviews(product_id);

-- ────────────────────────────────────────
-- CART (server-side, persists across sessions)
-- ────────────────────────────────────────
CREATE TABLE cart_items (
    id          SERIAL PRIMARY KEY,
    user_id     INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    product_id  INT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    quantity    INT NOT NULL DEFAULT 1 CHECK (quantity > 0),
    added_at    TIMESTAMP NOT NULL DEFAULT NOW(),
    UNIQUE(user_id, product_id)
);

CREATE INDEX idx_cart_user ON cart_items(user_id);

-- ────────────────────────────────────────
-- WATCHLIST
-- ────────────────────────────────────────
CREATE TABLE watchlist (
    id          SERIAL PRIMARY KEY,
    user_id     INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    product_id  INT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    added_at    TIMESTAMP NOT NULL DEFAULT NOW(),
    UNIQUE(user_id, product_id)
);

CREATE INDEX idx_watchlist_user ON watchlist(user_id);

-- ────────────────────────────────────────
-- MESSAGES (buyer-seller communication)
-- ────────────────────────────────────────
CREATE TABLE messages (
    id              SERIAL PRIMARY KEY,
    sender_id       INT NOT NULL REFERENCES users(id),
    receiver_id     INT NOT NULL REFERENCES users(id),
    product_id      INT REFERENCES products(id),     -- optional context
    order_id        INT REFERENCES orders(id),        -- optional context
    content         TEXT NOT NULL,
    is_read         BOOLEAN NOT NULL DEFAULT FALSE,
    created_at      TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_messages_sender ON messages(sender_id);
CREATE INDEX idx_messages_receiver ON messages(receiver_id);

-- ────────────────────────────────────────
-- NOTIFICATIONS
-- ────────────────────────────────────────
CREATE TABLE notifications (
    id          SERIAL PRIMARY KEY,
    user_id     INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type        VARCHAR(50) NOT NULL,        -- 'order_placed', 'order_shipped', 'price_drop', etc.
    title       VARCHAR(255) NOT NULL,
    message     TEXT,
    is_read     BOOLEAN NOT NULL DEFAULT FALSE,
    link        VARCHAR(500),                -- optional deep link
    created_at  TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_unread ON notifications(user_id, is_read) WHERE is_read = FALSE;

-- ────────────────────────────────────────
-- AUDIT LOG (admin tracking)
-- ────────────────────────────────────────
CREATE TABLE audit_log (
    id          SERIAL PRIMARY KEY,
    user_id     INT REFERENCES users(id),
    action      VARCHAR(100) NOT NULL,       -- 'user_registered', 'order_placed', 'product_listed', etc.
    entity_type VARCHAR(50),                 -- 'user', 'order', 'product'
    entity_id   INT,
    details     JSONB,                       -- flexible metadata
    ip_address  VARCHAR(45),
    created_at  TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_audit_user ON audit_log(user_id);
CREATE INDEX idx_audit_action ON audit_log(action);
CREATE INDEX idx_audit_date ON audit_log(created_at DESC);

-- ════════════════════════════════════════════════════════════════
-- VIEWS (for admin dashboard queries)
-- ════════════════════════════════════════════════════════════════

-- Platform revenue summary
CREATE OR REPLACE VIEW v_platform_stats AS
SELECT
    (SELECT COUNT(*) FROM users WHERE is_active = TRUE) AS total_users,
    (SELECT COUNT(*) FROM users WHERE role = 'buyer') AS total_buyers,
    (SELECT COUNT(*) FROM users WHERE role = 'seller') AS total_sellers,
    (SELECT COUNT(*) FROM products WHERE is_active = TRUE) AS active_listings,
    (SELECT COUNT(*) FROM orders) AS total_orders,
    (SELECT COALESCE(SUM(total), 0) FROM orders WHERE status != 'Cancelled') AS total_revenue,
    (SELECT COUNT(*) FROM orders WHERE status = 'Processing') AS pending_orders,
    (SELECT COUNT(*) FROM orders WHERE created_at > NOW() - INTERVAL '7 days') AS orders_this_week;

-- Seller performance summary
CREATE OR REPLACE VIEW v_seller_stats AS
SELECT
    u.id AS seller_id,
    u.name AS seller_name,
    u.store_name,
    u.wallet_balance,
    COUNT(DISTINCT p.id) AS product_count,
    COUNT(DISTINCT oi.order_id) AS order_count,
    COALESCE(SUM(oi.subtotal), 0) AS total_revenue,
    COALESCE(AVG(r.rating), 0) AS avg_rating,
    COUNT(DISTINCT r.id) AS review_count
FROM users u
LEFT JOIN products p ON p.seller_id = u.id AND p.is_active = TRUE
LEFT JOIN order_items oi ON oi.seller_id = u.id
LEFT JOIN reviews r ON r.product_id = p.id
WHERE u.role = 'seller'
GROUP BY u.id, u.name, u.store_name, u.wallet_balance;

-- Monthly revenue breakdown (for charts)
CREATE OR REPLACE VIEW v_monthly_revenue AS
SELECT
    DATE_TRUNC('month', created_at) AS month,
    COUNT(*) AS order_count,
    SUM(total) AS revenue
FROM orders
WHERE status != 'Cancelled'
GROUP BY DATE_TRUNC('month', created_at)
ORDER BY month DESC;

-- Product performance
CREATE OR REPLACE VIEW v_product_performance AS
SELECT
    p.id,
    p.name,
    p.price,
    p.emoji_icon,
    p.total_sold,
    c.name AS category_name,
    u.store_name AS seller_name,
    COALESCE(AVG(r.rating), 0) AS avg_rating,
    COUNT(r.id) AS review_count
FROM products p
JOIN categories c ON c.id = p.category_id
JOIN users u ON u.id = p.seller_id
LEFT JOIN reviews r ON r.product_id = p.id
WHERE p.is_active = TRUE
GROUP BY p.id, p.name, p.price, p.emoji_icon, p.total_sold, c.name, u.store_name;

-- ════════════════════════════════════════════════════════════════
-- FUNCTIONS
-- ════════════════════════════════════════════════════════════════

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_users_updated BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_timestamp();
CREATE TRIGGER trg_products_updated BEFORE UPDATE ON products
    FOR EACH ROW EXECUTE FUNCTION update_timestamp();
CREATE TRIGGER trg_orders_updated BEFORE UPDATE ON orders
    FOR EACH ROW EXECUTE FUNCTION update_timestamp();

-- Generate order number
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TRIGGER AS $$
BEGIN
    NEW.order_number = 'ORD-' || UPPER(SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 8));
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_order_number BEFORE INSERT ON orders
    FOR EACH ROW EXECUTE FUNCTION generate_order_number();
