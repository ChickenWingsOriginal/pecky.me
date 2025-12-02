import { css } from "@/styled-system/css";
import Image from "next/image";
import { RetroBox } from "./RetroBox";

export function PeckyIntro() {
  return (
    <RetroBox className={css({ textAlign: "center" })}>
      <div className={css({ mb: "20px" })}>
        <Image
          src="/images/pecky-logo.png"
          alt="Pecky Logo"
          width={80}
          height={80}
          style={{ margin: "0 auto" }}
        />
      </div>
      <h2 className={css({ fontSize: "24px", fontWeight: "700", color: "#4a2c00", mb: "16px" })}>
        Say hi to Pecky!
      </h2>
      <p className={css({ fontSize: "14px", color: "#513d0a", lineHeight: "1.6", mb: "16px" })}>
        Pecky was just a normal chicken… until he ate a weird Dorito behind the barn. Now he thinks he has a secret mission to "uncrack the egg of truth" — whatever that means. He's sure the rooster is a spy and fights scarecrows like they're evil robots.
      </p>
      <p className={css({ fontSize: "14px", color: "#513d0a", lineHeight: "1.6" })}>
        No teamtokens, No premine, Pecky is 100% owned by the Supra community.
      </p>
    </RetroBox>
  );
}
