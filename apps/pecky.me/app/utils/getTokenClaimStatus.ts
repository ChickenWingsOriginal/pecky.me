import { NFT_CLAIM_TABLE_HANDLE, NFT_CLAIM_COOLDOWN_DAYS } from "./constants";
import { callSupraTable } from "./rpc";

export async function getTokenClaimStatus(tokenName: string) {
  const encoder = new TextEncoder();
  const hexKey =
    "0x" +
    Array.from(encoder.encode(tokenName))
      .map((byte) => byte.toString(16).padStart(2, "0"))
      .join("");

  const data = await callSupraTable<number>(
    NFT_CLAIM_TABLE_HANDLE,
    "vector<u8>",
    "u64",
    hexKey
  );

  const lastClaimTimestamp = Number(data || 0);

  if (isNaN(lastClaimTimestamp) || lastClaimTimestamp === 0) {
    return { status: "claimable" as const, text: "Available now! ✓" };
  }

  const cooldown = NFT_CLAIM_COOLDOWN_DAYS * 24 * 60 * 60;
  const nextClaimTime = lastClaimTimestamp + cooldown;
  const now = Math.floor(Date.now() / 1000);
  const secondsLeft = nextClaimTime - now;

  if (secondsLeft <= 0) {
    return { status: "claimable" as const, text: "Available now! ✓" };
  } else {
    const d = Math.floor(secondsLeft / 86400);
    const h = Math.floor((secondsLeft % 86400) / 3600);
    const m = Math.floor((secondsLeft % 3600) / 60);
    const parts = [];
    if (d > 0) parts.push(`${d}d`);
    if (h > 0) parts.push(`${h}h`);
    if (d === 0 && m > 0) parts.push(`${m}m`);
    return {
      status: "cooldown" as const,
      text: `Next claim in ${parts.join(" ")}`,
    };
  }
}
