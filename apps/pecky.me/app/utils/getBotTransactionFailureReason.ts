export async function getBotTransactionFailureReason(
  txHash: string
): Promise<string> {
  try {
    const response = await fetch(
      `https://rpc-mainnet.supra.com/rpc/v1/transactions/${txHash}`
    );
    const data = await response.json();
    const status = data?.output?.Move?.vm_status;

    if (status?.includes("0x7d0")) {
      return "You're already activated – no need to pay twice.";
    } else if (status?.includes("0x7d1")) {
      return "Please enter a positive number of days.";
    } else if (status?.includes("0x7d2")) {
      return "You can't extend a bot that isn't active. Activate it first!";
    } else if (status?.includes("0x7d3")) {
      return "Your grace period has expired – reactivate with Supra first.";
    } else if (status?.includes("0x3e7")) {
      return "You need to register first.";
    } else {
      return "Transaction failed. Reason unknown.";
    }
  } catch {
    return "Transaction failed.";
  }
}
