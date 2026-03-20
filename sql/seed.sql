-- ════════════════════════════════════════════════════════════════
-- SEED DATA
-- Run after schema.sql: psql -U postgres -d marketplace -f seed.sql
-- ════════════════════════════════════════════════════════════════

-- ────────────────────────────────────────
-- ADMIN ACCOUNT (password: admin123456)
-- Hash generated with bcrypt, 10 rounds
-- ────────────────────────────────────────
INSERT INTO users (email, password_hash, name, role, avatar, wallet_balance, is_verified)
VALUES ('admin@gmail.com', '$2b$10$adminHashPlaceholder', 'Admin User', 'admin', 'AU', 99999.00, TRUE);

-- ────────────────────────────────────────
-- DEMO SELLERS (for product listings)
-- Password for all: seller123456
-- ────────────────────────────────────────
INSERT INTO users (email, password_hash, name, role, avatar, store_name, store_desc, is_verified) VALUES
('tech@vault.com',    '$2b$10$sellerHashPlaceholder', 'Tom Chen',     'seller', 'TC', 'TechVault',   'Premium electronics and gadgets', TRUE),
('style@house.com',   '$2b$10$sellerHashPlaceholder', 'Sarah Kim',    'seller', 'SK', 'StyleHouse',  'Curated fashion and accessories', TRUE),
('home@nest.com',     '$2b$10$sellerHashPlaceholder', 'Emily Park',   'seller', 'EP', 'HomeNest',    'Beautiful home and living essentials', TRUE),
('fit@gear.com',      '$2b$10$sellerHashPlaceholder', 'Mike Johnson', 'seller', 'MJ', 'FitGear',     'Sports equipment and fitness gear', TRUE),
('book@worm.com',     '$2b$10$sellerHashPlaceholder', 'Lisa Wang',    'seller', 'LW', 'BookWorm',    'Books for every reader', TRUE),
('glow@up.com',       '$2b$10$sellerHashPlaceholder', 'Anna Lee',     'seller', 'AL', 'GlowUp',      'Skincare and beauty products', TRUE),
('toy@box.com',       '$2b$10$sellerHashPlaceholder', 'Dan Kim',      'seller', 'DK', 'ToyBox',      'Fun toys for all ages', TRUE),
('auto@parts.com',    '$2b$10$sellerHashPlaceholder', 'James Park',   'seller', 'JP', 'AutoParts',   'Quality automotive accessories', TRUE);

-- ────────────────────────────────────────
-- CATEGORIES
-- ────────────────────────────────────────
INSERT INTO categories (name, slug, icon, sort_order) VALUES
('Electronics',   'electronics',    '💻', 1),
('Fashion',       'fashion',        '👔', 2),
('Home & Living', 'home-living',    '🏠', 3),
('Sports',        'sports',         '⚽', 4),
('Books',         'books',          '📚', 5),
('Beauty',        'beauty',         '✨', 6),
('Toys',          'toys',           '🧸', 7),
('Automotive',    'automotive',     '🚗', 8);

-- ────────────────────────────────────────
-- 50 PRODUCTS (all fresh, no orders)
-- Seller IDs: 2=TechVault, 3=StyleHouse, 4=HomeNest,
--             5=FitGear, 6=BookWorm, 7=GlowUp,
--             8=ToyBox, 9=AutoParts
-- ────────────────────────────────────────

