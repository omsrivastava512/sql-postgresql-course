DROP SCHEMA IF EXISTS course_tx CASCADE;
CREATE SCHEMA course_tx;
CREATE TABLE course_tx.clinics (
  id integer PRIMARY KEY,
  invoice_counter integer NOT NULL
);
CREATE TABLE course_tx.visits (
  id integer PRIMARY KEY,
  patient_name text NOT NULL
);
CREATE TABLE course_tx.invoices (
  id integer PRIMARY KEY,
  clinic_id integer NOT NULL REFERENCES course_tx.clinics(id),
  visit_id integer NOT NULL REFERENCES course_tx.visits(id),
  invoice_number integer NOT NULL,
  amount integer NOT NULL CHECK (amount >= 0),
  UNIQUE (clinic_id, invoice_number)
);
CREATE FUNCTION course_tx.number_invoice()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  UPDATE course_tx.clinics
  SET invoice_counter = invoice_counter + 1
  WHERE id = NEW.clinic_id
  RETURNING invoice_counter INTO NEW.invoice_number;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'clinic does not exist';
  END IF;
  RETURN NEW;
END;
$$;
CREATE TRIGGER invoice_number
BEFORE INSERT ON course_tx.invoices
FOR EACH ROW EXECUTE FUNCTION course_tx.number_invoice();
INSERT INTO course_tx.clinics VALUES (1, 42);
INSERT INTO course_tx.visits VALUES (10, 'Riya');

