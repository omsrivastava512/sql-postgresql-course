WITH claimed AS (
  UPDATE course_race.stock SET available = available - 1
  WHERE item_id = 1 AND available >= 1
  RETURNING item_id
)
INSERT INTO course_race.reservations (id, item_id, quantity)
SELECT 101, item_id, 1 FROM claimed RETURNING id;

WITH claimed AS (
  UPDATE course_race.sessions SET remaining_seats = remaining_seats - 2
  WHERE id = 1 AND remaining_seats >= 2
  RETURNING id
)
INSERT INTO course_race.registrations (id, session_id, seats)
SELECT 201, id, 2 FROM claimed RETURNING id;

SELECT * FROM course_race.stock ORDER BY item_id;
SELECT * FROM course_race.reservations ORDER BY id;
SELECT * FROM course_race.sessions ORDER BY id;
SELECT * FROM course_race.registrations ORDER BY id;
