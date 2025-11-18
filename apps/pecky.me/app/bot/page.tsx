import { css } from "@/styled-system/css";
import { flex } from "@/styled-system/patterns";

export default function BotPage() {
  return (
    <div className={css({ minH: "100vh", bg: "#fff3da", display: "flex", flexDir: "column", alignItems: "center", justifyContent: "center", pb: "100px" })}>
      <main className={css({ maxW: "520px", w: "90%", mt: "40px" })}>
        {/* Bot Card */}
        <div className={css({ bg: "white", p: "30px", borderRadius: "16px", boxShadow: "0 4px 12px rgba(0,0,0,0.08)", border: "2px solid #ffae00" })}>
          <div className={css({ textAlign: "center", mb: "20px" })}>
            <div className={css({ fontSize: "48px", mb: "12px" })}>🤖</div>
            <h2 className={css({ fontSize: "24px", fontWeight: "700", color: "#a06500" })}>PECKYBOT on Discord</h2>
          </div>

          {/* Features */}
          <div className={css({ bg: "#fffbe8", p: "16px", borderRadius: "12px", mb: "20px", border: "1px solid #ffae00" })}>
            <div className={css({ fontSize: "14px", fontWeight: "600", color: "#2e2e2e", mb: "12px" })}>
              Get exclusive bot access:
            </div>
            <ul className={css({ fontSize: "13px", color: "#b48512", pl: "20px", lineHeight: "1.8" })}>
              <li>Get notifications when someone bids on your NFT</li>
              <li>Set alerts for any top 25 NFT on Crystara with your rarity, below your chosen price</li>
              <li>More features coming soon!</li>
            </ul>
          </div>

          {/* Cost Info */}
          <div className={css({ bg: "#fff3da", p: "16px", borderRadius: "12px", mb: "20px", border: "1px solid #ffae00" })}>
            <div className={css({ fontSize: "14px", color: "#a06500", mb: "8px" })}>
              Pay <span className={css({ fontWeight: "700" })}>one time 5,000 $SUPRA</span> to activate the bot.
            </div>
            <div className={css({ fontSize: "13px", color: "#a06500" })}>
              After that, you only need Pecky as gas to keep the bot active.
            </div>
            <div className={css({ fontSize: "12px", color: "#ed7a00", fontWeight: "600", mt: "8px" })}>
              All $Pecky used for the bot will be burned.
            </div>
          </div>

          {/* Buttons */}
          <div className={flex({ flexDir: "column", gap: "12px", mb: "20px" })}>
            <button className={css({ bg: "linear-gradient(to right, #ffaa00, #ff7700)", color: "white", py: "14px", px: "20px", borderRadius: "12px", border: "none", fontSize: "15px", fontWeight: "600", cursor: "pointer", transition: "transform 0.1s", _hover: { transform: "scale(1.03)" } })}>
              Activate PECKYBOT with Supra
            </button>
            <button className={css({ bg: "white", color: "#ff7700", py: "14px", px: "20px", borderRadius: "12px", border: "2px solid #ffae00", fontSize: "14px", fontWeight: "600", cursor: "pointer", transition: "transform 0.1s", _hover: { transform: "scale(1.03)", bg: "#fffbe8" } })}>
              Extend with Pecky
            </button>
          </div>

          {/* Info */}
          <div className={css({ fontSize: "12px", color: "#888", textAlign: "center", lineHeight: "1.8" })}>
            <div>300,000 Pecky = 1 day bot activation.</div>
            <div>Use the bot as long as you keep extending!</div>
            <div className={css({ mt: "8px" })}>Need help? Ask in Discord!</div>
          </div>
        </div>
      </main>
    </div>
  );
}
