import { defineRouting } from 'next-intl/routing';
import { createNavigation } from 'next-intl/navigation';

export const routing = defineRouting({
  // A list of all locales that are supported
  // Future: 'zh' (Chinese), 'ru' (Russian)
  locales: ['en', 'es'],

  // Used when no locale matches
  defaultLocale: 'en',

  // Locale prefix strategy
  localePrefix: 'as-needed' // e.g., /en/about -> /about for default locale
});

// Lightweight wrappers around Next.js' navigation APIs
// that will consider the routing configuration
export const { Link, redirect, usePathname, useRouter } =
  createNavigation(routing);