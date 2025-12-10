"use client";

import { css } from "@/styled-system/css";
import Image from "next/image";
import { useGlobalData } from "@/app/context/GlobalDataContext";
import { formatMicroUnits } from "@/app/utils/format";
import { RetroBox } from "@/app/components/RetroBox";

export default function InfoPage() {
  const { burnedPecky } = useGlobalData();

  const burningSections = [
    {
      title: "STAKING",
      icon: "Meridian.png",
      description:
        "Stake your $SUPRA on the <b>Meridian node</b> and get the same 8% node rewards as anywhere else,<br>but you also get the same amount of $Pecky as your daily staked $SUPRA! <br>Even better: <b>50% of the node rewards</b> are used to buy up and burn $Pecky for the community!",
      width: 36,
      height: 36,
    },
    {
      title: "NFTs",
      icon: "crystara.png",
      description:
        "All NFTs sold on the Crystara marketplace have a 5% royalty.<br>Instead of keeping these fees, <b>we use every penny to buy and burn Pecky!</b>",
      width: 115,
      height: 34,
    },
    {
      title: "PECKYBOT",
      icon: "bot-icon.png",
      description:
        "On Discord, our bot helps NFT traders by sending instant alerts when:<br>• someone bids on your NFT<br>• a top collection NFT is listed below your set price<br>All Pecky used as gas for the bot <b>is instantly sent to the burn pile!</b>",
      width: 33,
      height: 36,
    },
  ];

  const partners = [
    {
      href: "https://supra.com/",
      src: "Supra-icon.png",
      alt: "Supra",
      width: 37,
      height: 36,
    },
    {
      href: "https://ribbitwallet.com/",
      src: "Ribbitwallet.png",
      alt: "Ribbit Wallet",
      width: 95,
      height: 36,
    },
    {
      href: "https://futurameridian.com",
      src: "Meridian.png",
      alt: "Meridian",
      width: 36,
      height: 36,
    },
    {
      href: "https://app.dexlyn.com/?outputCurrency=31&inputCurrency=48",
      src: "Dexlyn.png",
      alt: "Dexlyn",
      width: 34,
      height: 36,
    },
    {
      href: "https://crystara.trade/trade/chickenwings",
      src: "crystara.png",
      alt: "Crystara",
      width: 122,
      height: 36,
    },
  ];

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
      <main className={css({ maxW: "520px", w: "90%", mt: "40px" })}>
        <div className={css({ textAlign: "center", mb: "20px" })}>
          <Image
            src="/images/info-icon.png"
            alt="Pecky Egg"
            width={100}
            height={100}
            style={{ margin: "0 auto" }}
          />
        </div>

        <h1
          className={css({
            fontSize: "24px",
            fontWeight: "700",
            color: "#a06500",
            textAlign: "center",
            mb: "16px",
          })}
        >
          Welcome to the Info Page
        </h1>

        <div
          className={css({
            fontSize: "15px",
            color: "#633e03",
            mb: "16px",
            textAlign: "center",
            lineHeight: "1.6",
          })}
        >
          Pecky was hatched from the ChickenWings NFT collection. <br />
          Pecky is a true <b>community token</b> with <b>zero team tokens</b>.
          Hold your Peckys tight, because we burn everything we can get our
          wings on!
        </div>

        <RetroBox className={css({ textAlign: "center" })}>
          <div
            className={css({
              fontSize: "18px",
              fontWeight: "700",
              color: "#4a2c00",
              mb: "8px",
            })}
          >
            🔥 Total Pecky Burned
          </div>
          <div
            className={css({
              fontSize: "20px",
              fontWeight: "700",
              color: "#a06500",
            })}
          >
            {burnedPecky !== null
              ? formatMicroUnits(burnedPecky) + " $Pecky"
              : "–"}
          </div>
        </RetroBox>

        <div className={css({ textAlign: "center", mb: "20px" })}>
          <Image
            src="/images/Peckyburning.png"
            alt="Pecky Burning"
            width={75}
            height={75}
            style={{ margin: "0 auto" }}
          />
        </div>

        <div
          className={css({
            fontSize: "16px",
            color: "#a06500",
            fontWeight: "600",
            textAlign: "center",
            mb: "20px",
          })}
        >
          How does our burning ritual work?
        </div>

        {burningSections.map((section) => (
          <div key={section.title} className={css({ mb: "20px" })}>
            <div
              className={css({
                fontWeight: "700",
                color: "#ffae00",
                fontSize: "16px",
                textAlign: "center",
                letterSpacing: "1px",
                mb: "8px",
              })}
            >
              {section.title}
            </div>
            <div className={css({ textAlign: "center", mb: "8px" })}>
              <Image
                src={`/images/${section.icon}`}
                alt={section.title}
                width={section.width}
                height={section.height}
                style={{ margin: "0 auto" }}
              />
            </div>
            <div
              className={css({
                fontSize: "14.5px",
                color: "#42310b",
                textAlign: "center",
                lineHeight: "1.6",
              })}
              dangerouslySetInnerHTML={{ __html: section.description }}
            />
          </div>
        ))}

        <div
          className={css({
            margin: "25px 0 8px 0",
            fontWeight: "700",
            color: "#ed7a00",
            fontSize: "16px",
            textAlign: "center",
          })}
        >
          Our partners:
        </div>

        <div
          className={css({
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "center",
            gap: "25px 28px",
            mb: "20px",
          })}
        >
          {partners.map((partner) => (
            <a
              key={partner.alt}
              href={partner.href}
              target="_blank"
              rel="noopener noreferrer"
              title={partner.alt}
            >
              <Image
                src={`/images/${partner.src}`}
                alt={partner.alt}
                width={partner.width}
                height={partner.height}
              />
            </a>
          ))}
        </div>

        <div
          className={css({
            margin: "22px 0 9px 0",
            textAlign: "center",
            fontSize: "15px",
          })}
        >
          Have questions? Join our Discord or check us out on X!
        </div>

        <div
          className={css({
            display: "flex",
            justifyContent: "center",
            gap: "25px",
          })}
        >
          <a
            href="https://discord.gg/fG8zcsGA6n"
            target="_blank"
            rel="noopener noreferrer"
            title="Discord"
          >
            <Image
              src="/images/Discord-pecky.png"
              alt="Discord"
              width={37}
              height={37}
            />
          </a>
          <a
            href="https://x.com/Chickens_sup"
            target="_blank"
            rel="noopener noreferrer"
            title="X (Twitter)"
          >
            <Image
              src="/images/Xchickenwings.png"
              alt="Twitter/X"
              width={34}
              height={34}
            />
          </a>
        </div>
      </main>
    </div>
  );
}
