DROP SCHEMA IF EXISTS course_race CASCADE;
CREATE SCHEMA course_race;
CREATE TABLE course_race.stock (item_id integer PRIMARY KEY, available integer NOT NULL CHECK (available >= 0));
CREATE TABLE course_race.reservations (id integer PRIMARY KEY, item_id integer NOT NULL REFERENCES course_race.stock(item_id), quantity integer NOT NULL CHECK (quantity > 0));
INSERT INTO course_race.stock VALUES (1, 1), (2, 5);
CREATE TABLE course_race.sessions (id integer PRIMARY KEY, remaining_seats integer NOT NULL CHECK (remaining_seats >= 0));
CREATE TABLE course_race.registrations (id integer PRIMARY KEY, session_id integer NOT NULL REFERENCES course_race.sessions(id), seats integer NOT NULL CHECK (seats > 0));
INSERT INTO course_race.sessions VALUES (1, 3);
