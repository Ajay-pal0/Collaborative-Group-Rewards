export function calculateSegmentedProgress(points: number): number {
  if (points <= 0) return 0;
  if (points >= 1000) return 100;

  if (points < 200) {
    return (points / 200) * 33.33;
  } else if (points < 500) {
    const seg = (points - 200) / (500 - 200);
    return 33.33 + seg * 33.33;
  } else {
    const seg = (points - 500) / (1000 - 500);
    return 66.67 + seg * 33.33;
  }
}

/**
 * Calculates segmented progress along the 5-node milestone highway:
 * Base (0) -> Starter (200) -> Team (500) -> Premium (1000) -> Champion (2000)
 * Each milestone node is spaced at 25% increments (0%, 25%, 50%, 75%, 100%).
 */
export function calculateHighwayProgress(points: number): number {
  if (points <= 0) return 0;
  if (points >= 2000) return 100;

  if (points < 200) {
    return (points / 200) * 25;
  } else if (points < 500) {
    const seg = (points - 200) / (500 - 200);
    return 25 + seg * 25;
  } else if (points < 1000) {
    const seg = (points - 500) / (1000 - 500);
    return 50 + seg * 25;
  } else {
    const seg = (points - 1000) / (2000 - 1000);
    return 75 + seg * 25;
  }
}
