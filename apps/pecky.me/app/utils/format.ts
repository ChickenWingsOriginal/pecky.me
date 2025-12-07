/**
 * Format large numbers using B (billions), M (millions) notation
 * @param n Number to format
 * @returns Formatted string (e.g., "1.23B", "456.78M", "789.01")
 */
export function formatMillions(n: number): string {
  if (n >= 1_000_000_000) {
    return (n / 1_000_000_000).toFixed(2) + 'B';
  } else if (n >= 1_000_000) {
    return (n / 1_000_000).toFixed(2) + 'M';
  } else {
    return n.toFixed(2);
  }
}

/**
 * Convert micro-units to regular units and format for display
 * @param micro Amount in micro-units (6 decimals)
 * @param decimals Number of decimal places (default 6 for Pecky)
 * @returns Formatted string with B/M notation
 */
export function formatMicroUnits(micro: bigint, decimals: number = 6): string {
  const units = Number(micro) / Math.pow(10, decimals);
  return formatMillions(units);
}
