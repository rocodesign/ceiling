import { describe, expect, it } from "vitest";
import { selectVisibleFloatBarProviders } from "./selection";

function row(providerId: string, used = 10) {
  return { providerId, used };
}

function seat(providerId: string, accountEmail: string | null, used = 10) {
  return { providerId, accountEmail, used };
}

const pinned = [row("codex", 20), row("claude", 90), row("cursor", 40)];

describe("selectVisibleFloatBarProviders", () => {
  it("keeps the pinned list in pinned mode", () => {
    expect(
      selectVisibleFloatBarProviders(pinned, pinned, {
        mode: "pinned",
        detectionEnabled: true,
        lastActiveProviderId: "cursor",
        usedPercent: (item) => item.used,
        highUsageThreshold: 85,
      }),
    ).toEqual(pinned);
  });

  it("falls back to pinned when detection is off", () => {
    expect(
      selectVisibleFloatBarProviders(pinned, pinned, {
        mode: "active",
        detectionEnabled: false,
        lastActiveProviderId: "cursor",
        usedPercent: (item) => item.used,
        highUsageThreshold: 85,
      }),
    ).toEqual(pinned);
  });

  it("shows only the last active provider in active mode", () => {
    expect(
      selectVisibleFloatBarProviders(pinned, pinned, {
        mode: "active",
        detectionEnabled: true,
        lastActiveProviderId: "cursor",
        usedPercent: (item) => item.used,
        highUsageThreshold: 85,
      }),
    ).toEqual([row("cursor", 40)]);
  });

  it("keeps pinned when no active provider is known yet", () => {
    expect(
      selectVisibleFloatBarProviders(pinned, pinned, {
        mode: "active",
        detectionEnabled: true,
        lastActiveProviderId: null,
        usedPercent: (item) => item.used,
        highUsageThreshold: 85,
      }),
    ).toEqual(pinned);
  });

  it("keeps the last active provider when the focused app is unrelated", () => {
    expect(
      selectVisibleFloatBarProviders(pinned, pinned, {
        mode: "active",
        detectionEnabled: true,
        lastActiveProviderId: "codex",
        usedPercent: (item) => item.used,
        highUsageThreshold: 85,
      }),
    ).toEqual([row("codex", 20)]);
  });

  it("keeps the full pinned list in active-plus-critical until a match exists", () => {
    expect(
      selectVisibleFloatBarProviders(pinned, pinned, {
        mode: "activePlusCritical",
        detectionEnabled: true,
        lastActiveProviderId: null,
        usedPercent: (item) => item.used,
        highUsageThreshold: 85,
      }),
    ).toEqual(pinned);
  });

  it("adds warning-threshold providers in active-plus-critical mode", () => {
    expect(
      selectVisibleFloatBarProviders(pinned, pinned, {
        mode: "activePlusCritical",
        detectionEnabled: true,
        lastActiveProviderId: "cursor",
        usedPercent: (item) => item.used,
        highUsageThreshold: 85,
      }),
    ).toEqual([row("cursor", 40), row("claude", 90)]);
  });

  it("can show an active provider that is not in the pinned list", () => {
    const grok = row("grok", 12);
    expect(
      selectVisibleFloatBarProviders(pinned, [...pinned, grok], {
        mode: "active",
        detectionEnabled: true,
        lastActiveProviderId: "grok",
        usedPercent: (item) => item.used,
        highUsageThreshold: 85,
      }),
    ).toEqual([grok]);
  });

  it("shows every account of the active provider", () => {
    const personal = seat("claude", "me@personal.test", 30);
    const work = seat("claude", "me@work.test", 70);
    expect(
      selectVisibleFloatBarProviders([personal, work], [personal, work], {
        mode: "active",
        detectionEnabled: true,
        lastActiveProviderId: "claude",
        usedPercent: (item) => item.used,
        highUsageThreshold: 85,
      }),
    ).toEqual([personal, work]);
  });

  it("does not drop a second account that is over the threshold", () => {
    const personal = seat("claude", "me@personal.test", 30);
    const work = seat("claude", "me@work.test", 95);
    const cursor = seat("cursor", null, 10);
    expect(
      selectVisibleFloatBarProviders(
        [cursor, personal, work],
        [cursor, personal, work],
        {
          mode: "activePlusCritical",
          detectionEnabled: true,
          lastActiveProviderId: "cursor",
          usedPercent: (item) => item.used,
          highUsageThreshold: 85,
        },
      ),
    ).toEqual([cursor, work]);
  });

  it("keeps both accounts when the active provider is the multi-seat one", () => {
    const personal = seat("claude", "me@personal.test", 30);
    const work = seat("claude", "me@work.test", 95);
    const cursor = seat("cursor", null, 10);
    expect(
      selectVisibleFloatBarProviders(
        [personal, work, cursor],
        [personal, work, cursor],
        {
          mode: "activePlusCritical",
          detectionEnabled: true,
          lastActiveProviderId: "claude",
          usedPercent: (item) => item.used,
          highUsageThreshold: 85,
        },
      ),
    ).toEqual([personal, work]);
  });
});
