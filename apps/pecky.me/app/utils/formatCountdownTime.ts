export function formatCountdownTime(secondsUntilClaim: number): string {
  if (secondsUntilClaim <= 0) return "";
  const hours = Math.floor(secondsUntilClaim / 3600);
  const minutes = Math.floor((secondsUntilClaim % 3600) / 60);
  return `next claim in ${hours}h ${minutes}m`;
}
