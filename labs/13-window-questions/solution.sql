SELECT id, SUM(cents) OVER (PARTITION BY account_id ORDER BY charged_on, id ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW) AS running_cents FROM course_window.charges ORDER BY id;
SELECT id, RANK() OVER (PARTITION BY account_id ORDER BY cents DESC) AS rank, DENSE_RANK() OVER (PARTITION BY account_id ORDER BY cents DESC) AS dense_rank FROM course_window.charges ORDER BY id;
WITH numbered AS (SELECT *, ROW_NUMBER() OVER (PARTITION BY account_id ORDER BY charged_on DESC, id DESC) AS position FROM course_window.charges)
SELECT account_id, id, cents FROM numbered WHERE position = 1 ORDER BY account_id;
SELECT DISTINCT ON (account_id) account_id, id, cents FROM course_window.charges ORDER BY account_id, charged_on DESC, id DESC;
SELECT id, cents - LAG(cents) OVER (PARTITION BY account_id ORDER BY charged_on, id) AS change FROM course_window.charges ORDER BY id;
SELECT id, reading - LAG(reading) OVER (PARTITION BY meter ORDER BY read_on, id) AS used FROM course_window.readings ORDER BY id;
WITH numbered AS (SELECT *, ROW_NUMBER() OVER (PARTITION BY meter ORDER BY read_on DESC, id DESC) AS position FROM course_window.readings)
SELECT meter, reading FROM numbered WHERE position = 1 ORDER BY meter;
