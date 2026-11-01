CREATE TABLE course_receipt.centres (centre text PRIMARY KEY);
CREATE TABLE course_receipt.workshops (
    workshop_code text PRIMARY KEY,
    title text NOT NULL
);
CREATE TABLE course_receipt.listings (
    centre text REFERENCES course_receipt.centres,
    local_code text,
    workshop_code text NOT NULL REFERENCES course_receipt.workshops,
    fee_paise integer NOT NULL CHECK (fee_paise >= 0),
    PRIMARY KEY (centre, local_code),
    UNIQUE (centre, workshop_code)
);
CREATE TABLE course_receipt.bookings (
    booking_id integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    centre text NOT NULL REFERENCES course_receipt.centres,
    local_code text NOT NULL,
    accepted_title text NOT NULL,
    accepted_fee_paise integer NOT NULL CHECK (accepted_fee_paise >= 0)
);

INSERT INTO course_receipt.centres VALUES ('East'), ('West');
INSERT INTO course_receipt.workshops VALUES ('SQL', 'SQL basics'), ('MAP', 'Map reading');
INSERT INTO course_receipt.listings VALUES
    ('East', '7', 'SQL', 80000), ('West', '7', 'MAP', 70000), ('West', '9', 'SQL', 90000);

INSERT INTO course_receipt.bookings (centre, local_code, accepted_title, accepted_fee_paise)
SELECT l.centre, l.local_code, w.title, l.fee_paise
FROM course_receipt.listings AS l
JOIN course_receipt.workshops AS w USING (workshop_code)
WHERE l.centre = 'East' AND l.local_code = '7';

SELECT centre, local_code, workshop_code, fee_paise FROM course_receipt.listings ORDER BY centre, local_code;
SELECT centre, local_code, accepted_title, accepted_fee_paise FROM course_receipt.bookings ORDER BY booking_id;
UPDATE course_receipt.listings SET fee_paise = 85000 WHERE centre = 'East' AND local_code = '7';
SELECT centre, local_code, workshop_code, fee_paise FROM course_receipt.listings ORDER BY centre, local_code;
SELECT centre, local_code, accepted_title, accepted_fee_paise FROM course_receipt.bookings ORDER BY booking_id;
