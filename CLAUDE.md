# Development Notes for Claude

## Important Workflow Rules

### Token Conservation
**DO NOT run builds automatically** - To save tokens on routine tasks:
- ❌ Don't run `pnpm build` or similar commands unless explicitly requested
- ✅ Instead, inform the user when they should build (e.g., "Please run `pnpm build` to verify the changes")
- ✅ Let the user report build results back to you
- **Reasoning**: Building is a simple task that doesn't require AI assistance. Save tokens for actual coding and problem-solving.

## Project Overview

**Main Goal**: Refactor `apps/pecky.me.old` (vanilla HTML/JS dApp) into a fresh Next.js 16 project at `apps/pecky.me`.

The old site uses vanilla HTML with `index.html`, `style.css`, and `script.js` in a monolithic structure. We're rebuilding it as a modern Next.js application with proper TypeScript, component architecture, and blockchain integration using the Supra SDK.

**Key Repository Structure**:
- `apps/pecky.me/` - New Next.js 16 refactor (active development)
- `apps/pecky.me.old/` - Legacy vanilla HTML/JS implementation (reference)

## Supra NFT Claiming Integration

### Key Packages & Setup
- **Wallet Integration**: Uses `@gerritsen/supra-connect` hook-based integration
- **BCS Serialization**: `supra-l1-sdk` must be installed for `BCS.bcsSerializeStr()`
  ```bash
  npm install supra-l1-sdk
  ```

### NFT Claiming Pattern (app/nft/page.tsx)

**Import Required:**
```typescript
import { BCS } from "supra-l1-sdk";
import { useSupraConnect, type SupraTransactionRequest } from "@gerritsen/supra-connect";
```

**Basic Pattern:**
```typescript
const { sendTransaction } = useSupraConnect();

const claimNFTReward = async (tokenName: string) => {
  try {
    // Serialize string arguments using BCS for Move String type (0x1::string::String)
    const serializedArg = BCS.bcsSerializeStr(tokenName);

    const result = await sendTransaction({
      payload: {
        moduleAddress: "0xe54b95920ef1cf9483705a32eab8526f270bc2f936dfb4112fd6ef971509d85d",
        moduleName: "Coin",
        functionName: "claim_nft_airdrop",
        typeArguments: [],
        arguments: [serializedArg]  // Pre-serialized arguments
      }
    });

    if (result.success) {
      // Handle success - result.txHash available
    } else {
      // Handle failure - result.reason or result.error available
    }
  } catch (error) {
    // Handle exception
  }
};
```

### Important Points
1. **BCS Serialization Requirements**
   - ✅ **Transaction arguments**: Always use BCS serialization (`BCS.bcsSerializeStr()` for Move `String` types)
   - ❌ **View call arguments**: Use raw strings/values (no BCS serialization for RPC view calls)
   - Different BCS methods exist for other Move types (u64, address, vector, etc.) when sending transactions

2. **useSupraConnect() returns**:
   - `sendTransaction(request)` - for transactions
   - `connectedWallet` - wallet info
   - `isConnected` - connection status

3. **sendTransaction() response**:
   - `success: boolean`
   - `txHash?: string` (if successful)
   - `error?: string`
   - `reason?: string`

4. **Function Signature Reference**:
   - See `app/lib/coin-idl.json` for the Coin module IDL
   - Available NFT functions: `claim_nft_airdrop` (takes `&signer` and `0x1::string::String`)

### Common Pitfalls
- ❌ Passing raw strings without BCS serialization → `FAILED_TO_DESERIALIZE_ARGUMENT`
- ❌ Using `window.supraProvider` → doesn't exist, use `useSupraConnect()` hook
- ❌ Forgetting to import `BCS` from `supra-l1-sdk` → build fails

### Coin IDL Location
`app/lib/coin-idl.json` - Contains all exposed functions and their parameter types for the Pecky Coin module.

---

## Code Consolidation Analysis

### Completed Consolidations (✅)

#### 1. Shared Constants (`utils/constants.ts`)
Created centralized constants file to eliminate duplication across 9+ files:
- `RPC_BASE` - Supra RPC endpoint
- `PECKY_COIN_MODULE` - Main contract address
- `NFT_CLAIM_TABLE_HANDLE` - NFT claim table
- `STAKING_CLAIM_TABLE_HANDLE` - Staking claim table
- `NFTS_CACHE_KEY` - LocalStorage cache key
- `CACHE_LIFESPAN_MS` - Cache TTL (12 hours)
- `NFT_CLAIM_COOLDOWN_DAYS` - NFT claim cooldown period
- `SUPRA_DECIMALS` - Supra token decimals (8)
- `PECKY_DECIMALS` - Pecky token decimals (6)

**Impact**: ~20 lines saved, single source of truth for all constants

#### 2. Generic RPC Functions (`utils/rpc.ts`)
Created reusable RPC call functions to eliminate duplicate fetch patterns:

```typescript
// Generic view function call
callSupraView<T>(functionName, args, typeArguments): Promise<T | null>

// Generic table lookup
callSupraTable<T>(tableHandle, keyType, valueType, key): Promise<T | null>
```

**Impact**: ~60 lines saved across 6 files
- `checkPeckyBotStatus.ts` - Now 12 lines (was 25)
- `getPeckyBotDaysRemaining.ts` - Now 12 lines (was 25)
- `checkAirdropStatus.ts` - Now 10 lines (was 24)
- `fetchStakingData.ts` - Now 21 lines (was 28)
- `fetchNextClaimTime.ts` - Now 21 lines (was 30)
- `getTokenClaimStatus.ts` - Simplified RPC calls

### Pending Consolidations (Future Consideration)

#### 3. Countdown Formatting (Medium Priority)
Two similar countdown formatters with different logic:
- `formatCountdownTime(seconds)` - Simple hours/minutes
- `formatCountdownFromTimestamp(timestamp)` - Days/hours/minutes with timestamp conversion

**Recommendation**: Create unified `formatCountdown(seconds, options?)` function

#### 4. Balance/Amount Formatting (Low Priority)
Similar patterns but different use cases:
- `formatSupraBalance(balance, 8 decimals)` → uses `toLocaleString`
- `formatMicroUnits(balance, 6 decimals)` → uses B/M notation

**Recommendation**: Consider optional formatting style parameter

#### 5. Cache Functions (Medium Priority)
NFT-specific cache functions follow generic localStorage pattern:
- `getNftsFromCache(walletAddress)`
- `saveNftsToCache(walletAddress, data)`

**Recommendation**: Create generic `getFromCache<T>(key, walletAddress, ttl)` and `saveToCache<T>(key, walletAddress, data)`

#### 6. Type Duplication (Low Priority)
`OwnedNFT` interface defined in both cache files

**Recommendation**: Move shared types to `types.ts` or export from single file

### Summary
**Completed savings**: ~80 lines of code + improved maintainability
**Potential savings**: ~50 additional lines if pending consolidations implemented

**Status**: ✅ All consolidations implemented and verified - build successful