-- Electronics (category 1, seller 2 = TechVault)
INSERT INTO products (seller_id, category_id, name, description, price, original_price, condition, quantity, emoji_icon, free_shipping, is_trending) VALUES
(2, 1, 'MacBook Pro 16" M4',          'Latest Apple MacBook Pro with M4 chip, 18GB RAM, 512GB SSD. Stunning Liquid Retina XDR display.', 2499.00, 2799.00, 'New', 25, '💻', TRUE, TRUE),
(2, 1, 'Sony WH-1000XM5 Headphones',  'Industry-leading noise cancellation with exceptional sound quality. 30-hour battery life.', 348.00, NULL, 'New', 50, '🎧', TRUE, FALSE),
(2, 1, 'iPad Air 2024',               'Powerful M2 chip, 10.9-inch Liquid Retina display. Perfect for work and creativity.', 599.00, 699.00, 'New', 40, '📱', TRUE, TRUE),
(2, 1, 'Samsung 4K OLED 65"',         'Breathtaking OLED display with infinite contrast. Smart TV with built-in streaming apps.', 1299.00, 1599.00, 'New', 15, '📺', FALSE, FALSE),
(2, 1, 'DJI Mini 4 Pro Drone',        'Ultra-lightweight drone with 4K HDR video. Under 249g, no license required in most regions.', 759.00, NULL, 'New', 30, '🛸', TRUE, TRUE),
(2, 1, 'Mechanical Keyboard RGB',     'Hot-swappable switches, per-key RGB lighting. Premium PBT keycaps included.', 129.00, 159.00, 'New', 100, '⌨️', TRUE, FALSE),
(2, 1, 'Canon EOS R6 Camera',         'Full-frame mirrorless camera. 20.1MP sensor, 4K 60fps video, in-body stabilization.', 2499.00, NULL, 'New', 10, '📷', FALSE, FALSE),
(2, 1, 'Nintendo Switch OLED',        'Vibrant 7-inch OLED screen, wide adjustable stand, 64GB internal storage.', 349.00, NULL, 'New', 60, '🎮', TRUE, TRUE),
(2, 1, 'AirPods Pro 3',               'Adaptive Audio, personalized spatial audio, USB-C charging. Up to 6 hours listening time.', 249.00, NULL, 'New', 80, '🎵', TRUE, FALSE),
(2, 1, 'LG UltraWide Monitor 34"',    '34-inch curved IPS display, QHD resolution, USB-C connectivity. Perfect for productivity.', 449.00, 549.00, 'New', 20, '🖥️', FALSE, FALSE);

-- Fashion (category 2, seller 3 = StyleHouse)
INSERT INTO products (seller_id, category_id, name, description, price, original_price, condition, quantity, emoji_icon, free_shipping, is_trending) VALUES
(3, 2, 'Italian Leather Jacket',      'Handcrafted genuine Italian leather. Classic biker style with modern tailoring.', 389.00, 499.00, 'New', 15, '🧥', TRUE, TRUE),
(3, 2, 'Cashmere Sweater',            '100% Grade-A Mongolian cashmere. Incredibly soft, lightweight, and warm.', 195.00, NULL, 'New', 30, '👔', TRUE, FALSE),
(3, 2, 'Running Shoes Pro',           'Responsive carbon plate, breathable mesh upper. Designed for marathon performance.', 159.00, 199.00, 'New', 45, '👟', TRUE, FALSE),
(3, 2, 'Designer Sunglasses',         'Polarized UV400 lenses, titanium frame. Comes with premium leather case.', 245.00, NULL, 'New', 25, '🕶️', TRUE, TRUE),
(3, 2, 'Silk Scarf Collection',       'Set of 3 hand-printed pure silk scarves. Timeless patterns in versatile colors.', 89.00, 120.00, 'New', 40, '🧣', TRUE, FALSE),
(3, 2, 'Denim Jacket Vintage',        'Authentic vintage-wash selvedge denim. Relaxed fit with classic brass buttons.', 120.00, NULL, 'Like New', 20, '👖', FALSE, FALSE),
(3, 2, 'Minimalist Watch',            'Swiss quartz movement, sapphire crystal. 40mm case with interchangeable straps.', 275.00, 350.00, 'New', 35, '⌚', TRUE, TRUE);

