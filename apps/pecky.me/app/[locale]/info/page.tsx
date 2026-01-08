import { css } from "@/styled-system/css";
import Image from "next/image";
import { BurnedPeckyDisplay } from "@/app/components/BurnedPeckyDisplay";
import { getBurnedPecky } from "@/app/lib/blockchain-data";
import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";

// Revalidate every hour (burned pecky data changes)
export const revalidate = 3600;

export async function generateMetadata({params}: {params: Promise<{locale: string}>}): Promise<Metadata> {
  const {locale} = await params;
  const t = await getTranslations({locale, namespace: 'info'});

  return {
    title: t('title'),
    description: t('description'),
    openGraph: {
      title: `PECKY - ${t('title')}`,
      description: t('ogDescription'),
      type: "website",
    },
  };
}

export default async function InfoPage({params}: {params: Promise<{locale: string}>}) {
  const {locale} = await params;
  setRequestLocale(locale);
  const burnedPecky = await getBurnedPecky();
  const t = await getTranslations('info');

  const burningSections = [
    {
      title: t('staking.title'),
      icon: "meridian.png",
      description: t.raw('staking.description'),
      width: 36,
      height: 36,
    },
    {
      title: t('nfts.title'),
      icon: "crystara.png",
      description: t.raw('nfts.description'),
      width: 115,
      height: 34,
    },
    {
      title: t('peckybot.title'),
      icon: "bot-icon.png",
      description: t.raw('peckybot.description'),
      width: 33,
      height: 36,
    },
  ];

  const partners = [
    {
      href: "https://supra.com/",
      src: "supra-icon.png",
      alt: "Supra",
      width: 37,
      height: 36,
    },
    {
      href: "https://ribbitwallet.com/",
      src: "ribbitwallet.png",
      alt: "Ribbit Wallet",
      width: 95,
      height: 36,
    },
    {
      href: "https://futurameridian.com",
      src: "meridian.png",
      alt: "Meridian",
      width: 36,
      height: 36,
    },
    {
      href: "https://app.dexlyn.com/?outputCurrency=31&inputCurrency=48",
      src: "dexlyn.png",
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
          {t('pageHeading')}
        </h1>

        <div
          className={css({
            fontSize: "15px",
            color: "#633e03",
            mb: "16px",
            textAlign: "center",
            lineHeight: "1.6",
          })}
          dangerouslySetInnerHTML={{ __html: t.raw('introText') }}
        />

        <BurnedPeckyDisplay burnedPecky={burnedPecky} />

        <div className={css({ textAlign: "center", mb: "20px" })}>
          <Image
            src="/images/peckyburning.png"
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
          {t('burningRitualHeading')}
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
          {t('partnersHeading')}
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
          {t('questionsText')}
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
              src="/images/discord-pecky.png"
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
              src="/images/xchickenwings.png"
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
