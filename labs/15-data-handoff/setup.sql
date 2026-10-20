DROP SCHEMA IF EXISTS course_import CASCADE;
CREATE SCHEMA course_import;
CREATE TABLE course_import.orders (id integer PRIMARY KEY);
INSERT INTO course_import.orders VALUES (101), (102);
CREATE TABLE course_import.raw_lines (line_no integer PRIMARY KEY, source_key text, order_id text, product text, quantity text, unit_price text, sold_on text, note text);
INSERT INTO course_import.raw_lines VALUES
  (1, 'L1', '101', 'Coffee, ground', '2', '10.00', '2026-10-01', NULL),
  (2, 'L2', '101', 'Coffee, ground', '2', '10.00', '2026-10-01', NULL),
  (3, 'L1', '101', 'Coffee, ground', '2', '10.00', '2026-10-01', NULL),
  (4, 'L3', '101', 'Mug', '1', '7.00', '2026-02-30', NULL),
  (5, 'L4', '101', 'Mug', '0', '7.00', '2026-10-01', NULL),
  (6, 'L5', '101', 'Mug', '1', '12.345', '2026-10-01', NULL),
  (7, 'L6', '999', 'Mug', '1', '7.00', '2026-10-01', NULL),
  (8, 'L7', '101', '   ', '1', '7.00', '2026-10-01', NULL),
  (9, 'L8', '102', 'Tea "house"', ' 1 ', ' 5.50 ', '2026-10-02', 'check, shelf'),
  (10, 'L9', '102', 'Mug', '1', '7.00', '2026-10-02', '');
CREATE TABLE course_import.facts (source_key text PRIMARY KEY, order_id integer NOT NULL REFERENCES course_import.orders(id), product text NOT NULL CHECK (length(btrim(product)) > 0), quantity integer NOT NULL CHECK (quantity BETWEEN 1 AND 999), unit_cents integer NOT NULL CHECK (unit_cents BETWEEN 0 AND 999999), sold_on date NOT NULL, note text);
CREATE TABLE course_import.decisions (line_no integer PRIMARY KEY REFERENCES course_import.raw_lines(line_no), decision text NOT NULL);
