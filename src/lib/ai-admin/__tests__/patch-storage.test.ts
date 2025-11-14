import test from 'node:test';
import assert from 'node:assert/strict';

import { calculateDeletionCutoffDate } from '../patch-utils';

const ONE_DAY_IN_MS = 24 * 60 * 60 * 1000;

test('calculateDeletionCutoffDate subtracts the requested number of days', () => {
  // Arrange: create a fixed reference date so the test is deterministic.
  const referenceDate = new Date('2025-02-10T12:00:00Z');

  // Act: request a cutoff that is five days older than the reference point.
  const cutoff = calculateDeletionCutoffDate(5, referenceDate);

  // Assert: confirm that the difference between the two timestamps is exactly five days.
  assert.equal(referenceDate.getTime() - cutoff.getTime(), 5 * ONE_DAY_IN_MS);
});

test('calculateDeletionCutoffDate returns a cloned reference date when the delta is not positive', () => {
  // Arrange: set a baseline reference date.
  const referenceDate = new Date('2025-02-10T12:00:00Z');

  // Act: request a cutoff with a negative delta, which should clamp to zero.
  const cutoff = calculateDeletionCutoffDate(-3, referenceDate);

  // Assert: verify that the returned instance matches the baseline timestamp but is not the same reference.
  assert.equal(cutoff.getTime(), referenceDate.getTime());
  assert.notStrictEqual(cutoff, referenceDate);
});
