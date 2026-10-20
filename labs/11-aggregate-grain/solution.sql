SELECT order_id, SUM(quantity * unit_cents) AS line_cents FROM course_totals.lines GROUP BY order_id HAVING SUM(quantity * unit_cents) >= 2000 ORDER BY order_id;
SELECT order_id, SUM(cents) FILTER (WHERE kind = 'capture') AS captured, SUM(cents) FILTER (WHERE kind = 'refund') AS refunded FROM course_totals.payments GROUP BY order_id ORDER BY order_id;
SELECT o.id, COALESCE(l.line_cents, 0) AS line_cents, COALESCE(p.net_cents, 0) AS net_cents
FROM course_totals.orders o
LEFT JOIN (SELECT order_id, SUM(quantity * unit_cents) AS line_cents FROM course_totals.lines GROUP BY order_id) l ON l.order_id = o.id
LEFT JOIN (SELECT order_id, SUM(CASE WHEN kind = 'refund' THEN -cents ELSE cents END) AS net_cents FROM course_totals.payments GROUP BY order_id) p ON p.order_id = o.id
ORDER BY o.id;
SELECT a.id, COALESCE(u.units, 0) AS units, COALESCE(r.cents, 0) AS cents
FROM course_totals.accounts a
LEFT JOIN (SELECT account_id, SUM(units) AS units FROM course_totals.usage GROUP BY account_id) u ON u.account_id = a.id
LEFT JOIN (SELECT account_id, SUM(cents) AS cents FROM course_totals.receipts GROUP BY account_id) r ON r.account_id = a.id
ORDER BY a.id;
