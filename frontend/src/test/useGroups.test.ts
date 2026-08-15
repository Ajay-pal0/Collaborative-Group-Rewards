import { describe, it, expect } from 'vitest';
import { calculateSegmentedProgress } from '../lib/progress';

describe('Segmented Progress Bar Calculation', () => {
  it('calculates 0% for 0 points', () => {
    expect(calculateSegmentedProgress(0)).toBe(0);
  });

  it('calculates 33% progress at 200 points (1st threshold)', () => {
    expect(Math.round(calculateSegmentedProgress(200))).toBe(33);
  });

  it('calculates 67% progress at 500 points (2nd threshold)', () => {
    expect(Math.round(calculateSegmentedProgress(500))).toBe(67);
  });

  it('calculates 100% progress at 1000 points (3rd threshold)', () => {
    expect(calculateSegmentedProgress(1000)).toBe(100);
  });
});
