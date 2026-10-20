BEGIN;
CREATE OR REPLACE VIEW course_import.normalized AS
SELECT line_no, btrim(source_key) AS source_key, btrim(product) AS product, note,
       CASE WHEN btrim(order_id) ~ '^[1-9][0-9]{0,5}$' THEN btrim(order_id)::integer END AS order_id,
       CASE WHEN btrim(quantity) ~ '^[1-9][0-9]{0,2}$' THEN btrim(quantity)::integer END AS quantity,
       CASE WHEN btrim(unit_price) ~ '^[0-9]{1,4}[.][0-9]{2}$' THEN (btrim(unit_price)::numeric * 100)::integer END AS unit_cents,
       CASE WHEN btrim(sold_on) ~ '^[0-9]{4}-[0-9]{2}-[0-9]{2}$' AND pg_input_is_valid(btrim(sold_on), 'date') THEN btrim(sold_on)::date END AS sold_on
FROM course_import.raw_lines;
CREATE OR REPLACE VIEW course_import.assessed AS
WITH key_versions AS (
  SELECT source_key, COUNT(DISTINCT (order_id, product, quantity, unit_cents, sold_on, note)) AS versions FROM course_import.normalized GROUP BY source_key
), numbered AS (
  SELECT n.*, ROW_NUMBER() OVER (PARTITION BY source_key ORDER BY line_no) AS occurrence FROM course_import.normalized n
)
SELECT n.line_no,
       CASE WHEN n.source_key IS NULL OR n.source_key = '' THEN 'reject_key'
            WHEN n.order_id IS NULL THEN 'reject_order_format'
            WHEN n.product IS NULL OR n.product = '' THEN 'reject_product'
            WHEN n.quantity IS NULL THEN 'reject_quantity'
            WHEN n.unit_cents IS NULL THEN 'reject_price'
            WHEN n.sold_on IS NULL THEN 'reject_date'
            WHEN o.id IS NULL THEN 'reject_unknown_order'
            WHEN k.versions > 1 THEN 'reject_conflicting_source'
            WHEN f.source_key IS NOT NULL AND (f.order_id, f.product, f.quantity, f.unit_cents, f.sold_on, f.note) IS DISTINCT FROM (n.order_id, n.product, n.quantity, n.unit_cents, n.sold_on, n.note) THEN 'reject_existing_conflict'
            WHEN n.occurrence > 1 THEN 'duplicate'
            ELSE 'accept' END AS decision
FROM numbered n JOIN key_versions k ON k.source_key IS NOT DISTINCT FROM n.source_key
LEFT JOIN course_import.orders o ON o.id = n.order_id
LEFT JOIN course_import.facts f ON f.source_key = n.source_key;
INSERT INTO course_import.decisions SELECT line_no, decision FROM course_import.assessed
ON CONFLICT (line_no) DO UPDATE SET decision = EXCLUDED.decision;
INSERT INTO course_import.facts (source_key, order_id, product, quantity, unit_cents, sold_on, note)
SELECT n.source_key, n.order_id, n.product, n.quantity, n.unit_cents, n.sold_on, n.note
FROM course_import.normalized n JOIN course_import.decisions d ON d.line_no = n.line_no
WHERE d.decision = 'accept'
ON CONFLICT (source_key) DO NOTHING;
COMMIT;
SELECT decision, COUNT(*) AS rows FROM course_import.decisions GROUP BY decision ORDER BY decision;
SELECT COUNT(*) AS facts, SUM(quantity::bigint * unit_cents) AS cents FROM course_import.facts;
