RESET ROLE;
DROP SCHEMA IF EXISTS course_policy CASCADE;
DO $$ BEGIN
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'course_policy_alice') THEN CREATE ROLE course_policy_alice NOLOGIN; END IF;
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'course_policy_bob') THEN CREATE ROLE course_policy_bob NOLOGIN; END IF;
END $$;
CREATE SCHEMA course_policy;
CREATE TABLE course_policy.documents (id integer PRIMARY KEY, owner_role name NOT NULL, title text NOT NULL, archived boolean NOT NULL DEFAULT false);
INSERT INTO course_policy.documents VALUES (1, 'course_policy_alice', 'Alice draft', false), (2, 'course_policy_bob', 'Bob draft', false), (3, 'course_policy_alice', 'Alice archive', true);
CREATE TABLE course_policy.messages (id integer PRIMARY KEY, recipient_role name NOT NULL, body text NOT NULL);
INSERT INTO course_policy.messages VALUES (10, 'course_policy_alice', 'Alice message'), (20, 'course_policy_bob', 'Bob message');
GRANT USAGE ON SCHEMA course_policy TO course_policy_alice, course_policy_bob;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA course_policy TO course_policy_alice, course_policy_bob;
