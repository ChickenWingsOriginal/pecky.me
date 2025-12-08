import { SUPRA_DECIMALS } from "./constants";

const GAS_RESERVE_SUPRA = 1;

export function calculateMaxStakeAmount(balance: bigint | null): string {
  if (!balance) return "0";
  const balanceNumber = Number(balance) / Math.pow(10, SUPRA_DECIMALS);
  const maxAmount = balanceNumber - GAS_RESERVE_SUPRA;
  if (maxAmount < 0) return "0";
  return maxAmount.toFixed(2).replace(/\.?0+$/, "");
}
