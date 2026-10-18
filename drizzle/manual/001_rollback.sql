-- 001_rollback.sql — reverses 001_additive_agents_workflows_usage.sql.
-- SAFE ONLY IF these four tables were created by 001 and are empty / hold no
-- data you need (verify first: SELECT count(*) FROM agents; ... workflows;
-- ... usage_tracking; ... organizations;). Dropping them deletes any rows.
-- Does not touch any pre-existing table (users, subscriptions, etc.).
-- No types were created by 001, so none are dropped.
BEGIN;
DROP TABLE IF EXISTS "workflows";
DROP TABLE IF EXISTS "agents";
DROP TABLE IF EXISTS "usage_tracking";
DROP TABLE IF EXISTS "organizations";
COMMIT;
