DROP SCHEMA IF EXISTS course_filter CASCADE;
CREATE SCHEMA course_filter;
CREATE TABLE course_filter.orders (
  id integer PRIMARY KEY,
  customer text NOT NULL,
  status text CHECK (status IN ('paid', 'pending', 'cancelled')),
  ordered_on date NOT NULL,
  total integer NOT NULL CHECK (total >= 0)
);
INSERT INTO course_filter.orders VALUES
  (101, 'Riya', 'paid', '2026-10-01', 30),
  (102, 'Sam', 'pending', '2026-10-01', 20),
  (103, 'Riya', 'cancelled', '2026-10-02', 20),
  (104, 'Dev', 'paid', '2026-10-02', 30),
  (105, 'Sam', NULL, '2026-10-03', 50),
  (106, 'Riya', 'pending', '2026-10-02', 10),
  (107, 'Rena', 'paid', '2026-10-02', 5);
CREATE TABLE course_filter.subscriptions (
  id integer PRIMARY KEY,
  customer text NOT NULL,
  plan text NOT NULL,
  active boolean NOT NULL,
  renew_on date
);
INSERT INTO course_filter.subscriptions VALUES
  (1, 'Asha', 'pro', true, '2026-11-01'),
  (2, 'Bo', 'pro', true, NULL),
  (3, 'Cy', 'basic', true, '2026-10-31'),
  (4, 'Dee', 'pro', false, '2026-10-30'),
  (5, 'Eli', 'pro', true, '2026-10-31'),
  (6, 'Fay', 'pro', true, '2026-10-31');
