INSERT INTO course_identity.memberships VALUES (20, 2, 'bo');
INSERT INTO course_identity.profiles VALUES (1, 'Grows herbs');
INSERT INTO course_identity.uuid_records (label) VALUES ('First'), ('Second');
CREATE TABLE course_identity.enrolments (
  customer_id integer REFERENCES course_identity.customers(id),
  program_id integer REFERENCES course_identity.programs(id),
  card_code text NOT NULL,
  PRIMARY KEY (customer_id, program_id),
  UNIQUE (program_id, card_code)
);
INSERT INTO course_identity.enrolments VALUES (1, 10, 'A'), (1, 20, 'A'), (2, 10, 'B');
SELECT workspace_id, member_id, handle FROM course_identity.memberships ORDER BY workspace_id, member_id;
SELECT customer_id, program_id, card_code FROM course_identity.enrolments ORDER BY customer_id, program_id;
