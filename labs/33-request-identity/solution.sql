BEGIN;
CREATE FUNCTION course_auth33_api.request_identity()
RETURNS jsonb LANGUAGE sql STABLE SECURITY INVOKER
SET search_path = pg_catalog, pg_temp AS $$
    SELECT jsonb_build_object('database_role', current_user, 'session_role', session_user, 'actor', auth.uid());
$$;
CREATE FUNCTION course_auth33_api.has_store_access(p_store text)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = pg_catalog, pg_temp AS $$
    SELECT EXISTS (
        SELECT 1 FROM course_auth33_private.memberships
        WHERE store = p_store AND actor = auth.uid() AND active
    );
$$;
ALTER FUNCTION course_auth33_api.has_store_access(text) OWNER TO course_auth33_owner;
REVOKE ALL ON FUNCTION course_auth33_api.request_identity(), course_auth33_api.has_store_access(text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION course_auth33_api.request_identity(), course_auth33_api.has_store_access(text) TO anon, authenticated;
REVOKE CREATE ON SCHEMA course_auth33_api FROM course_auth33_owner;
CREATE POLICY own_profile ON course_auth33_api.profiles FOR SELECT TO authenticated
USING (user_id = auth.uid());
CREATE POLICY member_store ON course_auth33_api.stores FOR SELECT TO authenticated
USING (course_auth33_api.has_store_access(store));
NOTIFY pgrst, 'reload schema';
COMMIT;
