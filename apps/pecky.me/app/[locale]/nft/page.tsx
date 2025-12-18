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
import { useTranslations } from "next-intl";

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
  const t = useTranslations('nft');
  const { nftPoolRemaining, refetch: refetchGlobalData } = useGlobalData();
  const { state, dispatch, refreshBalances, refreshNfts } = useWallet();
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
      // Try cache first for instant display
      const cachedNfts = getNftsFromCache(connectedWallet.walletAddress);
      if (cachedNfts && cachedNfts.length > 0) {
        setOwnedNfts(cachedNfts);
      }

      // Then load from WalletContext (which has images now!)
      if (state.ownedNfts && state.ownedNfts.length > 0) {
        loadUserNfts(state.ownedNfts);
      }
    } else {
      setOwnedNfts([]);
    }
  }, [
    state.isConnected,
    state.isRegistered,
    connectedWallet?.walletAddress,
    state.ownedNfts,
  ]);

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
              getTokenClaimStatus(token.name, t),
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
      // Refresh NFTs from WalletContext (single source of truth)
      await refreshNfts();
      // The useEffect will pick up the change and enhance with claim status
    } finally {
      setIsRefreshing(false);
    }
  };

  const refreshSpecificNft = async (tokenName: string) => {
    try {
      const [claimStatus, airdropStatus] = await Promise.all([
        getTokenClaimStatus(tokenName, t),
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
      toast.error(t('connectFirst'));
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
        toast.success(t('claimSuccess'));
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
          t('claimFailed', { error: result.reason || result.error || "Unknown error" })
        );
      }
    } catch (error) {
      console.error("Claim failed:", error);
      toast.error(t('claimFailedGeneric'));
    } finally {
      setClaimingNftName(null);
    }
  };

  const handleCheckNftStatus = async () => {
    let tokenId = nftStatusInput.trim();
    if (!/^\d{1,3}$/.test(tokenId)) {
      toast.error(t('invalidTokenId'));
      return;
    }

    tokenId = String(Number(tokenId));
    const tokenName = `TOKEN_${tokenId}`;

    setCheckingStatus(true);
    try {
      const [airdropAvailable, claimStatus] = await Promise.all([
        checkAirdropStatus(tokenName),
        getTokenClaimStatus(tokenName, t),
      ]);

      const airdropText = airdropAvailable
        ? t('claimableAirdrop')
        : t('claimedAirdrop');

      const claimText =
        claimStatus.status === "claimable"
          ? t('availableNow')
          : claimStatus.status === "cooldown"
            ? claimStatus.text
            : t('statusUnknown');

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
              {t('nextMonthlyClaim')}
            </div>
            <div className={css({ fontSize: "13px" })}>{claimText}</div>
          </div>
        </div>,
      );
    } catch (error) {
      console.error("Failed to check NFT status:", error);
      toast.error(t('statusCheckFailed'));
    } finally {
      setCheckingStatus(false);
    }
  };

  const claimNftAirdropReward = async (tokenName: string) => {
    if (!state.walletAddress) {
      toast.error(t('connectFirst'));
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
        toast.success(t('airdropClaimSuccess'));
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
          t('airdropClaimFailed', { error: result.reason || result.error || "Unknown error" })
        );
      }
    } catch (error) {
      console.error("Airdrop claim failed:", error);
      toast.error(t('airdropClaimFailedGeneric'));
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
          gap: "4px",
        })}
      >
        <div className={css({ textAlign: "center", mb: "20px" })}>
          <Image
            src="/images/nft-icon.png"
            alt="NFT Icon"
            width={100}
            height={100}
            style={{ margin: "0 auto", marginBottom: "12px" }}
          />
        </div>
        <RetroBox>
          <div className={css({ textAlign: "center", mb: "20px" })}>
            <h2
              className={css({
                fontSize: "24px",
                fontWeight: "700",
                color: "#a06500",
              })}
            >
              {t('heading')}
            </h2>
          </div>
          <div
            className={css({
              p: "4px",
              mb: "20px",
            })}
          >
            <div
              className={css({
                fontSize: "14px",
                color: "#513d0a",
                lineHeight: "1.65",
              })}
            >
              {t('subtitle1')} <b>{t('subtitle2')}</b> {t('subtitle3')}
              <br />
              {t('buyOn')} <b>Crystara</b>.
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
            {t('vaultHeading')}
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
              ? t('remaining', { amount: poolRemainingFormatted })
              : t('loading')}
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
              {t('yourNfts')}
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
                {t('loadingNfts')}
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
                {t('noNfts')}{" "}
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
              {t('connectWallet')}
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
              {t('checkStatus')}
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
                placeholder={t('nftIdPlaceholder')}
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
                {checkingStatus ? t('checking') : t('check')}
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
