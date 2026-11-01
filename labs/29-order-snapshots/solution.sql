CREATE TABLE course_receipt.orders (
    order_id integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    store_id text NOT NULL REFERENCES course_receipt.stores
);

CREATE TABLE course_receipt.order_lines (
    order_id integer NOT NULL REFERENCES course_receipt.orders,
    line_no integer NOT NULL CHECK (line_no > 0),
    offer_id integer REFERENCES course_receipt.offers ON DELETE SET NULL,
    accepted_description text NOT NULL,
    accepted_sku text NOT NULL,
    quantity integer NOT NULL CHECK (quantity > 0),
    unit_price_paise integer NOT NULL CHECK (unit_price_paise >= 0),
    PRIMARY KEY (order_id, line_no)
);

CREATE FUNCTION course_receipt.accept_offer(p_store text, p_sku text, p_quantity integer)
RETURNS SETOF integer
LANGUAGE sql AS $$
    WITH selected AS (
        SELECT o.offer_id, o.store_id, o.store_sku, o.unit_price_paise,
               p.product_name || ' ' || v.pack_g || ' g' AS description
        FROM course_receipt.offers AS o
        JOIN course_receipt.variants AS v USING (variant_code)
        JOIN course_receipt.products AS p USING (product_code)
        WHERE o.store_id = p_store AND o.store_sku = p_sku
    ), new_order AS (
        INSERT INTO course_receipt.orders (store_id)
        SELECT store_id FROM selected
        RETURNING order_id
    )
    INSERT INTO course_receipt.order_lines
        (order_id, line_no, offer_id, accepted_description, accepted_sku, quantity, unit_price_paise)
    SELECT n.order_id, 1, s.offer_id, s.description, s.store_sku, p_quantity, s.unit_price_paise
    FROM new_order AS n CROSS JOIN selected AS s
    RETURNING order_id;
$$;

CREATE VIEW course_receipt.receipts AS
SELECT h.order_id, l.line_no, h.store_id, l.accepted_sku, l.accepted_description,
       l.quantity, l.unit_price_paise, l.quantity::bigint * l.unit_price_paise AS total_paise,
       l.offer_id
FROM course_receipt.orders AS h
JOIN course_receipt.order_lines AS l USING (order_id);

SELECT * FROM course_receipt.accept_offer('North', '17', 3);

UPDATE course_receipt.products SET product_name = 'Morning Tea' WHERE product_code = 'TEA';
UPDATE course_receipt.offers SET unit_price_paise = 2200, store_sku = '17A'
WHERE store_id = 'North' AND store_sku = '17';

SELECT * FROM course_receipt.accept_offer('North', '17A', 3);

DELETE FROM course_receipt.offers WHERE store_id = 'North' AND store_sku = '17A';
SELECT * FROM course_receipt.receipts ORDER BY order_id, line_no;
