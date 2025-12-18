import { BotClient } from "./BotClient";
import type { Metadata } from "next";
import { css } from "@/styled-system/css";
import Image from "next/image";
import { RetroBox } from "@/app/components/RetroBox";
import { useTranslations } from "next-intl";
import { getTranslations } from "next-intl/server";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('bot');

  return {
    title: t('pageTitle'),
    description: t('pageDescription'),
    openGraph: {
      title: `PECKY - ${t('pageTitle')}`,
      description: t('description'),
      type: "website",
    },
  };
}

export default function BotPage() {
  const t = useTranslations('bot');
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
            src="/images/bot-icon.png"
            alt="NFT Icon"
            width={100}
            height={108}
            style={{ margin: "0 auto", marginBottom: "12px" }}
          />
        </div>
        <RetroBox>
          <div className={css({ textAlign: "center", mb: "16px" })}>
            <h1
              className={css({
                fontSize: "24px",
                fontWeight: "700",
                color: "#ff9000",
                mb: "12px",
              })}
            >
              {t('heading')}
            </h1>
          </div>

          <div className={css({ mb: "14px" })}>
            <div
              className={css({
                fontSize: "14px",
                fontWeight: "600",
                color: "#2e2e2e",
                mb: "10px",
              })}
            >
              {t('exclusiveAccess')}
            </div>
            <ul
              className={css({
                fontSize: "13px",
                color: "#b48512",
                pl: "20px",
                lineHeight: "1.8",
                m: "0",
                mb: "12px",
              })}
            >
              <li>{t('feature1')}</li>
              <li>{t('feature2')}</li>
              <li>{t('feature3')}</li>
            </ul>
          </div>

          <div
            className={css({ fontSize: "14px", color: "#a06500", mb: "8px" })}
          >
            {t('activationCost')}{" "}
            <span className={css({ fontWeight: "700" })}>
              {t('activationAmount')}
            </span>{" "}
            {t('activationText')}
            <br />
            {t('gasText')}
          </div>
          <div
            className={css({
              fontSize: "12px",
              color: "#ed7a00",
              fontWeight: "600",
            })}
          >
            {t('burnNotice')}
          </div>
        </RetroBox>
        <BotClient />
      </div>
    </div>
  );
}
