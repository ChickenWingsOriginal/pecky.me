import { callSupraTable } from "./rpc";

export async function fetchNextClaimTime(
  walletAddress: string,
  tableHandle: string
): Promise<number | null> {
  const data = await callSupraTable<number>(
    tableHandle,
    "address",
    "u64",
    walletAddress
  );

  if (data && !isNaN(Number(data))) {
    const lastClaimTimeSeconds = Number(data);
    const nextClaimTimeSeconds = lastClaimTimeSeconds + 86400;
    return nextClaimTimeSeconds;
  }

  return null;
}
