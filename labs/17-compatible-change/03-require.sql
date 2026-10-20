BEGIN;
SET LOCAL lock_timeout = '1s';
ALTER TABLE course_change.bookings ADD CONSTRAINT reminder_present CHECK (reminder_minutes IS NOT NULL) NOT VALID;
ALTER TABLE course_change.bookings VALIDATE CONSTRAINT reminder_range;
ALTER TABLE course_change.bookings VALIDATE CONSTRAINT reminder_present;
ALTER TABLE course_change.bookings ALTER COLUMN reminder_minutes SET NOT NULL;
ALTER TABLE course_change.bookings DROP CONSTRAINT reminder_present;
INSERT INTO course_change.migration_history VALUES ('003_require');
COMMIT;
