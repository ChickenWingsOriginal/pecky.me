import { css } from "@/styled-system/css";
import { flex } from "@/styled-system/patterns";

export default function StakingPage() {
  return (
    <div className={css({ minH: "100vh", bg: "#fff3da", display: "flex", flexDir: "column", alignItems: "center", justifyContent: "center", pb: "100px" })}>
      <main className={css({ maxW: "520px", w: "90%", mt: "40px" })}>
        <div className={css({ bg: "white", p: "30px", borderRadius: "16px", boxShadow: "0 4px 12px rgba(0,0,0,0.08)", border: "2px solid #ffae00" })}>
          <div className={css({ textAlign: "center", mb: "20px" })}>
            <div className={css({ fontSize: "48px", mb: "12px" })}>💰</div>
            <h2 className={css({ fontSize: "24px", fontWeight: "700", color: "#a06500" })}>Stake $Supra on Meridian Node</h2>
          </div>

          <div className={css({ bg: "#fffbe8", p: "16px", borderRadius: "12px", mb: "20px", border: "1px solid #ffae00" })}>
            <ul className={css({ fontSize: "13px", color: "#b48512", lineHeight: "1.8", pl: "20px" })}>
              <li>Stake your Supra and earn <span className={css({ fontWeight: "700" })}>8% APY</span></li>
              <li>Get daily $Pecky – <span className={css({ fontWeight: "700" })}>1 $Pecky per staked Supra, every day</span></li>
              <li><span className={css({ fontWeight: "700" })}>50% of the node's profit is used to buy & burn $Pecky!</span></li>
              <li>No chicken left behind 🐔</li>
            </ul>
          </div>

          <div className={css({ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", mb: "20px" })}>
            <div className={css({ bg: "#fffbe8", p: "12px", borderRadius: "10px", border: "1px solid #ffae00", textAlign: "center" })}>
              <div className={css({ fontSize: "11px", color: "#a06500", mb: "4px" })}>SUPRA Balance</div>
              <div className={css({ fontSize: "18px", fontWeight: "700", color: "#ff7700" })}>0</div>
            </div>
            <div className={css({ bg: "#fffbe8", p: "12px", borderRadius: "10px", border: "1px solid #ffae00", textAlign: "center" })}>
              <div className={css({ fontSize: "11px", color: "#a06500", mb: "4px" })}>Staked</div>
              <div className={css({ fontSize: "18px", fontWeight: "700", color: "#ff7700" })}>0</div>
            </div>
          </div>

          <div className={flex({ gap: "8px", mb: "20px" })}>
            <input
              type="number"
              placeholder="0.000"
              className={css({
                flex: "1",
                px: "12px",
                py: "10px",
                borderRadius: "10px",
                border: "1.5px solid #ffae00",
                fontSize: "14px",
                bg: "#fff",
              })}
            />
            <button className={css({ px: "16px", py: "10px", borderRadius: "10px", bg: "white", border: "1.5px solid #ffae00", color: "#ff7700", fontSize: "13px", fontWeight: "600", cursor: "pointer" })}>
              MAX
            </button>
          </div>

          {/* Buttons */}
          <div className={flex({ flexDir: "column", gap: "12px", mb: "20px" })}>
            <button className={css({ bg: "linear-gradient(to right, #ffaa00, #ff7700)", color: "white", py: "14px", px: "20px", borderRadius: "12px", border: "none", fontSize: "15px", fontWeight: "600", cursor: "pointer", transition: "transform 0.1s", _hover: { transform: "scale(1.03)" } })}>
              Stake on Meridian
            </button>
            <button className={css({ bg: "white", color: "white", py: "14px", px: "20px", borderRadius: "12px", border: "none", fontSize: "15px", fontWeight: "600", cursor: "pointer", background: "linear-gradient(to right, #ffaa00, #ff7700)", transition: "transform 0.1s", _hover: { transform: "scale(1.03)" } })}>
              Claim Meridian Reward
            </button>
          </div>

          {/* Vault Progress */}
          <div className={css({ bg: "#fffbe8", p: "16px", borderRadius: "12px", mb: "20px", border: "1px solid #ffae00" })}>
            <div className={css({ fontSize: "12px", fontWeight: "600", color: "#a06500", mb: "8px" })}>
              Airdrop Vault
            </div>
            <div className={css({ w: "100%", h: "20px", bg: "#e8e8e8", borderRadius: "10px", overflow: "hidden" })}>
              <div className={css({ h: "100%", w: "48%", bg: "linear-gradient(to right, #ffaa00, #ff7700)" })} />
            </div>
            <div className={css({ fontSize: "11px", color: "#b48512", mt: "6px" })}>
              ~48,801,667,994 $Pecky left for grab
            </div>
          </div>

          {/* Info */}
          <div className={css({ fontSize: "12px", color: "#888", textAlign: "center", lineHeight: "1.8" })}>
            <div>Each staked Supra earns <span className={css({ fontWeight: "700" })}>1 $Pecky</span> per day</div>
            <div>Ex: 500,000 staked → 500,000 $Pecky / 24h</div>
            <div className={css({ mt: "8px", fontSize: "11px" })}>As long as the airdrop vault still has $Pecky left.</div>
          </div>
        </div>
      </main>
    </div>
  );
}
