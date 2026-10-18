DROP SCHEMA IF EXISTS course_defer CASCADE;
CREATE SCHEMA course_defer;
CREATE TABLE course_defer.patients (id integer PRIMARY KEY);
CREATE TABLE course_defer.visits (
  id integer PRIMARY KEY,
  patient_id integer NOT NULL,
  CONSTRAINT visit_patient_fk FOREIGN KEY (patient_id)
    REFERENCES course_defer.patients(id)
    ON DELETE NO ACTION DEFERRABLE INITIALLY IMMEDIATE
);
CREATE TABLE course_defer.restricted_patients (id integer PRIMARY KEY);
CREATE TABLE course_defer.restricted_visits (
  id integer PRIMARY KEY,
  patient_id integer NOT NULL,
  CONSTRAINT restricted_patient_fk FOREIGN KEY (patient_id)
    REFERENCES course_defer.restricted_patients(id)
    ON DELETE RESTRICT DEFERRABLE INITIALLY IMMEDIATE
);
INSERT INTO course_defer.patients VALUES (10);
INSERT INTO course_defer.visits VALUES (100, 10);
INSERT INTO course_defer.restricted_patients VALUES (10);
INSERT INTO course_defer.restricted_visits VALUES (100, 10);

