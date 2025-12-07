import { css } from "@/styled-system/css";
import { RetroBox } from "./RetroBox";

export function Tokenomics() {
  const tokenomicsData = [
    { label: "45%", desc: "NFT Holders" },
    { label: "10%", desc: "Airdrop" },
    { label: "20%", desc: "Liquidity Pool", note: "(LP tokens are burned)" },
    { label: "15%", desc: "Staking rewards" },
    { label: "10%", desc: "Marketing & Community" },
    { label: "0%", desc: "Team & Founders" },
  ];

  return (
    <RetroBox>
      <h3 className={css({ fontSize: "20px", fontWeight: "700", color: "#a06500", mb: "16px", textAlign: "center" })}>
        $Pecky Tokenomics
      </h3>
      <div className={css({ fontSize: "14px", color: "#513d0a", textAlign: "center", mb: "16px" })}>
        Total Supply: <span className={css({ fontWeight: "700", fontFamily: "monospace" })}>1,000,000,000,000</span> $Pecky
      </div>

      <div className={css({ display: "grid", gap: "12px" })}>
        {tokenomicsData.map((item) => (
          <div key={item.desc}>
            <div className={css({ display: "flex", justifyContent: "space-between", pb: "8px", borderBottom: "1px solid #ffae00" })}>
              <span className={css({ color: "#513d0a", fontWeight: "600" })}>{item.desc}</span>
              <span className={css({ color: "#ff7700", fontWeight: "700" })}>{item.label}</span>
            </div>
            {item.note && (
              <div className={css({ fontSize: "12px", color: "#888", fontStyle: "italic", mt: "4px" })}>
                {item.note}
              </div>
            )}
          </div>
        ))}
      </div>
    </RetroBox>
  );
}
