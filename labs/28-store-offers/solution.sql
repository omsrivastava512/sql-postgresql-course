CREATE TABLE course_offers.offers (
    offer_id integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    store_id text NOT NULL REFERENCES course_offers.stores,
    store_sku text NOT NULL,
    variant_code text NOT NULL REFERENCES course_offers.variants,
    unit_price_paise integer NOT NULL CHECK (unit_price_paise >= 0),
    stock_units integer NOT NULL CHECK (stock_units >= 0),
    UNIQUE (store_id, store_sku),
    UNIQUE (store_id, variant_code)
);

INSERT INTO course_offers.offers (store_id, store_sku, variant_code, unit_price_paise, stock_units)
SELECT store_id, store_sku, variant_code, unit_price_paise, stock_units
FROM course_offers.offer_feed;

UPDATE course_offers.offers SET unit_price_paise = 2200
WHERE store_id = 'North' AND store_sku = '17';

SELECT s.store_id, v.variant_code, o.store_sku, o.unit_price_paise, o.stock_units
FROM course_offers.stores AS s
CROSS JOIN course_offers.variants AS v
LEFT JOIN course_offers.offers AS o
    ON o.store_id = s.store_id AND o.variant_code = v.variant_code
ORDER BY s.store_id, v.variant_code;
