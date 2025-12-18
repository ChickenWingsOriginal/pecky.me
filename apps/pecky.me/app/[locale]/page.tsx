import { css } from "@/styled-system/css";
import { PeckyIntro } from "@/app/components/PeckyIntro";
import { QuickLinks } from "@/app/components/QuickLinks";
import { DiscordLinking } from "@/app/components/DiscordLinking";
import { EarnSection } from "@/app/components/EarnSection";
import { Tokenomics } from "@/app/components/Tokenomics";
import type { Metadata } from "next";
import { getTranslations } from 'next-intl/server';
import { useTranslations } from 'next-intl';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('home');

  return {
    title: t('title'),
    description: t('description'),
  };
}

export default function Home() {
  const t = useTranslations('home');

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
