DROP SCHEMA IF EXISTS course_plan CASCADE;
CREATE SCHEMA course_plan;
CREATE TABLE course_plan.orders (id integer PRIMARY KEY, customer_id integer NOT NULL, amount_cents integer NOT NULL, padding text NOT NULL);
INSERT INTO course_plan.orders SELECT g, (g - 1) % 1000 + 1, 100 + g % 1000, repeat('x', 80) FROM generate_series(1, 40000) g;
CREATE TABLE course_plan.deliveries (id integer PRIMARY KEY, route_id integer NOT NULL, delivered boolean NOT NULL, package_units integer NOT NULL);
INSERT INTO course_plan.deliveries SELECT g, (g - 1) % 200 + 1, g % 3 <> 0, 1 + g % 4 FROM generate_series(1, 12000) g;
ANALYZE course_plan.orders;
ANALYZE course_plan.deliveries;
