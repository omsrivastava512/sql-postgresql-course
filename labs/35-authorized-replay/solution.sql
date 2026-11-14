BEGIN;
CREATE FUNCTION course_auth35_api.place_order(p_store text, p_key text, p_sku text, p_quantity integer)
RETURNS jsonb LANGUAGE plpgsql VOLATILE SECURITY DEFINER
SET search_path = pg_catalog, pg_temp AS $$
DECLARE
    caller uuid := auth.uid();
    membership course_auth35_private.memberships%ROWTYPE;
    saved course_auth35_private.requests%ROWTYPE;
    offer course_auth35_private.offers%ROWTYPE;
    new_id integer;
    result jsonb;
BEGIN
    SELECT * INTO membership FROM course_auth35_private.memberships
    WHERE store = p_store AND actor = caller FOR SHARE;
    IF NOT FOUND OR NOT membership.active OR NOT membership.can_place THEN
        RAISE EXCEPTION 'Order permission required' USING ERRCODE = '42501';
    END IF;
    IF p_key IS NULL OR p_key = '' OR p_sku IS NULL OR p_quantity IS NULL OR p_quantity <= 0 THEN
        RAISE EXCEPTION 'Supply a key, SKU and positive quantity' USING ERRCODE = '22023';
    END IF;
    INSERT INTO course_auth35_private.requests (store, actor, request_key, sku, quantity)
    VALUES (p_store, caller, p_key, p_sku, p_quantity)
    ON CONFLICT (store, actor, request_key) DO NOTHING;
    SELECT * INTO STRICT saved FROM course_auth35_private.requests
    WHERE store = p_store AND actor = caller AND request_key = p_key FOR UPDATE;
    IF (saved.sku, saved.quantity) IS DISTINCT FROM (p_sku, p_quantity) THEN
        RAISE EXCEPTION 'Request key already used for a different order' USING ERRCODE = '22023';
    END IF;
    IF saved.receipt IS NOT NULL THEN
        RETURN saved.receipt;
    END IF;
    SELECT * INTO STRICT offer FROM course_auth35_private.offers WHERE store = p_store AND sku = p_sku;
    INSERT INTO course_auth35_private.orders (store, actor) VALUES (p_store, caller) RETURNING order_id INTO new_id;
    INSERT INTO course_auth35_private.order_lines VALUES (new_id, p_sku, offer.description, p_quantity, offer.unit_price_paise);
    result := jsonb_build_object(
        'order_id', new_id, 'accepted_sku', p_sku, 'accepted_description', offer.description,
        'quantity', p_quantity, 'unit_price_paise', offer.unit_price_paise,
        'total_paise', (p_quantity::bigint * offer.unit_price_paise)::text
    );
    UPDATE course_auth35_private.requests SET receipt = result
    WHERE store = p_store AND actor = caller AND request_key = p_key;
    RETURN result;
END;
$$;
CREATE FUNCTION course_auth35_api.read_own_receipt(p_store text, p_key text)
RETURNS jsonb LANGUAGE plpgsql VOLATILE SECURITY DEFINER
SET search_path = pg_catalog, pg_temp AS $$
DECLARE
    caller uuid := auth.uid();
    membership course_auth35_private.memberships%ROWTYPE;
    result jsonb;
BEGIN
    SELECT * INTO membership FROM course_auth35_private.memberships
    WHERE store = p_store AND actor = caller FOR SHARE;
    IF NOT FOUND OR NOT membership.active OR NOT membership.can_read_receipt THEN
        RAISE EXCEPTION 'Receipt permission required' USING ERRCODE = '42501';
    END IF;
    SELECT receipt INTO result FROM course_auth35_private.requests
    WHERE store = p_store AND actor = caller AND request_key = p_key;
    RETURN result;
END;
$$;
ALTER FUNCTION course_auth35_api.place_order(text, text, text, integer) OWNER TO course_auth35_owner;
ALTER FUNCTION course_auth35_api.read_own_receipt(text, text) OWNER TO course_auth35_owner;
REVOKE ALL ON FUNCTION course_auth35_api.place_order(text, text, text, integer), course_auth35_api.read_own_receipt(text, text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION course_auth35_api.place_order(text, text, text, integer), course_auth35_api.read_own_receipt(text, text) TO authenticated;
REVOKE CREATE ON SCHEMA course_auth35_api FROM course_auth35_owner;
NOTIFY pgrst, 'reload schema';
COMMIT;
