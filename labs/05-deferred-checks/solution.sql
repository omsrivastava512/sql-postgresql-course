BEGIN;
SET CONSTRAINTS course_defer.visit_patient_fk DEFERRED;
DELETE FROM course_defer.patients WHERE id = 10;
DELETE FROM course_defer.visits WHERE id = 100;
COMMIT;
SELECT * FROM course_defer.patients;
SELECT * FROM course_defer.visits;

