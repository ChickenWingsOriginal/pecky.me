"use client";

import { css } from "@/styled-system/css";
import Image from "next/image";
import { PeckyNode } from "@/app/components/PeckyNode";

export default function NodePage() {
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
            src="/images/node-icon.png"
            alt="Node icon"
            width={96}
            height={96}
          />
        </div>
        <PeckyNode />
      </main>
    </div>
  );
}
