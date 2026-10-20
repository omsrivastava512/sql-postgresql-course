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
