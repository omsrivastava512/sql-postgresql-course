SELECT c.id AS customer_id, c.name, o.id AS order_id, o.cents
FROM course_request.customers c LEFT JOIN course_request.orders o ON o.customer_id = c.id AND o.status = 'paid'
WHERE c.active ORDER BY c.id, o.id;
SELECT p.id, count(t.id)::integer AS open_tasks
FROM course_request.projects p LEFT JOIN course_request.tasks t ON t.project_id = p.id AND NOT t.done
WHERE p.active GROUP BY p.id ORDER BY p.id;
