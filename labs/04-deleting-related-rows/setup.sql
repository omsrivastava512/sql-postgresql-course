DROP SCHEMA IF EXISTS course_delete CASCADE;
CREATE SCHEMA course_delete;
CREATE TABLE course_delete.patients (id integer PRIMARY KEY, name text NOT NULL);
CREATE TABLE course_delete.visits (
  id integer PRIMARY KEY,
  patient_id integer,
  CONSTRAINT visit_patient_fk FOREIGN KEY (patient_id)
    REFERENCES course_delete.patients(id) ON DELETE NO ACTION
);
INSERT INTO course_delete.patients VALUES (10, 'Riya');
INSERT INTO course_delete.visits VALUES (100, 10);

