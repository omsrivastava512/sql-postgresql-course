INSERT INTO course_auth33_api.stores VALUES
    ('East Library', 'East library branch'),
    ('West Library', 'West library branch');
INSERT INTO course_auth33_private.memberships (store, actor, active)
SELECT 'East Library', user_id, true FROM course_auth33_api.profiles WHERE display_name = 'alice';
INSERT INTO course_auth33_private.memberships (store, actor, active)
SELECT 'West Library', user_id, true FROM course_auth33_api.profiles WHERE display_name = 'bob';
