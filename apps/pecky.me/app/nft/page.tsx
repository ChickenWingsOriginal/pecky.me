"use client";

import { css } from "@/styled-system/css";
import Image from "next/image";
import { useState, useEffect } from "react";
import { toast } from "sonner";
// @ts-ignore
import { BCS } from "supra-l1-sdk";
import { RetroBox } from "@/app/components/RetroBox";
import { useGlobalData } from "@/app/context/GlobalDataContext";
import { useWallet } from "@/app/context/WalletContext";
import { useSupraConnect } from "@gerritsen/supra-connect";
import { NFTGrid } from "@/app/components/NFTGrid";
import { EXTERNAL_LINKS } from "@/app/constants/links";
import { rarityLabel } from "@/app/utils/nodeService";
import { getNftsFromCache } from "@/app/utils/getNftsFromCache";
import { saveNftsToCache } from "@/app/utils/saveNftsToCache";
import { getTokenClaimStatus } from "@/app/utils/getTokenClaimStatus";
import { checkAirdropStatus } from "@/app/utils/checkAirdropStatus";
import { formatMillions } from "@/app/utils/format";

const NFT_POOL_TOTAL = 450_000_000_000;

const rarities = [
  {
    name: "Common",
    count: 250,
    percent: "1%",
    color: "#0099ff",
    monthlyPercent: 0.00004,
  },
  {
    name: "Rare",
    count: 125,
    percent: "1%",
    color: "#25c36a",
    monthlyPercent: 0.00008,
  },
  {
    name: "Epic",
    count: 75,
    percent: "0.75%",
    color: "#ff53a2",
    monthlyPercent: 0.0001,
  },
  {
    name: "Legendary",
    count: 40,
    percent: "0.75%",
    color: "#ffe270",
    monthlyPercent: 0.00018,
  },
  {
    name: "Mythic",
    count: 10,
    percent: "0.5%",
    color: "#a259ff",
    monthlyPercent: 0.0005,
  },
];

interface OwnedNFT {
  name: string;
  rarity?: string;
  claimStatus?: { status: "claimable" | "cooldown" | "unknown"; text: string };
  airdropAvailable?: boolean;
}

const SPIN_ANIMATION_CSS = `
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
`;

