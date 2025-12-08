import { PECKY_COIN_MODULE } from "./constants";
import { callSupraView } from "./rpc";

export async function getPeckyBotDaysRemaining(
  walletAddress: string
): Promise<number> {
  const result = await callSupraView<number>(
    `${PECKY_COIN_MODULE}::PeckyBotV2::get_remaining_days`,
    [walletAddress]
  );
  return result ?? 0;
}
