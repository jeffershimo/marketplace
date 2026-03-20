-- ════════════════════════════════════════════════════════════════
-- MIGRATION: Cancel/Refund System + Contact Number
-- Run: psql -U postgres -d marketplace -f migration_cancel.sql
-- ════════════════════════════════════════════════════════════════

-- Add contact number to orders
ALTER TABLE orders ADD COLUMN IF NOT EXISTS contact_phone VARCHAR(20);

-- Cancel/Refund requests table
DROP TABLE IF EXISTS cancel_requests CASCADE;
CREATE TABLE cancel_requests (
    id              SERIAL PRIMARY KEY,
    order_id        INT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    buyer_id        INT NOT NULL REFERENCES users(id),
    reason          TEXT NOT NULL,
    status          VARCHAR(20) NOT NULL DEFAULT 'pending'
                    CHECK (status IN ('pending', 'approved', 'rejected')),
    seller_response TEXT,
    responded_at    TIMESTAMP,
    created_at      TIMESTAMP NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_cancel_order ON cancel_requests(order_id);
CREATE INDEX idx_cancel_buyer ON cancel_requests(buyer_id);

-- Update orders status to include refund states
ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_status_check;
ALTER TABLE orders ADD CONSTRAINT orders_status_check
    CHECK (status IN ('Processing', 'Confirmed', 'Shipped', 'Delivered', 'Cancel Requested', 'Cancelled', 'Refunded'));
