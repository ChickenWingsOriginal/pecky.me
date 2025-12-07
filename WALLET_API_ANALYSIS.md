# Wallet API Analysis from pecky.me.old

## Endpoints Summary

### Pecky Balance
- **Endpoint**: `/rpc/v2/accounts/{address}/resources/{encoded}` (with v1 fallback)
- **Resource Type**: `0x0000000000000000000000000000000000000000000000000000000000000001::coin::CoinStore<0xe54b95920ef1cf9483705a32eab8526f270bc2f936dfb4112fd6ef971509d85d::Coin::Pecky>`

### Pecky Price
- **Endpoint**: `/rpc/v2/view` (not v1!)
- **Function**: `0x0dc694898dff98a1b0447e0992d0413e123ea80da1021d464a4fbaf0265870d8::router::get_reserves_size`
- **Type Arguments**: `[0xe54b95920ef1cf9483705a32eab8526f270bc2f936dfb4112fd6ef971509d85d::Coin::Pecky, 0x1::supra_coin::SupraCoin, 0x0dc694898dff98a1b0447e0992d0413e123ea80da1021d464a4fbaf0265870d8::curves::Uncorrelated]`
- **Arguments**: `[]`
- **Response**: `[peckyReserve, supraReserve]` (both as strings/BigInts)
- **Calculation**: `price = (supraReserve / peckyReserve) * 0.01`

### Registration Status
- **Endpoint**: `/rpc/v1/view`
- **Function**: `0xe54b95920ef1cf9483705a32eab8526f270bc2f936dfb4112fd6ef971509d85d::Coin::is_pecky_registered`
- **Type Arguments**: `[]`
- **Arguments**: `[walletAddress]`
- **Response**: `[result[0]]` where result[0] is a boolean-like value
- **Note**: Line 454: `if (data?.result?.length > 0) { return !!data.result[0]; }`

### Discord ID (Check if registered)
- **Endpoint**: `/rpc/v1/view`
- **Function**: `0xe54b95920ef1cf9483705a32eab8526f270bc2f936dfb4112fd6ef971509d85d::discord_link::is_registered`
- **Type Arguments**: `[]`
- **Arguments**: `[walletAddress]`
- **Response**: `[bool]`

### Discord ID (Get ID)
- **Endpoint**: `/rpc/v1/view`
- **Function**: `0xe54b95920ef1cf9483705a32eab8526f270bc2f936dfb4112fd6ef971509d85d::discord_link::get_discord_id`
- **Type Arguments**: `[]`
- **Arguments**: `[walletAddress]`
- **Response**: `[discordId]` (string)
- **Note**: Line 3290: `if (out?.result?.length === 2 && out.result[0] === true)`

### Staking Info
- **Endpoint**: `/rpc/v1/view`
- **Function**: `0x1::pbo_delegation_pool::get_stake`
- **Type Arguments**: `[]`
- **Arguments**: `[MERIDIAN_POOL, walletAddress]` where MERIDIAN_POOL = `0x72b93dccbda04c9caf1b8726d96cb28edee5feceb85e32db318dd1eea4320331`
- **Response**: `[stakedAmount]` (as string, in micro-SUPRA)
- **Note**: Takes pool address FIRST, then wallet address

## Register Button (Transaction)
- **Function**: `registerUser()`
- **Provider Method**: `provider.createRawTransactionData()` then `provider.sendTransaction()`
- **Payload Structure**:
  ```
  [
    walletAddress,
    0,
    PECKY_COIN_MODULE,
    "Coin",
    "register",
    [],
    [],
    {}
  ]
  ```
- **Transaction Details**:
  - `from`: walletAddress
  - `to`: PECKY_COIN_MODULE
  - `chainId`: "8"
  - `value`: ""
- **Behavior**:
  1. Checks if already registered (blocks if already done)
  2. Checks `isRegisteredPecky` flag
  3. Creates raw transaction data
  4. Sends transaction via wallet provider
  5. Updates button state after completion
  6. Shows popup with result

## Key Observations
1. Most view calls use `/rpc/v1/view`
2. Pecky price uses `/rpc/v2/view`
3. All functions return arrays of strings/values
4. The module path is: `0xe54b95920ef1cf9483705a32eab8526f270bc2f936dfb4112fd6ef971509d85d` (PECKY_COIN_MODULE)
5. Register button triggers a transaction, not just a view call
6. MERIDIAN_POOL address is required for staking info: `0x72b93dccbda04c9caf1b8726d96cb28edee5feceb85e32db318dd1eea4320331`