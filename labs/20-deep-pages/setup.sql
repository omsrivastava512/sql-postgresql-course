DROP SCHEMA IF EXISTS course_page CASCADE;
CREATE SCHEMA course_page;
CREATE TABLE course_page.events (id integer PRIMARY KEY, workspace_id integer NOT NULL, occurred_at timestamptz NOT NULL, description text NOT NULL);
INSERT INTO course_page.events SELECT g, (g - 1) / 10000 + 1, timestamptz '2026-01-01 00:00:00+00' + ((g - 1) / 3) * interval '1 second', 'Event ' || g FROM generate_series(1, 100000) g;
CREATE TABLE course_page.messages (id integer PRIMARY KEY, channel_id integer NOT NULL, sent_at timestamptz NOT NULL);
INSERT INTO course_page.messages SELECT g, (g - 1) / 3000 + 1, timestamptz '2026-01-01 00:00:00+00' + ((g - 1) / 2) * interval '1 second' FROM generate_series(1, 9000) g;
ANALYZE course_page.events;
ANALYZE course_page.messages;
