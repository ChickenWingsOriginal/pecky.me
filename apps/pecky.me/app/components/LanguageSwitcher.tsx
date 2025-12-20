"use client";

import { useRouter, usePathname } from "@/i18n/routing";
import { useParams, useSearchParams } from "next/navigation";
import { css } from "@/styled-system/css";

// Alphabetically ordered by full language name
const languages = [
  { code: 'en', label: 'English', flag: '🇺🇸' },
  { code: 'es', label: 'Español', flag: '🇪🇸' },
  { code: 'ha', label: 'Hausa', flag: '🇳🇬' },
  { code: 'nl', label: 'Nederlands', flag: '🇳🇱' },
  { code: 'ru', label: 'Русский', flag: '🇷🇺' },
  { code: 'tr', label: 'Türkçe', flag: '🇹🇷' },
  { code: 'zh', label: '中文', flag: '🇨🇳' },
];

export function LanguageSwitcher() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams();
  const searchParams = useSearchParams();
  const currentLocale = (params.locale as string) || 'en';

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const locale = e.target.value;

    // Preserve query parameters when changing language
    const queryString = searchParams.toString();
    const pathnameWithQuery = queryString ? `${pathname}?${queryString}` : pathname;

    router.replace(pathnameWithQuery, { locale });
  };

  const currentLanguage = languages.find(lang => lang.code === currentLocale) || languages[0];

  return (
    <div className={css({ textAlign: "center" })}>
      <div
        className={css({
          position: "relative",
          maxW: "240px",
          mx: "auto"
        })}
      >
        <select
          value={currentLocale}
          onChange={handleLanguageChange}
          className={css({
            w: "100%",
            px: "1rem",
            py: "0.75rem",
            bg: "white",
            color: "#a06500",
            border: "2px solid #ffae00",
            borderRadius: "0.75rem",
            fontWeight: "600",
            fontSize: "0.9375rem",
            cursor: "pointer",
            transition: "all 0.25s ease",
            boxShadow: "0 2px 6px rgba(255, 174, 0, 0.15)",
            appearance: "none",
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23a06500' d='M6 9L1 4h10z'/%3E%3C/svg%3E")`,
            backgroundRepeat: "no-repeat",
            backgroundPosition: "right 0.875rem center",
            paddingRight: "2.5rem",
            _hover: {
              bg: "#fffbe8",
              borderColor: "#ff7700",
              boxShadow: "0 3px 10px rgba(255, 174, 0, 0.25)",
            },
            _focus: {
              outline: "none",
              borderColor: "#ff7700",
              boxShadow: "0 0 0 3px rgba(255, 119, 0, 0.1)",
            }
          })}
        >
          {languages.map((lang) => (
            <option key={lang.code} value={lang.code}>
              {lang.flag} {lang.label}
            </option>
          ))}
        </select>
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