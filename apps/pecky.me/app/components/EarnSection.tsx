import { css } from "@/styled-system/css";

export function EarnSection() {
  return (
    <div className={css({ textAlign: "center", mb: "30px" })}>
      <div className={css({ fontSize: "20px", fontWeight: "700", color: "#a06500", mb: "8px" })}>
        Earn Pecky Coin – Daily or Monthly!
      </div>
      <div className={css({ fontSize: "16px", color: "#513d0a", lineHeight: "1.6" })}>
        Want to get free Pecky Coins?<br />
        It's easy. Just Own an NFT or Stake SUPRA.
      </div>
    </div>
  );
}
