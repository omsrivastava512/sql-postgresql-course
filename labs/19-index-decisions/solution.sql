CREATE INDEX orders_customer_recent_idx ON course_index.orders (customer_id, placed_at DESC, id DESC) INCLUDE (total_cents);
CREATE INDEX orders_open_idx ON course_index.orders (placed_at, id) WHERE status = 'open';
CREATE UNIQUE INDEX subscriptions_one_active_idx ON course_index.subscriptions (customer_id) WHERE active;
CREATE INDEX tickets_project_recent_idx ON course_index.tickets (project_id, created_at DESC, id DESC);
ANALYZE course_index.orders;
ANALYZE course_index.tickets;
SELECT id, total_cents FROM course_index.orders WHERE customer_id = 42 ORDER BY placed_at DESC, id DESC LIMIT 5;
SELECT id FROM course_index.orders WHERE status = 'open' ORDER BY placed_at, id LIMIT 5;
SELECT id FROM course_index.tickets WHERE project_id = 8 ORDER BY created_at DESC, id DESC LIMIT 3;
