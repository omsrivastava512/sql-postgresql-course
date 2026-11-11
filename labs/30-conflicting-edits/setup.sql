DROP SCHEMA IF EXISTS course_edit CASCADE;
CREATE SCHEMA course_edit;

CREATE TABLE course_edit.offers (
    offer_id integer PRIMARY KEY,
    store_name text NOT NULL,
    price_paise integer NOT NULL CHECK (price_paise >= 0),
    version integer NOT NULL DEFAULT 1 CHECK (version > 0)
);

INSERT INTO course_edit.offers (offer_id, store_name, price_paise)
VALUES (1, 'North', 2000), (2, 'South', 2300);
