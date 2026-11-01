DROP SCHEMA IF EXISTS course_variants CASCADE;
CREATE SCHEMA course_variants;

CREATE TABLE course_variants.flat_catalog (
    variant_code text PRIMARY KEY,
    product_code text NOT NULL,
    product_name text NOT NULL,
    pack_g integer NOT NULL CHECK (pack_g > 0),
    UNIQUE (product_code, pack_g)
);

INSERT INTO course_variants.flat_catalog VALUES
    ('T50', 'TEA', 'Tea', 50),
    ('T100', 'TEA', 'Tea', 100),
    ('B50', 'BIS', 'Oat Biscuits', 50);
