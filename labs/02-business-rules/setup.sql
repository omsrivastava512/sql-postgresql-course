DROP SCHEMA IF EXISTS course_rules CASCADE;
CREATE SCHEMA course_rules;
CREATE TABLE course_rules.profiles (
  id integer PRIMARY KEY,
  name text NOT NULL,
  role text NOT NULL CHECK (role IN ('admin', 'receptionist'))
);
CREATE TABLE course_rules.patients (
  id integer PRIMARY KEY,
  name text NOT NULL,
  owner_id integer NOT NULL REFERENCES course_rules.profiles(id)
);
CREATE FUNCTION course_rules.validate_owner()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM course_rules.profiles
    WHERE id = NEW.owner_id AND role = 'admin'
  ) THEN
    RAISE EXCEPTION 'owner must be an admin';
  END IF;
  RETURN NEW;
END;
$$;
CREATE TRIGGER patient_owner_guard
BEFORE INSERT OR UPDATE ON course_rules.patients
FOR EACH ROW EXECUTE FUNCTION course_rules.validate_owner();
INSERT INTO course_rules.profiles VALUES (1, 'Meera', 'admin'), (2, 'Dev', 'receptionist');

