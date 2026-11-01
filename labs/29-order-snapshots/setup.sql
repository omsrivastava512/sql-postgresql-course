DROP SCHEMA IF EXISTS course_receipt CASCADE;
CREATE SCHEMA course_receipt;

CREATE TABLE course_receipt.products (
    product_code text PRIMARY KEY,
    product_name text NOT NULL
);

CREATE TABLE course_receipt.variants (
    variant_code text PRIMARY KEY,
    product_code text NOT NULL REFERENCES course_receipt.products,
    pack_g integer NOT NULL CHECK (pack_g > 0),
    UNIQUE (product_code, pack_g)
);

CREATE TABLE course_receipt.stores (
    store_id text PRIMARY KEY
);

INSERT INTO course_receipt.products VALUES ('TEA', 'Breakfast Tea'), ('BIS', 'Oat Biscuits');
INSERT INTO course_receipt.variants VALUES
    ('T50', 'TEA', 50),
    ('T100', 'TEA', 100),
    ('B50', 'BIS', 50);
INSERT INTO course_receipt.stores VALUES ('North'), ('South');

CREATE TABLE course_receipt.offers (
    offer_id integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    store_id text NOT NULL REFERENCES course_receipt.stores,
    store_sku text NOT NULL,
    variant_code text NOT NULL REFERENCES course_receipt.variants,
    unit_price_paise integer NOT NULL CHECK (unit_price_paise >= 0),
    stock_units integer NOT NULL CHECK (stock_units >= 0),
    UNIQUE (store_id, store_sku),
    UNIQUE (store_id, variant_code)
);

INSERT INTO course_receipt.offers (store_id, store_sku, variant_code, unit_price_paise, stock_units)
VALUES
    ('North', '17', 'T50', 2000, 12),
    ('South', '17', 'B50', 1500, 8),
    ('South', '81', 'T50', 2300, 0);
