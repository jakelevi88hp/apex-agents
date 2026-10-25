// Seed ONE non-admin e2e user into the CI test DB (Neon, HTTPS driver).
// Env: DATABASE_URL, TEST_USER_EMAIL, TEST_USER_PASSWORD (falls back to ./ci-e2e.env and ./ci-e2e-user.env).
// Schema must already exist (this CI branch was cloned from prod's schema). For a fresh DB, create it first
// from src/lib/db/schema.ts with drizzle-kit (see report) -- this script does not create tables.
// Idempotent: upserts by email, refreshes the password hash, keeps role='user', resets the trial window,
// and (re)creates the e2e_limit_probe usage row used by tests/e2e/subscription.spec.ts.
// Run automatically by tests/e2e/global-setup.ts on CI.
import fs from 'node:fs';
import { createRequire } from 'node:module';
const here = new URL('.', import.meta.url).pathname;
const require = createRequire(here + '../package.json');
const { neon } = require('@neondatabase/serverless');
const bcrypt = require('bcryptjs');

function fromFile(file, key) {
  if (!fs.existsSync(here + file)) return undefined;
  const line = fs.readFileSync(here + file, 'utf8').split('\n').find(l => l.startsWith(key + '='));
  return line?.slice(key.length + 1).trim().replace(/^['"]|['"]$/g, '');
}
const url = process.env.DATABASE_URL ?? fromFile('ci-e2e.env', 'DATABASE_URL');
const email = (process.env.TEST_USER_EMAIL ?? fromFile('ci-e2e-user.env', 'TEST_USER_EMAIL'))?.toLowerCase();
const password = process.env.TEST_USER_PASSWORD ?? fromFile('ci-e2e-user.env', 'TEST_USER_PASSWORD');
if (!url || !email || !password) { console.error('Missing DATABASE_URL / TEST_USER_EMAIL / TEST_USER_PASSWORD'); process.exit(1); }
const host = new URL(url).hostname;
if (!host.includes('ep-autumn-art-adfdarku') || host.includes('ep-odd-union')) { console.error('ABORT: not the CI branch host'); process.exit(2); }
if (email === 'jakelevi88hp@gmail.com') { console.error('ABORT: owner email is auto-promoted to admin'); process.exit(2); }

const sql = neon(url);
const hash = await bcrypt.hash(password, 10);          // same as auth.signup: bcryptjs, 10 rounds
const [user] = await sql.query(
  `insert into users (email, password_hash, name, role, subscription_tier, subscription_status, trial_start_date, trial_end_date)
   values ($1, $2, 'CI E2E User', 'user', 'trial', 'trial', now(), now() + interval '365 days')
   on conflict (email) do update set password_hash = excluded.password_hash, role = 'user',
     subscription_tier = 'trial', subscription_status = 'trial', trial_start_date = now(),
     trial_end_date = now() + interval '365 days', updated_at = now()
   returning id, role`, [email, hash]);
// Same as SubscriptionService.initializeTrial: one agi_messages counter (trial limit 100), reset 1st of next month.
const have = await sql.query(`select 1 from usage_tracking where user_id = $1 and feature = 'agi_messages'`, [user.id]);
if (!have.length) {
  await sql.query(`insert into usage_tracking (id, user_id, feature, count, "limit", reset_at)
    values (gen_random_uuid()::text, $1, 'agi_messages', 0, 100, date_trunc('month', now()) + interval '1 month')`, [user.id]);
}
// Fixture for the "limit exceeded" e2e test: a synthetic feature counter already at its limit, so
// subscription.canUseFeature({ feature: 'e2e_limit_probe' }) must return false. Real features are untouched.
await sql.query(`delete from usage_tracking where user_id = $1 and feature = 'e2e_limit_probe'`, [user.id]);
await sql.query(`insert into usage_tracking (id, user_id, feature, count, "limit", reset_at)
  values (gen_random_uuid()::text, $1, 'e2e_limit_probe', 1, 1, date_trunc('month', now()) + interval '1 month')`, [user.id]);
const ok = await bcrypt.compare(password, (await sql.query(`select password_hash from users where id=$1`, [user.id]))[0].password_hash);
console.log(`seeded user role=${user.role} hash_verifies=${ok}`);
