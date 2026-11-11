DROP SCHEMA IF EXISTS course_bins CASCADE;
CREATE SCHEMA course_bins;

CREATE TABLE course_bins.bins (
    bin_id integer PRIMARY KEY,
    units integer NOT NULL CHECK (units >= 0)
);

INSERT INTO course_bins.bins VALUES (1, 5), (2, 5);
