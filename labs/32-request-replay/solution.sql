CREATE FUNCTION course_replay.accept_order(p_store text, p_key text, p_sku text, p_quantity integer)
RETURNS jsonb LANGUAGE plpgsql AS $$
DECLARE
    saved course_replay.requests%ROWTYPE;
    offer course_replay.offers%ROWTYPE;
    new_id integer;
    result jsonb;
BEGIN
    INSERT INTO course_replay.requests (store, request_key, sku, quantity)
    VALUES (p_store, p_key, p_sku, p_quantity)
    ON CONFLICT (store, request_key) DO NOTHING;

    SELECT * INTO STRICT saved FROM course_replay.requests
    WHERE store = p_store AND request_key = p_key FOR UPDATE;
    IF (saved.sku, saved.quantity) IS DISTINCT FROM (p_sku, p_quantity) THEN
        RAISE EXCEPTION 'Request key already used for a different order' USING ERRCODE = '22023';
    END IF;
    IF saved.receipt IS NOT NULL THEN
        RETURN saved.receipt;
    END IF;

    SELECT * INTO STRICT offer FROM course_replay.offers WHERE store = p_store AND sku = p_sku;
    INSERT INTO course_replay.orders (store) VALUES (p_store) RETURNING order_id INTO new_id;
    INSERT INTO course_replay.order_lines VALUES (new_id, p_sku, offer.description, p_quantity, offer.unit_price_paise);
    result := jsonb_build_object(
        'order_id', new_id, 'accepted_sku', p_sku, 'accepted_description', offer.description,
        'quantity', p_quantity, 'unit_price_paise', offer.unit_price_paise,
        'total_paise', (p_quantity::bigint * offer.unit_price_paise)::text
    );
    UPDATE course_replay.requests SET receipt = result WHERE store = p_store AND request_key = p_key;
    RETURN result;
END;
$$;
