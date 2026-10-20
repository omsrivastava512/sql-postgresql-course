CREATE VIEW course_report.order_amounts AS
SELECT o.id, o.placed_at, o.status, SUM(l.quantity) AS units, SUM(l.quantity::bigint * l.unit_cents - l.discount_cents) AS sale_cents
FROM course_report.orders o JOIN course_report.lines l ON l.order_id = o.id
GROUP BY o.id, o.placed_at, o.status;
CREATE VIEW course_report.monthly_sales AS
WITH sales AS (
  SELECT p.label, COUNT(o.id) AS order_count, COALESCE(SUM(o.units), 0) AS units, COALESCE(SUM(o.sale_cents), 0) AS sale_cents
  FROM course_report.periods p LEFT JOIN course_report.order_amounts o ON o.status = 'paid' AND o.placed_at >= p.start_at AND o.placed_at < p.end_at
  GROUP BY p.label
), refunds AS (
  SELECT p.label, COALESCE(SUM(r.cents), 0) AS refund_cents
  FROM course_report.periods p LEFT JOIN (
    SELECT r.refunded_at, r.cents FROM course_report.refunds r JOIN course_report.orders o ON o.id = r.order_id WHERE o.status = 'paid'
  ) r ON r.refunded_at >= p.start_at AND r.refunded_at < p.end_at
  GROUP BY p.label
)
SELECT s.label, s.order_count, s.units, s.sale_cents, r.refund_cents, s.sale_cents - r.refund_cents AS net_cents,
       ROUND(s.sale_cents::numeric / NULLIF(s.units, 0), 2) AS average_unit_cents
FROM sales s JOIN refunds r ON r.label = s.label;
CREATE VIEW course_report.monthly_usage AS
WITH per_account AS (
  SELECT p.label, a.id, COALESCE(SUM(u.units), 0) AS units
  FROM course_report.periods p CROSS JOIN course_report.accounts a
  LEFT JOIN course_report.usage u ON u.account_id = a.id AND u.used_at >= p.start_at AND u.used_at < p.end_at
  WHERE a.active
  GROUP BY p.label, a.id
)
SELECT label, COUNT(*) AS active_accounts, SUM(units) AS units, ROUND(AVG(units), 2) AS average_units FROM per_account GROUP BY label;
SELECT * FROM course_report.monthly_sales ORDER BY label;
SELECT * FROM course_report.monthly_usage ORDER BY label;
WITH ranked AS (
  SELECT p.label, o.id, o.sale_cents, RANK() OVER (PARTITION BY p.label ORDER BY o.sale_cents DESC) AS position
  FROM course_report.periods p JOIN course_report.order_amounts o ON o.status = 'paid' AND o.placed_at >= p.start_at AND o.placed_at < p.end_at
)
SELECT label, id, sale_cents FROM ranked WHERE position = 1 ORDER BY label, id;
