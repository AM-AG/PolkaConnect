export function formatBalance(value: string | number, decimals: number = 10): string {
  const num = typeof value === 'string' ? parseFloat(value) : value;
  return (num / 10 ** decimals).toFixed(4);
}

export function formatAddress(address: string, prefixLength: number = 6, suffixLength: number = 4): string {
  if (address.length <= prefixLength + suffixLength) {
    return address;
  }
  return `${address.slice(0, prefixLength)}...${address.slice(-suffixLength)}`;
}

export function parseAmount(amount: string | number, decimals: number = 10): string {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  return (num * 10 ** decimals).toFixed(0);
}
