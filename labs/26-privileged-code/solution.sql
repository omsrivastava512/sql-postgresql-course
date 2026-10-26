BEGIN;
ALTER VIEW course_code.document_list SET (security_invoker = true);
ALTER FUNCTION course_code.document_count() SECURITY INVOKER;
ALTER FUNCTION course_code.label_for(integer) SET search_path = pg_catalog, course_code, pg_temp;
CREATE FUNCTION course_code.delivery_label_for(p_code integer) RETURNS text LANGUAGE sql SECURITY DEFINER SET search_path = pg_catalog, course_code, pg_temp AS $$ SELECT label FROM course_code.delivery_labels WHERE code = p_code $$;
ALTER FUNCTION course_code.delivery_label_for(integer) OWNER TO course_code_worker;
REVOKE EXECUTE ON ALL FUNCTIONS IN SCHEMA course_code FROM PUBLIC;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA course_code TO course_code_alice, course_code_bob;
COMMIT;
