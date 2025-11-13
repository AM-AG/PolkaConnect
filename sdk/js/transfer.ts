export interface TransferParams {
  fromChain: string;
  toChain: string;
  address: string;
  amount: number;
}

export interface TransferResult {
  success: boolean;
  txHash?: string;
  message?: string;
  error?: string;
}

export async function transferTokens(
  params: TransferParams,
  baseUrl: string = 'https://polkaconnect.replit.app'
): Promise<TransferResult> {
  const res = await fetch(`${baseUrl}/api/transfer/xcm`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });

  if (!res.ok) {
    throw new Error(`Transfer failed: ${res.statusText}`);
  }

  return res.json();
}
