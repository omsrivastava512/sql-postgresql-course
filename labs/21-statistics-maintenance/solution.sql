UPDATE course_maintenance.tasks SET status = 'open' WHERE id BETWEEN 41 AND 20000;
ANALYZE course_maintenance.tasks;
UPDATE course_maintenance.mail SET status = 'queued' WHERE id BETWEEN 21 AND 1000;
ANALYZE course_maintenance.mail;
SELECT status, count(*)::integer AS n FROM course_maintenance.tasks GROUP BY status ORDER BY status;
SELECT status, count(*)::integer AS n FROM course_maintenance.mail GROUP BY status ORDER BY status;
ALTER TABLE course_maintenance.tasks RESET (autovacuum_enabled);
ALTER TABLE course_maintenance.mail RESET (autovacuum_enabled);
