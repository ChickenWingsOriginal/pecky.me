# Testing Guide - Next-intl Optimization

## Current Status

✅ **All locale files split into namespaces**
- English (en) ✓
- Spanish (es) ✓
- Chinese (zh) ✓
- Russian (ru) ✓
- Hausa (ha) ✓
- Dutch (nl) ✓
- Turkish (tr) ✓

✅ **Code updated to use namespace structure**
✅ **All pages optimized for server-side rendering**

## What We're Testing

The new namespace-based translation system that:
1. Loads translations **server-side only** (no client hydration)
2. Uses **Cyrillic font subsets** for Russian text
3. Enables **static generation** for all routes
4. Should improve Russian route performance by **70-100 points**

---

## Testing Steps

### 1. Start Development Server

```bash
cd apps/pecky.me
pnpm dev
```

Expected output: Server starts on http://localhost:3000

### 2. Test English Routes (Baseline)

Visit each route and verify:

| Route | Check |
|-------|-------|
| http://localhost:3000 | ✓ Homepage loads |
| http://localhost:3000/nft | ✓ NFT page loads |
| http://localhost:3000/staking | ✓ Staking page loads |
| http://localhost:3000/bot | ✓ Bot page loads |
| http://localhost:3000/info | ✓ Info page loads |

**What to check:**
- ✓ Page loads without errors
- ✓ All text displays in English
- ✓ No console errors (press F12 → Console tab)
- ✓ Interactive features work (wallet button, navigation)

### 3. Test Russian Routes (Primary Target)

Visit each route and verify:

| Route | Check |
|-------|-------|
| http://localhost:3000/ru | ✓ Homepage in Russian |
| http://localhost:3000/ru/nft | ✓ NFT page in Russian |
| http://localhost:3000/ru/staking | ✓ Staking in Russian |
| http://localhost:3000/ru/bot | ✓ Bot page in Russian |
| http://localhost:3000/ru/info | ✓ Info page in Russian |

**What to check:**
- ✓ Page loads without errors
- ✓ All text displays in **Cyrillic** (Russian characters)
- ✓ Font renders correctly (no boxes or fallback fonts)
- ✓ No console errors
- ✓ Interactive features work

### 4. Test Other Locales (Verification)

Quick spot-check for Spanish, Chinese, Dutch, Turkish, Hausa:

| Locale | Test URL | Expected |
|--------|----------|----------|
| Spanish | http://localhost:3000/es | Spanish text |
| Chinese | http://localhost:3000/zh | Chinese characters |
| Dutch | http://localhost:3000/nl | Dutch text |
| Turkish | http://localhost:3000/tr | Turkish text |
| Hausa | http://localhost:3000/ha | Hausa text |

**What to check:**
- ✓ Page loads (don't need to verify all routes, just homepage)
- ✓ Text is in correct language
- ✓ No console errors

### 5. Check Browser Console

Open DevTools (F12) → Console tab

**Good signs:**
- ✅ No errors
- ✅ No warnings about missing translation keys
- ✅ No hydration mismatch warnings

**Bad signs:**
- ❌ `Error: Cannot find messages for locale 'xx'`
- ❌ `Translation key 'xxx' not found`
- ❌ `Hydration failed because the initial UI does not match`

### 6. Test Build (Important!)

```bash
cd apps/pecky.me
pnpm build
```

**Expected output:**
```
✓ Compiled successfully
✓ Linting and checking validity of types
✓ Collecting page data
✓ Generating static pages (X/X)
✓ Finalizing page optimization

Route (app)                              Size     First Load JS
┌ ○ /                                    ...      ...
├ ○ /[locale]                           ...      ...
├ ○ /[locale]/bot                       ...      ...
├ ○ /[locale]/info                      ...      ...
├ ○ /[locale]/nft                       ...      ...
└ ○ /[locale]/staking                   ...      ...

○  (Static)  automatically rendered as static HTML
```

**What to check:**
- ✅ Build completes without errors
- ✅ All routes show `○ (Static)` or have revalidate times
- ✅ No "Error: Cannot read messages" during build

**If build fails:**
- Check error message carefully
- Most likely: Missing translation key or namespace file
- Look for the specific locale and namespace mentioned in error

---

## Common Issues & Solutions

### Issue 1: "Cannot find messages for locale 'xx'"

**Cause:** Namespace directory doesn't exist for that locale
**Solution:** Check that `messages/{locale}/` directory exists with all 10 namespace files

### Issue 2: "Translation key 'xxx' not found"

**Cause:** Missing key in translation file
**Solution:** Add the missing key to the appropriate namespace file

### Issue 3: Hydration mismatch error

**Cause:** Server-rendered HTML doesn't match client-rendered HTML
**Solution:** Ensure all interactive components use server-side translations or receive translations as props

### Issue 4: Russian text shows boxes/wrong font

**Cause:** Font subset not loaded properly
**Solution:** Verify `layout.tsx` has Cyrillic subsets in font configuration (should already be fixed)

### Issue 5: Build fails with "generateStaticParams" error

**Cause:** Page component isn't properly configured for static generation
**Solution:** Verify each page has `unstable_setRequestLocale(locale)` call

---

## What Success Looks Like

✅ **Dev server runs without errors**
✅ **All 35 routes load successfully** (7 locales × 5 pages)
✅ **Translations display in correct language**
✅ **Russian text renders with proper Cyrillic fonts**
✅ **Build completes successfully**
✅ **All pages are statically generated**

---

## After Successful Testing

Once all tests pass, you can:

### 1. Clean Up Old Translation Files

```bash
cd apps/pecky.me
rm messages/en.json
rm messages/es.json
rm messages/zh.json
rm messages/ru.json
rm messages/ha.json
rm messages/nl.json
rm messages/tr.json
```

### 2. Commit Changes

```bash
git add .
git commit -m "Optimize next-intl: namespace structure + Cyrillic fonts + SSR

- Split all 7 locales into namespace structure
- Added Cyrillic/Cyrillic-ext font subsets for Russian
- Removed client-side translation hydration
- Added static generation to all pages
- Expected: +70-100 performance improvement for /ru routes"
```

### 3. Deploy to Vercel

```bash
git push
```

Vercel will auto-deploy. Monitor Vercel Speed Insights for 24-48 hours to see performance improvements.

---

## Performance Verification (After Deploy)

Visit Vercel Speed Insights dashboard and compare:

**Before (documented issues):**
- `/ru` - Performance: 15
- `/ru/nft` - Performance: 5
- `/ru/staking` - Performance: 5

**Target (after optimization):**
- `/ru` - Performance: 85-95+
- `/ru/nft` - Performance: 85-95+
- `/ru/staking` - Performance: 85-95+

**Improvement:** +70-90 points expected

---

## Rollback Plan

If major issues occur, rollback with:

```bash
# View changes
git diff HEAD~1

# Rollback to previous commit
git reset --hard HEAD~1

# Force push (if already deployed)
git push --force
```

Alternatively, restore specific files:
```bash
git checkout HEAD~1 -- app/[locale]/layout.tsx
git checkout HEAD~1 -- i18n/request.ts
git checkout HEAD~1 -- messages/
```

---

## Support

If you encounter issues:
1. Check browser console for specific errors
2. Review build output for error messages
3. Compare working routes (en) vs broken routes
4. Check `OPTIMIZATION_COMPLETE_SUMMARY.md` for detailed implementation notes

---

**Last Updated:** 2025-12-28
**Status:** Ready for Testing
**Estimated Testing Time:** 15-20 minutes
