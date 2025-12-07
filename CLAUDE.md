# Development Notes for Claude

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
