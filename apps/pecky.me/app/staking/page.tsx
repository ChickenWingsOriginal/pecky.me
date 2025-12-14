"use client";

import { css } from "@/styled-system/css";
import Image from "next/image";
import { RetroTabs } from "@/app/components/RetroTabs";
import { MeridianStaking } from "@/app/components/MeridianStaking";
import { PeckyNode } from "@/app/components/PeckyNode";

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
              title: "Meridian Staking",
              content: <MeridianStaking />,
            },
            {
              title: "Pecky Node",
              content: <PeckyNode />,
            },
          ]}
        />
      </main>
    </div>
  );
}
