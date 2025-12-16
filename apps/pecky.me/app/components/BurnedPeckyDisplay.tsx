"use client";

import { css } from "@/styled-system/css";
import { formatMicroUnits } from "@/app/utils/format";
import { RetroBox } from "@/app/components/RetroBox";

interface BurnedPeckyDisplayProps {
  burnedPecky: bigint;
}

export function BurnedPeckyDisplay({ burnedPecky }: BurnedPeckyDisplayProps) {

  return (
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
        {formatMicroUnits(burnedPecky)} $Pecky
      </div>
    </RetroBox>
  );
}