import { css } from "@/styled-system/css";
import { PeckyIntro } from "@/app/components/PeckyIntro";
import { QuickLinks } from "@/app/components/QuickLinks";
import { DiscordLinking } from "@/app/components/DiscordLinking";
import { EarnSection } from "@/app/components/EarnSection";
import { Tokenomics } from "@/app/components/Tokenomics";
import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from 'next-intl/server';

// Enable ISR with 1 hour revalidation (allows client components)
export const revalidate = 3600;

export async function generateMetadata({params}: {params: Promise<{locale: string}>}): Promise<Metadata> {
  const {locale} = await params;
  const t = await getTranslations({locale, namespace: 'home'});

  return {
    title: t('title'),
    description: t('description'),
  };
}

export default async function Home({params}: {params: Promise<{locale: string}>}) {
  const {locale} = await params;
  setRequestLocale(locale);

  const t = await getTranslations('home');

  return (
    <div className={css({ minH: "100vh", bg: "#fff3da", display: "flex", flexDir: "column", alignItems: "center", pb: "100px" })}>
      <main className={css({ maxW: "520px", w: "90%", mt: "40px" })}>
        <PeckyIntro />
        <QuickLinks />

        <h1 className={css({ fontSize: "28px", fontWeight: "700", color: "#a06500", textAlign: "center", mb: "30px" })}>
          {t('dappTitle')}
        </h1>

        <DiscordLinking />
        <EarnSection />
        <Tokenomics />
      </main>
    </div>
  );
}
