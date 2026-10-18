ALTER TABLE course_delete.visits DROP CONSTRAINT visit_patient_fk;
ALTER TABLE course_delete.visits ADD CONSTRAINT visit_patient_fk
FOREIGN KEY (patient_id) REFERENCES course_delete.patients(id) ON DELETE CASCADE;
DELETE FROM course_delete.patients WHERE id = 10;
SELECT * FROM course_delete.patients;
SELECT * FROM course_delete.visits;

INSERT INTO course_delete.patients VALUES (10, 'Riya');
INSERT INTO course_delete.visits VALUES (100, 10);
ALTER TABLE course_delete.visits DROP CONSTRAINT visit_patient_fk;
ALTER TABLE course_delete.visits ADD CONSTRAINT visit_patient_fk
FOREIGN KEY (patient_id) REFERENCES course_delete.patients(id) ON DELETE SET NULL;
DELETE FROM course_delete.patients WHERE id = 10;
SELECT * FROM course_delete.visits;

