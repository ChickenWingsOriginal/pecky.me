import { PECKY_COIN_MODULE } from "./constants";
import { callSupraView } from "./rpc";

export async function checkAirdropStatus(tokenName: string): Promise<boolean> {
  const result = await callSupraView<boolean>(
    `${PECKY_COIN_MODULE}::Coin::has_claimed_NFT_airdrop`,
    [tokenName]
  );
  return result !== true;
}
