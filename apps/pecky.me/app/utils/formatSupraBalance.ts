import { SUPRA_DECIMALS } from "./constants";

export function formatSupraBalance(balance: bigint | null): string {
  if (!balance) return "0";
  const balanceNumber = Number(balance) / Math.pow(10, SUPRA_DECIMALS);
  return balanceNumber.toLocaleString("en-US", { maximumFractionDigits: 2 });
}