export default function NFTPage() {
  const { nftPoolRemaining, refetch: refetchGlobalData } = useGlobalData();
  const { state, dispatch, refreshBalances } = useWallet();
  const { sendTransaction, connectedWallet } = useSupraConnect();
  const [ownedNfts, setOwnedNfts] = useState<OwnedNFT[]>([]);
  const [loadingNfts, setLoadingNfts] = useState(false);
  const [nftStatusInput, setNftStatusInput] = useState("");
  const [checkingStatus, setCheckingStatus] = useState(false);
  const [claimingAirdrop, setClaimingAirdrop] = useState(false);
  const [claimingNftName, setClaimingNftName] = useState<string | null>(null);
  const [claimingAirdropNftName, setClaimingAirdropNftName] = useState<
    string | null
  >(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    if (
      state.isConnected &&
      state.isRegistered &&
      connectedWallet?.walletAddress
    ) {
      const cachedNfts = getNftsFromCache(connectedWallet.walletAddress);
      if (cachedNfts && cachedNfts.length > 0) {
        setOwnedNfts(cachedNfts);
        return;
      }
      if (state.ownedNfts && state.ownedNfts.length > 0) {
        loadUserNfts(state.ownedNfts);
      } else {
        fetchAndLoadNfts();
      }
    } else {
      setOwnedNfts([]);
    }
  }, [state.isConnected, state.isRegistered, connectedWallet?.walletAddress]);

  const fetchAndLoadNfts = async () => {
    if (!connectedWallet?.walletAddress) return;

    setLoadingNfts(true);
    try {
      const res = await fetch(
        `https://api.pecky.me/api/nfts?wallet=${connectedWallet.walletAddress}`,
      );
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.owned_tokens)) {
          const seen = new Set<string>();
          let tokens = data.owned_tokens.filter((t: OwnedNFT) => {
            const key = (t?.name || "").toUpperCase();
            if (seen.has(key)) return false;
            seen.add(key);
            return true;
          });

          tokens.sort((a: OwnedNFT, b: OwnedNFT) => {
            const ia = parseInt((a?.name || "").replace("TOKEN_", ""), 10) || 0;
            const ib = parseInt((b?.name || "").replace("TOKEN_", ""), 10) || 0;
            return ia - ib;
          });

          await loadUserNfts(tokens);
        }
      }
    } catch (error) {
      console.error("Failed to fetch NFTs:", error);
      setOwnedNfts([]);
    } finally {
      setLoadingNfts(false);
    }
  };

  const loadUserNfts = async (nfts: any[] | null = null) => {
    if (!nfts || nfts.length === 0) {
      setOwnedNfts([]);
      return;
    }

    setLoadingNfts(true);
    try {
      // Process NFTs in batches of 10 with 100ms delay between batches
      const BATCH_SIZE = 10;
      const BATCH_DELAY_MS = 100;
      const tokensWithStatus: OwnedNFT[] = [];

      for (let i = 0; i < nfts.length; i += BATCH_SIZE) {
        const batch = nfts.slice(i, i + BATCH_SIZE);

        const batchResults = await Promise.all(
          batch.map(async (token: OwnedNFT) => {
            const [claimStatus, airdropStatus] = await Promise.all([
              getTokenClaimStatus(token.name),
              checkAirdropStatus(token.name),
            ]);
            console.log({
              ...token,
              rarity: rarityLabel(token.name),
              claimStatus,
              airdropAvailable: airdropStatus,
            });
            return {
              ...token,
              rarity: rarityLabel(token.name),
              claimStatus,
              airdropAvailable: airdropStatus,
            };
          }),
        );

        tokensWithStatus.push(...batchResults);

        // Wait between batches (except for the last batch)
        if (i + BATCH_SIZE < nfts.length) {
          await new Promise((resolve) => setTimeout(resolve, BATCH_DELAY_MS));
        }
      }

      setOwnedNfts(tokensWithStatus as any);
      if (connectedWallet?.walletAddress) {
        saveNftsToCache(connectedWallet.walletAddress, tokensWithStatus as any);
      }
    } catch (error) {
      console.error("Failed to load NFTs:", error);
      setOwnedNfts([]);
    } finally {
      setLoadingNfts(false);
    }
  };

  const handleRefreshNfts = async () => {
    setIsRefreshing(true);
    try {
      await fetchAndLoadNfts();
    } finally {
      setIsRefreshing(false);
    }
  };

  const refreshSpecificNft = async (tokenName: string) => {
    try {
      const [claimStatus, airdropStatus] = await Promise.all([
        getTokenClaimStatus(tokenName),
        checkAirdropStatus(tokenName),
      ]);

      setOwnedNfts((prevNfts) => {
        return prevNfts.map((nft) => {
          if (nft.name === tokenName) {
            return {
              ...nft,
              claimStatus,
              airdropAvailable: airdropStatus,
            };
          }
          return nft;
        });
      });
    } catch (error) {
      console.error("Failed to refresh NFT status:", error);
    }
  };

  const claimNftReward = async (tokenName: string) => {
    if (!state.walletAddress) {
      toast.error("Please connect your wallet");
      return;
    }

    setClaimingNftName(tokenName);
    try {
      const PECKY_COIN_MODULE =
        "0xe54b95920ef1cf9483705a32eab8526f270bc2f936dfb4112fd6ef971509d85d";

      const serializedTokenName = BCS.bcsSerializeStr(tokenName);

      const result = await sendTransaction({
        payload: {
          moduleAddress: PECKY_COIN_MODULE,
          moduleName: "ClaimNFT",
          functionName: "claim",
          typeArguments: [],
          arguments: [serializedTokenName],
        },
      });

      if (result.success) {
        toast.success("Reward claimed successfully!");
        await new Promise((resolve) => setTimeout(resolve, 2000));

        await refreshSpecificNft(tokenName);

        try {
          await refreshBalances();
        } catch (error) {
          console.error("Failed to refresh wallet balance:", error);
        }

        await refetchGlobalData();
      } else {
        toast.error(
          `Failed to claim reward: ${result.reason || result.error || "Unknown error"}`,
        );
      }
    } catch (error) {
      console.error("Claim failed:", error);
      toast.error("Failed to claim reward");
    } finally {
      setClaimingNftName(null);
    }
  };

  const handleCheckNftStatus = async () => {
    let tokenId = nftStatusInput.trim();
    if (!/^\d{1,3}$/.test(tokenId)) {
      toast.error("Please enter a valid 1-3 digit Token ID.");
      return;
    }

    tokenId = String(Number(tokenId));
    const tokenName = `TOKEN_${tokenId}`;

    setCheckingStatus(true);
    try {
      const [airdropAvailable, claimStatus] = await Promise.all([
        checkAirdropStatus(tokenName),
        getTokenClaimStatus(tokenName),
      ]);

      const airdropText = airdropAvailable
        ? "Yes, still claimable! ✓"
        : "No, it's already claimed.";

      const claimText =
        claimStatus.status === "claimable"
          ? "Available now! ✓"
          : claimStatus.status === "cooldown"
            ? claimStatus.text
            : "Unknown";

      toast.success(
        <div className={css({ textAlign: "left" })}>
          <div
            className={css({ fontWeight: "700", mb: "8px", fontSize: "14px" })}
          >
            NFT {tokenId}
          </div>
          <div className={css({ mb: "8px" })}>
            <div
              className={css({
                fontSize: "12px",
                fontWeight: "600",
                color: "#a06500",
                mb: "2px",
              })}
            >
              Airdrop reward claimable?
            </div>
            <div className={css({ fontSize: "13px" })}>{airdropText}</div>
          </div>
          <div>
            <div
              className={css({
                fontSize: "12px",
                fontWeight: "600",
                color: "#a06500",
                mb: "2px",
              })}
            >
              Next Monthly Claim:
            </div>
            <div className={css({ fontSize: "13px" })}>{claimText}</div>
          </div>
        </div>,
      );
    } catch (error) {
      console.error("Failed to check NFT status:", error);
      toast.error("Failed to check NFT status");
    } finally {
      setCheckingStatus(false);
    }
  };

  const claimNftAirdropReward = async (tokenName: string) => {
    if (!state.walletAddress) {
      toast.error("Please connect your wallet first");
      return;
    }

    setClaimingAirdropNftName(tokenName);
    try {
      const PECKY_COIN_MODULE =
        "0xe54b95920ef1cf9483705a32eab8526f270bc2f936dfb4112fd6ef971509d85d";

      const serializedTokenName = BCS.bcsSerializeStr(tokenName);

      const result = await sendTransaction({
        payload: {
          moduleAddress: PECKY_COIN_MODULE,
          moduleName: "Coin",
          functionName: "claim_nft_airdrop",
          typeArguments: [],
          arguments: [serializedTokenName],
        },
      });

      if (result.success) {
        toast.success("NFT airdrop claimed successfully!");
        await new Promise((resolve) => setTimeout(resolve, 2000));

        await refreshSpecificNft(tokenName);

        try {
          await refreshBalances();
        } catch (error) {
          console.error("Failed to refresh wallet balance:", error);
        }

        await refetchGlobalData();
      } else {
        toast.error(
          `Failed to claim NFT airdrop: ${result.reason || result.error || "Unknown error"}`,
        );
      }
    } catch (error) {
      console.error("Airdrop claim failed:", error);
      toast.error("Failed to claim NFT airdrop");
    } finally {
      setClaimingAirdropNftName(null);
    }
  };

  const poolRemainingRegular = nftPoolRemaining
    ? Number(nftPoolRemaining) / 1_000_000
    : 0;
  const poolRemainingPercentage =
    NFT_POOL_TOTAL > 0
      ? Math.max(
          0,
          Math.min(100, (poolRemainingRegular / NFT_POOL_TOTAL) * 100),
        )
      : 0;
  const poolRemainingFormatted = poolRemainingRegular.toLocaleString("en-US", {
    maximumFractionDigits: 0,
  });

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
      <style>{SPIN_ANIMATION_CSS}</style>
      <div
        className={css({
          maxW: "520px",
          w: "90%",
          mt: "40px",
          display: "flex",
          flexDir: "column",
          gap: "5px",
        })}
      >
        <RetroBox>
          <div className={css({ textAlign: "center" })}>
            <Image
              src="/images/nft-icon.png"
              alt="NFT Icon"
              width={100}
              height={100}
              style={{ margin: "0 auto", marginBottom: "12px" }}
            />
            <h1
              className={css({
                fontSize: "24px",
                fontWeight: "700",
                color: "#4a2c00",
                mb: "12px",
              })}
            >
              Own a ChickenWings NFT?
            </h1>
            <div
              className={css({
                fontSize: "14px",
                color: "#513d0a",
                lineHeight: "1.65",
              })}
            >
              As an NFT holder, you're a co-owner of Pecky—think of it as
              holding shares!
              <br />
              There are only <b>500 ChickenWings NFTs</b> in existence.
              <br />
              Every month, you'll receive $Pecky based on your NFT's rarity.
              <br />
              Buy or sell on <b>Crystara</b>.
            </div>
          </div>
        </RetroBox>

        <RetroBox>
          <div
            className={css({
              fontSize: "14px",
              fontWeight: "600",
              color: "#a06500",
              mb: "10px",
              textAlign: "center",
            })}
          >
            NFT Rewards Vault
          </div>
          <div
            className={css({
              w: "100%",
              h: "24px",
              bg: "#e8e8e8",
              borderRadius: "10px",
              overflow: "hidden",
              mb: "8px",
            })}
          >
            <div
              style={{
                height: "100%",
                width: `${poolRemainingPercentage}%`,
                background: "linear-gradient(to right, #ffaa00, #ff7700)",
                transition: "width 0.3s ease",
              }}
            />
          </div>
          <div
            className={css({
              fontSize: "12px",
              color: "#b48512",
              textAlign: "center",
              mb: "16px",
            })}
          >
            {nftPoolRemaining !== null
              ? `${poolRemainingFormatted} $Pecky remaining`
              : "Loading..."}
          </div>

          <hr
            style={{
              margin: "12px 0",
              borderTop: "1.5px dashed #ffd36e",
              opacity: 0.6,
            }}
          />

          <div
            className={css({
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: "14px",
              mt: "16px",
            })}
          >
            <div
              className={css({
                fontSize: "15px",
                color: "#4a2c00",
                fontWeight: "700",
                flex: 1,
                textAlign: "center",
              })}
            >
              Your ChickenWings NFTs
            </div>
            <button
              onClick={handleRefreshNfts}
              disabled={isRefreshing || loadingNfts}
              className={css({
                width: "1.5rem",
                height: "1.5rem",
                fontSize: "18px",
                bg: isRefreshing || loadingNfts ? "#cccccc" : "#ff7700",
                color: "white",
                border: "none",
                borderRadius: "50%",
                cursor: isRefreshing || loadingNfts ? "not-allowed" : "pointer",
                transition: "transform 0.1s",
                _hover:
                  isRefreshing || loadingNfts
                    ? {}
                    : { transform: "scale(1.05)" },
              })}
              style={{
                animation:
                  isRefreshing || loadingNfts
                    ? "spin 1s linear infinite"
                    : "none",
              }}
            >
              ↻
            </button>
          </div>
          {state.isConnected && state.isRegistered ? (
            loadingNfts ? (
              <div
                className={css({
                  fontSize: "14px",
                  color: "#b48512",
                  textAlign: "center",
                  py: "20px",
                })}
              >
                Loading NFTs...
              </div>
            ) : ownedNfts.length > 0 ? (
              <NFTGrid
                nfts={ownedNfts}
                onClaim={claimNftReward}
                onClaimAirdrop={claimNftAirdropReward}
                isLoading={loadingNfts}
                isClaimingNft={claimingNftName}
                isClaimingAirdropNft={claimingAirdropNftName}
                walletConnected={state.isConnected}
              />
            ) : (
              <div
                className={css({
                  fontSize: "14px",
                  color: "#b48512",
                  textAlign: "center",
                  py: "20px",
                })}
              >
                You don't have any Pecky NFTs yet, get one now on{" "}
                <a
                  href={EXTERNAL_LINKS.crystara}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={css({
                    color: "#ff7700",
                    fontWeight: "600",
                    textDecoration: "underline",
                    _hover: { opacity: "0.8" },
                  })}
                >
                  Crystara
                </a>
              </div>
            )
          ) : (
            <div
              className={css({
                fontSize: "14px",
                color: "#b48512",
                textAlign: "center",
                py: "20px",
              })}
            >
              Please connect your wallet
            </div>
          )}

          <hr
            style={{
              margin: "16px 0",
              borderTop: "1.5px dashed #ffd36e",
              opacity: 0.6,
            }}
          />

          <div className={css({ mt: "16px" })}>
            <div
              className={css({
                fontSize: "15px",
                color: "#4a2c00",
                fontWeight: "700",
                mb: "12px",
                textAlign: "center",
              })}
            >
              Check NFT Status
            </div>
            <div
              className={css({
                display: "flex",
                gap: "10px",
                justifyContent: "center",
                alignItems: "stretch",
              })}
            >
              <input
                type="text"
                maxLength={3}
                inputMode="numeric"
                pattern="\d{1,3}"
                placeholder="NFT ID"
                value={nftStatusInput}
                onChange={(e) => setNftStatusInput(e.target.value)}
                className={css({
                  p: "10px 13px",
                  borderRadius: "12px",
                  border: "1.5px solid #ffae00",
                  fontSize: "14px",
                  bg: "white",
                  w: "100px",
                  height: "40px",
                  boxSizing: "border-box",
                  textAlign: "center",
                })}
              />
              <button
                onClick={handleCheckNftStatus}
                disabled={checkingStatus || !nftStatusInput}
                className={css({
                  flex: 1,
                  p: "0 15px",
                  height: "40px",
                  bg:
                    checkingStatus || !nftStatusInput
                      ? "#cccccc"
                      : "linear-gradient(to right, #ffaa00, #ff7700)",
                  color: "white",
                  border: "none",
                  borderRadius: "12px",
                  fontSize: "14px",
                  fontWeight: "600",
                  cursor:
                    checkingStatus || !nftStatusInput
                      ? "not-allowed"
                      : "pointer",
                  transition: "transform 0.1s",
                  _hover:
                    checkingStatus || !nftStatusInput
                      ? {}
                      : { transform: "scale(1.02)" },
                })}
              >
                {checkingStatus ? "Checking..." : "Check"}
              </button>
            </div>
          </div>
        </RetroBox>

        <RetroBox>
          <div className={css({ textAlign: "center" })}>
            <h3
              className={css({
                color: "#ff7700",
                margin: "0 0 8px 0",
                fontSize: "15px",
                fontWeight: "700",
              })}
            >
              Monthly Rewards by Rarity
            </h3>
            <div
              className={css({
                fontSize: "12px",
                mb: "12px",
                color: "#b48512",
              })}
            >
              From a <b>450B Pecky</b> pool
            </div>
            <div className={css({ display: "grid", gap: "8px", mb: "12px" })}>
              {rarities.map((rarity) => (
                <div
                  key={rarity.name}
                  style={{
                    backgroundColor: "white",
                    border: `2px solid ${rarity.color}`,
                    padding: "10px 12px",
                    borderRadius: "8px",
                    textAlign: "center",
                    fontSize: "13px",
                    fontWeight: "600",
                    transition: "transform 0.2s",
                    color: "#a06500",
                  }}
                >
                  <div
                    style={{
                      fontWeight: "700",
                      marginBottom: "4px",
                      color: "#a06500",
                    }}
                  >
                    {rarity.name}
                  </div>
                  <div
                    style={{
                      fontSize: "11px",
                      opacity: "0.9",
                      color: "#a06500",
                      marginBottom: "3px",
                    }}
                  >
                    {rarity.count} NFTs • {rarity.percent}/month
                  </div>
                  <div style={{ fontSize: "11px", color: "#a06500" }}>
                    Monthly NFT reward is now{" "}
                    {nftPoolRemaining !== null
                      ? formatMillions(
                          Number(
                            (
                              Math.round(
                                Number(nftPoolRemaining) *
                                  rarity.monthlyPercent,
                              ) / 1_000_000
                            ).toFixed(2),
                          ),
                        )
                      : "–"}
                    $Pecky
                  </div>
                </div>
              ))}
            </div>

            <div className={css({ textAlign: "center", mb: "12px" })}>
              <div
                className={css({
                  fontSize: "13px",
                  fontWeight: "600",
                  color: "#a06500",
                  mb: "8px",
                })}
              >
                HODL your NFT = Monthly passive Pecky power!
              </div>
              <a
                href={EXTERNAL_LINKS.crystara}
                target="_blank"
                rel="noopener noreferrer"
                className={css({
                  fontSize: "13px",
                  color: "#ff7700",
                  fontWeight: "600",
                  textDecoration: "none",
                  _hover: { opacity: "0.8" },
                })}
              >
                Trade your NFT on Crystara
              </a>
            </div>
          </div>
        </RetroBox>
      </div>
    </div>
  );
}
