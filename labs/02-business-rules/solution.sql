INSERT INTO course_rules.patients VALUES (10, 'Riya', 1);
UPDATE course_rules.profiles SET role = 'receptionist' WHERE id = 1;
SELECT p.id, p.owner_id, r.role
FROM course_rules.patients p
JOIN course_rules.profiles r ON r.id = p.owner_id;

