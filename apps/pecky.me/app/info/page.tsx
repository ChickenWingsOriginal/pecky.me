import { css } from "@/styled-system/css";
import { flex } from "@/styled-system/patterns";

export default function InfoPage() {
  return (
    <div className={css({ minH: "100vh", bg: "#fff3da", display: "flex", flexDir: "column", alignItems: "center", justifyContent: "center", pb: "100px" })}>
      <main className={css({ maxW: "520px", w: "90%", mt: "40px" })}>
        {/* Info Card */}
        <div className={css({ bg: "white", p: "30px", borderRadius: "16px", boxShadow: "0 4px 12px rgba(0,0,0,0.08)", border: "2px solid #ffae00" })}>
          <div className={css({ textAlign: "center", mb: "20px" })}>
            <div className={css({ fontSize: "48px", mb: "12px" })}>ℹ️</div>
            <h2 className={css({ fontSize: "24px", fontWeight: "700", color: "#a06500" })}>Welcome to the Info Page</h2>
          </div>

          {/* Intro */}
          <p className={css({ fontSize: "14px", color: "#513d0a", lineHeight: "1.8", mb: "20px", textAlign: "center" })}>
            Pecky was hatched from the ChickenWings NFT collection. Pecky is a true <span className={css({ fontWeight: "700" })}>community token</span> with <span className={css({ fontWeight: "700" })}>zero team tokens</span>. Hold your Peckys tight, because we burn everything we can get our wings on!
          </p>

          {/* Burned Pecky */}
          <div className={css({ bg: "#fff3da", p: "16px", borderRadius: "12px", mb: "20px", border: "2px solid #ffae00", textAlign: "center" })}>
            <div className={css({ fontSize: "18px", fontWeight: "700", color: "#4a2c00", mb: "8px" })}>
              🔥 Total Pecky Burned
            </div>
            <div className={css({ fontSize: "20px", fontWeight: "700", color: "#a06500" })}>
              –
            </div>
          </div>

          {/* How Burning Works */}
          <h3 className={css({ fontSize: "16px", fontWeight: "700", color: "#a06500", mb: "16px", textAlign: "center" })}>
            How does our burning ritual work?
          </h3>

          {/* Sections */}
          <div className={css({ display: "grid", gap: "16px" })}>
            {/* Staking Section */}
            <div className={css({ bg: "#fffbe8", p: "16px", borderRadius: "12px", border: "1px solid #ffae00" })}>
              <div className={css({ fontSize: "13px", fontWeight: "700", color: "#ffae00", textAlign: "center", mb: "8px", letterSpacing: "1px" })}>
                STAKING
              </div>
              <div className={css({ fontSize: "12px", color: "#42310b", textAlign: "center", lineHeight: "1.6" })}>
                Stake your $SUPRA on the <span className={css({ fontWeight: "700" })}>Meridian node</span> and get the same 8% node rewards as anywhere else, but you also get the same amount of $Pecky as your daily staked $SUPRA! Even better: <span className={css({ fontWeight: "700" })}>50% of the node rewards</span> are used to buy up and burn $Pecky for the community!
              </div>
            </div>

            {/* NFT Section */}
            <div className={css({ bg: "#fffbe8", p: "16px", borderRadius: "12px", border: "1px solid #ffae00" })}>
              <div className={css({ fontSize: "13px", fontWeight: "700", color: "#ffae00", textAlign: "center", mb: "8px", letterSpacing: "1px" })}>
                NFTs
              </div>
              <div className={css({ fontSize: "12px", color: "#42310b", textAlign: "center", lineHeight: "1.6" })}>
                All NFTs sold on the Crystara marketplace have a 5% royalty. Instead of keeping these fees, <span className={css({ fontWeight: "700" })}>we use every penny to buy and burn Pecky!</span>
              </div>
            </div>

            {/* PECKYBOT Section */}
            <div className={css({ bg: "#fffbe8", p: "16px", borderRadius: "12px", border: "1px solid #ffae00" })}>
              <div className={css({ fontSize: "13px", fontWeight: "700", color: "#ffae00", textAlign: "center", mb: "8px", letterSpacing: "1px" })}>
                PECKYBOT
              </div>
              <div className={css({ fontSize: "12px", color: "#42310b", textAlign: "center", lineHeight: "1.6" })}>
                On Discord, our bot helps NFT traders by sending instant alerts when someone bids on your NFT or a top collection NFT is listed below your set price. All Pecky used as gas for the bot <span className={css({ fontWeight: "700" })}>is instantly sent to the burn pile!</span>
              </div>
            </div>
          </div>

          {/* Partners */}
          <div className={css({ mt: "20px", textAlign: "center" })}>
            <div className={css({ fontSize: "14px", fontWeight: "700", color: "#ed7a00", mb: "12px" })}>
              Our partners:
            </div>
            <div className={flex({ justify: "center", gap: "16px", flexWrap: "wrap" })}>
              {["Supra", "Ribbit Wallet", "Meridian", "Crystara", "Dexlyn"].map((partner) => (
                <div key={partner} className={css({ fontSize: "12px", color: "#a06500", fontWeight: "600", px: "12px", py: "8px", bg: "white", borderRadius: "8px", border: "1px solid #ffae00" })}>
                  {partner}
                </div>
              ))}
            </div>
          </div>

          {/* Social Links */}
          <div className={css({ mt: "20px", textAlign: "center" })}>
            <div className={css({ fontSize: "13px", color: "#513d0a", mb: "12px" })}>
              Have questions? Join our Discord or check us out on X!
            </div>
            <div className={flex({ justify: "center", gap: "16px" })}>
              <button className={css({ px: "16px", py: "8px", bg: "#5865F2", color: "white", borderRadius: "8px", border: "none", fontSize: "12px", fontWeight: "600", cursor: "pointer" })}>
                Discord
              </button>
              <button className={css({ px: "16px", py: "8px", bg: "#000", color: "white", borderRadius: "8px", border: "none", fontSize: "12px", fontWeight: "600", cursor: "pointer" })}>
                X (Twitter)
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
