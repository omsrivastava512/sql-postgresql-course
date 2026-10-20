SELECT a.id FROM course_shape.accounts a WHERE EXISTS (SELECT 1 FROM course_shape.orders o WHERE o.account_id = a.id AND o.status = 'paid') ORDER BY a.id;
SELECT a.id FROM course_shape.accounts a WHERE NOT EXISTS (SELECT 1 FROM course_shape.orders o WHERE o.account_id = a.id) ORDER BY a.id;
SELECT a.id, (SELECT c.address FROM course_shape.contacts c WHERE c.account_id = a.id ORDER BY c.id DESC LIMIT 1) AS newest_address FROM course_shape.accounts a ORDER BY a.id;
SELECT customer_id FROM course_shape.online UNION SELECT customer_id FROM course_shape.store ORDER BY customer_id;
SELECT customer_id FROM course_shape.online UNION ALL SELECT customer_id FROM course_shape.store ORDER BY customer_id;
SELECT customer_id FROM course_shape.online INTERSECT SELECT customer_id FROM course_shape.store ORDER BY customer_id;
SELECT customer_id FROM course_shape.online EXCEPT SELECT customer_id FROM course_shape.store ORDER BY customer_id;
WITH totals AS (SELECT account_id, SUM(cents) AS cents FROM course_shape.orders GROUP BY account_id)
SELECT a.id, COALESCE(t.cents, 0) AS cents FROM course_shape.accounts a LEFT JOIN totals t ON t.account_id = a.id ORDER BY a.id;
SELECT w.id FROM course_shape.workspaces w WHERE NOT EXISTS (SELECT 1 FROM course_shape.events e WHERE e.workspace_id = w.id AND e.status = 'success') ORDER BY w.id;
