DROP SCHEMA IF EXISTS course_change CASCADE;
CREATE SCHEMA course_change;
CREATE TABLE course_change.bookings (id integer PRIMARY KEY, room text NOT NULL, starts_at timestamptz NOT NULL);
INSERT INTO course_change.bookings VALUES
(1, 'Blue', '2026-10-22 09:00:00+00'),
(2, 'Blue', '2026-10-22 10:00:00+00'),
(3, 'Green', '2026-10-22 11:00:00+00'),
(4, 'Green', '2026-10-22 12:00:00+00');
CREATE TABLE course_change.migration_history (version text PRIMARY KEY);
CREATE TABLE course_change.jobs (id integer PRIMARY KEY, queue text NOT NULL);
INSERT INTO course_change.jobs VALUES (1, 'email'), (2, 'sms');
