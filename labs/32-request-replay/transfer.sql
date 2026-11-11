CREATE TABLE course_replay.fees (
    centre text,
    code text,
    fee_paise integer NOT NULL,
    PRIMARY KEY (centre, code)
);
CREATE TABLE course_replay.bookings (
    centre text,
    request_key text,
    code text NOT NULL,
    accepted_fee_paise integer NOT NULL,
    PRIMARY KEY (centre, request_key)
);
INSERT INTO course_replay.fees VALUES ('East', '7', 80000), ('West', '7', 70000);

CREATE FUNCTION course_replay.book(p_centre text, p_key text, p_code text)
RETURNS integer LANGUAGE plpgsql AS $$
DECLARE
    saved course_replay.bookings%ROWTYPE;
BEGIN
    SELECT * INTO saved FROM course_replay.bookings WHERE centre = p_centre AND request_key = p_key;
    IF NOT FOUND THEN
        INSERT INTO course_replay.bookings
        SELECT centre, p_key, code, fee_paise FROM course_replay.fees
        WHERE centre = p_centre AND code = p_code
        ON CONFLICT (centre, request_key) DO NOTHING;
        SELECT * INTO STRICT saved FROM course_replay.bookings WHERE centre = p_centre AND request_key = p_key;
    END IF;
    IF saved.code IS DISTINCT FROM p_code THEN
        RAISE EXCEPTION 'Conflicting workshop code' USING ERRCODE = '22023';
    END IF;
    RETURN saved.accepted_fee_paise;
END;
$$;

SELECT course_replay.book('East', 'booking-1', '7');
UPDATE course_replay.fees SET fee_paise = 85000 WHERE centre = 'East' AND code = '7';
SELECT course_replay.book('East', 'booking-1', '7');
SELECT course_replay.book('East', 'booking-2', '7');
SELECT * FROM course_replay.bookings ORDER BY centre, request_key;
