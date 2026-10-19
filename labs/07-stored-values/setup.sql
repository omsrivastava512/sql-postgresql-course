DROP SCHEMA IF EXISTS course_values CASCADE;
CREATE SCHEMA course_values;
CREATE TABLE course_values.products (
  id integer PRIMARY KEY,
  name text NOT NULL,
  stock integer DEFAULT 0 CHECK (stock >= 0),
  note text DEFAULT 'not supplied'
);
INSERT INTO course_values.products (id, name) VALUES (10, 'Mug');
INSERT INTO course_values.products (id, name, stock, note) VALUES (20, 'Tea', NULL, NULL);
INSERT INTO course_values.products (id, name, stock, note) VALUES (30, 'Tin', 0, '');
CREATE TABLE course_values.reservations (
  id integer PRIMARY KEY,
  contact text
);
INSERT INTO course_values.reservations VALUES (1, NULL), (2, ''), (3, 'sam@example.test');
