ALTER TABLE course_policy.documents ENABLE ROW LEVEL SECURITY;
CREATE POLICY document_read ON course_policy.documents FOR SELECT TO course_policy_alice, course_policy_bob USING (owner_role = current_user);
CREATE POLICY document_insert ON course_policy.documents FOR INSERT TO course_policy_alice, course_policy_bob WITH CHECK (owner_role = current_user);
CREATE POLICY document_update ON course_policy.documents FOR UPDATE TO course_policy_alice, course_policy_bob USING (owner_role = current_user) WITH CHECK (owner_role = current_user);
CREATE POLICY document_delete ON course_policy.documents FOR DELETE TO course_policy_alice, course_policy_bob USING (owner_role = current_user AND NOT archived);
ALTER TABLE course_policy.messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY own_messages ON course_policy.messages TO course_policy_alice, course_policy_bob USING (recipient_role = current_user) WITH CHECK (recipient_role = current_user);
