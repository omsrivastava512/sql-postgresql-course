GRANT USAGE ON SCHEMA course_priv TO course_priv_reader, course_priv_writer, course_priv_dispatch;
GRANT SELECT ON course_priv.profiles TO course_priv_reader, course_priv_writer;
GRANT SELECT (id, subject) ON course_priv.tickets TO course_priv_reader;
GRANT SELECT, INSERT ON course_priv.tickets TO course_priv_writer;
GRANT UPDATE (subject) ON course_priv.tickets TO course_priv_writer;
GRANT USAGE ON SEQUENCE course_priv.tickets_id_seq TO course_priv_writer;
GRANT SELECT (id, tracking, status), UPDATE (status) ON course_priv.deliveries TO course_priv_dispatch;
