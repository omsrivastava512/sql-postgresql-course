CREATE INDEX events_workspace_cursor_idx ON course_page.events (workspace_id, occurred_at, id);
CREATE INDEX messages_channel_cursor_idx ON course_page.messages (channel_id, sent_at DESC, id DESC);
SELECT id FROM course_page.events WHERE workspace_id = 7 ORDER BY occurred_at, id LIMIT 10 OFFSET 9000;
SELECT id FROM course_page.events WHERE workspace_id = 7 AND (occurred_at, id) > (timestamptz '2026-01-01 06:23:19+00', 69000) ORDER BY occurred_at, id LIMIT 10;
SELECT id FROM course_page.messages WHERE channel_id = 2 AND (sent_at, id) < (timestamptz '2026-01-01 00:37:29+00', 4500) ORDER BY sent_at DESC, id DESC LIMIT 5;
