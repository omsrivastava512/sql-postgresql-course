SELECT c.id AS customer_id, o.id AS order_id FROM course_join.customers c JOIN course_join.orders o ON o.customer_id = c.id ORDER BY c.id, o.id;
SELECT c.id AS customer_id, o.id AS order_id FROM course_join.customers c LEFT JOIN course_join.orders o ON o.customer_id = c.id AND o.status = 'paid' ORDER BY c.id, o.id;
SELECT c.id AS customer_id, o.id AS order_id FROM course_join.customers c FULL JOIN course_join.orders o ON o.customer_id = c.id ORDER BY c.id NULLS LAST, o.id;
SELECT t.id, creator.name AS creator, assignee.name AS assignee FROM course_join.tickets t JOIN course_join.staff creator ON creator.id = t.created_by LEFT JOIN course_join.staff assignee ON assignee.id = t.assigned_to ORDER BY t.id;
SELECT c.id AS club_id, m.id AS membership_id FROM course_join.clubs c LEFT JOIN course_join.memberships m ON m.club_id = c.id AND m.active ORDER BY c.id, m.id;
SELECT c.id FROM course_join.clubs c LEFT JOIN course_join.memberships m ON m.club_id = c.id AND m.active WHERE m.id IS NULL ORDER BY c.id;
