CREATE INDEX orders_customer_idx ON course_plan.orders (customer_id);
CREATE INDEX deliveries_route_idx ON course_plan.deliveries (route_id);
ANALYZE course_plan.orders;
ANALYZE course_plan.deliveries;
EXPLAIN (ANALYZE, BUFFERS) SELECT id, amount_cents FROM course_plan.orders WHERE customer_id = 42 ORDER BY id;
SELECT count(*)::integer AS orders, sum(amount_cents)::integer AS cents FROM course_plan.orders WHERE customer_id = 42;
EXPLAIN (ANALYZE, BUFFERS) SELECT id, package_units FROM course_plan.deliveries WHERE route_id = 7 AND NOT delivered ORDER BY id;
SELECT count(*)::integer AS deliveries, sum(package_units)::integer AS units FROM course_plan.deliveries WHERE route_id = 7 AND NOT delivered;
