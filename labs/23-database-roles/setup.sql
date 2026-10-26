RESET ROLE;
DROP SCHEMA IF EXISTS course_priv CASCADE;
DO $$ BEGIN
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'course_priv_reader') THEN CREATE ROLE course_priv_reader NOLOGIN; END IF;
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'course_priv_writer') THEN CREATE ROLE course_priv_writer NOLOGIN; END IF;
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'course_priv_dispatch') THEN CREATE ROLE course_priv_dispatch NOLOGIN; END IF;
END $$;
CREATE SCHEMA course_priv;
CREATE TABLE course_priv.profiles (id integer PRIMARY KEY, db_role name UNIQUE NOT NULL, app_role text NOT NULL);
INSERT INTO course_priv.profiles VALUES (1, 'course_priv_reader', 'admin'), (2, 'course_priv_writer', 'staff');
CREATE TABLE course_priv.tickets (id serial PRIMARY KEY, subject text NOT NULL, internal_note text NOT NULL DEFAULT 'Internal only');
INSERT INTO course_priv.tickets (subject, internal_note) VALUES ('Late delivery', 'Customer called twice'), ('Missing item', 'Review warehouse record');
CREATE TABLE course_priv.deliveries (id integer PRIMARY KEY, tracking text NOT NULL, status text NOT NULL, private_address text NOT NULL);
INSERT INTO course_priv.deliveries VALUES (10, 'TRACK-10', 'queued', 'Synthetic address A'), (20, 'TRACK-20', 'sent', 'Synthetic address B');