-- Home & Living (category 3, seller 4 = HomeNest)
INSERT INTO products (seller_id, category_id, name, description, price, original_price, condition, quantity, emoji_icon, free_shipping, is_trending) VALUES
(4, 3, 'Ceramic Vase Set',            'Set of 3 handmade ceramic vases in earth tones. Each piece is unique.', 78.00, NULL, 'New', 50, '🏺', TRUE, FALSE),
(4, 3, 'Smart LED Lamp',              'WiFi-enabled ambient lamp with 16M colors. Works with Alexa and Google Home.', 65.00, 85.00, 'New', 60, '💡', TRUE, FALSE),
(4, 3, 'Scandinavian Coffee Table',   'Solid oak construction with tapered legs. Minimalist Nordic design, 120cm wide.', 450.00, NULL, 'New', 10, '🪑', FALSE, TRUE),
(4, 3, 'Handwoven Throw Blanket',     'Artisan-woven from organic cotton and merino wool blend. 150x200cm.', 95.00, 130.00, 'New', 35, '🛋️', TRUE, FALSE),
(4, 3, 'Espresso Machine Pro',        'Professional 15-bar pump, integrated grinder. Makes cafe-quality espresso at home.', 699.00, NULL, 'New', 15, '☕', FALSE, TRUE),
(4, 3, 'Indoor Herb Garden Kit',      'Self-watering LED grow system. Includes 6 herb pods: basil, mint, cilantro, and more.', 45.00, 59.00, 'New', 80, '🌱', TRUE, FALSE),
(4, 3, 'Aromatherapy Diffuser',       'Ultrasonic essential oil diffuser with ambient light. 300ml capacity, runs 10+ hours.', 55.00, NULL, 'New', 70, '🕯️', TRUE, FALSE);

-- Sports (category 4, seller 5 = FitGear)
INSERT INTO products (seller_id, category_id, name, description, price, original_price, condition, quantity, emoji_icon, free_shipping, is_trending) VALUES
(5, 4, 'Titanium Water Bottle',       'Double-wall vacuum insulated. Keeps drinks cold 24hr or hot 12hr. 750ml capacity.', 42.00, NULL, 'New', 100, '🧴', TRUE, FALSE),
(5, 4, 'Yoga Mat Premium',            '6mm natural rubber with alignment lines. Non-slip, eco-friendly, includes carry strap.', 68.00, 89.00, 'New', 55, '🧘', TRUE, FALSE),
(5, 4, 'Carbon Fiber Bicycle',        'Full carbon frame, Shimano 105 groupset. Weighs only 8.2kg. Road racing geometry.', 1850.00, NULL, 'New', 5, '🚲', FALSE, TRUE),
(5, 4, 'Tennis Racket Pro',           '100 sq in head, 300g unstrung. Ideal balance of power and control for advanced players.', 229.00, 279.00, 'New', 25, '🎾', TRUE, FALSE),
(5, 4, 'Resistance Band Set',         'Set of 5 latex-free bands (10-50 lbs). Includes door anchor, handles, and carry bag.', 35.00, NULL, 'New', 120, '💪', TRUE, FALSE),
(5, 4, 'Hiking Backpack 60L',         'Waterproof ripstop nylon, adjustable torso fit. Rain cover included. Lifetime warranty.', 189.00, 239.00, 'New', 30, '🎒', FALSE, TRUE),
(5, 4, 'Smart Jump Rope',             'Counts reps, calories, and workout time. LED display in handles. Bluetooth app sync.', 45.00, NULL, 'New', 75, '🏋️', TRUE, FALSE);

-- Books (category 5, seller 6 = BookWorm)
INSERT INTO products (seller_id, category_id, name, description, price, original_price, condition, quantity, emoji_icon, free_shipping, is_trending) VALUES
(6, 5, 'The Art of Design',           'A comprehensive guide to design thinking and visual communication. 400 pages, hardcover.', 32.00, NULL, 'New', 60, '📖', TRUE, FALSE),
(6, 5, 'JavaScript Mastery Guide',    'From beginner to expert. Covers ES2024, React, Node.js, and modern best practices.', 45.00, 55.00, 'New', 40, '📚', TRUE, TRUE),
(6, 5, 'Mindfulness Journal',         '365-day guided journal with daily prompts, gratitude sections, and reflection pages.', 24.00, NULL, 'New', 90, '📓', TRUE, FALSE),
(6, 5, 'World Atlas Illustrated',     'Beautifully illustrated atlas with 200+ detailed maps. Updated 2024 edition.', 55.00, NULL, 'New', 25, '🗺️', FALSE, FALSE),
(6, 5, 'Cookbook: Global Flavors',     '150 recipes from 50 countries. Step-by-step photos, ingredient substitution guide.', 38.00, 48.00, 'New', 50, '📕', TRUE, FALSE),
(6, 5, 'Sci-Fi Novel Collection',     'Box set of 6 award-winning science fiction novels. Perfect for binge reading.', 48.00, NULL, 'New', 35, '📘', TRUE, FALSE);

