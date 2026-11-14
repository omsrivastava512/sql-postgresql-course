BEGIN;
DO $$
BEGIN
    IF to_regclass('auth.users') IS NULL OR to_regprocedure('auth.uid()') IS NULL THEN
        RAISE EXCEPTION 'Run this fixture in the dedicated Supabase course project';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'course_auth35_owner') THEN
        CREATE ROLE course_auth35_owner NOLOGIN NOSUPERUSER NOBYPASSRLS;
    END IF;
    IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'course_auth35_owner' AND (rolcanlogin OR rolsuper OR rolbypassrls))
       OR EXISTS (SELECT 1 FROM pg_auth_members WHERE member = 'course_auth35_owner'::regrole) THEN
        RAISE EXCEPTION 'Unexpected privileges on course_auth35_owner';
    END IF;
END;
$$;
GRANT course_auth35_owner TO CURRENT_USER;
DROP SCHEMA IF EXISTS course_auth35_api CASCADE;
DROP SCHEMA IF EXISTS course_auth35_private CASCADE;
CREATE SCHEMA course_auth35_api;
CREATE SCHEMA course_auth35_private;
REVOKE ALL ON SCHEMA course_auth35_api, course_auth35_private FROM PUBLIC, anon, authenticated;
CREATE TABLE course_auth35_private.memberships (
    store text CHECK (store IN ('North', 'South')),
    actor uuid REFERENCES auth.users(id),
    active boolean NOT NULL,
    can_place boolean NOT NULL,
    can_read_receipt boolean NOT NULL,
    PRIMARY KEY (store, actor)
);
CREATE TABLE course_auth35_private.offers (
    store text,
    sku text,
    description text NOT NULL,
    unit_price_paise integer NOT NULL CHECK (unit_price_paise >= 0),
    PRIMARY KEY (store, sku)
);
INSERT INTO course_auth35_private.offers VALUES
    ('North', '17', 'Breakfast Tea 50 g', 2000),
    ('South', '17', 'Oat Biscuits 50 g', 1500);
CREATE TABLE course_auth35_private.orders (
    order_id integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    store text NOT NULL,
    actor uuid NOT NULL REFERENCES auth.users(id)
);
CREATE TABLE course_auth35_private.order_lines (
    order_id integer PRIMARY KEY REFERENCES course_auth35_private.orders,
    accepted_sku text NOT NULL,
    accepted_description text NOT NULL,
    quantity integer NOT NULL CHECK (quantity > 0),
    unit_price_paise integer NOT NULL CHECK (unit_price_paise >= 0)
);
CREATE TABLE course_auth35_private.requests (
    store text,
    actor uuid REFERENCES auth.users(id),
    request_key text CHECK (request_key <> ''),
    sku text NOT NULL,
    quantity integer NOT NULL CHECK (quantity > 0),
    receipt jsonb,
    PRIMARY KEY (store, actor, request_key)
);
REVOKE ALL ON ALL TABLES IN SCHEMA course_auth35_private FROM PUBLIC, anon, authenticated;
REVOKE ALL ON ALL SEQUENCES IN SCHEMA course_auth35_private FROM PUBLIC, anon, authenticated;
GRANT USAGE ON SCHEMA course_auth35_api TO authenticated;
GRANT USAGE, CREATE ON SCHEMA course_auth35_api TO course_auth35_owner;
GRANT USAGE ON SCHEMA course_auth35_private, auth TO course_auth35_owner;
GRANT EXECUTE ON FUNCTION auth.uid() TO course_auth35_owner;
GRANT SELECT ON ALL TABLES IN SCHEMA course_auth35_private TO course_auth35_owner;
GRANT UPDATE (active) ON course_auth35_private.memberships TO course_auth35_owner;
GRANT INSERT ON course_auth35_private.orders, course_auth35_private.order_lines, course_auth35_private.requests TO course_auth35_owner;
GRANT UPDATE (receipt) ON course_auth35_private.requests TO course_auth35_owner;
GRANT USAGE ON SEQUENCE course_auth35_private.orders_order_id_seq TO course_auth35_owner;
COMMIT;
