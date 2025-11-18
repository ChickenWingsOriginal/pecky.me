# Pecky dApp Monorepo

A turborepo monorepo containing the original static Pecky dApp and a modern Next.js recreation.

## 📁 Project Structure

```
pecky.me/
├── apps/
│   ├── pecky.me.old/          # Original static HTML/CSS/JS version
│   └── pecky.me/              # New Next.js version
├── packages/
│   └── config/                # Shared configuration and types
├── package.json
├── pnpm-workspace.yaml
├── turbo.json
└── README.md
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ (with pnpm installed)

### Installation

```bash
# Install dependencies for all workspaces
pnpm install
```

### Development

```bash
# Start dev servers for all apps
pnpm dev

# Start a specific app
pnpm --filter pecky.me dev
pnpm --filter pecky.me.old dev
```

### Building

```bash
# Build all apps
pnpm build

# Build a specific app
pnpm --filter pecky.me build
```

### Linting & Formatting

```bash
# Lint all apps
pnpm lint

# Format code
pnpm format
```

## 📦 Workspaces

### `apps/pecky.me.old`
The original static dApp built with vanilla HTML, CSS, and JavaScript.

**Features:**
- Static HTML/CSS/JS website
- Wallet integration (Supra blockchain)
- NFT management
- Staking interface
- Discord bot activation
- Multiple page navigation

**Dev Server:**
```bash
pnpm --filter pecky.me.old dev
# Runs on http://localhost:8000
```

### `apps/pecky.me`
Modern Next.js recreation with TypeScript and Tailwind CSS.

**Stack:**
- Next.js 16
- React 19
- TypeScript
- Tailwind CSS
- ESLint

**Dev Server:**
```bash
pnpm --filter pecky.me.nextjs dev
# Runs on http://localhost:3000
```

### `packages/config`
Shared configuration, constants, and TypeScript types used across all apps.

**Exports:**
- `@pecky/config` - All exports
- `@pecky/config/constants` - App constants
- `@pecky/config/types` - TypeScript type definitions

## 🔧 Turborepo Configuration

The `turbo.json` file defines the build pipeline:

- **dev**: Development server (no caching, persistent)
- **build**: Production build (caches outputs, depends on `^build`)
- **lint**: Linting (no caching)
- **clean**: Clean up artifacts

## 📝 Key Constants (from `packages/config`)

- **Supra Blockchain:** Network IDs, RPC endpoints, contract modules
- **Vault Configuration:** Total supply, airdrop amounts
- **NFT Rarities:** Common, Rare, Epic, Legendary, Mythic
- **External Links:** Discord, Twitter, trading platforms

## 🛠️ Development Workflow

1. **Add a new workspace:**
   ```bash
   pnpm create next-app apps/another-app
   ```

2. **Use shared config in a workspace:**
   ```typescript
   import { SUPRA_CONFIG, NFT_CONFIG } from '@pecky/config';
   ```

3. **Run task in specific workspace:**
   ```bash
   pnpm --filter pecky.me build
   ```

## 📚 Resources

- [Turborepo Documentation](https://turbo.build/repo/docs)
- [pnpm Workspaces](https://pnpm.io/workspaces)
- [Next.js Documentation](https://nextjs.org/docs)

## 📄 License

This is a private project.
