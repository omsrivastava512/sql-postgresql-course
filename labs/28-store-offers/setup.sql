DROP SCHEMA IF EXISTS course_offers CASCADE;
CREATE SCHEMA course_offers;

CREATE TABLE course_offers.products (
    product_code text PRIMARY KEY,
    product_name text NOT NULL
);

CREATE TABLE course_offers.variants (
    variant_code text PRIMARY KEY,
    product_code text NOT NULL REFERENCES course_offers.products,
    pack_g integer NOT NULL CHECK (pack_g > 0),
    UNIQUE (product_code, pack_g)
);

CREATE TABLE course_offers.stores (
    store_id text PRIMARY KEY
);

INSERT INTO course_offers.products VALUES ('TEA', 'Breakfast Tea'), ('BIS', 'Oat Biscuits');
INSERT INTO course_offers.variants VALUES
    ('T50', 'TEA', 50),
    ('T100', 'TEA', 100),
    ('B50', 'BIS', 50);
INSERT INTO course_offers.stores VALUES ('North'), ('South');

CREATE TABLE course_offers.offer_feed (
    store_id text, store_sku text, variant_code text, unit_price_paise integer, stock_units integer
);

INSERT INTO course_offers.offer_feed VALUES
    ('North', '17', 'T50', 2000, 12),
    ('South', '17', 'B50', 1500, 8),
    ('South', '81', 'T50', 2300, 0);
