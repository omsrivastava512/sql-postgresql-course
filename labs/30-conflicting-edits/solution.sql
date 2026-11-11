CREATE FUNCTION course_edit.save_price(p_offer integer, p_version integer, p_price integer)
RETURNS TABLE (price_paise integer, version integer)
LANGUAGE sql AS $$
    UPDATE course_edit.offers AS o
    SET price_paise = p_price, version = o.version + 1
    WHERE o.offer_id = p_offer AND o.version = p_version
    RETURNING o.price_paise, o.version;
$$;

SELECT * FROM course_edit.save_price(1, 1, 2200);
SELECT * FROM course_edit.save_price(1, 1, 2500);
SELECT * FROM course_edit.offers ORDER BY offer_id;
