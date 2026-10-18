DROP SCHEMA IF EXISTS course_fk CASCADE;
CREATE SCHEMA course_fk;
CREATE TABLE course_fk.profiles (
  id integer PRIMARY KEY,
  name text NOT NULL,
  role text NOT NULL
);
CREATE TABLE course_fk.patients (
  id integer PRIMARY KEY,
  name text NOT NULL,
  owner_id integer NOT NULL REFERENCES course_fk.profiles(id)
);
CREATE TABLE course_fk.visits (
  id integer PRIMARY KEY,
  patient_id integer NOT NULL REFERENCES course_fk.patients(id)
);
INSERT INTO course_fk.profiles VALUES (1, 'Meera', 'admin'), (2, 'Dev', 'receptionist');
INSERT INTO course_fk.patients VALUES (10, 'Riya', 1);

