UPDATE course_variants.flat_catalog
SET product_name = 'Breakfast Tea'
WHERE variant_code = 'T50';

SELECT product_code, array_agg(DISTINCT product_name ORDER BY product_name) AS names
FROM course_variants.flat_catalog
GROUP BY product_code
HAVING count(DISTINCT product_name) > 1;

CREATE TABLE course_variants.products (
    product_code text PRIMARY KEY,
    product_name text NOT NULL
);

CREATE TABLE course_variants.variants (
    variant_code text PRIMARY KEY,
    product_code text NOT NULL REFERENCES course_variants.products,
    pack_g integer NOT NULL CHECK (pack_g > 0),
    UNIQUE (product_code, pack_g)
);

INSERT INTO course_variants.products VALUES ('TEA', 'Breakfast Tea'), ('BIS', 'Oat Biscuits');
INSERT INTO course_variants.variants (variant_code, product_code, pack_g)
SELECT variant_code, product_code, pack_g FROM course_variants.flat_catalog;

CREATE VIEW course_variants.catalog AS
SELECT v.variant_code, p.product_code, p.product_name, v.pack_g
FROM course_variants.variants AS v
JOIN course_variants.products AS p USING (product_code);

WITH expected (variant_code, product_code, product_name, pack_g) AS (
    VALUES ('B50', 'BIS', 'Oat Biscuits', 50),
           ('T50', 'TEA', 'Breakfast Tea', 50),
           ('T100', 'TEA', 'Breakfast Tea', 100)
)
SELECT 'missing' AS difference, m.*
FROM (TABLE expected EXCEPT ALL TABLE course_variants.catalog) AS m
UNION ALL
SELECT 'unexpected', u.*
FROM (TABLE course_variants.catalog EXCEPT ALL TABLE expected) AS u;
