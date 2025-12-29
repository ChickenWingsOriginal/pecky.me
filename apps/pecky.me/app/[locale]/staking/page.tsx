import { css } from "@/styled-system/css";
import Image from "next/image";
import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { getActiveNodes } from "@/app/lib/blockchain-data";
import { StakingPageClient } from "./StakingPageClient";

// Revalidate every hour (staking data can change)
export const revalidate = 3600;

export async function generateMetadata({params}: {params: Promise<{locale: string}>}): Promise<Metadata> {
  const {locale} = await params;
  const t = await getTranslations({locale, namespace: 'staking'});

  return {
    title: t('title'),
    description: t('description'),
    openGraph: {
      title: `PECKY - ${t('title')}`,
      description: t('description'),
      type: "website",
    },
  };
}

interface StakingPageProps {
  params: Promise<{locale: string}>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function StakingPage({ params, searchParams }: StakingPageProps) {
  const {locale} = await params;
  setRequestLocale(locale);
  // Fetch nodes server-side for better performance and SEO
  const allNodes = await getActiveNodes();

  // Read query params
  const searchParamsResolved = await searchParams;
  const nodeParam = typeof searchParamsResolved.node === 'string' ? searchParamsResolved.node : undefined;

  // Validate node param against available nodes
  const initialNodeId = nodeParam && allNodes.some(n => n.nodeId === nodeParam)
    ? nodeParam
    : null;
  
  const t = await getTranslations('staking');

  return (
    <div
      className={css({
        minH: "100vh",
        bg: "#fff3da",
        display: "flex",
        flexDir: "column",
        alignItems: "center",
        pb: "100px",
      })}
    >
      <main
        className={css({
          maxW: "520px",
          w: "90%",
          mt: "40px",
          display: "flex",
          flexDir: "column",
          gap: "4px",
        })}
      >
        <div className={css({ textAlign: "center", mb: "20px" })}>
          <Image
            src="/images/staking-icon.png"
            alt="Staking icon"
            width={96}
            height={96}
          />
        </div>
        <StakingPageClient
          initialNodes={allNodes}
          initialNodeId={initialNodeId}
          peckyStakingLabel={t('peckyStaking')}
          meridianStakingLabel={t('meridianStaking')}
        />
      </main>
    </div>
  );
}
