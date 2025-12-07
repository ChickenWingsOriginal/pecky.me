export function formatCountdownFromTimestamp(releaseTimestamp: bigint): string {
  const now = Math.floor(Date.now() / 1000);
  const diff = Number(releaseTimestamp) - now;

  if (diff <= 0) return "ready";

  const days = Math.floor(diff / 86400);
  const hours = Math.floor((diff % 86400) / 3600);
  const minutes = Math.floor((diff % 3600) / 60);

  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}
