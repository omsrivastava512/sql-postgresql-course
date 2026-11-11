CREATE TABLE course_bins.resources (
    resource_id integer PRIMARY KEY,
    label text NOT NULL,
    booking text
);

INSERT INTO course_bins.resources VALUES (10, 'Room', NULL), (20, 'Projector', NULL), (5, 'Spare room', NULL);

CREATE FUNCTION course_bins.reserve_pair(p_first integer, p_second integer, p_booking text)
RETURNS void LANGUAGE plpgsql AS $$
DECLARE
    resource integer;
BEGIN
    IF p_first IS NULL OR p_second IS NULL OR p_first = p_second OR NULLIF(p_booking, '') IS NULL THEN
        RAISE EXCEPTION 'Choose two distinct resources and a booking' USING ERRCODE = '22023';
    END IF;
    FOREACH resource IN ARRAY ARRAY[LEAST(p_first, p_second), GREATEST(p_first, p_second)] LOOP
        UPDATE course_bins.resources SET booking = p_booking
        WHERE resource_id = resource AND booking IS NULL;
        IF NOT FOUND THEN
            RAISE EXCEPTION 'Resource % unavailable', resource USING ERRCODE = '23514';
        END IF;
    END LOOP;
END;
$$;

SELECT course_bins.reserve_pair(20, 10, 'Workshop A');
SELECT * FROM course_bins.resources ORDER BY resource_id;
