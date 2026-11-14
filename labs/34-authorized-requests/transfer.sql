UPDATE course_auth34_private.memberships SET can_place = true
WHERE actor = (SELECT actor FROM course_auth34_api.draft_orders WHERE draft_id = 3)
  AND store = 'North';
