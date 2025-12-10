import { css } from "@/styled-system/css";
import Image from "next/image";

export function QuickLinks() {
  const links = [
    {
      href: "https://crystara.trade/marketplace/chickenwings",
      src: "/images/chickenwingsnft.png",
      alt: "ChickenWings NFT",
      width: 50,
      height: 50,
    },
    {
      href: "https://x.com/Chickens_sup",
      src: "/images/xchickenwings.png",
      alt: "X (Twitter)",
      width: 50,
      height: 50,
    },
    {
      href: "https://discord.gg/fG8zcsGA6n",
      src: "/images/discord-pecky.png",
      alt: "Discord",
      width: 50,
      height: 50,
    },
    {
      href: "https://app.dexlyn.com/?outputCurrency=31&inputCurrency=48",
      src: "/images/dexlyn-logo.svg",
      alt: "Dexlyn",
      width: 121.856,
      height: 44.8,
    },
    {
      href: "https://app.atmos.ag/en/swap?sellToken=0x0000000000000000000000000000000000000000000000000000000000000001::supra_coin::SupraCoin&buyToken=0xaa925a2232144c11dfe855178e1d252a8d0d4f51f5572fc0ec34efa6333952ae",
      src: "/images/atmos-logo.svg",
      alt: "Atmos",
      width: 172.8,
      height: 44.8,
    },
  ];

  return (
    <div
      className={css({
        display: "flex",
        justifyContent: "center",
        gap: "14px",
        mb: "30px",
        flexWrap: "wrap",
      })}
    >
      {links.map((link) => (
        <a
          key={link.href}
          href={link.href}
          target="_blank"
          rel="noopener noreferrer"
          className={css({
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          })}
        >
          <Image
            src={link.src}
            alt={link.alt}
            width={link.width}
            height={link.height}
          />
        </a>
      ))}
    </div>
  );
}
