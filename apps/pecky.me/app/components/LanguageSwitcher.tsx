"use client";

import { useRouter, usePathname } from "@/i18n/routing";
import { useParams } from "next/navigation";
import { css } from "@/styled-system/css";

const languages = [
  { code: 'en', label: 'EN', flag: '🇺🇸' },
  { code: 'es', label: 'ES', flag: '🇪🇸' },
];

export function LanguageSwitcher() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams();
  const currentLocale = params.locale as string;

  const handleLanguageChange = (locale: string) => {
    router.replace(pathname, { locale });
  };

  return (
    <div className={css({ display: "flex", gap: "0.5rem" })}>
      {languages.map((lang) => (
        <button
          key={lang.code}
          onClick={() => handleLanguageChange(lang.code)}
          className={css({
            px: "0.75rem",
            py: "0.5rem",
            bg: currentLocale === lang.code ? "#ff7700" : "white",
            color: currentLocale === lang.code ? "white" : "#a06500",
            border: "1.5px solid #ffae00",
            borderRadius: "0.5rem",
            fontWeight: "600",
            fontSize: "0.875rem",
            cursor: "pointer",
            transition: "all 0.2s",
            _hover: {
              bg: currentLocale === lang.code ? "#ff7700" : "#fff3da",
              transform: "scale(1.05)",
            },
            display: "flex",
            alignItems: "center",
            gap: "0.25rem",
          })}
        >
          <span>{lang.flag}</span>
          <span>{lang.label}</span>
        </button>
      ))}
    </div>
  );
}