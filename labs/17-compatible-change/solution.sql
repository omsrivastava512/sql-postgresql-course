BEGIN;
SET LOCAL lock_timeout = '1s';
ALTER TABLE course_change.bookings ADD COLUMN reminder_minutes integer;
ALTER TABLE course_change.bookings ALTER COLUMN reminder_minutes SET DEFAULT 30;
ALTER TABLE course_change.bookings ADD CONSTRAINT reminder_range CHECK (reminder_minutes BETWEEN 0 AND 1440) NOT VALID;
INSERT INTO course_change.migration_history VALUES ('001_expand');
COMMIT;

BEGIN;
SET LOCAL lock_timeout = '1s';
WITH batch AS (
  SELECT id FROM course_change.bookings
  WHERE reminder_minutes IS NULL ORDER BY id LIMIT 2 FOR UPDATE
)
UPDATE course_change.bookings b SET reminder_minutes = 30
FROM batch WHERE b.id = batch.id AND b.reminder_minutes IS NULL
RETURNING b.id, b.reminder_minutes;
COMMIT;

BEGIN;
SET LOCAL lock_timeout = '1s';
WITH batch AS (
  SELECT id FROM course_change.bookings
  WHERE reminder_minutes IS NULL ORDER BY id LIMIT 2 FOR UPDATE
)
UPDATE course_change.bookings b SET reminder_minutes = 30
FROM batch WHERE b.id = batch.id AND b.reminder_minutes IS NULL
RETURNING b.id, b.reminder_minutes;
COMMIT;

BEGIN;
SET LOCAL lock_timeout = '1s';
ALTER TABLE course_change.bookings ADD CONSTRAINT reminder_present CHECK (reminder_minutes IS NOT NULL) NOT VALID;
ALTER TABLE course_change.bookings VALIDATE CONSTRAINT reminder_range;
ALTER TABLE course_change.bookings VALIDATE CONSTRAINT reminder_present;
ALTER TABLE course_change.bookings ALTER COLUMN reminder_minutes SET NOT NULL;
ALTER TABLE course_change.bookings DROP CONSTRAINT reminder_present;
INSERT INTO course_change.migration_history VALUES ('003_require');
COMMIT;

BEGIN;
ALTER TABLE course_change.jobs ADD COLUMN attempt_limit integer;
ALTER TABLE course_change.jobs ALTER COLUMN attempt_limit SET DEFAULT 5;
UPDATE course_change.jobs SET attempt_limit = 3 WHERE attempt_limit IS NULL;
ALTER TABLE course_change.jobs ADD CONSTRAINT attempt_range CHECK (attempt_limit BETWEEN 1 AND 10);
ALTER TABLE course_change.jobs ALTER COLUMN attempt_limit SET NOT NULL;
COMMIT;
SELECT id, room, starts_at, reminder_minutes FROM course_change.bookings ORDER BY id;
SELECT * FROM course_change.jobs ORDER BY id;
SELECT * FROM course_change.migration_history ORDER BY version;
