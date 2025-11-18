import { css } from "@/styled-system/css";
import { flex } from "@/styled-system/patterns";

const rarities = [
  { name: "Common", count: 250, percent: "1%", color: "#0099ff" },
  { name: "Rare", count: 125, percent: "1%", color: "#25c36a" },
  { name: "Epic", count: 75, percent: "0.75%", color: "#ff53a2" },
  { name: "Legendary", count: 40, percent: "0.75%", color: "#ffe270" },
  { name: "Mythic", count: 10, percent: "0.5%", color: "#a259ff" },
];

export default function NFTPage() {
  return (
    <div className={css({ minH: "100vh", bg: "#fff3da", display: "flex", flexDir: "column", alignItems: "center", justifyContent: "center", pb: "100px" })}>
      <main className={css({ maxW: "520px", w: "90%", mt: "40px" })}>
        {/* NFT Card */}
        <div className={css({ bg: "white", p: "30px", borderRadius: "16px", boxShadow: "0 4px 12px rgba(0,0,0,0.08)", border: "2px solid #ffae00" })}>
          <div className={css({ textAlign: "center", mb: "20px" })}>
            <div className={css({ fontSize: "48px", mb: "12px" })}>🖼️</div>
            <h2 className={css({ fontSize: "24px", fontWeight: "700", color: "#a06500" })}>Own a ChickenWings NFT?</h2>
          </div>

          {/* Info */}
          <p className={css({ fontSize: "14px", color: "#513d0a", lineHeight: "1.8", mb: "20px", textAlign: "center" })}>
            As an NFT holder, you're a co-owner of Pecky—think of it as holding shares! There are only <span className={css({ fontWeight: "700" })}>500 ChickenWings NFTs</span> in existence.
          </p>

          <p className={css({ fontSize: "14px", color: "#513d0a", lineHeight: "1.8", mb: "20px", textAlign: "center" })}>
            Every month, you'll receive $Pecky based on your NFT's rarity—<span className={css({ fontWeight: "700" })}>the rarer your NFT, the higher your monthly payout</span>.
          </p>

          {/* Vault Progress */}
          <div className={css({ bg: "#fffbe8", p: "16px", borderRadius: "12px", mb: "20px", border: "1px solid #ffae00" })}>
            <div className={css({ fontSize: "12px", fontWeight: "600", color: "#a06500", mb: "8px" })}>
              NFT Rewards Vault
            </div>
            <div className={css({ w: "100%", h: "20px", bg: "#e8e8e8", borderRadius: "10px", overflow: "hidden" })}>
              <div className={css({ h: "100%", w: "45%", bg: "linear-gradient(to right, #ffaa00, #ff7700)" })} />
            </div>
            <div className={css({ fontSize: "11px", color: "#b48512", mt: "6px" })}>
              Loading vault...
            </div>
          </div>

          {/* Buttons */}
          <div className={flex({ flexDir: "column", gap: "12px", mb: "20px" })}>
            <button className={css({ bg: "linear-gradient(to right, #ffaa00, #ff7700)", color: "white", py: "14px", px: "20px", borderRadius: "12px", border: "none", fontSize: "15px", fontWeight: "600", cursor: "pointer", transition: "transform 0.1s", _hover: { transform: "scale(1.03)" } })}>
              Claim NFT Reward
            </button>
            <button className={css({ bg: "white", color: "#ff7700", py: "14px", px: "20px", borderRadius: "12px", border: "2px solid #ffae00", fontSize: "14px", fontWeight: "600", cursor: "pointer", transition: "transform 0.1s", _hover: { transform: "scale(1.03)", bg: "#fffbe8" } })}>
              Check NFT Status
            </button>
          </div>

          {/* Rarity Cards */}
          <div className={css({ mb: "20px" })}>
            <h3 className={css({ fontSize: "16px", fontWeight: "700", color: "#ff7700", mb: "12px", textAlign: "center" })}>
              Monthly Pecky Rewards by Rarity
            </h3>
            <div className={css({ display: "grid", gap: "10px" })}>
              {rarities.map((rarity) => (
                <div
                  key={rarity.name}
                  className={css({
                    bg: rarity.color,
                    p: "12px",
                    borderRadius: "10px",
                    color: "white",
                    textAlign: "center",
                    fontSize: "13px",
                    fontWeight: "600",
                    cursor: "pointer",
                    transition: "transform 0.2s",
                    _hover: { transform: "scale(1.02)" },
                  })}
                >
                  <div>{rarity.name}</div>
                  <div className={css({ fontSize: "11px", opacity: "0.9" })}>
                    {rarity.count} NFTs • {rarity.percent} per month
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className={css({ fontSize: "12px", color: "#888", textAlign: "center", lineHeight: "1.8" })}>
            <div>Rewards are distributed from a 450,000,000,000 Pecky pool.</div>
            <div>The rarer your NFT, the higher your share!</div>
          </div>
        </div>
      </main>
    </div>
  );
}
