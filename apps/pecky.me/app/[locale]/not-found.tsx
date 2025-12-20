"use client";

import { css } from "@/styled-system/css";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import Image from "next/image";

export default function NotFound() {
  const t = useTranslations("notFound");

  return (
    <div
      className={css({
        minH: "100vh",
        bg: "#fff3da",
        display: "flex",
        flexDir: "column",
        alignItems: "center",
        justifyContent: "center",
        pb: "100px",
      })}
    >
      <main
        className={css({
          maxW: "520px",
          w: "90%",
          textAlign: "center",
          display: "flex",
          flexDir: "column",
          alignItems: "center",
          gap: "24px",
        })}
      >
        {/* Pecky looking confused */}
        <div className={css({ mb: "20px" })}>
          <Image
            src="/images/pecky-icon.png"
            alt="Pecky"
            width={120}
            height={120}
            className={css({
              opacity: "0.8",
              filter: "grayscale(0.3)",
            })}
          />
        </div>

        {/* 404 Heading */}
        <h1
          className={css({
            fontSize: "48px",
            fontWeight: "700",
            color: "#ff7700",
            mb: "0",
          })}
        >
          404
        </h1>

        {/* Message */}
        <h2
          className={css({
            fontSize: "24px",
            fontWeight: "700",
            color: "#a06500",
            mb: "8px",
          })}
        >
          {t("heading")}
        </h2>

        <p
          className={css({
            fontSize: "16px",
            color: "#b48512",
            mb: "24px",
            lineHeight: "1.6",
          })}
        >
          {t("message")}
        </p>

        {/* Back to Home Button */}
        <Link href="/">
          <button
            className={css({
              px: "32px",
              py: "14px",
              bg: "linear-gradient(135deg, #ffaa00, #ff7700)",
              color: "white",
              border: "none",
              borderRadius: "12px",
              fontWeight: "600",
              fontSize: "16px",
              cursor: "pointer",
              transition: "all 0.25s ease",
              boxShadow: "0 4px 12px rgba(255, 119, 0, 0.3)",
              _hover: {
                transform: "translateY(-2px)",
                boxShadow: "0 6px 16px rgba(255, 119, 0, 0.4)",
              },
              _active: {
                transform: "translateY(0)",
              },
            })}
          >
            {t("homeButton")}
          </button>
        </Link>
      </main>
    </div>
  );
}