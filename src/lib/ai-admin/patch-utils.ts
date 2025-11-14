/**
 * Helpers shared by AI Admin patch storage utilities.
 */

/**
 * Calculate the cutoff date used when deleting old patches.
 *
 * @param daysOld - Number of days to subtract when computing the cutoff.
 * @param referenceDate - Optional reference date (defaults to now) for deterministic testing.
 * @returns A new Date instance representing the cutoff timestamp.
 */
export function calculateDeletionCutoffDate(
  daysOld: number = 30,
  referenceDate: Date = new Date(),
): Date {
  const normalizedDays = Number.isFinite(daysOld) ? Math.max(0, Math.floor(daysOld)) : 0;
  const cutoffDate = new Date(referenceDate.getTime());
  if (normalizedDays === 0) {
    return cutoffDate;
  }

  cutoffDate.setDate(cutoffDate.getDate() - normalizedDays);
  return cutoffDate;
}
