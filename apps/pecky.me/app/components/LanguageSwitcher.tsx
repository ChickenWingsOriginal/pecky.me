"use client";

import { useRouter, usePathname } from "@/i18n/routing";
import { useParams } from "next/navigation";
import { css } from "@/styled-system/css";

const languages = [
  { code: 'en', label: 'EN', flag: '🇺🇸' },
  { code: 'es', label: 'ES', flag: '🇪🇸' },
  { code: 'zh', label: '中文', flag: '🇨🇳' },
  { code: 'ru', label: 'RU', flag: '🇷🇺' },
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
    <div className={css({ textAlign: "center" })}>
      <div
        className={css({
          display: "grid",
          gridTemplateColumns: "repeat(2, 1fr)",
          gap: "0.5rem",
          maxW: "200px",
          mx: "auto"
        })}
      >
        {languages.map((lang) => {
          const isActive = currentLocale === lang.code;
          return (
            <button
              key={lang.code}
              onClick={() => handleLanguageChange(lang.code)}
              className={css({
                position: "relative",
                px: "0.625rem",
                py: "0.5rem",
                bg: isActive
                  ? "linear-gradient(135deg, #ffaa00, #ff7700)"
                  : "white",
                color: isActive ? "white" : "#a06500",
                border: isActive ? "2px solid #ff7700" : "2px solid #ffae00",
                borderRadius: "0.625rem",
                fontWeight: "700",
                fontSize: "0.8125rem",
                cursor: "pointer",
                transition: "all 0.25s ease",
                boxShadow: isActive
                  ? "0 3px 8px rgba(255, 119, 0, 0.3)"
                  : "0 2px 4px rgba(0, 0, 0, 0.08)",
                _hover: {
                  bg: isActive
                    ? "linear-gradient(135deg, #ffaa00, #ff7700)"
                    : "#fffbe8",
                  transform: "translateY(-2px)",
                  boxShadow: isActive
                    ? "0 4px 12px rgba(255, 119, 0, 0.4)"
                    : "0 3px 8px rgba(255, 174, 0, 0.2)",
                },
                _active: {
                  transform: "translateY(0)",
                },
                display: "flex",
                flexDir: "column",
                alignItems: "center",
                gap: "0.125rem",
              })}
            >
              <span className={css({ fontSize: "1.25rem", lineHeight: "1" })}>
                {lang.flag}
              </span>
              <span className={css({ fontSize: "0.6875rem", letterSpacing: "0.02em" })}>
                {lang.label}
              </span>
              {isActive && (
                <div
                  className={css({
                    position: "absolute",
                    top: "-4px",
                    right: "-4px",
                    w: "8px",
                    h: "8px",
                    bg: "#4caf50",
                    borderRadius: "50%",
                    border: "2px solid white",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.2)"
                  })}
                />
              )}
            </button>
          );
        })}
      </div>
      <div
        className={css({
          mt: "0.5rem",
          fontSize: "0.625rem",
          color: "#b48512",
          fontStyle: "italic",
          opacity: "0.8"
        })}
      >
        AI-assisted translations
      </div>
    </div>
  );
}