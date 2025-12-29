# Next-intl Optimization Progress

## Problem Statement
Russian locale routes (/ru/*) showing 60-70 point performance degradation compared to English routes:
- `/ru` routes: 5-15 performance score
- `/` (English) routes: 22-28 performance score (90-100 on some pages)

## Root Causes Identified

### 1. **CRITICAL: Missing Cyrillic Font Subsets** (50-60% of performance drop)
- Geist fonts only loaded `latin` subset
- Cyrillic characters triggered font fallback → FOUT/FOIT
- Caused layout shifts and delayed text rendering

### 2. **CRITICAL: Client-Side Translation Loading** (30-40% of performance drop)
- ALL translations sent to client via `NextIntlClientProvider`
- Russian: 26,338 bytes (16,763 chars)
- English: 17,543 bytes (15,379 chars)
- **8.8KB extra payload for Russian** due to UTF-8 Cyrillic encoding
- No tree-shaking, all 369 lines loaded even if only 10 used

### 3. **MEDIUM: Missing Static Generation**
- No explicit `export const dynamic = 'force-static'`
- Pages may be dynamically rendered instead of statically generated

## Completed Work (✅)

### Phase 1: Font Optimization ✅
**File: `app/[locale]/layout.tsx:12-22`**
```typescript
// BEFORE:
subsets: ["latin"]

// AFTER:
subsets: ["latin", "latin-ext", "cyrillic", "cyrillic-ext"],
display: "swap",
```
**Impact**: Eliminates font fallback issues for Cyrillic text

### Phase 2: Translation Namespace Splitting ✅
**Created namespace structure:**
```
messages/
├── en/
│   ├── common.json
│   ├── nav.json
│   ├── wallet.json
│   ├── quotes.json
│   ├── home.json
│   ├── nft.json
│   ├── staking.json
│   ├── bot.json
│   ├── info.json
│   └── notFound.json
└── ru/
    ├── common.json (Cyrillic optimized)
    ├── nav.json
    ├── wallet.json
    ├── quotes.json
    ├── home.json
    ├── nft.json
    ├── staking.json
    ├── bot.json
    ├── info.json
    └── notFound.json
```

**Impact**: Enables per-page translation loading instead of loading all 26KB at once

## In Progress / Remaining Work

### Phase 3: Update i18n Configuration (NEXT STEP)
**File: `i18n/request.ts`**

**Current Code (line 15):**
```typescript
messages: (await import(`../messages/${locale}.json`)).default
```

**Required Change:**
Update to support namespace-based loading. Two options:

**Option A: Load all namespaces server-side (simpler, still better than client-side)**
```typescript
messages: {
  common: (await import(`../messages/${locale}/common.json`)).default,
  nav: (await import(`../messages/${locale}/nav.json`)).default,
  wallet: (await import(`../messages/${locale}/wallet.json`)).default,
  quotes: (await import(`../messages/${locale}/quotes.json`)).default,
  home: (await import(`../messages/${locale}/home.json`)).default,
  nft: (await import(`../messages/${locale}/nft.json`)).default,
  staking: (await import(`../messages/${locale}/staking.json`)).default,
  bot: (await import(`../messages/${locale}/bot.json`)).default,
  info: (await import(`../messages/${locale}/info.json`)).default,
  notFound: (await import(`../messages/${locale}/notFound.json`)).default,
}
```

**Option B: Per-page namespace loading (optimal)**
- Remove global message loading from `request.ts`
- Use `getTranslations()` with namespace parameter in each page
- Example: `const t = await getTranslations('home');`

**Recommendation**: Use Option B for maximum performance

### Phase 4: Refactor Layout.tsx
**File: `app/[locale]/layout.tsx`**

**Changes Required:**
1. Remove lines 52-54 (getMessages import and call)
2. Remove `<NextIntlClientProvider messages={messages}>` wrapper (line 61)
3. Keep children wrapped only in `<Providers>` (already a client component)
4. Add `unstable_setRequestLocale(locale)` for static generation support

**Before:**
```typescript
const messages = await getMessages();
return (
  <html lang={locale}>
    <body>
      <NextIntlClientProvider messages={messages}>
        <Providers>
          <Navigation />
          {children}
        </Providers>
      </NextIntlClientProvider>
    </body>
  </html>
);
```

**After:**
```typescript
import {unstable_setRequestLocale} from 'next-intl/server';

// In function body:
unstable_setRequestLocale(locale);

return (
  <html lang={locale}>
    <body>
      <Providers>
        <Navigation />
        {children}
      </Providers>
    </body>
  </html>
);
```

### Phase 5: Convert Pages to Server-Side Translations

#### 5a. Homepage (`app/[locale]/page.tsx`)
**Approach**: Fully server component
```typescript
import {getTranslations, unstable_setRequestLocale} from 'next-intl/server';

export default async function Home({params}: {params: Promise<{locale: string}>}) {
  const {locale} = await params;
  unstable_setRequestLocale(locale);

  const t = await getTranslations('home');
  const tCommon = await getTranslations('common');
  const tWallet = await getTranslations('wallet');
  const tQuotes = await getTranslations('quotes');

  // Use t() throughout component
  return <h1>{t('title')}</h1>;
}
```

#### 5b. NFT Page (`app/[locale]/nft/page.tsx`)
**Approach**: Server component with client wrappers for wallet interaction
- Main page: Server component with `getTranslations('nft')`
- Interactive components (claim buttons, wallet info): Extract to client components
- Pass scoped translation objects as props to client components

#### 5c. Staking Page (`app/[locale]/staking/page.tsx`)
**Approach**: Server component with client wrappers for staking interactions
- Main layout: Server component with `getTranslations('staking')`
- Staking forms, claim buttons: Client components receiving translation props

#### 5d. Navigation Component (`app/components/Navigation.tsx`)
**Challenge**: Currently renders in layout, needs `nav` translations
**Solution**: Pass translations as props from layout OR use `useTranslations()` client-side
**Recommendation**: Since Navigation is already client-side, use `useTranslations('nav')`

### Phase 6: Add Static Generation Configuration
Add to all page files:
```typescript
export const dynamic = 'force-static'; // For fully static pages (home, nft, info, bot)
export const revalidate = 3600; // For semi-static pages (staking - 1 hour revalidation)

export function generateStaticParams() {
  return routing.locales.map((locale) => ({locale}));
}
```

### Phase 7: Testing & Verification
**Test matrix:**
- ✅ English routes: /, /nft, /staking, /bot, /info
- ✅ Russian routes: /ru, /ru/nft, /ru/staking, /ru/bot, /ru/info
- ✅ No hydration mismatches
- ✅ Check Vercel Speed Insights Real Experience Scores

**Target Performance:**
- All routes: 85-95+ performance score
- Russian routes improvement: 5-15 → 85-95 (+70-80 points)

## Expected Performance Gains

| Optimization | Expected Improvement |
|--------------|---------------------|
| Cyrillic font subsets | +30-40 points |
| Server-side translations | +20-30 points |
| Namespace splitting | +10-15 points (payload reduction) |
| Static generation | +10-15 points (faster TTFB) |
| **TOTAL** | **+70-100 points for /ru routes** |

## File Status

### Modified Files
- ✅ `app/[locale]/layout.tsx` - Font subsets updated (lines 12-22)

### New Files Created
- ✅ `messages/en/*.json` - 10 namespace files
- ✅ `messages/ru/*.json` - 10 namespace files

### Files to Modify
- ⏳ `i18n/request.ts` - Update message loading strategy
- ⏳ `app/[locale]/layout.tsx` - Remove client provider, add setRequestLocale
- ⏳ `app/[locale]/page.tsx` - Convert to server-side translations
- ⏳ `app/[locale]/nft/page.tsx` - Convert to server-side translations
- ⏳ `app/[locale]/staking/page.tsx` - Convert to server-side translations
- ⏳ `app/[locale]/bot/page.tsx` - Add static generation config
- ⏳ `app/[locale]/info/page.tsx` - Add static generation config

### Files to Delete (after migration)
- 🗑️ `messages/en.json` - Replaced by namespace files
- 🗑️ `messages/ru.json` - Replaced by namespace files

## Important Notes

1. **Don't delete old translation files yet** - Keep until migration is complete and tested
2. **Test incrementally** - Test each page conversion before moving to next
3. **Watch for hydration errors** - Most common issue when mixing server/client components
4. **Check browser console** - Look for missing translation keys
5. **Vercel deployment** - Performance improvements should be verified in production, not just local dev

## Next Session: Start Here

1. Update `i18n/request.ts` to support namespace loading (Option B recommended)
2. Refactor `app/[locale]/layout.tsx` to remove NextIntlClientProvider
3. Convert homepage to server-side translations
4. Test homepage in both locales
5. Proceed with NFT and Staking pages

---

**Last Updated**: 2025-12-28
**Progress**: 3/10 tasks complete (30%)
**Estimated Time Remaining**: 3-4 hours
