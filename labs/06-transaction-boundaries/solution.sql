INSERT INTO course_tx.invoices (id, clinic_id, visit_id, amount)
VALUES (100, 1, 10, 500) RETURNING *;
SELECT * FROM course_tx.clinics;

BEGIN;
INSERT INTO course_tx.visits VALUES (20, 'Sam');
INSERT INTO course_tx.invoices (id, clinic_id, visit_id, amount)
VALUES (101, 1, 20, 700);
COMMIT;
SELECT * FROM course_tx.visits ORDER BY id;
SELECT * FROM course_tx.invoices ORDER BY id;
SELECT * FROM course_tx.clinics;

