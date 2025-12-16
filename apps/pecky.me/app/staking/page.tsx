import { css } from "@/styled-system/css";
import Image from "next/image";
import { RetroTabs } from "@/app/components/RetroTabs";
import { MeridianStaking } from "@/app/components/MeridianStaking";
import { PeckyNode } from "@/app/components/PeckyNode";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Staking",
  description:
    "Stake Supra on Meridian Node to earn 8% APY + daily Pecky rewards, or stake Pecky on Nodes for passive income. All staking rewards with zero fees.",
  openGraph: {
    title: "PECKY - Staking",
    description:
      "Earn rewards by staking Supra or Pecky tokens. Meridian Node offers 8% APY plus daily Pecky. Node staking provides passive Pecky income.",
    type: "website",
  },
};

export default function StakingPage() {
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
      <main
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
            src="/images/staking-icon.png"
            alt="Staking icon"
            width={96}
            height={96}
          />
        </div>
        <RetroTabs
          tabs={[
            {
              title: "Pecky Staking",
              content: <PeckyNode />,
            },
            {
              title: "Meridian Staking",
              content: <MeridianStaking />,
            },
          ]}
        />
      </main>
    </div>
  );
}
