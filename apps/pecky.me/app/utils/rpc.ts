import { RPC_BASE } from "./constants";

/**
 * Retry a function with exponential backoff
 * @param fn - Function to retry
 * @param maxRetries - Maximum number of retries (default: 3)
 * @param delayMs - Initial delay in milliseconds (default: 200)
 * @returns Promise with the function result
 */
async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  delayMs: number = 200
): Promise<T> {
  let lastError: any;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      // Don't retry on last attempt
      if (attempt === maxRetries) {
        break;
      }

      // Exponential backoff: 200ms, 400ms, 800ms
      const backoffDelay = delayMs * Math.pow(2, attempt);
      console.log(`Retry attempt ${attempt + 1}/${maxRetries} after ${backoffDelay}ms...`);
      await new Promise(resolve => setTimeout(resolve, backoffDelay));
    }
  }

  throw lastError;
}

/**
 * Generic function to call Supra RPC view functions
 * @param functionName - Full function path (e.g., "0x1::module::function")
 * @param args - Array of arguments to pass to the function
 * @param typeArguments - Array of type arguments (optional)
 * @returns Promise with the first result value or null
 */
export async function callSupraView<T = any>(
  functionName: string,
  args: any[] = [],
  typeArguments: string[] = []
): Promise<T | null> {
  try {
    return await retryWithBackoff(async () => {
      const response = await fetch(`${RPC_BASE}/rpc/v1/view`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          function: functionName,
          arguments: args,
          type_arguments: typeArguments,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return data?.result?.[0] ?? null;
    });
  } catch (error) {
    console.error(`Failed to call view function ${functionName}:`, error);
    return null;
  }
}

/**
 * Call a Supra RPC table lookup
 * @param tableHandle - The table handle address
 * @param keyType - The type of the key
 * @param valueType - The type of the value
 * @param key - The key to lookup
 * @returns Promise with the result or null
 */
export async function callSupraTable<T = any>(
  tableHandle: string,
  keyType: string,
  valueType: string,
  key: any
): Promise<T | null> {
  try {
    return await retryWithBackoff(async () => {
      const response = await fetch(
        `${RPC_BASE}/rpc/v1/tables/${tableHandle}/item`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            key_type: keyType,
            value_type: valueType,
            key: key,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return data ?? null;
    });
  } catch (error) {
    console.error(`Failed to lookup table ${tableHandle}:`, error);
    return null;
  }
}
