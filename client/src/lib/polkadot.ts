/**
 * Convert DOT amount (as decimal string) to planck (10^-10 DOT) as BigInt
 * Avoids precision loss from float conversion
 * 
 * @param amount - DOT amount as string (e.g., "123.456789", "0.5", or ".5")
 * @returns BigInt in planck units (1 DOT = 10^10 planck)
 */
export function dotToPlanck(amount: string): bigint {
  const trimmed = amount.trim();
  
  if (!trimmed) {
    throw new Error('Amount cannot be empty');
  }

  // Validate input is a valid positive decimal
  // Allows: "100", "100.5", ".5", "0.5"
  // Rejects: "100.", "", "-5", "abc"
  if (!/^(\d+(\.\d+)?|\.\d+)$/.test(trimmed)) {
    throw new Error('Invalid amount format - must be a positive number');
  }

  // Normalize ".5" to "0.5" for consistent parsing
  const normalized = trimmed.startsWith('.') ? '0' + trimmed : trimmed;
  
  const parts = normalized.split('.');
  const [wholePart = '0', decimalPart = ''] = parts;
  
  // Reject if precision exceeds 10 decimals (planck precision for DOT)
  if (decimalPart.length > 10) {
    throw new Error(`Precision exceeds 10 decimals (got ${decimalPart.length})`);
  }
  
  // Pad decimal to exactly 10 digits
  // "5" → "5000000000"
  // "0000000005" → "0000000005" (already 10 digits)
  const paddedDecimal = decimalPart.padEnd(10, '0');
  
  // Combine: wholePart + paddedDecimal
  // "100" + "0000000000" = "1000000000000" (100 DOT)
  // "0" + "5000000000" = "05000000000" = 5000000000 (0.5 DOT)
  // "100" + "5000000000" = "1005000000000" (100.5 DOT)
  const planckString = wholePart + paddedDecimal;
  
  return BigInt(planckString);
}
