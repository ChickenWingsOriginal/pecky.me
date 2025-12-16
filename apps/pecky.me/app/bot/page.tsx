import { BotClient } from "./BotClient";
import type { Metadata } from "next";
import { css } from "@/styled-system/css";
import Image from "next/image";
import { RetroBox } from "../components/RetroBox";

export const metadata: Metadata = {
  title: "PeckyBot",
  description:
    "Activate PeckyBot on Discord for NFT bid notifications and Crystara marketplace alerts. Pay 5,000 $SUPRA to activate, then extend with Pecky tokens.",
  openGraph: {
    title: "PECKY - PeckyBot",
    description:
      "Get exclusive Discord bot access for NFT notifications and marketplace alerts.",
    type: "website",
  },
};

export default function BotPage() {
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
              PECKYBOT on Discord
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
              Get exclusive bot access:
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
              <li>Get notifications when someone bids on your NFT</li>
              <li>
                Set alerts for any top 25 NFT on Crystara with your rarity,
                below your chosen price
              </li>
              <li>...and more features soon!</li>
            </ul>
          </div>

          <div
            className={css({ fontSize: "14px", color: "#a06500", mb: "8px" })}
          >
            Pay{" "}
            <span className={css({ fontWeight: "700" })}>
              one time 5,000 $SUPRA
            </span>{" "}
            to activate the bot.
            <br />
            After that, you only need Pecky as gas to keep the bot active.
          </div>
          <div
            className={css({
              fontSize: "12px",
              color: "#ed7a00",
              fontWeight: "600",
            })}
          >
            All $Pecky used for the bot will be burned.
          </div>
        </RetroBox>
        <BotClient />
      </div>
    </div>
  );
}
