import { RPC_BASE } from "./constants";

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
    const response = await fetch(`${RPC_BASE}/rpc/v1/view`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        function: functionName,
        arguments: args,
        type_arguments: typeArguments,
      }),
    });

    const data = await response.json();
    return data?.result?.[0] ?? null;
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

    const data = await response.json();
    return data ?? null;
  } catch (error) {
    console.error(`Failed to lookup table ${tableHandle}:`, error);
    return null;
  }
}
