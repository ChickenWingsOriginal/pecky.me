import { css } from "@/styled-system/css";
import Image from "next/image";
import { RetroBox } from "./RetroBox";
import { useTranslations } from "next-intl";

export function PeckyIntro() {
  const t = useTranslations('home.intro');

  return (
    <RetroBox className={css({ textAlign: "center" })}>
      <div className={css({ mb: "20px" })}>
        <Image
          src="/images/pecky-logo.png"
          alt="Pecky Logo"
          width={96}
          height={96}
        />
      </div>
      <h2
        className={css({
          fontSize: "24px",
          fontWeight: "700",
          color: "#4a2c00",
          mb: "16px",
        })}
      >
        {t('greeting')}
      </h2>
      <p
        className={css({
          fontSize: "14px",
          color: "#513d0a",
          lineHeight: "1.6",
          mb: "16px",
        })}
      >
        {t('story')}
      </p>
      <p
        className={css({
          fontSize: "14px",
          color: "#513d0a",
          lineHeight: "1.6",
        })}
      >
        {t('tokenInfo')}
      </p>
    </RetroBox>
  );
}