-- Beauty (category 6, seller 7 = GlowUp)
INSERT INTO products (seller_id, category_id, name, description, price, original_price, condition, quantity, emoji_icon, free_shipping, is_trending) VALUES
(7, 6, 'Vitamin C Serum',             '20% L-Ascorbic Acid with hyaluronic acid and vitamin E. Brightens and protects skin.', 42.00, NULL, 'New', 80, '✨', TRUE, TRUE),
(7, 6, 'Natural Face Moisturizer',    'Organic aloe vera, jojoba oil, and shea butter blend. Fragrance-free, for all skin types.', 58.00, 75.00, 'New', 60, '🧴', TRUE, FALSE),
(7, 6, 'Hair Oil Elixir',             'Argan, rosemary, and castor oil blend. Strengthens hair, reduces breakage, adds shine.', 36.00, NULL, 'New', 70, '💧', TRUE, FALSE),
(7, 6, 'Perfume Set Luxury',          'Collection of 5 mini eau de parfums (10ml each). Floral, woody, citrus, musk, oriental.', 125.00, 160.00, 'New', 25, '🌸', TRUE, TRUE),
(7, 6, 'Electric Toothbrush Pro',     'Sonic technology, 5 brushing modes, 2-min smart timer. Includes 4 brush heads.', 89.00, NULL, 'New', 45, '🪥', TRUE, FALSE);

-- Toys (category 7, seller 8 = ToyBox)
INSERT INTO products (seller_id, category_id, name, description, price, original_price, condition, quantity, emoji_icon, free_shipping, is_trending) VALUES
(8, 7, 'Building Blocks 1000pc',      'Compatible with major brands. Includes wheels, windows, doors, and base plates.', 55.00, 70.00, 'New', 40, '🧱', TRUE, FALSE),
(8, 7, 'RC Racing Car',               '1:16 scale, 30km/h top speed. 2.4GHz remote, rechargeable battery, 20 min run time.', 79.00, NULL, 'New', 35, '🏎️', TRUE, TRUE),
(8, 7, 'Telescope Kids Edition',      '70mm aperture refractor telescope. Includes tripod, phone adapter, and star map.', 95.00, NULL, 'New', 20, '🔭', FALSE, FALSE),
(8, 7, 'Art Supply Kit',              '150-piece set: colored pencils, markers, watercolors, pastels, sketchbook. Wooden case.', 42.00, 55.00, 'New', 50, '🎨', TRUE, FALSE);

-- Automotive (category 8, seller 9 = AutoParts)
INSERT INTO products (seller_id, category_id, name, description, price, original_price, condition, quantity, emoji_icon, free_shipping, is_trending) VALUES
(9, 8, 'Car Dash Camera 4K',          'Front and rear dual camera, night vision, parking monitor. 32GB SD card included.', 129.00, NULL, 'New', 40, '📹', TRUE, FALSE),
(9, 8, 'Portable Jump Starter',       '2000A peak current, starts any vehicle. Also works as power bank (20000mAh). LED light.', 89.00, 119.00, 'New', 30, '🔋', TRUE, TRUE),
(9, 8, 'Car Vacuum Cordless',         '12000Pa suction, HEPA filter, 30-min battery. Includes crevice and brush attachments.', 65.00, NULL, 'New', 55, '🧹', TRUE, FALSE),
(9, 8, 'LED Underglow Kit',           '4-piece RGB strip kit, app-controlled. 8M colors, music sync, waterproof IP67.', 45.00, 60.00, 'New', 65, '💡', TRUE, FALSE);

-- ────────────────────────────────────────
-- Initial audit log entry
-- ────────────────────────────────────────
INSERT INTO audit_log (user_id, action, entity_type, details)
VALUES (1, 'system_initialized', 'system', '{"message": "Marketplace database initialized with seed data", "products": 50, "sellers": 8, "categories": 8}');
