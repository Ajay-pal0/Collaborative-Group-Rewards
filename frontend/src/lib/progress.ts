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
