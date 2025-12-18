import { NFT_CLAIM_TABLE_HANDLE, NFT_CLAIM_COOLDOWN_DAYS } from "./constants";
import { callSupraTable } from "./rpc";

type TranslationFunction = (key: string) => string;

export async function getTokenClaimStatus(tokenName: string, t?: TranslationFunction) {
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

  const availableText = t ? t('availableNow') : "Available now! ✓";

  if (isNaN(lastClaimTimestamp) || lastClaimTimestamp === 0) {
    return { status: "claimable" as const, text: availableText };
  }

  const cooldown = NFT_CLAIM_COOLDOWN_DAYS * 24 * 60 * 60;
  const nextClaimTime = lastClaimTimestamp + cooldown;
  const now = Math.floor(Date.now() / 1000);
  const secondsLeft = nextClaimTime - now;

  if (secondsLeft <= 0) {
    return { status: "claimable" as const, text: availableText };
  } else {
    const d = Math.floor(secondsLeft / 86400);
    const h = Math.floor((secondsLeft % 86400) / 3600);
    const m = Math.floor((secondsLeft % 3600) / 60);
    const parts = [];
    if (d > 0) parts.push(`${d}d`);
    if (h > 0) parts.push(`${h}h`);
    if (d === 0 && m > 0) parts.push(`${m}m`);

    const timeString = parts.join(" ");
    const cooldownText = t ? t('nextClaimIn') : "Next claim in";

    return {
      status: "cooldown" as const,
      text: `${cooldownText} ${timeString}`,
    };
  }
}
