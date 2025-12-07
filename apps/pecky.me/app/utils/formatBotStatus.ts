export function formatBotStatus(
  isConnected: boolean,
  botActive: boolean,
  daysLeft: number
): string {
  if (!isConnected) {
    return "connect wallet";
  }
  if (botActive) {
    return `✅ ACTIVE - ${daysLeft} days left`;
  }
  return "❌ inactive";
}
