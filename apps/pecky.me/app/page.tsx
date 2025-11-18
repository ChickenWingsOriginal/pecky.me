import { css } from "@/styled-system/css";
import { flex, stack } from "@/styled-system/patterns";

export default function Home() {
  return (
    <div className={css({ minH: "100vh", bg: "#fff3da", display: "flex", flexDir: "column", alignItems: "center", justifyContent: "center", pb: "100px" })}>
      {/* Main Content */}
      <main className={css({ maxW: "520px", w: "90%", mt: "40px" })}>
        {/* Hero Card */}
        <div className={css({ bg: "white", p: "30px", borderRadius: "16px", boxShadow: "0 4px 12px rgba(0,0,0,0.08)", border: "2px solid #ffae00", mb: "30px" })}>
          <h2 className={css({ fontSize: "28px", fontWeight: "700", color: "#a06500", mb: "12px", textAlign: "center" })}>
            Welcome to Pecky!
          </h2>
          <p className={css({ fontSize: "16px", color: "#513d0a", lineHeight: "1.6", mb: "24px", textAlign: "center" })}>
            Pecky was hatched from the ChickenWings NFT collection. Pecky is a true community token with zero team tokens.
          </p>
        </div>

        {/* Earn Methods */}
        <div className={css({ bg: "white", p: "30px", borderRadius: "16px", boxShadow: "0 4px 12px rgba(0,0,0,0.08)", border: "2px solid #ffae00", mb: "30px" })}>
          <h3 className={css({ fontSize: "20px", fontWeight: "700", color: "#ff7700", mb: "16px", textAlign: "center" })}>
            Earn Pecky – Daily or Monthly!
          </h3>
          <p className={css({ fontSize: "14px", color: "#513d0a", mb: "16px", textAlign: "center" })}>
            Want to get free Pecky Coins? It's easy. Just Own an NFT or Stake SUPRA.
          </p>

          <div className={css({ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" })}>
            <div className={css({ bg: "#fffbe8", p: "16px", borderRadius: "12px", border: "1px solid #ffae00", textAlign: "center" })}>
              <div className={css({ fontSize: "28px", mb: "4px" })}>🖼️</div>
              <div className={css({ fontSize: "12px", fontWeight: "600", color: "#a06500" })}>Hold NFTs</div>
              <div className={css({ fontSize: "11px", color: "#b48512", mt: "4px" })}>Monthly rewards</div>
            </div>
            <div className={css({ bg: "#fffbe8", p: "16px", borderRadius: "12px", border: "1px solid #ffae00", textAlign: "center" })}>
              <div className={css({ fontSize: "28px", mb: "4px" })}>💰</div>
              <div className={css({ fontSize: "12px", fontWeight: "600", color: "#a06500" })}>Stake SUPRA</div>
              <div className={css({ fontSize: "11px", color: "#b48512", mt: "4px" })}>Daily rewards</div>
            </div>
          </div>
        </div>

        {/* Tokenomics */}
        <div className={css({ bg: "white", p: "30px", borderRadius: "16px", boxShadow: "0 4px 12px rgba(0,0,0,0.08)", border: "2px solid #ffae00" })}>
          <h3 className={css({ fontSize: "20px", fontWeight: "700", color: "#ff7700", mb: "16px", textAlign: "center" })}>
            $Pecky Tokenomics
          </h3>
          <div className={css({ fontSize: "14px", color: "#513d0a", textAlign: "center", mb: "12px" })}>
            Total Supply: <span className={css({ fontWeight: "700", fontFamily: "monospace" })}>1,000,000,000,000</span>
          </div>

          <div className={css({ display: "grid", gap: "8px" })}>
            {[
              { label: "45%", desc: "NFT Holders" },
              { label: "15%", desc: "Staking rewards" },
              { label: "20%", desc: "Liquidity Pool" },
              { label: "10%", desc: "Airdrop" },
              { label: "10%", desc: "Marketing & Community" },
              { label: "0%", desc: "Team & Founders" },
            ].map((item) => (
              <div key={item.desc} className={css({ display: "flex", justify: "space-between", pb: "8px", borderBottom: "1px solid #ffae00" })}>
                <span className={css({ color: "#513d0a", fontWeight: "600" })}>{item.desc}</span>
                <span className={css({ color: "#ff7700", fontWeight: "700" })}>{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
