import { execFileSync } from 'node:child_process';
import path from 'node:path';

/**
 * On CI, seed the non-admin e2e user (and its fixture rows) before the suite runs.
 * scripts/seed-ci-user.mjs refuses any DB host other than the CI Neon branch and never creates admins.
 * Locally this is a no-op unless E2E_SEED=1, so it can't touch a developer's database by accident.
 */
export default function globalSetup() {
  const wanted = process.env.CI || process.env.E2E_SEED === '1';
  const configured = process.env.DATABASE_URL && process.env.TEST_USER_EMAIL && process.env.TEST_USER_PASSWORD;
  if (!wanted || !configured) return;
  execFileSync('node', [path.join(__dirname, '../../scripts/seed-ci-user.mjs')], { stdio: 'inherit' });
}
