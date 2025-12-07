import { css } from "@/styled-system/css";
import Image from "next/image";

export function QuickLinks() {
  const links = [
    {
      href: "https://crystara.trade/marketplace/chickenwings",
      src: "/images/chickenwingsnft.png",
      alt: "ChickenWings NFT",
    },
    {
      href: "https://x.com/Chickens_sup",
      src: "/images/xchickenwings.png",
      alt: "X (Twitter)",
    },
    {
      href: "https://discord.gg/fG8zcsGA6n",
      src: "/images/discord-pecky.png",
      alt: "Discord",
    },
    {
      href: "https://app.dexlyn.com/?inputCurrency=SUPRA&amount=&outputCurrency=PECKY",
      src: "/images/dexlyn.png",
      alt: "Dexlyn",
    },
  ];

  return (
    <div className={css({ display: "flex", justifyContent: "center", gap: "20px", mb: "30px", flexWrap: "wrap" })}>
      {links.map((link) => (
        <a
          key={link.href}
          href={link.href}
          target="_blank"
          rel="noopener noreferrer"
          className={css({ display: "flex", alignItems: "center", justifyContent: "center" })}
        >
          <Image
            src={link.src}
            alt={link.alt}
            width={50}
            height={50}
          />
        </a>
      ))}
    </div>
  );
}
