DROP SCHEMA IF EXISTS course_replay CASCADE;
CREATE SCHEMA course_replay;

CREATE TABLE course_replay.offers (
    store text,
    sku text,
    description text NOT NULL,
    unit_price_paise integer NOT NULL CHECK (unit_price_paise >= 0),
    PRIMARY KEY (store, sku)
);

INSERT INTO course_replay.offers VALUES
    ('North', '17', 'Breakfast Tea 50 g', 2000),
    ('South', '17', 'Oat Biscuits 50 g', 1500);

CREATE TABLE course_replay.orders (
    order_id integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    store text NOT NULL
);

CREATE TABLE course_replay.order_lines (
    order_id integer PRIMARY KEY REFERENCES course_replay.orders,
    accepted_sku text NOT NULL,
    accepted_description text NOT NULL,
    quantity integer NOT NULL CHECK (quantity > 0),
    unit_price_paise integer NOT NULL CHECK (unit_price_paise >= 0)
);

CREATE TABLE course_replay.requests (
    store text,
    request_key text CHECK (request_key <> ''),
    sku text NOT NULL,
    quantity integer NOT NULL CHECK (quantity > 0),
    receipt jsonb,
    PRIMARY KEY (store, request_key)
);
