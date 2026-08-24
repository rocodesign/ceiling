import type { FloatBarSelectionMode } from "../types/bridge";

type SelectableRow = { providerId: string; accountEmail?: string | null };

// Matches `providerKey` in FloatBar.tsx: a provider can contribute one row per
// account, so `providerId` alone would collapse a second seat back out.
function rowKey(row: SelectableRow): string {
  return `${row.providerId}:${row.accountEmail ?? ""}`;
}

export function selectVisibleFloatBarProviders<T extends SelectableRow>(
  pinned: T[],
  allEligible: T[],
  options: {
    mode: FloatBarSelectionMode;
    detectionEnabled: boolean;
    lastActiveProviderId: string | null;
    usedPercent: (row: T) => number;
    highUsageThreshold: number;
  },
): T[] {
  const {
    mode,
    detectionEnabled,
    lastActiveProviderId,
    usedPercent,
    highUsageThreshold,
  } = options;
  if (mode === "pinned" || !detectionEnabled) {
    return pinned;
  }

  const active = lastActiveProviderId
    ? allEligible.filter((row) => row.providerId === lastActiveProviderId)
    : [];

  if (active.length === 0) {
    return pinned;
  }
  if (mode === "active") {
    return active;
  }

  const next: T[] = [...active];
  const seen = new Set<string>(active.map(rowKey));
  for (const row of pinned) {
    if (seen.has(rowKey(row))) continue;
    if (usedPercent(row) + 1e-9 >= highUsageThreshold) {
      next.push(row);
      seen.add(rowKey(row));
    }
  }
  return next.length > 0 ? next : pinned;
}
