CREATE TABLE course_edit.workshops (
    centre text,
    code text,
    fee_paise integer NOT NULL CHECK (fee_paise >= 0),
    version integer NOT NULL DEFAULT 1,
    PRIMARY KEY (centre, code)
);

INSERT INTO course_edit.workshops (centre, code, fee_paise)
VALUES ('East', '7', 80000), ('West', '7', 70000);

CREATE FUNCTION course_edit.save_fee(p_centre text, p_code text, p_version integer, p_fee integer)
RETURNS TABLE (fee_paise integer, version integer)
LANGUAGE sql AS $$
    UPDATE course_edit.workshops AS w
    SET fee_paise = p_fee, version = w.version + 1
    WHERE (w.centre, w.code, w.version) = (p_centre, p_code, p_version)
    RETURNING w.fee_paise, w.version;
$$;

SELECT * FROM course_edit.save_fee('East', '7', 1, 85000);
SELECT * FROM course_edit.save_fee('East', '7', 1, 82000);
SELECT * FROM course_edit.workshops ORDER BY centre, code;
