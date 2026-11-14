BEGIN;
CREATE FUNCTION course_auth34_api.may_use_store(p_store text, p_write boolean)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = pg_catalog, pg_temp AS $$
    SELECT EXISTS (
        SELECT 1 FROM course_auth34_private.memberships
        WHERE store = p_store AND actor = auth.uid() AND active AND (NOT p_write OR can_place)
    );
$$;
ALTER FUNCTION course_auth34_api.may_use_store(text, boolean) OWNER TO course_auth34_owner;
REVOKE ALL ON FUNCTION course_auth34_api.may_use_store(text, boolean) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION course_auth34_api.may_use_store(text, boolean) TO authenticated;
REVOKE CREATE ON SCHEMA course_auth34_api FROM course_auth34_owner;
CREATE POLICY own_read ON course_auth34_api.draft_orders FOR SELECT TO authenticated
USING (actor = auth.uid() AND course_auth34_api.may_use_store(store, false));
CREATE POLICY own_insert ON course_auth34_api.draft_orders FOR INSERT TO authenticated
WITH CHECK (actor = auth.uid() AND course_auth34_api.may_use_store(store, true));
CREATE POLICY own_update ON course_auth34_api.draft_orders FOR UPDATE TO authenticated
USING (actor = auth.uid() AND course_auth34_api.may_use_store(store, true))
WITH CHECK (actor = auth.uid() AND course_auth34_api.may_use_store(store, true));
CREATE POLICY own_delete ON course_auth34_api.draft_orders FOR DELETE TO authenticated
USING (actor = auth.uid() AND course_auth34_api.may_use_store(store, true));
NOTIFY pgrst, 'reload schema';
COMMIT;
