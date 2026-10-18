DROP SCHEMA IF EXISTS course_derive CASCADE;
CREATE SCHEMA course_derive;
CREATE TABLE course_derive.profiles (
  id integer PRIMARY KEY,
  name text NOT NULL
);
CREATE TABLE course_derive.patients (
  id integer PRIMARY KEY,
  name text NOT NULL,
  owner_id integer NOT NULL REFERENCES course_derive.profiles(id)
);
CREATE TABLE course_derive.notes (
  id integer PRIMARY KEY,
  patient_id integer NOT NULL REFERENCES course_derive.patients(id),
  owner_id integer NOT NULL REFERENCES course_derive.profiles(id),
  body text NOT NULL
);
CREATE FUNCTION course_derive.note_owner()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  NEW.owner_id := (
    SELECT owner_id FROM course_derive.patients
    WHERE id = NEW.patient_id
  );
  RETURN NEW;
END;
$$;
CREATE TRIGGER note_owner_guard
BEFORE INSERT OR UPDATE ON course_derive.notes
FOR EACH ROW EXECUTE FUNCTION course_derive.note_owner();
INSERT INTO course_derive.profiles VALUES (1, 'Meera'), (2, 'Dev');
INSERT INTO course_derive.patients VALUES (10, 'Riya', 1);

