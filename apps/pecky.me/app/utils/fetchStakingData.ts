import { callSupraView } from "./rpc";

export async function fetchStakingData(
  walletAddress: string,
  poolAddress: string
): Promise<bigint | null> {
  const result = await callSupraView<string>(
    "0x1::pbo_delegation_pool::get_stake",
    [poolAddress, walletAddress]
  );

  if (result) {
    try {
      return BigInt(result);
    } catch (error) {
      console.error("Failed to parse staking data:", error);
    }
  }

  return null;
}
