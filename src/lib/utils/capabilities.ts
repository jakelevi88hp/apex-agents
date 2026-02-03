export type CapabilitiesInput =
  | string[]
  | Record<string, boolean>
  | null
  | undefined;

/**
 * Normalize capabilities input into a unique string list.
 * @param value - Capabilities array or boolean map.
 * @returns A normalized array of capability identifiers.
 */
export const normalizeCapabilities = (value: CapabilitiesInput): string[] => {
  if (Array.isArray(value)) {
    return Array.from(new Set(value.filter((item) => typeof item === 'string' && item.trim() !== '')));
  }

  if (value && typeof value === 'object') {
    return Object.entries(value)
      .filter(([, enabled]) => enabled)
      .map(([key]) => key);
  }

  return [];
};
