import { PECKY_COIN_MODULE } from "./constants";
import { callSupraView } from "./rpc";

export async function checkPeckyBotStatus(
  walletAddress: string
): Promise<boolean> {
  const result = await callSupraView<boolean>(
    `${PECKY_COIN_MODULE}::PeckyBotV2::is_peckybot_active`,
    [walletAddress]
  );
  return result === true;
}
