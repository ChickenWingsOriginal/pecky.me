import { getRequestConfig } from 'next-intl/server';
import { routing } from './routing';

export default getRequestConfig(async ({ requestLocale }) => {
  // This typically corresponds to the `[locale]` segment
  let locale = await requestLocale;

  // Ensure that a valid locale is used
  if (!locale || !routing.locales.includes(locale as any)) {
    locale = routing.defaultLocale;
  }

  // Load all namespaces from the new structure
  // This runs server-side only, not sent to client
  return {
    locale,
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
  };
});