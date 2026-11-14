BEGIN;
DO $$
BEGIN
    IF to_regclass('auth.users') IS NULL OR to_regprocedure('auth.uid()') IS NULL THEN
        RAISE EXCEPTION 'Run this fixture in the dedicated Supabase course project';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'course_auth33_owner') THEN
        CREATE ROLE course_auth33_owner NOLOGIN NOSUPERUSER NOBYPASSRLS;
    END IF;
    IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'course_auth33_owner' AND (rolcanlogin OR rolsuper OR rolbypassrls))
       OR EXISTS (SELECT 1 FROM pg_auth_members WHERE member = 'course_auth33_owner'::regrole) THEN
        RAISE EXCEPTION 'Unexpected privileges on course_auth33_owner';
    END IF;
END;
$$;
GRANT course_auth33_owner TO CURRENT_USER;
DROP SCHEMA IF EXISTS course_auth33_api CASCADE;
DROP SCHEMA IF EXISTS course_auth33_private CASCADE;
CREATE SCHEMA course_auth33_api;
CREATE SCHEMA course_auth33_private;
REVOKE ALL ON SCHEMA course_auth33_api, course_auth33_private FROM PUBLIC, anon, authenticated;

CREATE TABLE course_auth33_api.profiles (
    user_id uuid PRIMARY KEY REFERENCES auth.users(id),
    display_name text NOT NULL
);
CREATE TABLE course_auth33_api.stores (
    store text PRIMARY KEY,
    description text NOT NULL
);
CREATE TABLE course_auth33_private.memberships (
    store text REFERENCES course_auth33_api.stores,
    actor uuid REFERENCES auth.users(id),
    active boolean NOT NULL,
    PRIMARY KEY (store, actor)
);
INSERT INTO course_auth33_api.stores VALUES ('North', 'North counter'), ('South', 'South counter');
REVOKE ALL ON ALL TABLES IN SCHEMA course_auth33_api, course_auth33_private FROM PUBLIC, anon, authenticated;

GRANT USAGE ON SCHEMA course_auth33_api TO anon, authenticated;
GRANT USAGE, CREATE ON SCHEMA course_auth33_api TO course_auth33_owner;
GRANT USAGE ON SCHEMA course_auth33_private, auth TO course_auth33_owner;
GRANT SELECT ON course_auth33_private.memberships TO course_auth33_owner;
GRANT EXECUTE ON FUNCTION auth.uid() TO course_auth33_owner;
GRANT SELECT ON course_auth33_api.profiles, course_auth33_api.stores TO anon, authenticated;
ALTER TABLE course_auth33_api.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_auth33_api.stores ENABLE ROW LEVEL SECURITY;
COMMIT;
