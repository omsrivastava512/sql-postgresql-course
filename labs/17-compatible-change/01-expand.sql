BEGIN;
SET LOCAL lock_timeout = '1s';
ALTER TABLE course_change.bookings ADD COLUMN reminder_minutes integer;
ALTER TABLE course_change.bookings ALTER COLUMN reminder_minutes SET DEFAULT 30;
ALTER TABLE course_change.bookings ADD CONSTRAINT reminder_range CHECK (reminder_minutes BETWEEN 0 AND 1440) NOT VALID;
INSERT INTO course_change.migration_history VALUES ('001_expand');
COMMIT;
