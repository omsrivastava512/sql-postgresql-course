DROP SCHEMA IF EXISTS course_identity CASCADE;
CREATE SCHEMA course_identity;
CREATE TABLE course_identity.workspaces (id integer PRIMARY KEY, name text NOT NULL);
CREATE TABLE course_identity.members (
  id integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name text NOT NULL,
  external_ref text UNIQUE
);
CREATE TABLE course_identity.memberships (
  workspace_id integer REFERENCES course_identity.workspaces(id),
  member_id integer REFERENCES course_identity.members(id),
  handle text NOT NULL,
  PRIMARY KEY (workspace_id, member_id),
  UNIQUE (workspace_id, handle)
);
CREATE TABLE course_identity.profiles (
  member_id integer PRIMARY KEY REFERENCES course_identity.members(id),
  bio text NOT NULL
);
CREATE TABLE course_identity.identity_only (id integer GENERATED ALWAYS AS IDENTITY);
CREATE TABLE course_identity.strict_refs (external_ref text UNIQUE NULLS NOT DISTINCT);
CREATE TABLE course_identity.uuid_records (id uuid DEFAULT gen_random_uuid() PRIMARY KEY, label text NOT NULL);
CREATE TABLE course_identity.customers (id integer PRIMARY KEY, name text NOT NULL);
CREATE TABLE course_identity.programs (id integer PRIMARY KEY, name text NOT NULL);
INSERT INTO course_identity.workspaces VALUES (10, 'Studio'), (20, 'Garden');
INSERT INTO course_identity.members (name) VALUES ('Asha'), ('Bo');
INSERT INTO course_identity.memberships VALUES (10, 1, 'sam'), (20, 1, 'sam'), (10, 2, 'bo');
INSERT INTO course_identity.customers VALUES (1, 'Riya'), (2, 'Sam');
INSERT INTO course_identity.programs VALUES (10, 'Local'), (20, 'Online');
