import { css } from "@/styled-system/css";
import Image from "next/image";
import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { getNftPoolRemaining } from "@/app/lib/blockchain-data";
import { RetroBox } from "@/app/components/RetroBox";
import { formatMillions } from "@/app/utils/format";
import { NFTPageClient } from "./NFTPageClient";

// Enable ISR with 1 hour revalidation (allows client components)
export const revalidate = 3600;

const NFT_POOL_TOTAL = 450_000_000_000;

const rarities = [
  {
    name: "Common",
    count: 250,
    percent: "1%",
    color: "#0099ff",
    monthlyPercent: 0.00004,
  },
  {
    name: "Rare",
    count: 125,
    percent: "1%",
    color: "#25c36a",
    monthlyPercent: 0.00008,
  },
  {
    name: "Epic",
    count: 75,
    percent: "0.75%",
    color: "#ff53a2",
    monthlyPercent: 0.0001,
  },
  {
    name: "Legendary",
    count: 40,
    percent: "0.75%",
    color: "#ffe270",
    monthlyPercent: 0.00018,
  },
  {
    name: "Mythic",
    count: 10,
    percent: "0.5%",
    color: "#a259ff",
    monthlyPercent: 0.0005,
  },
];

export async function generateMetadata({params}: {params: Promise<{locale: string}>}): Promise<Metadata> {
  const {locale} = await params;
  const t = await getTranslations({locale, namespace: 'nft'});

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

export default async function NFTPage({params}: {params: Promise<{locale: string}>}) {
  const {locale} = await params;
  setRequestLocale(locale);

  // Fetch NFT pool data server-side for better SEO and performance
  const nftPoolRemaining = await getNftPoolRemaining();
  const t = await getTranslations('nft');

  const poolRemainingRegular = nftPoolRemaining
    ? Number(nftPoolRemaining) / 1_000_000
    : 0;
  const poolRemainingPercentage =
    NFT_POOL_TOTAL > 0
      ? Math.max(
          0,
          Math.min(100, (poolRemainingRegular / NFT_POOL_TOTAL) * 100),
        )
      : 0;
  const poolRemainingFormatted = poolRemainingRegular.toLocaleString("en-US", {
    maximumFractionDigits: 0,
  });

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
      <div
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
            src="/images/nft-icon.png"
            alt="NFT Icon"
            width={100}
            height={100}
            style={{ margin: "0 auto", marginBottom: "12px" }}
          />
        </div>

        {/* Static intro section - SSR */}
        <RetroBox>
          <div className={css({ textAlign: "center", mb: "20px" })}>
            <h2
              className={css({
                fontSize: "24px",
                fontWeight: "700",
                color: "#a06500",
              })}
            >
              {t('heading')}
            </h2>
          </div>
          <div
            className={css({
              p: "4px",
              mb: "20px",
            })}
          >
            <div
              className={css({
                fontSize: "14px",
                color: "#513d0a",
                lineHeight: "1.65",
              })}
            >
              {t('subtitle1')} <b>{t('subtitle2')}</b> {t('subtitle3')}
              <br />
              {t('buyOn')} <b>Crystara</b>.
            </div>
          </div>
        </RetroBox>

        {/* NFT Pool Vault - SSR with server-fetched data */}
        <RetroBox>
          <div
            className={css({
              fontSize: "14px",
              fontWeight: "600",
              color: "#a06500",
              mb: "10px",
              textAlign: "center",
            })}
          >
            {t('vaultHeading')}
          </div>
          <div
            className={css({
              w: "100%",
              h: "24px",
              bg: "#e8e8e8",
              borderRadius: "10px",
              overflow: "hidden",
              mb: "8px",
            })}
          >
            <div
              style={{
                height: "100%",
                width: `${poolRemainingPercentage}%`,
                background: "linear-gradient(to right, #ffaa00, #ff7700)",
                transition: "width 0.3s ease",
              }}
            />
          </div>
          <div
            className={css({
              fontSize: "12px",
              color: "#b48512",
              textAlign: "center",
              mb: "16px",
            })}
          >
            {t('remaining', { amount: poolRemainingFormatted })}
          </div>

          <hr
            style={{
              margin: "12px 0",
              borderTop: "1.5px dashed #ffd36e",
              opacity: 0.6,
            }}
          />

          {/* Wallet-connected features - Client Component */}
          <NFTPageClient />
        </RetroBox>

        {/* Rarity Rewards Table - SSR with static data */}
        <RetroBox>
          <div className={css({ textAlign: "center" })}>
            <h3
              className={css({
                color: "#ff7700",
                margin: "0 0 8px 0",
                fontSize: "15px",
                fontWeight: "700",
              })}
            >
              {t('rewardsTitle')}
            </h3>
            <div
              className={css({
                fontSize: "12px",
                mb: "12px",
                color: "#b48512",
              })}
            >
              {t.rich('poolDescription', {
                bold: (chunks) => <b>{chunks}</b>
              })}
            </div>
            <div className={css({ display: "grid", gap: "8px", mb: "12px" })}>
              {rarities.map((rarity) => (
                <div
                  key={rarity.name}
                  style={{
                    backgroundColor: "white",
                    border: `2px solid ${rarity.color}`,
                    padding: "10px 12px",
                    borderRadius: "8px",
                    textAlign: "center",
                    fontSize: "13px",
                    fontWeight: "600",
                    transition: "transform 0.2s",
                    color: "#a06500",
                  }}
                >
                  <div
                    style={{
                      fontWeight: "700",
                      marginBottom: "4px",
                      color: "#a06500",
                    }}
                  >
                    {rarity.name}
                  </div>
                  <div
                    style={{
                      fontSize: "11px",
                      opacity: "0.9",
                      color: "#a06500",
                      marginBottom: "3px",
                    }}
                  >
                    {rarity.count} {t('nftsPerMonth', { percent: rarity.percent })}
                  </div>
                  <div style={{ fontSize: "11px", color: "#a06500" }}>
                    {t('monthlyReward')}{" "}
                    {formatMillions(
                      Number(
                        (
                          Math.round(
                            Number(nftPoolRemaining) *
                              rarity.monthlyPercent,
                          ) / 1_000_000
                        ).toFixed(2),
                      ),
                    )}
                    $Pecky
                  </div>
                </div>
              ))}
            </div>

            <div className={css({ textAlign: "center", mb: "12px" })}>
              <div
                className={css({
                  fontSize: "13px",
                  fontWeight: "600",
                  color: "#a06500",
                  mb: "8px",
                })}
              >
                {t('hodlPower')}
              </div>
              <a
                href="https://crystara.trade/trade/chickenwings"
                target="_blank"
                rel="noopener noreferrer"
                className={css({
                  fontSize: "13px",
                  color: "#ff7700",
                  fontWeight: "600",
                  textDecoration: "none",
                  _hover: { opacity: "0.8" },
                })}
              >
                {t('tradeOnCrystara')}
              </a>
            </div>
          </div>
        </RetroBox>
      </div>
    </div>
  );
}