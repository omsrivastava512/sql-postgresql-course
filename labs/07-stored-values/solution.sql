INSERT INTO course_values.products (id, name, stock, note) VALUES (40, 'Bowl', 2, DEFAULT);
UPDATE course_values.products SET stock = 4 WHERE id = 20;
ALTER TABLE course_values.products ALTER COLUMN stock SET NOT NULL;
ALTER TABLE course_values.products ADD CONSTRAINT product_name_nonblank CHECK (length(btrim(name)) > 0);
UPDATE course_values.reservations SET contact = NULL WHERE btrim(contact) = '';
ALTER TABLE course_values.reservations ADD CONSTRAINT contact_nonblank CHECK (contact IS NULL OR length(btrim(contact)) > 0);
SELECT id, stock, note FROM course_values.products ORDER BY id;
SELECT id, contact FROM course_values.reservations ORDER BY id;
