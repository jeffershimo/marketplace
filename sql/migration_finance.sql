-- ════════════════════════════════════════════════════════════════
-- MIGRATION: Realistic Finance System
-- Run: psql -U postgres -d marketplace -f migration_finance.sql
-- ════════════════════════════════════════════════════════════════

-- ────────────────────────────────────────
-- WALLET TRANSACTIONS (tracks every money movement)
-- ────────────────────────────────────────
DROP TABLE IF EXISTS wallet_transactions CASCADE;

CREATE TABLE wallet_transactions (
    id              SERIAL PRIMARY KEY,
    user_id         INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type            VARCHAR(30) NOT NULL
                    CHECK (type IN (
                        'topup',           -- buyer adds money from card
                        'purchase',        -- buyer pays for order (debit)
                        'sale_credit',     -- seller receives payment (credit)
                        'platform_fee',    -- platform fee deducted from sale
                        'refund',          -- refund to buyer
                        'withdrawal'       -- seller withdraws to bank
                    )),
    amount          DECIMAL(12, 2) NOT NULL,   -- positive = credit, negative = debit
    balance_after   DECIMAL(12, 2) NOT NULL,   -- wallet balance after this transaction
    reference_type  VARCHAR(30),               -- 'order', 'card', 'withdrawal'
    reference_id    INT,                       -- order_id, card_id, etc.
    description     TEXT NOT NULL,
    created_at      TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_wallet_tx_user ON wallet_transactions(user_id);
CREATE INDEX idx_wallet_tx_type ON wallet_transactions(type);
CREATE INDEX idx_wallet_tx_date ON wallet_transactions(user_id, created_at DESC);

-- ────────────────────────────────────────
-- PLATFORM LEDGER (tracks platform's own revenue)
-- ────────────────────────────────────────
DROP TABLE IF EXISTS platform_ledger CASCADE;

CREATE TABLE platform_ledger (
    id              SERIAL PRIMARY KEY,
    type            VARCHAR(30) NOT NULL
                    CHECK (type IN ('commission', 'tax_collected', 'refund_loss')),
    amount          DECIMAL(12, 2) NOT NULL,
    order_id        INT REFERENCES orders(id),
    description     TEXT,
    created_at      TIMESTAMP NOT NULL DEFAULT NOW()
);

-- ────────────────────────────────────────
-- Reset all wallets to $0 (realistic starting point)
-- Existing admin keeps some balance for testing
-- ────────────────────────────────────────
UPDATE users SET wallet_balance = 0.00 WHERE role != 'admin';
UPDATE users SET wallet_balance = 500.00 WHERE role = 'admin';

-- ────────────────────────────────────────
-- Add card tracking fields
-- ────────────────────────────────────────
ALTER TABLE cards ADD COLUMN IF NOT EXISTS total_topped_up DECIMAL(12,2) NOT NULL DEFAULT 0;
ALTER TABLE cards ADD COLUMN IF NOT EXISTS total_spent DECIMAL(12,2) NOT NULL DEFAULT 0;

-- Remove the fake balance column concept — cards are now just payment methods
-- We keep the balance column but it's now "available credit limit" (simulated)
UPDATE cards SET balance = 50000.00;

-- ────────────────────────────────────────
-- SELLER PAYOUT SUMMARY VIEW
-- ────────────────────────────────────────
CREATE OR REPLACE VIEW v_seller_earnings AS
SELECT
    u.id AS seller_id,
    u.name AS seller_name,
    u.store_name,
    u.wallet_balance,
    -- Gross sales (what buyers paid for this seller's items)
    COALESCE(SUM(oi.subtotal), 0) AS gross_sales,
    -- Platform commission (5%)
    COALESCE(SUM(oi.subtotal) * 0.05, 0) AS total_commission,
    -- Net earnings (what seller actually received)
    COALESCE(SUM(oi.subtotal) * 0.95, 0) AS net_earnings,
    -- Order count
    COUNT(DISTINCT oi.order_id) AS total_orders,
    -- Items sold
    COALESCE(SUM(oi.quantity), 0) AS items_sold,
    -- Average order value
    CASE WHEN COUNT(DISTINCT oi.order_id) > 0
         THEN COALESCE(SUM(oi.subtotal), 0) / COUNT(DISTINCT oi.order_id)
         ELSE 0 END AS avg_order_value
FROM users u
LEFT JOIN order_items oi ON oi.seller_id = u.id
LEFT JOIN orders o ON o.id = oi.order_id AND o.status != 'Cancelled'
WHERE u.role = 'seller'
GROUP BY u.id, u.name, u.store_name, u.wallet_balance;

-- ────────────────────────────────────────
-- ENHANCED PLATFORM STATS VIEW
-- ────────────────────────────────────────
CREATE OR REPLACE VIEW v_platform_finance AS
SELECT
    -- Revenue metrics
    COALESCE(SUM(o.total), 0) AS gross_marketplace_volume,
    COALESCE(SUM(o.subtotal), 0) AS total_product_sales,
    COALESCE(SUM(o.tax), 0) AS total_tax_collected,
    COALESCE(SUM(o.subtotal) * 0.05, 0) AS total_platform_commission,
    COALESCE(SUM(o.shipping_cost), 0) AS total_shipping_revenue,
    -- Order metrics
    COUNT(*) AS total_orders,
    COUNT(*) FILTER (WHERE o.status = 'Processing') AS orders_processing,
    COUNT(*) FILTER (WHERE o.status = 'Shipped') AS orders_shipped,
    COUNT(*) FILTER (WHERE o.status = 'Delivered') AS orders_delivered,
    COUNT(*) FILTER (WHERE o.status = 'Cancelled') AS orders_cancelled,
    -- Time-based
    COUNT(*) FILTER (WHERE o.created_at > NOW() - INTERVAL '24 hours') AS orders_today,
    COUNT(*) FILTER (WHERE o.created_at > NOW() - INTERVAL '7 days') AS orders_this_week,
    COALESCE(SUM(o.total) FILTER (WHERE o.created_at > NOW() - INTERVAL '7 days'), 0) AS revenue_this_week,
    COALESCE(SUM(o.total) FILTER (WHERE o.created_at > NOW() - INTERVAL '30 days'), 0) AS revenue_this_month
FROM orders o
WHERE o.status != 'Cancelled';

-- ────────────────────────────────────────
-- BUYER SPENDING SUMMARY VIEW
-- ────────────────────────────────────────
CREATE OR REPLACE VIEW v_buyer_spending AS
SELECT
    u.id AS buyer_id,
    u.name AS buyer_name,
    u.wallet_balance,
    COALESCE(SUM(o.total), 0) AS total_spent,
    COUNT(o.id) AS order_count,
    COALESCE(
        (SELECT SUM(wt.amount) FROM wallet_transactions wt WHERE wt.user_id = u.id AND wt.type = 'topup'), 0
    ) AS total_topped_up
FROM users u
LEFT JOIN orders o ON o.buyer_id = u.id AND o.status != 'Cancelled'
WHERE u.role = 'buyer'
GROUP BY u.id, u.name, u.wallet_balance;
