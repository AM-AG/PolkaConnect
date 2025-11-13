export interface SwapParams {
  from: string;
  to: string;
  amount: number;
}

export interface SwapResult {
  success: boolean;
  txHash?: string;
  error?: string;
}

export async function swapTokens(
  params: SwapParams,
  baseUrl: string = 'https://polkaconnect.replit.app'
): Promise<SwapResult> {
  const res = await fetch(`${baseUrl}/api/swap`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });

  if (!res.ok) {
    throw new Error(`Swap failed: ${res.statusText}`);
  }

  return res.json();
}
