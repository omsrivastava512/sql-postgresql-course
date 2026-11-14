BEGIN;
DO $$
BEGIN
    IF to_regclass('auth.users') IS NULL OR to_regprocedure('auth.uid()') IS NULL THEN
        RAISE EXCEPTION 'Run this fixture in the dedicated Supabase course project';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'course_auth34_owner') THEN
        CREATE ROLE course_auth34_owner NOLOGIN NOSUPERUSER NOBYPASSRLS;
    END IF;
    IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'course_auth34_owner' AND (rolcanlogin OR rolsuper OR rolbypassrls))
       OR EXISTS (SELECT 1 FROM pg_auth_members WHERE member = 'course_auth34_owner'::regrole) THEN
        RAISE EXCEPTION 'Unexpected privileges on course_auth34_owner';
    END IF;
END;
$$;
GRANT course_auth34_owner TO CURRENT_USER;
DROP SCHEMA IF EXISTS course_auth34_api CASCADE;
DROP SCHEMA IF EXISTS course_auth34_private CASCADE;
CREATE SCHEMA course_auth34_api;
CREATE SCHEMA course_auth34_private;
REVOKE ALL ON SCHEMA course_auth34_api, course_auth34_private FROM PUBLIC, anon, authenticated;
CREATE TABLE course_auth34_private.memberships (
    store text CHECK (store IN ('North', 'South')),
    actor uuid REFERENCES auth.users(id),
    active boolean NOT NULL,
    can_place boolean NOT NULL,
    PRIMARY KEY (store, actor)
);
CREATE TABLE course_auth34_api.draft_orders (
    draft_id integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    store text NOT NULL CHECK (store IN ('North', 'South')),
    actor uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id),
    sku text NOT NULL,
    quantity integer NOT NULL CHECK (quantity > 0)
);
REVOKE ALL ON ALL TABLES IN SCHEMA course_auth34_api, course_auth34_private FROM PUBLIC, anon, authenticated;
REVOKE ALL ON ALL SEQUENCES IN SCHEMA course_auth34_api FROM PUBLIC, anon, authenticated;
GRANT USAGE ON SCHEMA course_auth34_api TO anon, authenticated;
GRANT USAGE, CREATE ON SCHEMA course_auth34_api TO course_auth34_owner;
GRANT USAGE ON SCHEMA course_auth34_private, auth TO course_auth34_owner;
GRANT SELECT ON course_auth34_private.memberships TO course_auth34_owner;
GRANT EXECUTE ON FUNCTION auth.uid() TO course_auth34_owner;
GRANT SELECT ON course_auth34_api.draft_orders TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON course_auth34_api.draft_orders TO authenticated;
GRANT USAGE ON SEQUENCE course_auth34_api.draft_orders_draft_id_seq TO authenticated;
ALTER TABLE course_auth34_api.draft_orders ENABLE ROW LEVEL SECURITY;
COMMIT;
