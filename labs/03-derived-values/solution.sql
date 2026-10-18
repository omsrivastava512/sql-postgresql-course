INSERT INTO course_derive.notes (id, patient_id, owner_id, body)
VALUES (100, 10, 2, 'Follow-up recorded') RETURNING *;
INSERT INTO course_derive.notes (id, patient_id, body)
VALUES (101, 10, 'Second note') RETURNING *;
UPDATE course_derive.patients SET owner_id = 2 WHERE id = 10;
SELECT n.id, n.owner_id AS stored_note_owner, p.owner_id AS current_patient_owner
FROM course_derive.notes n
JOIN course_derive.patients p ON p.id = n.patient_id
ORDER BY n.id;

