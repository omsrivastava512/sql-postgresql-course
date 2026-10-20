DROP SCHEMA IF EXISTS course_window CASCADE;
CREATE SCHEMA course_window;
CREATE TABLE course_window.charges (id integer PRIMARY KEY, account_id integer NOT NULL, charged_on date NOT NULL, cents integer NOT NULL);
INSERT INTO course_window.charges VALUES (1, 1, '2026-10-01', 100), (2, 1, '2026-10-02', 200), (3, 1, '2026-10-02', 200), (4, 1, '2026-10-03', -50), (5, 2, '2026-10-02', 300);
CREATE TABLE course_window.readings (id integer PRIMARY KEY, meter text NOT NULL, read_on date NOT NULL, reading integer NOT NULL);
INSERT INTO course_window.readings VALUES (1, 'A', '2026-10-01', 10), (2, 'A', '2026-10-02', 13), (3, 'A', '2026-10-02', 13), (4, 'A', '2026-10-03', 17), (5, 'B', '2026-10-02', 5);
