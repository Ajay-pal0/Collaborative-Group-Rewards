/**
 * Masks a 10-character PAN number preserving first 5 characters and last 1 character with 4 asterisks.
 * Example: EMTPP1234H -> EMTPP****H
 */
export function maskPan(pan?: string | null): string {
  if (!pan) return 'EMTPP****H';
  const clean = pan.trim().toUpperCase();
  if (clean.length === 10 && !clean.includes('*') && !clean.includes('•')) {
    return `${clean.slice(0, 5)}****${clean.slice(-1)}`;
  }
  // Standardize any existing masking with bullets (••••) or mixed asterisks to 4 asterisks
  if (clean.includes('•') || clean.includes('*')) {
    return clean.replace(/[•*]+/g, '****');
  }
  return clean;
}

/**
 * Masks a 12-digit Aadhaar number preserving the last 4 digits.
 * Example: 123456789012 -> XXXXXXXX9012
 */
export function maskAadhaar(aadhaar?: string | null): string {
  if (!aadhaar) return 'XXXXXXXX1234';
  const clean = aadhaar.trim().replace(/[\s-]+/g, '');
  if (clean.length >= 4 && !clean.startsWith('X') && !clean.startsWith('x')) {
    return `${'X'.repeat(clean.length - 4)}${clean.slice(-4)}`;
  }
  return clean;
}
