'use client';

import { css } from "@/styled-system/css";
import { useTranslations } from "next-intl";

export function EarnSection() {
  const t = useTranslations('home.earn');

  return (
    <div className={css({ textAlign: "center", mb: "30px" })}>
      <div className={css({ fontSize: "20px", fontWeight: "700", color: "#a06500", mb: "8px" })}>
        {t('heading')}
      </div>
      <div className={css({ fontSize: "16px", color: "#513d0a", lineHeight: "1.6" })}>
        {t('subtitle')}<br />
        {t('howTo')}
      </div>
    </div>
  );
}
