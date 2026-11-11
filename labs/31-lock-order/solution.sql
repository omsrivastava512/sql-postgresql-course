CREATE FUNCTION course_bins.move_stock(p_from integer, p_to integer, p_units integer)
RETURNS void LANGUAGE plpgsql AS $$
BEGIN
    IF p_from IS NULL OR p_to IS NULL OR p_from = p_to OR p_units IS NULL OR p_units <= 0 THEN
        RAISE EXCEPTION 'Choose different bins and a positive quantity' USING ERRCODE = '22023';
    END IF;

    PERFORM 1 FROM course_bins.bins WHERE bin_id = LEAST(p_from, p_to) FOR UPDATE;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Missing bin %', LEAST(p_from, p_to) USING ERRCODE = 'P0002';
    END IF;
    PERFORM 1 FROM course_bins.bins WHERE bin_id = GREATEST(p_from, p_to) FOR UPDATE;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Missing bin %', GREATEST(p_from, p_to) USING ERRCODE = 'P0002';
    END IF;

    UPDATE course_bins.bins SET units = units - p_units
    WHERE bin_id = p_from AND units >= p_units;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Insufficient stock in bin %', p_from USING ERRCODE = '23514';
    END IF;
    UPDATE course_bins.bins SET units = units + p_units WHERE bin_id = p_to;
END;
$$;

SELECT course_bins.move_stock(1, 2, 1);
SELECT course_bins.move_stock(2, 1, 1);
SELECT * FROM course_bins.bins ORDER BY bin_id;
