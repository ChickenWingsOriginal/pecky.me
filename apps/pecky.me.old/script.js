if (window.__PECKY_SCRIPT_LOADED__) {
  console.warn("Pecky script.js already loaded (duplicate include?)");
} else {
  window.__PECKY_SCRIPT_LOADED__ = true;
}

let walletAddress = null;
let supraProvider = null;
let nftLoadingInterval = null;
let __peckyBalanceCache = { micro: 0n, pecky: 0 };
const AIRDROP_VAULT_TOTAL = 100_000_000_000; 
const TABLE_HANDLE = "0xbf3d300e9d7444b36d9b036c45f95c092fd7b62fe5093f54b891f3916179197c";  
const PECKY_COIN_MODULE = "0xe54b95920ef1cf9483705a32eab8526f270bc2f936dfb4112fd6ef971509d85d";
const PECKY_TOKEN_TYPE = `${PECKY_COIN_MODULE}::Coin::Pecky`;
const DECIMALS = 6;
const VAULT_TOTAL = 1_000_000_000_000; 
const VAULT_AIRDROP_URL = "https://rpc-mainnet.supra.com/rpc/v1/accounts/0xe54b95920ef1cf9483705a32eab8526f270bc2f936dfb4112fd6ef971509d85d/resources/0xe54b95920ef1cf9483705a32eab8526f270bc2f936dfb4112fd6ef971509d85d::Coin::VaultAirdrop";
const VAULT_NFT_URL = "https://rpc-mainnet.supra.com/rpc/v1/accounts/0xe54b95920ef1cf9483705a32eab8526f270bc2f936dfb4112fd6ef971509d85d/resources/0xe54b95920ef1cf9483705a32eab8526f270bc2f936dfb4112fd6ef971509d85d::ClaimNFT::VaultNFT";
const COINSTORE_URL = "https://rpc-mainnet.supra.com/rpc/v1/accounts/0xe54b95920ef1cf9483705a32eab8526f270bc2f936dfb4112fd6ef971509d85d/resources/0x1%3A%3Acoin%3A%3ACoinStore%3C0xe54b95920ef1cf9483705a32eab8526f270bc2f936dfb4112fd6ef971509d85d%3A%3ACoin%3A%3APecky%3E";
const MERIDIAN_POOL   = "0x72b93dccbda04c9caf1b8726d96cb28edee5feceb85e32db318dd1eea4320331";
const STAKE_VIEW_FN   = "0x1::pbo_delegation_pool::get_stake";
const STAKE_ADD_FN    = "0x1::pbo_delegation_pool::add_stake";
const BURN_ADDRESS = "0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff";
const PECKY_RESOURCE_TYPE =
  "0x0000000000000000000000000000000000000000000000000000000000000001::coin::CoinStore<" +
  "0xe54b95920ef1cf9483705a32eab8526f270bc2f936dfb4112fd6ef971509d85d::Coin::Pecky" +
  ">";

/* ==== TOEGEVOEGD: Discord module constants ==== */
const DISCORD_MODULE_ADDR = "0xe54b95920ef1cf9483705a32eab8526f270bc2f936dfb4112fd6ef971509d85d";
const DISCORD_MODULE      = `${DISCORD_MODULE_ADDR}::discord_link`;
/* ============================================== */

function fromRaw(rawValue) {
  return Number(rawValue) / 10 ** DECIMALS;
}

const NFT_PERCENT = {
  common:    0.00004,
  rare:      0.00008,
  epic:      0.00010,
  legendary: 0.0001875,
  mythic:    0.0005
};

document.addEventListener("DOMContentLoaded", async () => {
   if (window.__PECKY_INIT_DONE__) return;
  window.__PECKY_INIT_DONE__ = true;
  // Prijs per Pecky ophalen en tonen
  const price = await fetchPeckyPrice();
  const priceDiv = document.getElementById("peckyPriceDisplay");
  if (priceDiv) {
    priceDiv.textContent = price
      ? `1 $Pecky = ${price.toFixed(6)} $SUPRA`
      : "Price not available";
  }

  // Een random Pecky quote tonen in de sidebar
  const quotes = [
    "While you were sleeping, Pecky bought the dip.",
    "NFT? Nah, it’s a Not-Fried-Turkey.",
    "Keep calm and let the chicken moon.",
    "Staking? Pecky’s been sitting on golden eggs for weeks.",
    "One wallet to hatch them all.",
    "The only rug Pecky knows is his nest.",
    "In Pecky we trust (and maybe in memes too).",
    "Pecky’s wings aren’t just for flying – they’re for flipping NFTs.",
    "This wallet smells like victory and Doritos.",
    "Counting your chickens before they hatch..."
  ];
  const noteElem = document.getElementById("sidebarNote");
  if (noteElem) {
    const randomNote = quotes[Math.floor(Math.random() * quotes.length)];
    noteElem.textContent = randomNote;
  }

  // Vault progress bars & rewards
  updateVaultProgress();
  setInterval(updateVaultProgress, 30000);
  
  showAllNftRewards();
  setInterval(showAllNftRewards, 60000);

  updateVaultNftProgress();
  setInterval(updateVaultNftProgress, 30000);

  await renderStakeAllPanel()
  // Sidebar openen/sluiten
  const menuBtn = document.querySelector(".menu-button");
  if (menuBtn) {
    menuBtn.addEventListener("click", function(e) {
      e.stopPropagation();
      toggleSidebar();
    });
  }
  const sidebarOverlay = document.getElementById("sidebarOverlay");
  if (sidebarOverlay) {
    sidebarOverlay.addEventListener("click", function () {
      toggleSidebar(true);
    });
  }

  // Stake button event
  const stakeBtn = document.getElementById("stakeBtn");
  if (stakeBtn) {
    stakeBtn.addEventListener("click", addStake);
  }

  // --------- PECKYBOT (BOT-PAGINA) FUNCTIONALITEIT ---------
  // Activatie met Supra
  const activateSupraBtn = document.getElementById("activateBotSupraBtn");
  if (activateSupraBtn) {
    activateSupraBtn.addEventListener("click", async () => {
      await activatePeckyBotWithSupra();
      await checkPeckyBotActive();
      await getPeckyBotDays();
    });
  }
  // Activatie met Pecky voor X dagen
  const activatePeckyBtn = document.getElementById("activateBotPeckyBtn");
  if (activatePeckyBtn) {
    activatePeckyBtn.addEventListener("click", async () => {
      await activatePeckyBotWithPecky();
      await checkPeckyBotActive();
      await getPeckyBotDays();
    });
  }
  // Invulveld: automatisch laten zien hoeveel Pecky het kost
  const botDaysInput = document.getElementById("botDaysInput");
  if (botDaysInput) {
    botDaysInput.addEventListener("input", function() {
      const days = parseInt(this.value, 10);
      const peckyAmount = isNaN(days) ? 0 : days * 300_000;
      const hintDiv = document.getElementById("botDaysHint");
      if (hintDiv) {
        hintDiv.textContent =
          days > 0 ? `You will pay ${peckyAmount.toLocaleString()} Pecky` : "";
      }
    });
  }

  // --- Check PeckyBot direct als pagina geladen wordt ---
  if (window.location.hash === "#bot" || document.getElementById("page-bot")?.style.display !== "none") {
    await checkPeckyBotActive();
    await getPeckyBotDays();
  }

  // Registratiebutton initialiseren
  await updateRegisterButton(walletAddress);

  /* ====== TOEGEVOEGD: Listeners die je nog miste ====== */
function bindUiOnce() {
  if (window.__PECKY_LISTENERS_BOUND__) return;
  window.__PECKY_LISTENERS_BOUND__ = true;

  document.getElementById("connectBtn")?.addEventListener("click", handleWallet);
  document.getElementById("registerBtn")?.addEventListener("click", registerUser);
  document.getElementById("futuraClaimBtn")?.addEventListener("click", claimFuturaTokens);

  // Belangrijk: jouw knop-id is 'nftClaimRewardBtn' (niet 'nftClaimBtn')
  document.getElementById("nftClaimRewardBtn")?.addEventListener("click", claimNft);

  // NFT status & airdrop
  document.getElementById("nftStatusBtn")?.addEventListener("click", checkNftStatus);
  document.getElementById("nftAirdropClaimBtn")?.addEventListener("click", claimNftAirdropReward);

  // Discord
  document.getElementById("discordLinkBtn")?.addEventListener("click", registerDiscord);
  document.getElementById("discordUnlinkBtn")?.addEventListener("click", unregisterDiscord);
}
bindUiOnce();

(function ensureNodePanelAboveMeridian(){
  const stakingPage = document.getElementById("page-staking");
  if (!stakingPage) return;
  const nodeMount   = document.getElementById("nodePanelMount");
  // Pak de eerste Meridian-kaart op de staking pagina:
  const meridianCard = stakingPage.querySelector(".staking-retro-card");
  if (nodeMount && meridianCard && nodeMount !== meridianCard.previousSibling) {
    stakingPage.insertBefore(nodeMount, meridianCard);
  }
})();

// Eerste Discord UI refresh (veilig: doet niets als elementen ontbreken)
if (typeof refreshDiscordUI === "function") {
  await refreshDiscordUI();
}
  /* ===================================================== */
});

function showPage(page) {
  const pages = ['bot', 'nft', 'home', 'staking', 'info'];
  pages.forEach(p => {
    if (p === 'home') {
      document.querySelector('.container').style.display = (page === 'home') ? 'block' : 'none';
    } else {
      document.getElementById('page-' + p).style.display = (p === page) ? 'block' : 'none';
    }
  });

  document.querySelectorAll('.footer-btn').forEach((btn, i) => {
    btn.classList.toggle('active', pages[i] === page);
  });

  // *** Extra: PeckyBot status/data verversen bij openen van botpagina ***
  if(page === 'bot') {
    checkPeckyBotActive();
    getPeckyBotDays();
  }
}

// Footer knoppen koppelen aan showPage
document.getElementById('navBot').onclick = () => showPage('bot');
document.getElementById('navNft').onclick = () => showPage('nft');
document.getElementById('navHome').onclick = () => showPage('home');
document.getElementById('navStaking').onclick = () => showPage('staking');
document.getElementById('navInfo').onclick = () => showPage('info');

// Standaard naar home bij laden
showPage('home');

async function fetchPeckyPrice() {
  const payload = {
    function: "0x0dc694898dff98a1b0447e0992d0413e123ea80da1021d464a4fbaf0265870d8::router::get_reserves_size",
    type_arguments: [
      "0xe54b95920ef1cf9483705a32eab8526f270bc2f936dfb4112fd6ef971509d85d::Coin::Pecky",
      "0x1::supra_coin::SupraCoin",
      "0x0dc694898dff98a1b0447e0992d0413e123ea80da1021d464a4fbaf0265870d8::curves::Uncorrelated"
    ],
    arguments: []
  };

  try {
    const res = await fetch("https://rpc-mainnet.supra.com/rpc/v2/view", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    const data = await res.json();
    const [peckyReserve, supraReserve] = data?.result?.map(BigInt);

    if (!peckyReserve || !supraReserve || peckyReserve === 0n) return null;

    // Both reserves are integers (micro-units)
    // So: price in Supra per Pecky = (supraReserve / peckyReserve) * 0.01
    const price = Number(supraReserve) / Number(peckyReserve) * 0.01;
    return price;
  } catch (err) {
    console.warn("Failed to fetch Pecky price:", err);
    return null;
  }
}

async function checkNftStatus() {
  const input = document.getElementById("nftTokenInput");
  let tokenId = input.value.trim();
  if (!/^\d{1,3}$/.test(tokenId)) {
    showPopup("Please enter a valid 1-3 digit Token ID.");
    return;
  }
  tokenId = String(Number(tokenId));
  const tokenName = `TOKEN_${tokenId}`;

  // 1. Check: Is de airdrop nog beschikbaar voor deze NFT?
  let airdropAvailable = false;
  try {
    const url = "https://rpc-mainnet.supra.com/rpc/v1/view";
    const payload = {
      function: "0xe54b95920ef1cf9483705a32eab8526f270bc2f936dfb4112fd6ef971509d85d::Coin::has_claimed_NFT_airdrop",
      type_arguments: [],
      arguments: [tokenName]
    };
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    const data = await response.json();
    airdropAvailable = data?.result?.[0] !== true; // TRUE = claimed, so not available
  } catch {
    showPopup("Failed to check airdrop claim status.");
    return;
  }

  // 2. Check: Wanneer mag de volgende maandelijkse NFT-claim?
  let claimStatus = await getTokenClaimStatus(tokenName);
  let claimText = "";
  if (claimStatus.status === "claimable") {
    claimText = `<span style="color:#29cf41; font-weight:600;">Available now!</span>`;
  } else if (claimStatus.status === "cooldown") {
    claimText = `<span style="color:#fff; font-weight:500;">${claimStatus.text}</span>`;
  } else {
    claimText = `<span style="color:#fff; font-weight:500;">Unknown</span>`;
  }

  let airdropText = airdropAvailable
    ? `<span style="color:#29cf41; font-weight:600;">Yes, still claimable!</span>`
    : `<span style="color:#e53935; font-weight:600;">No, it's already claimed.</span>`;

  // Pop-up HTML
  const popupHtml = `
    <div style="max-width:340px; font-size:14px; line-height:1.6;">
      <div style="font-size:17px; font-weight:700; color:#fff; text-align:center; letter-spacing:1px; margin-bottom:13px;">
        NFT Token ID: <span style="color:#fff">${tokenId}</span>
      </div>
      <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;gap:10px;">
        <div style="font-size:14px;font-weight:600;color:#fff;margin-bottom:4px;">
          Airdrop reward claimable?
        </div>
        <div>${airdropText}</div>
      </div>
      <div style="margin-top:17px;">
        <div style="text-align:center;font-size:14px;font-weight:600;color:#fff;margin-bottom:4px;">
          Next Monthly Claim:
        </div>
        <div style="text-align:center;">${claimText}</div>
      </div>
    </div>
  `;

  showPopup(popupHtml, { long: true, html: true });
}


// === NFT Airdrop Reward claim-knop functionaliteit ===
// === NFT Airdrop Reward claim-knop functionaliteit (nu via dropdown) ===
async function claimNftAirdropReward() {
  if (!walletAddress) return showPopup("Connect your wallet first.");
  const provider = getProvider();
  if (!provider?.createRawTransactionData) return showPopup("Starkey wallet unsupported.");

  // Pak de gekozen NFT uit de dropdown
  const dropdown = document.getElementById("nftTokenIdSelect");
  if (!dropdown || !dropdown.value) {
    showPopup("Select an NFT from the dropdown first.");
    return;
  }
  const tokenId = dropdown.value.trim();
  if (!/^\d{1,3}$/.test(tokenId)) {
    showPopup("Invalid NFT selection.");
    return;
  }
  const tokenName = `TOKEN_${tokenId}`;
  const tokenArg = bcsSerializeStr(tokenName);

  try {
    const payload = [
      walletAddress,
      0,
      PECKY_COIN_MODULE,
      "Coin",
      "claim_nft_airdrop",
      [],
      [tokenArg],
      {}
    ];
    const txData = await provider.createRawTransactionData(payload);
    const txHash = await provider.sendTransaction({
      data: txData,
      from: walletAddress,
      to: PECKY_COIN_MODULE,
      chainId: "8",
      value: ""
    });

    // Zet de txHash in je status-box (zelfde plek als de andere knoppen)
    document.getElementById("status").innerText = `NFT Airdrop Tx hash: ${txHash}`;
    await getPeckyBalance(walletAddress);

    // Optioneel: wacht tot claim verwerkt is
    const claimed = await waitForClaimedAmount(txHash);
    if (claimed) {
      const formatted = formatPeckyAmount(claimed);
      showPopup(`Claimed {{icon}}${formatted}`, { long: true });
    } else {
      let failureMessage = await getFailureReason(txHash);
      showPopup(failureMessage, { long: true });
    }
  } catch (err) {
    showPopup("NFT Airdrop claim failed.");
  }
}

document.getElementById("nftAirdropClaimBtn").addEventListener("click", claimNftAirdropReward);

async function updateVaultProgress() {
  try {
    const res = await fetch(VAULT_AIRDROP_URL);
    const json = await res.json();
    const remainingRaw = json?.result?.[0]?.vault?.value || "0"; 
    const remaining = Number(BigInt(remainingRaw) / 1_000_000n);
    const pct = Math.max(0, Math.min(100, (remaining / AIRDROP_VAULT_TOTAL) * 100));
    const remainingStr = remaining.toLocaleString("en-US");
    const bar = document.getElementById("vaultBar");
    const text = document.getElementById("vaultBarText");
    if (bar) bar.style.width = `${pct}%`;
    if (text) text.textContent = `${remainingStr} $Pecky left`;
  } catch (err) {
    console.warn("Vault progress fetch failed", err);
  }
}

async function updateVaultNftProgress() {
  try {
    const res = await fetch(VAULT_NFT_URL);
    const json = await res.json();
    const remainingRaw = json?.result?.[0]?.vault?.value || "0";
    const remaining = Number(BigInt(remainingRaw) / 1_000_000n); // 6 decimals
    // Gebruik jouw totale NFT pool, bijvoorbeeld:
    const NFT_POOL_TOTAL = 450_000_000_000;
    const pct = Math.max(0, Math.min(100, (remaining / NFT_POOL_TOTAL) * 100));
    const remainingStr = remaining.toLocaleString("en-US");
    const bar = document.getElementById("vaultNftBar");
    const text = document.getElementById("vaultNftBarText");
    if (bar) bar.style.width = `${pct}%`;
    if (text) text.textContent = `${remainingStr} $Pecky left in NFT pool`;
  } catch (err) {
    const text = document.getElementById("vaultNftBarText");
    if (text) text.textContent = "Could not load NFT pool";
  }
}


function getProvider() {
  if (!supraProvider && window.starkey?.supra) {
    supraProvider = window.starkey.supra;
  }
  return supraProvider;
}

async function checkIsPeckyRegistered(address) {
  if (!address) return false;
  const url = "https://rpc-mainnet.supra.com/rpc/v1/view";
  const payload = {
    function: "0xe54b95920ef1cf9483705a32eab8526f270bc2f936dfb4112fd6ef971509d85d::Coin::is_pecky_registered",
    arguments: [address],
    type_arguments: []
  };

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    const text = await response.text();
    const contentType = response.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) return false;

    const data = JSON.parse(text);

    if (data?.result?.length > 0) {
      return !!data.result[0];
    }
    return false;
  } catch {
    return false;
  }
}

async function updateBotPageStatus() {
  const botStatusValue = document.getElementById("botActiveStatusValue");
  const botDaysLeft = document.getElementById("botDaysLeft");
  // Alleen uitvoeren als de elementen bestaan (dus pagina is geladen)
  if (botStatusValue || botDaysLeft) {
    await checkPeckyBotActive();
    if (typeof getPeckyBotDays === "function") {
      await getPeckyBotDays();
    }
  }
}


async function handleWallet() {
  const registerBtn   = document.getElementById("registerBtn");
  const btn           = document.getElementById("connectBtn");
  const walletStatus  = document.getElementById("walletStatus");
  const peckyAmount   = document.getElementById("peckyAmount");
  const nftDropdown   = document.getElementById("nftTokenIdSelect");

  if (registerBtn) {
    registerBtn.innerHTML = "Checking registration…";
    registerBtn.disabled = true;
    registerBtn.style.opacity = "0.5";
  }

  const isConnected = walletAddress !== null;

  // ===== WALLET DISCONNECT =====
  if (isConnected) {
    const provider = getProvider();
    if (provider && typeof provider.disconnect === "function") {
      try { await provider.disconnect(); } catch (e) {}
    }
    walletAddress = null;
    walletStatus.innerText = '';
    if (peckyAmount) peckyAmount.textContent = "*";
    btn.innerHTML = `Connect Wallet`;
    showPopup("Wallet disconnected");
    if (nftDropdown) {
      nftDropdown.innerHTML = '<option value="">Connect wallet</option>';
      nftDropdown.disabled = true;
    }
    if (registerBtn) {
      registerBtn.innerHTML = 'Register<br><span style="font-size: 12px; font-style: italic;">(required only once)</span>';
      registerBtn.disabled = false;
      registerBtn.style.opacity = "1";
    }
    await updateStakedDisplay();
    if (window.stakedBalanceInterval) clearInterval(window.stakedBalanceInterval);
    await updateFuturaClaimStatus();
    if (window.futuraClaimStatusInterval) clearInterval(window.futuraClaimStatusInterval);
    document.getElementById("nodePanelMount")?.replaceChildren();

    // ---- ALTIJD proberen botstatus te updaten, als de elementen bestaan! ----
    await updateBotPageStatusAlways();

    /* ====== TOEGEVOEGD: Discord UI updaten bij disconnect ====== */
    if (typeof refreshDiscordUI === "function") {
      await refreshDiscordUI();
    }
    /* ========================================================== */

    return;
  }

  // ===== WALLET CONNECT =====
  const provider = getProvider();
  if (!provider) return showPopup("Starkey wallet not found");

  try {
    const accounts = await provider.connect();
    if (!accounts?.length) return showPopup("Wallet connection failed");

    walletAddress = accounts[0];

    try {
      await provider.changeNetwork({ chainId: "8" });
      showPopup("Switched to Supra mainnet...", { long: false });
    } catch (err) {
      showPopup("Failed to switch to mainnet!", { long: true });
      console.warn("Network switch failed", err);
    }

    const short = walletAddress.slice(0, 6) + "..." + walletAddress.slice(-4);
    btn.innerHTML = `Disconnect Wallet<br><em style="color:white; font-size: 13px;">${short}</em>`;
    walletStatus.innerText = '';
    showPopup("Wallet connected");

    await getPeckyBalance(walletAddress);
    if (window.peckyInterval) clearInterval(window.peckyInterval);
    window.peckyInterval = setInterval(() => {
      if (walletAddress) getPeckyBalance(walletAddress);
    }, 30000);

    if (registerBtn) {
      registerBtn.innerHTML = "Checking registration…";
      registerBtn.disabled = true;
      registerBtn.style.opacity = "0.5";
    }
    await renderStakePanel();
    await renderUserStakesPanel();
    await renderPendingUnstakesPanel();

    const isRegistered = await checkIsPeckyRegistered(walletAddress);
    await updateRegisterButton(walletAddress);

    await updateFuturaClaimStatus();
    if (window.futuraClaimStatusInterval) clearInterval(window.futuraClaimStatusInterval);
    window.futuraClaimStatusInterval = setInterval(updateFuturaClaimStatus, 60000);

    await updateStakedDisplay();
    if (window.stakedBalanceInterval) clearInterval(window.stakedBalanceInterval);
    window.stakedBalanceInterval = setInterval(updateStakedDisplay, 60000);

    if (isRegistered && nftDropdown) {
      await fillNftDropdown(walletAddress);
    } else if (nftDropdown) {
      nftDropdown.innerHTML = '<option value="">Register first</option>';
      nftDropdown.disabled = true;
    }

    // ---- ALTIJD proberen botstatus te updaten, als de elementen bestaan! ----
    await updateBotPageStatusAlways();

    /* ====== TOEGEVOEGD: Discord UI updaten bij connect ====== */
    if (typeof refreshDiscordUI === "function") {
      await refreshDiscordUI();
    }
    /* ======================================================== */

  } catch (err) {
    console.error(err);
    showPopup("Connection error");
  }
}

async function fetchStakedSupra(address) {
  if (!address) return 0n;
  const payload = {
    function: STAKE_VIEW_FN,
    type_arguments: [],
    arguments: [MERIDIAN_POOL, address]
  };
  try {
    const res = await fetch("https://rpc-mainnet.supra.com/rpc/v1/view", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    const raw = BigInt(data?.result?.[0] || 0);
    return raw;                      // waarde in micro-SUPRA
  } catch {
    return 0n;
  }
}

function formatSupra(valMicro) {
  return (Number(valMicro) / 100_000_000).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " $SUPRA";
}

async function updateStakedDisplay() {
  await updateSupraBalances();
}

/* ---------- SUPRA-wallet & staked balans ---------- */

async function fetchSupraWalletBalance(addr) {
  if (!addr) return 0n;
  const payload = {
    function: "0x1::coin::balance",
    type_arguments: ["0x1::supra_coin::SupraCoin"],
    arguments: [addr]
  };
  try {
    const res = await fetch("https://rpc-mainnet.supra.com/rpc/v1/view", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    // Nieuwe response is direct een array met 1 value in stringvorm
    if (Array.isArray(data?.result) && data.result[0]) {
      return BigInt(data.result[0]);
    }
    return 0n;
  } catch (e) {
    console.error("Supra balance error:", e);
    return 0n;
  }
}

function formatSupraPretty(micro) {
  return (Number(micro) / 100_000_000).toLocaleString("en-US", { 
    minimumFractionDigits: 2, 
    maximumFractionDigits: 2 
  }) + " $SUPRA";
}

async function updateSupraBalances(){
  const walEl   = document.getElementById("supraWalletBalance");   // nieuwe id!
  const stakeEl = document.getElementById("supraStakedBalance");   // nieuwe id!
  if(!walEl || !stakeEl){ return; }

  const [walRaw, stakedRaw] = await Promise.all([
      fetchSupraWalletBalance(walletAddress),
      fetchStakedSupra(walletAddress)
  ]);

  walEl.textContent   = formatSupraPretty(walRaw);
  stakeEl.textContent = formatSupraPretty(stakedRaw);
}

function hexStrToByteArray(hex) {
  return hex.match(/.{1,2}/g).map(byte => parseInt(byte, 16));
}

async function addStake() {
  if (!walletAddress) return showPopup("Connect wallet first");
  const input = document.getElementById("stakeAmountInput");
  const amountStr = (input?.value || "").trim().replace(",", ".");
  if (!amountStr || isNaN(amountStr)) return showPopup("Enter a valid amount");
  const amount = BigInt(Math.floor(parseFloat(amountStr) * 1e8));
  if (amount <= 0n) return showPopup("Enter a positive amount");
  const provider = getProvider();
  if (!provider?.createRawTransactionData) return showPopup("Starkey wallet unsupported");

  try {
    // Pool address naar bytes (als array van getallen)
    const poolNo0x = MERIDIAN_POOL.replace(/^0x/, "");
    const poolVector = hexStrToByteArray(poolNo0x);

    // Amount als u64 little-endian
    const amountLE = new BigUint64Array([amount]);
    const amountVector = Array.from(new Uint8Array(amountLE.buffer));

    // Debug: output is [getallen], geen "0x..."
    // console.log("POOL", poolVector, "AMOUNT", amountVector);

    const payload = [
      walletAddress,
      0,
      "0x1",
      "pbo_delegation_pool",
      "add_stake",
      [],
      [poolVector, amountVector], // <-- dit is wat Move verwacht!
      {}
    ];

    const txData = await provider.createRawTransactionData(payload);
    const txHash = await provider.sendTransaction({
      data: txData,
      from: walletAddress,
      to: "0x1",
      chainId: "8",
      value: ""
    });

    showPopup("Stake submitted…", { long: true });
    document.getElementById("status").innerText = `Stake Tx: ${txHash}`;
    input.value = "";

    await waitForClaimedAmount(txHash, 5, 4000);
    await updateStakedDisplay();
  } catch (err) {
    console.error(err);
    showPopup("Stake failed");
  }
}

async function updateFuturaClaimStatus() {
  const btn = document.getElementById("futuraClaimBtn");        // de claim button
  const btnSub = document.getElementById("futuraClaimSubText"); // countdown tekst
  if (!walletAddress) {
    if (btn) btn.disabled = true;
    if (btnSub) btnSub.textContent = "";
    return;
  }
  try {
    const url = "https://rpc-mainnet.supra.com/rpc/v1/tables/0x68ff22fd7edc5d53bb61af22aa979170286489af715fbab3d080ed57df6717a4/item";
    const payload = {
      key_type: "address",
      value_type: "u64",
      key: walletAddress
    };
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    const data = await response.json();
    const lastClaimTimestamp = Number(data);
    if (isNaN(lastClaimTimestamp)) {
      if (btn) btn.disabled = false;
      if (btnSub) btnSub.textContent = "next claim: now";
      return;
    }
    const nextClaimTime = lastClaimTimestamp + 86400; // 24 uur cooldown
    const now = Math.floor(Date.now() / 1000);
    const secondsLeft = nextClaimTime - now;
    if (secondsLeft <= 0) {
      if (btn) btn.disabled = false;
      if (btnSub) btnSub.textContent = "next claim: now";
    } else {
      if (btn) btn.disabled = true;
      const h = Math.floor(secondsLeft / 3600);
      const m = Math.floor((secondsLeft % 3600) / 60);
      btnSub.textContent = `next claim in ${h > 0 ? h + "h " : ""}${m}m`;
    }
  } catch (err) {
    if (btn) btn.disabled = true;
    if (btnSub) btnSub.textContent = "";
  }
}

function toggleSidebar(forceClose = false) {
  const sidebar = document.getElementById("sidebar");
  const overlay = document.getElementById("sidebarOverlay");
  const isOpen = sidebar.classList.contains("open");

  if (forceClose || isOpen) {
    sidebar.classList.remove("open");
    overlay.classList.remove("active");
  } else {
    sidebar.classList.add("open");
    overlay.classList.add("active");
  }
}

async function fetchOwnedNfts(walletAddress) {
  if (!walletAddress) return [];
  const apiUrl = `https://api.pecky.me/api/nfts?wallet=${walletAddress}`;
  try {
    const res = await fetch(apiUrl);
    if (!res.ok) return [];
    const data = await res.json();
    // Verwacht: { owned_tokens: [ { name: "TOKEN_343", ... }, ... ] }
    if (Array.isArray(data.owned_tokens)) {
      return data.owned_tokens;
    }
    return [];
  } catch (err) {
    return [];
  }
}

async function withRetry(fn, retries = 100, delayMs = 500) {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      if (attempt < retries) {
        await new Promise(resolve => setTimeout(resolve, delayMs * (attempt + 1)));
      } else {
        console.warn("❌ Max retries reached:", err);
        return { status: "error", text: "error" };
      }
    }
  }
}

async function getTokenClaimStatus(tokenName) {
  try {
    const url = `https://rpc-mainnet.supra.com/rpc/v1/tables/${TABLE_HANDLE}/item`;
    const encoder = new TextEncoder();
    const hexKey = "0x" + Array.from(encoder.encode(tokenName))
      .map(byte => byte.toString(16).padStart(2, '0'))
      .join("");
    const payload = {
      key_type: "vector<u8>",
      value_type: "u64",
      key: hexKey
    };

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    const data = await response.json();
    const lastClaimTimestamp = Number(data);

    if (isNaN(lastClaimTimestamp)) {
      return { status: "unknown", text: "First claim?" };
    }

    const cooldown = 30 * 24 * 60 * 60;
    const nextClaimTime = lastClaimTimestamp + cooldown;
    const now = Math.floor(Date.now() / 1000);
    const secondsLeft = nextClaimTime - now;

    if (secondsLeft <= 0) {
      return { status: "claimable", text: 'claimable ✓' };
    } else {
      const d = Math.floor(secondsLeft / 86400);
      const h = Math.floor((secondsLeft % 86400) / 3600);
      const m = Math.floor((secondsLeft % 3600) / 60);
      return {
        status: "cooldown",
        text: `next claim in${d > 0 ? " " + d + "d" : ""}${h > 0 ? " " + h + "h" : ""}${d === 0 && m > 0 ? " " + m + "m" : ""}`
      };
    }
  } catch {
    return { status: "error", text: "error" };
  }
}

let __peckyFillRunId = 0;
async function fillNftDropdown(walletAddress) {
  const select = document.getElementById("nftTokenIdSelect");
  if (!select) return;

  const runId = ++__peckyFillRunId; // race-guard: alleen laatste run mag schrijven
  select.disabled = true;
  select.innerHTML = '<option value="">Loading your NFTs…</option>';

  // NFT's laden uit API
  const apiUrl = `https://api.pecky.me/api/nfts?wallet=${walletAddress}`;
  let ownedTokens = [];
  try {
    const res = await fetch(apiUrl);
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data.owned_tokens)) {
        ownedTokens = data.owned_tokens;
      }
    }
  } catch (e) {
    ownedTokens = [];
  }

  // Als er een nieuwere run is gestart, stop deze run
  if (runId !== __peckyFillRunId) return;

  // DEDUPE op token-naam (case-insensitive)
  const seen = new Set();
  ownedTokens = ownedTokens.filter(t => {
    const key = (t?.name || "").toUpperCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  // Optioneel: sorteren op tokennummer
  ownedTokens.sort((a, b) => {
    const ia = parseInt((a?.name || "").replace("TOKEN_", ""), 10) || 0;
    const ib = parseInt((b?.name || "").replace("TOKEN_", ""), 10) || 0;
    return ia - ib;
  });

  // Leeg en vul
  select.innerHTML = "";
  if (!ownedTokens.length) {
    select.innerHTML = '<option value="">No NFTs found</option>';
    select.disabled = true;
    return;
  }
  select.disabled = false;

  for (const token of ownedTokens) {
    // check of deze run nog de nieuwste is (tegen parallelle async claim-status calls)
    if (runId !== __peckyFillRunId) return;

    const id = (token.name || "").replace("TOKEN_", "");
    let label = `${token.name}`;
    if (token.rarity && token.rarity !== "Onbekend") label += ` (${token.rarity})`;

    // Claimstatus ophalen (on-chain) — mag falen zonder te breken
    try {
      const claimStatus = await getTokenClaimStatus(token.name);
      if (claimStatus.status === "claimable") {
        label += " ✅";
      } else if (claimStatus.status === "cooldown") {
        label += ` ⏳${claimStatus.text.replace("next claim in", "")}`;
      }
    } catch {}

    const opt = document.createElement("option");
    opt.value = id;
    opt.text = label;
    select.appendChild(opt);
  }
}


// Voor %-knoppen/stake: globale cache bovenin je script
// let __peckyBalanceCache = { micro: 0n, pecky: 0 };  // <-- zet dit 1x bij je globals

async function getPeckyBalance(address) {
  try {
    const resourceType = "0x0000000000000000000000000000000000000000000000000000000000000001::coin::CoinStore<0xe54b95920ef1cf9483705a32eab8526f270bc2f936dfb4112fd6ef971509d85d::Coin::Pecky>";
    const encoded = encodeURIComponent(resourceType);

    let json = null;

    // 1) v2 single-resource (snel en duidelijk)
    try {
      const resV2 = await fetch(`https://rpc-mainnet.supra.com/rpc/v2/accounts/${address}/resources/${encoded}`);
      json = await resV2.json();
    } catch {}

    // 2) v1 single-resource pad (zoals je had)
    if (!json?.data?.coin?.value && !Array.isArray(json?.result)) {
      try {
        const resV1single = await fetch(`https://rpc-mainnet.supra.com/rpc/v1/accounts/${address}/resources/${encoded}`);
        json = await resV1single.json();
      } catch {}
    }

    // 3) v1 all-resources fallback (zoek CoinStore tussen result)
    let raw = "0";
    if (json?.data?.coin?.value) {
      raw = json.data.coin.value;
    } else if (Array.isArray(json?.result)) {
      const cs = json.result.find(r => r?.type === resourceType);
      raw = cs?.coin?.value || cs?.data?.coin?.value || "0";
    }

    const peckyAmount = document.getElementById("peckyAmount");
    const peckyLabel  = document.getElementById("peckyBalance");
    const peckyValueDiv = document.getElementById("peckyValueInSupra");

    // ---- update balance cache (altijd, ook bij 0) ----
    const rawMicro = BigInt(raw || "0");
    __peckyBalanceCache = {
      micro: rawMicro,
      pecky: Number(rawMicro) / 1_000_000
    };

    if (rawMicro === 0n) {
      if (peckyAmount) peckyAmount.textContent = "0 $Pecky";
      if (peckyValueDiv) peckyValueDiv.textContent = "";
      if (peckyLabel) {
        const title = peckyLabel.querySelector("strong");
        if (title) title.textContent = "Wallet balance";
      }
      return;
    }

    // Format en UI
    const value = __peckyBalanceCache.pecky; // Number
    let formatted;
    if (value >= 1_000_000_000) {
      formatted = `${(value / 1_000_000_000).toFixed(2)}B`;
    } else if (value >= 1_000_000) {
      formatted = `${(value / 1_000_000).toFixed(2)}M`;
    } else {
      formatted = value.toFixed(2);
    }

    if (peckyAmount) {
      peckyAmount.innerHTML = `<img src="pecky-icon.png" style="height: 16px; vertical-align: middle; margin-right: 4px;"> $Pecky: ${formatted}`;
    }
    if (peckyLabel) {
      const title = peckyLabel.querySelector("strong");
      if (title) title.textContent = "Wallet balance";
    }

    // Worth in SUPRA (hele getal, komma-formaat)
    if (peckyValueDiv) {
      const price = await fetchPeckyPrice().catch(() => null);
      if (price) {
        const peckyValueInSupra = value * price;
        peckyValueDiv.textContent =
          `Your Pecky balance is worth: ${peckyValueInSupra.toLocaleString("en-US", { maximumFractionDigits: 0 })} $SUPRA`;
      } else {
        peckyValueDiv.textContent = "";
      }
    }

  } catch (err) {
    const peckyAmount   = document.getElementById("peckyAmount");
    const peckyValueDiv = document.getElementById("peckyValueInSupra");
    if (peckyAmount) peckyAmount.textContent = "Error";
    if (peckyValueDiv) peckyValueDiv.textContent = "";
    // Laat cache ongewijzigd bij error (houdt laatste bekende waarde voor UX)
  }
}


async function fetchVaultNFTValue() {
  try {
    const resp = await fetch(VAULT_NFT_URL);
    const json = await resp.json();
    let valStr = json?.result?.[0]?.vault?.value; 
    if (typeof valStr !== "string") return null;
    let mainVal = valStr.length > 6 ? valStr.slice(0, -6) : "0";
    let valueInt = parseInt(mainVal, 10);
    return valueInt;
  } catch {
    return null;
  }
}
function formatMillions(n) {
  if (n >= 1_000_000_000) {
    return (n / 1_000_000_000).toFixed(2) + "B";
  } else if (n >= 1_000_000) {
    return (n / 1_000_000).toFixed(2) + "M";
  } else {
    return n.toFixed(2);
  }
}
async function showAllNftRewards() {
  const vaultVal = await fetchVaultNFTValue();
  if (!vaultVal) return;
  const cards = [
    { id: "common",    pct: NFT_PERCENT.common },
    { id: "rare",      pct: NFT_PERCENT.rare },
    { id: "epic",      pct: NFT_PERCENT.epic },
    { id: "legendary", pct: NFT_PERCENT.legendary },
    { id: "mythic",    pct: NFT_PERCENT.mythic }
  ];
  for (const {id, pct} of cards) {
    const reward = Math.round(vaultVal * pct);
    const el = document.getElementById(id + "-reward");
    if (el) el.textContent = `Monthly NFT reward is now ${formatMillions(reward)} $Pecky`;
  }
}

function bcsSerializeStr(str) {
  const encoder = new TextEncoder();
  const strBytes = encoder.encode(str);
  const uleb = [];
  let n = strBytes.length;
  while (true) {
    let byte = n & 0x7f;
    n >>= 7;
    if (n === 0) {
      uleb.push(byte);
      break;
    } else {
      uleb.push(byte | 0x80);
    }
  }
  return [...uleb, ...strBytes];
}


let isRegisteredPecky = false;

async function updateRegisterButton(address) {
  const btn = document.getElementById("registerBtn");
  if (!btn) return;
  if (!address) {
    btn.innerHTML = 'Register<br><span style="font-size: 12px; font-style: italic;">(required only once)</span>';
    btn.disabled = false;
    btn.style.opacity = "1";
    isRegisteredPecky = false;
    return;
  }

  btn.innerHTML = 'Checking registration…';
  btn.disabled = true;
  btn.style.opacity = "0.5";
  isRegisteredPecky = false;

  const registered = await checkIsPeckyRegistered(address);

  if (registered === true) {
    btn.innerHTML = 'Already registered!';
    btn.disabled = false;
    btn.style.opacity = "0.5";
    isRegisteredPecky = true;
  } else {
    btn.innerHTML = 'Register<br><span style="font-size: 12px; font-style: italic;">(required only once)</span>';
    btn.disabled = false;
    btn.style.opacity = "1";
    isRegisteredPecky = false;
  }
}


async function registerUser() {
  if (!walletAddress) return showPopup("Connect wallet first");
  if (isRegisteredPecky) {
    showPopup("You are already registered for Pecky rewards!");
    return;
  }
  try {
    const provider = getProvider();
    const payload = [
      walletAddress,
      0,
      PECKY_COIN_MODULE,
      "Coin",
      "register",
      [],
      [],
      {}
    ];
    const txData = await provider.createRawTransactionData(payload);
    await provider.sendTransaction({
      data: txData,
      from: walletAddress,
      to: PECKY_COIN_MODULE,
      chainId: "8",
      value: ""
    });
    showPopup("Registration complete.");
    await updateRegisterButton(walletAddress)
  } catch (err) {
    showPopup("Registration failed or already done.");
  }
}


async function claimFuturaTokens() {
  if (!walletAddress) return showPopup("Connect your wallet first.");
  const provider = getProvider();
  if (!provider?.createRawTransactionData) return showPopup("Starkey wallet unsupported");

  try {
    const payload = [
      walletAddress,
      0,
      PECKY_COIN_MODULE,
      "Coin",
      "claim_from_airdrop_vault_staking",
      [],
      [],
      {}
    ];
    const txData = await provider.createRawTransactionData(payload);
    const txHash = await provider.sendTransaction({
      data: txData,
      from: walletAddress,
      to: PECKY_COIN_MODULE,
      chainId: "8",
      value: ""
    });

    document.getElementById("status").innerText = `Futura Meridian Tx hash: ${txHash}`;
    await getPeckyBalance(walletAddress);

    const claimed = await waitForClaimedAmount(txHash);
    if (claimed) {
      const formatted = formatPeckyAmount(claimed);
      showPopup(`Claimed {{icon}}${formatted}`, { long: true });
    } else {
      const failureMessage = await getFailureReason(txHash);
      showPopup(failureMessage, { long: true });
    }
    await updateFuturaClaimStatus();
  } catch (err) {
    showPopup("Futura claim failed");
  }
}

async function claimNft() {
  if (!walletAddress) return showPopup("Connect your wallet first.");
  const provider = getProvider();

  let tokenId = "";
  const dropdown = document.getElementById("nftTokenIdSelect");
  if (dropdown && dropdown.value) {
    tokenId = dropdown.value.trim();
  }
  if (!/^\d{1,3}$/.test(tokenId)) return showPopup("Select a valid NFT from the dropdown");

  const tokenArg = bcsSerializeStr(`TOKEN_${tokenId}`);

  try {
    const payload = [
      walletAddress,
      0,
      PECKY_COIN_MODULE,
      "ClaimNFT",
      "claim",
      [],
      [tokenArg],
      {}
    ];
    const txData = await provider.createRawTransactionData(payload);
    const txHash = await provider.sendTransaction({
      data: txData,
      from: walletAddress,
      to: PECKY_COIN_MODULE,
      chainId: "8",
      value: ""
    });

    document.getElementById("status").innerText = `NFT Tx hash: ${txHash}`;
    await getPeckyBalance(walletAddress);

    const claimed = await waitForClaimedAmount(txHash);
    if (claimed) {
      const formatted = formatPeckyAmount(claimed);
      showPopup(`Claimed NFT {{icon}}${formatted}`, { long: true });
    } else {
      let failureMessage = await getFailureReason(txHash);
      showPopup(failureMessage, { long: true });
    }
  } catch (err) {
    showPopup("NFT claim failed");
  }
}

let popupTimeout = null;
function showPopup(message, opts = {}) {
  const popup = document.getElementById("popup");
  if (!popup) return;
  if (opts.html) {
  popup.innerHTML = message;
  setTimeout(() => popup.classList.add("show"), 10);

  // Klik om te sluiten:
  function closeHtmlPopup() {
    popup.classList.remove("show");
    popup.removeEventListener("click", closeHtmlPopup);
    if (popupTimeout) clearTimeout(popupTimeout);
  }
  popup.addEventListener("click", closeHtmlPopup);

  if (popupTimeout) clearTimeout(popupTimeout);
  popupTimeout = setTimeout(() => closeHtmlPopup(), opts.long ? 30000 : 4000);

  return;
}

  popup.classList.remove("show", "minimize");
  popup.innerHTML = "";

  const content = document.createElement("div");
  content.className = "popup-content";
  const parts = message.split("{{icon}}");
  content.innerHTML = parts[0];

  if (parts.length > 1) {
    const icon = document.createElement("img");
    icon.src = "pecky-icon.png";
    icon.alt = "Pecky";
    icon.style.verticalAlign = "middle";
    icon.style.height = "22px";
    icon.style.width = "22px";
    content.appendChild(icon);

    if (parts[1]) {
      const span = document.createElement("span");
      span.innerHTML = " " + parts[1];
      content.appendChild(span);
    }
  }

  popup.appendChild(content);
  setTimeout(() => popup.classList.add("show"), 10);

  const timeout = opts.long ? 30000 : 4000;

  function closePopup(minimize = false) {
    popup.classList.remove("show", "minimize");
    if (popupTimeout) clearTimeout(popupTimeout);
    setTimeout(() => popup.classList.remove("show", "minimize"), 800);
    window.removeEventListener("mousedown", outsideListener);
    popup.removeEventListener("click", clickListener);
  }

  function outsideListener(e) {
    if (!popup.contains(e.target)) closePopup(true);
  }

  function clickListener() {
    closePopup(true);
  }

  if (opts.long) {
    window.addEventListener("mousedown", outsideListener);
    popup.addEventListener("click", clickListener);
  }

  if (popupTimeout) clearTimeout(popupTimeout);
  popupTimeout = setTimeout(() => closePopup(true), timeout);
}

async function getFailureReason(txHash) {
  try {
    const url = `https://rpc-mainnet.supra.com/rpc/v1/transactions/${txHash}`;
    const response = await fetch(url);
    const data = await response.json();
    const status = data?.output?.Move?.vm_status;

    if (status?.includes("0x64")) {
      return "Failed: You're claiming too soon. At least 24 hours between claims. Come back tomorrow.";
    } else if (status?.includes("0x65")) {
      return "Failed: You need at least 10k $SUPRA to claim free Pecky tokens.";
    } else if (status?.includes("0x3e7")) {
      return "Failed: Did you forget to register??";
    } else if (status?.includes("0xc8")) {
      return "Failed: You have not staked (enough) Supra on the Meridian node.";
    } else if (status?.includes("0x2329")) {
      return "Failed: Did you forget to register??";
    } else if (status?.includes("0x2d")) {
      return "Airdrop? More like air-nothing! This NFT claimed it already. 😅🐔";
    } else if (status?.includes("0x0")) {
      return "Oops! That token doesn't belong to you. Make sure your NFT is in your wallet!";
    } else if (status?.includes("0x1")) {
      return "Too soon! Each NFT can only claim once every 30 days. Try again later.";
    } else if (status?.includes("0x7d0")) {
      return "Nice try! You're already activated – no need to pay twice.";
    } else if (status?.includes("0x7d1")) {
      return "Please enter a positive number of days – we haven't invented negative time yet. 😉";
    } else if (status?.includes("0x7d2")) {
      return "You can't extend a bot that isn't active. Activate it first!";
    } else if (status?.includes("0x7d3")) {
      return "Your grace period has expired – extensions outside the 31-day window aren't allowed. Reactivate with Supra first.";

    } else {
      return "Transaction failed. Reason unknown.";
    }
  } catch {
    return "Transaction failed.";
  }
}


async function getClaimedAmountFromTx(txHash) {
  try {
    const url = `https://rpc-mainnet.supra.com/rpc/v1/transactions/${txHash}`;
    const resp = await fetch(url);
    const data = await resp.json();
    const events = data?.output?.Move?.events || [];
    for (const event of events) {
      if (event.type === "0x1::coin::CoinDeposit" && event.data?.amount) {
        return event.data.amount;
      }
    }
    return null;
  } catch {
    return null;
  }
}

async function waitForClaimedAmount(txHash, maxRetries = 10, delayMs = 2000) {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    const claimed = await getClaimedAmountFromTx(txHash);
    if (claimed) return claimed;
    if (attempt === 0) showPopup("Waiting for transaction confirmation...", { long: true });
    await new Promise(resolve => setTimeout(resolve, delayMs));
  }
  return null;
}


function formatPeckyAmount(amountRaw) {
  const amount = Number(amountRaw) / 1_000_000;
  if (amount >= 1_000_000_000) {
    return `<strong>${(amount / 1_000_000_000).toFixed(2)}B $Pecky</strong>`;
  } else if (amount >= 1_000_000) {
    return `<strong>${(amount / 1_000_000).toFixed(2)}M $Pecky</strong>`;
  } else {
    return `<strong>${amount.toFixed(2)} $Pecky</strong>`;
  }
}

async function activatePeckyBotWithSupra() {
  if (!walletAddress) return showPopup("Connect your wallet first.");
  const provider = getProvider();
  if (!provider?.createRawTransactionData) return showPopup("Starkey wallet unsupported");
  try {
    const payload = [
      walletAddress,
      0,
      PECKY_COIN_MODULE,
      "PeckyBotV2",
      "activate_peckybot_with_supra",
      [],
      [],
      {}
    ];
    const txData = await provider.createRawTransactionData(payload);
    const txHash = await provider.sendTransaction({
      data: txData,
      from: walletAddress,
      to: PECKY_COIN_MODULE,
      chainId: "8",
      value: ""
    });

    // Zet de hash in de statusbalk
    const statusEl = document.getElementById("status");
    if (statusEl) statusEl.innerText = `PeckyBot (Supra) Tx hash: ${txHash}`;

    // Toon direct een wachtende pop-up
    showPopup("Waiting for transaction confirmation...", { long: true });

    // Poll tot de bot actief wordt of tot max 10 pogingen
    let isActive = false;
    for (let i = 0; i < 10; i++) {
      await new Promise(r => setTimeout(r, 4000)); // 4s pauze
      isActive = await checkPeckyBotActive();
      if (isActive) break;
    }

    if (isActive) {
      showPopup("PeckyBot activated with Supra!", { long: true });
    } else {
      // Activatie is niet doorgegaan → haal de foutcode op
      const failureMsg = await getFailureReason(txHash);
      showPopup(failureMsg, { long: true });
    }

    await getPeckyBotDays();
  } catch {
    showPopup("Activation failed", { long: true });
  }
}



async function checkPeckyBotActive() {
  if (!walletAddress) return false;
  const url = "https://rpc-mainnet.supra.com/rpc/v1/view";
  const payload = {
    function: `${PECKY_COIN_MODULE}::PeckyBotV2::is_peckybot_active`,
    arguments: [walletAddress],
    type_arguments: []
  };
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    const data = await response.json();
    const isActive = data?.result?.[0] === true;
    // Update status tekst
    const statusValue = document.getElementById("botActiveStatusValue");
    if (statusValue) {
      statusValue.textContent = isActive ? "✅ PeckyBot is ACTIVE for this wallet" : "❌ Not active yet";
      statusValue.style.color = isActive ? "#29cf41" : "#ff9000";
    }
    // Update knop!
    const activateBtn = document.getElementById("activateBotSupraBtn");
    if (activateBtn) {
      activateBtn.disabled = isActive;
      activateBtn.style.opacity = isActive ? "0.4" : "1";
      activateBtn.style.cursor = isActive ? "not-allowed" : "pointer";
    }
    return isActive;
  } catch {
    const statusValue = document.getElementById("botActiveStatusValue");
    if (statusValue) statusValue.textContent = "Status unknown";
    return false;
  }
}

function bcsSerializeU64(num) {
  const arr = new ArrayBuffer(8);
  const view = new DataView(arr);
  view.setBigUint64(0, BigInt(num), true); // true = little-endian
  return Array.from(new Uint8Array(arr));
}

async function activatePeckyBotWithPecky() {
  if (!walletAddress) return showPopup("Connect your wallet first.");
  const provider = getProvider();
  if (!provider?.createRawTransactionData) return showPopup("Starkey wallet unsupported");

  const daysInput = document.getElementById("botDaysInput");
  const days = parseInt(daysInput.value.trim(), 10);
  if (!days || days <= 0) return showPopup("Enter valid number of days");

  const daysArg = bcsSerializeU64(days);

  try {
    // Sla huidig aantal dagen op
    const previousDays = await getPeckyBotDays();

    const payload = [
      walletAddress,
      0,
      PECKY_COIN_MODULE,
      "PeckyBotV2",
      "extend_peckybot_with_pecky",
      [],
      [daysArg],
      {}
    ];
    const txData = await provider.createRawTransactionData(payload);
    const txHash = await provider.sendTransaction({
      data: txData,
      from: walletAddress,
      to: PECKY_COIN_MODULE,
      chainId: "8",
      value: ""
    });

    // Zet de hash in de statusbalk
    const statusEl = document.getElementById("status");
    if (statusEl) statusEl.innerText = `PeckyBot (Pecky) Tx hash: ${txHash}`;

    // Toon "wacht op bevestiging"
    showPopup("Waiting for transaction confirmation...", { long: true });

    // Poll tot het aantal dagen stijgt
    let success = false;
    for (let i = 0; i < 10; i++) {
      await new Promise(r => setTimeout(r, 4000));
      const newDays = await getPeckyBotDays();
      if (newDays > previousDays) {
        success = true;
        break;
      }
    }

    if (success) {
      showPopup(`PeckyBot extended for ${days} day(s)!`, { long: true });
    } else {
      const failureMsg = await getFailureReason(txHash);
      showPopup(failureMsg, { long: true });
    }
  } catch {
    showPopup("Activation (Pecky) failed", { long: true });
  }
}

/***** ===== OPERATOR NODE PANEL (MAINNET) ===== *****/

// --- kleine helpers die dit paneel nodig heeft ---
function truthyDeep(v) {
  if (v === true) return true;
  if (typeof v === "number") return v !== 0;
  if (typeof v === "string") return ["true","1","yes"].includes(v.trim().toLowerCase());
  if (Array.isArray(v)) return v.length > 0 && v.some(truthyDeep);
  if (v && typeof v === "object") return Object.keys(v).some(k => truthyDeep(v[k]));
  return false;
}
// alias naar jouw bestaande serializer
const bcsStr = (s) => bcsSerializeStr(String(s));

// ---- supraView (MAINNET, met arg-check & debug) ----
async function supraView(functionId, args = [], typeArgs = []) {
  // walletAddress moet mee als arg bij deze view; log het nog even
  if (!Array.isArray(args)) args = [];
  // Debug: laat zien welke view we roepen en met welk adres
  try { console.debug("[view] call", functionId, "args:", args); } catch {}

  const url = "https://rpc-mainnet.supra.com/rpc/v2/view";
  const payload = { function: functionId, arguments: args, type_arguments: typeArgs };

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

  // Als Supra bij error geen JSON geeft, voorkom crash
  const text = await res.text();
  let data = {};
  try { data = JSON.parse(text); } catch { data = { raw: text }; }

  // v2 geeft { result: ... }
  return data?.result ?? null;
}


// === CONFIG ===
const STAKE_MODULE_ADDR  = "0xe54b95920ef1cf9483705a32eab8526f270bc2f936dfb4112fd6ef971509d85d";
const STAKE_MODULE_NAME  = "stake";
const STAKE_MODULE       = `${STAKE_MODULE_ADDR}::${STAKE_MODULE_NAME}`;
const NODE_TOKENS = Array.from({ length: 25 }, (_, i) => `TOKEN_${i + 1}`);

const isValidNodeTokenName = (n) => {
  const m = String(n).match(/^TOKEN_(\d{1,3})$/i);
  if (!m) return false;
  const id = Number(m[1]);
  return id >= 1 && id <= 25;
};


async function fetchOwnedNodeNfts(address, tokens = NODE_TOKENS) {
  if (!address) return [];

  
  try {
    const res = await fetch(`https://api.pecky.me/api/pecky-node-nfts?wallet=${address}`, {
      headers: { accept: "application/json" }
    });
    if (res.ok) {
      const json = await res.json();
      const arr = Array.isArray(json?.owned_tokens) ? json.owned_tokens : [];
      // ⚠️ FIX: niet beperken tot TOKEN_1..3 maar 1..25
      const fromApi = arr
        .map(t => String(t?.name || "").trim())
        .filter(isValidNodeTokenName);
      if (fromApi.length) return [...new Set(fromApi)];
    }
  } catch (e) {
    console.warn("[NodeAPI] error", e);
  }

  // 2) Fallback: on-chain `is_node_owner(node_id, address)`
  const truth = (r) => {
    const v = Array.isArray(r) ? r[0] : r;
    return v === true || v === 1 || v === "1";
  };

  const checks = await Promise.all(
    tokens.map(async (t) => {
      try {
        // ⚠️ FIX: gebruik de functieparameter `address`, niet de globale `walletAddress`
        const r = await supraView(`${STAKE_MODULE}::is_node_owner`, [t, address], []);
        return truth(r);
      } catch {
        return false;
      }
    })
  );

  return tokens.filter((t, i) => checks[i]);
}

// (optioneel) snelle helper:
async function isNodeOwner(address) {
  const owned = await fetchOwnedNodeNfts(address);
  return owned.length > 0;
}

// 2) UI mount + skeleton
function ensureNodePanelRoot() {
  // probeer binnen staking-pagina te mounten
  const host = document.getElementById("page-staking") || document.body;
  let mount = document.getElementById("nodePanelMount");
  if (!mount) { mount = document.createElement("div"); mount.id = "nodePanelMount"; host.appendChild(mount); }
  return mount;
}
function skeletonNodePanel() {
  const wrap = document.createElement("div");
  wrap.id = "nodePanel";
  wrap.style.cssText = `
    margin:16px auto; padding:16px;
    border:1px solid #1f2937; border-radius:14px;
    background:#0b1220; color:#e5e7eb;
    display:flex; flex-wrap:wrap;
    align-items:flex-start; justify-content:center;
    gap:18px; max-width:1040px;
  `;

  // --- uitleg + linker kolom (selector + reset + gif) ---
  wrap.innerHTML = `
    <div style="flex:1 1 560px; min-width:320px; max-width:620px; margin:0 auto;">
      <!-- UITLEG -->
      <div style="background:#0f172a; border:1px solid #1f2937; border-radius:12px; padding:14px 14px 10px; margin-bottom:14px;">
        <div style="font-weight:700; margin-bottom:6px;">🪶 Pecky Node Operator — Key Things to Know</div>

        <div style="font-weight:600; margin:8px 0 4px;">Activation</div>
        <ul style="margin:0 0 8px 18px; padding:0; line-height:1.5;">
          <li>You must own the Pecky Node Original NFT.</li>
          <li>You must have a minimum amount of Pecky LP tokens:</li>
          <li>Dexlyn LP tokens → 100M</li>
          <li>ATMOS LP tokens (50/50 weighted pool) → 1M</li>
          <li>Or a combination of both</li>
        </ul>

        <div style="color:#ffb020; font-weight:700; margin:8px 0 4px;">⚠️ Important:</div>
        <ul style="margin:0 0 8px 18px; padding:0; line-height:1.5;">
          <li>If your node becomes inactive (you lose the NFT or LP tokens):</li>
          <li>All unclaimed operator rewards are lost immediately.</li>
          <li>Reward accumulation stops until you’re eligible again.</li>
          <li>When reactivated, you start earning from zero again.</li>
        </ul>

        <hr style="border:none; border-top:1px solid #1f2937; margin:10px 0;">

        <div style="font-weight:600; margin:8px 0 4px;">Boosting APY with Rarity NFTs</div>
        <ul style="margin:0 0 8px 18px; padding:0; line-height:1.5;">
          <li>Attach Chicken Wings Original NFTs to increase your APY.</li>
          <li>Per rarity boost:</li>
          <li>Common → +0.5%</li>
          <li>Rare → +1.0%</li>
          <li>Epic → +1.5%</li>
          <li>Legendary → +2.0%</li>
          <li>Mythic → +2.5%</li>
          <li>Each rarity can be linked once (cannibals can be linked extra).</li>
          <li>You must hold the NFTs in your wallet — if you sell or lose them, they stop counting.</li>
        </ul>

        <hr style="border:none; border-top:1px solid #1f2937; margin:10px 0;">

        <div style="font-weight:600; margin:8px 0 4px;">Operator Rewards</div>
        <ul style="margin:0 0 8px 18px; padding:0; line-height:1.5;">
          <li>You earn rewards based on:</li>
          <li>The total PECKY staked on your node, and</li>
          <li>Your attached rarity NFTs (which define your APY).</li>
          <li>Claim regularly (&lt;30 days) to keep rewards growing.</li>
          <li>Payouts come from the global staking vault — if empty, the staking period has come to an end.</li>
        </ul>

        <hr style="border:none; border-top:1px solid #1f2937; margin:10px 0;">

        <div style="font-weight:600; margin:8px 0 4px;">Good Habits</div>
        <ul style="margin:0; padding:0 0 2px 18px; line-height:1.5;">
          <li>✅ Keep your Node NFT and LP tokens intact.</li>
          <li>✅ Claim at least once every 30 days.</li>
          <li>✅ Hold attached NFTs to maintain your boosted APY.</li>
          <li>✅ Avoid deactivation — once inactive, you lose your unclaimed rewards.</li>
        </ul>
      </div>

      <!-- Selector + Reset in één perfect uitgelijnde rij -->
      <div style="display:grid; grid-template-columns: 1fr auto; gap:10px; align-items:center; margin-bottom:10px;">
        <select id="nodeTokenSelect"
          style="
            width:100%;
            padding:10px 14px;
            min-height:42px;
            border-radius:10px;
            border:1px solid #1f2937;
            background:#0f172a; color:#e5e7eb;
            font-size:16px; letter-spacing:.2px;
          ">
        </select>

        <button id="btnResetNode" title="Reset node"
          style="
            padding:8px 12px;
            height:42px;
            border-radius:8px;
            border:1px solid #475569;
            background:#1e293b; color:#e5e7eb;
            cursor:pointer; font-size:12px; line-height:1;
            min-width:74px;
          ">
          Reset
        </button>
      </div>

      <!-- Node GIF -->
      <img id="nodeGif" src="" alt="Node NFT"
        style="
          width:96%; max-width:560px; height:auto;
          display:block; margin:8px auto 10px auto;
          object-fit:cover; border-radius:12px; border:1px solid #111;
        " />
    </div>

    <!-- RECHTER KOLOM -->
    <div style="flex:1 1 360px; min-width:300px; max-width:520px;">
      <div id="nodeApy" style="font-weight:600; margin-bottom:6px;">–</div>
      <div id="nodeRewards" style="font-weight:600; margin-bottom:12px;">–</div>
      <div id="nodeRightArea"></div>
    </div>
  `;

  // Reset functionaliteit
  setTimeout(() => {
    const btn = document.getElementById("btnResetNode");
    if (btn) btn.addEventListener("click", async () => {
      const nodeId = document.getElementById("nodeTokenSelect")?.value;
      if (!nodeId) return showPopup("No node selected.");
      if (!confirm(`Reset ${nodeId}? All your unclaimed rewards will be lost.`)) return;
      try {
        const txh = await txResetNode(nodeId);
        showPopup(`Node reset`, { long:true });
        await renderRightAreaFor(nodeId);
      } catch (e) {
        const msg = await getFailureReason(e?.hash || "");
        showPopup(msg || "Reset failed", { long:true });
      }
    });
  }, 0);

  return wrap;
}
function updateNodeGif(nodeId) {
  const img = document.getElementById("nodeGif");
  if (img) img.src = `https://smartnft.pecky.me/animation/pecky-node/${nodeId}.gif?cb=${Date.now()}`;
}

// 3) On-chain views
async function listAvailableLocations() {
  try {
    const r = await supraView(`${STAKE_MODULE}::list_available_locations`, [], []);
    const arr = Array.isArray(r) ? (r[0] ?? r) : [];
    return Array.isArray(arr) ? arr.map(String) : [];
  } catch { return []; }
}
async function isNodeActivated(nodeId) {
  try {
    const r = await supraView(`${STAKE_MODULE}::is_node_active`, [nodeId], []);
    return Array.isArray(r) ? (r[0] === true || r[0] === 1) : !!r;
  } catch { return false; }
}
async function getOperatorRewards(nodeId) {
  try {
    const r = await supraView(`${STAKE_MODULE}::get_operator_rewards`, [nodeId], []);
    const micro = Array.isArray(r) ? BigInt(r[0] ?? 0) : BigInt(r ?? 0);
    return Number(micro) / 1_000_000;
  } catch { return 0; }
}
async function getOperatorApy(nodeId) {
  try {
    const r = await supraView(
      `${STAKE_MODULE}::get_operator_apy_for_owner_bps`,
      [nodeId],
      []
    );

    // Pak waarde (array/string/number) en zet om naar number
    let v = Array.isArray(r) ? (r[0] ?? 0) : r;
    if (typeof v === "string" && /^0x/i.test(v)) v = parseInt(v, 16); // safety voor hex
    const bps = Number(v);

    return isFinite(bps) ? bps / 100 : 0; // 500 bps -> 5 (%)
  } catch {
    return 0;
  }
}
async function getAttachedMainNames(nodeId) {
  try {
    const r = await supraView(`${STAKE_MODULE}::get_attached_main_names`, [nodeId], []);
    const arr = Array.isArray(r) ? (r[0] ?? r) : [];
    return (Array.isArray(arr) ? arr : []).map(x => String(x)).filter(Boolean);
  } catch { return []; }
}

// Opties ophalen uit je bestaande NFT-dropdown, anders fallback op API
async function getOwnedTokensForDropdown() {
  const sel = document.getElementById("nftTokenIdSelect");
  const fromUi = [];
  if (sel && sel.options?.length) {
    for (const opt of sel.options) {
      const v = String(opt.value || "").trim();
      if (/^\d{1,4}$/.test(v)) fromUi.push(`TOKEN_${v}`);
    }
  }
  if (fromUi.length) return [...new Set(fromUi)];
  // fallback: je public script heeft fetchOwnedNfts(walletAddress) al
  if (walletAddress && typeof fetchOwnedNfts === "function") {
    try {
      const items = await fetchOwnedNfts(walletAddress); // {name:"TOKEN_123", ...}
      return items.map(i => String(i?.name || "")).filter(n => /^TOKEN_\d+$/.test(n));
    } catch { return []; }
  }
  return [];
}

// 4) TX helpers (mainnet chainId = "8")
async function txActivateNode(nodeId, displayName, location) {
  const provider = getProvider();
  if (!provider?.createRawTransactionData) return showPopup("Starkey wallet unsupported");
  if (!/^[\w .\-]{1,18}$/.test(displayName)) return showPopup("Display name ≤ 18 chars");
  const payload = [ walletAddress, 0, STAKE_MODULE_ADDR, STAKE_MODULE_NAME, "activate_node", [], [bcsStr(nodeId), bcsStr(displayName), bcsStr(location)], {} ];
  const tx = await provider.createRawTransactionData(payload);
  return provider.sendTransaction({ data: tx, from: walletAddress, to: STAKE_MODULE_ADDR, chainId: "8", value: "" });
}
async function txAddRarity(nodeId, tokenName) {
  const provider = getProvider(); if (!provider?.createRawTransactionData) throw new Error("Starkey wallet unsupported");
  const payload = [ walletAddress, 0, STAKE_MODULE_ADDR, STAKE_MODULE_NAME, "add_rarity_nft", [], [bcsStr(nodeId), bcsStr(tokenName)], {} ];
  const tx = await provider.createRawTransactionData(payload);
  return provider.sendTransaction({ data: tx, from: walletAddress, to: STAKE_MODULE_ADDR, chainId: "8", value: "" });
}
async function txRemoveRarity(nodeId, tokenName) {
  const provider = getProvider(); if (!provider?.createRawTransactionData) throw new Error("Starkey wallet unsupported");
  const payload = [ walletAddress, 0, STAKE_MODULE_ADDR, STAKE_MODULE_NAME, "remove_rarity_nft", [], [bcsStr(nodeId), bcsStr(tokenName)], {} ];
  const tx = await provider.createRawTransactionData(payload);
  return provider.sendTransaction({ data: tx, from: walletAddress, to: STAKE_MODULE_ADDR, chainId: "8", value: "" });
}
async function txClaimNodeReward(nodeId) {
  const provider = getProvider(); if (!provider?.createRawTransactionData) throw new Error("Starkey wallet unsupported");
  const payload = [ walletAddress, 0, STAKE_MODULE_ADDR, STAKE_MODULE_NAME, "claim_node_reward", [], [bcsStr(nodeId)], {} ];
  const tx = await provider.createRawTransactionData(payload);
  return provider.sendTransaction({ data: tx, from: walletAddress, to: STAKE_MODULE_ADDR, chainId: "8", value: "" });
}
async function txResetNode(nodeId) {
  const provider = getProvider(); if (!provider?.createRawTransactionData) throw new Error("Starkey wallet unsupported");
  const payload = [ walletAddress, 0, STAKE_MODULE_ADDR, STAKE_MODULE_NAME, "reset_node", [], [bcsStr(nodeId)], {} ];
  const tx = await provider.createRawTransactionData(payload);
  return provider.sendTransaction({ data: tx, from: walletAddress, to: STAKE_MODULE_ADDR, chainId: "8", value: "" });
}

// rarity label helper
function tokenNumberFromName(tokenName = "") {
  const m = String(tokenName).match(/^TOKEN_(\d{1,4})$/i);
  return m ? parseInt(m[1], 10) : NaN;
}
function rarityLabel(tokenName) {
  const n = tokenNumberFromName(tokenName);
  let rarity = "Unknown";
  if (n >= 1 && n <= 250) rarity = "Common";
  else if (n >= 251 && n <= 375) rarity = "Rare";
  else if (n >= 376 && n <= 450) rarity = "Epic";
  else if (n >= 451 && n <= 490) rarity = "Legendary";
  else if (n >= 491 && n <= 500) rarity = "Mythic";
  const chickenTokens = [1,251,376,451,491];
  return chickenTokens.includes(n) ? `${rarity} 🍗` : rarity;
}

// 5) Right area render
async function renderRightAreaFor(nodeId) {
  const area = document.getElementById("nodeRightArea");
  if (!area) return;
  area.innerHTML = "Loading…";
  updateNodeGif(nodeId);

  // APY (veel chains geven hier integer basis → we tonen als % met 2 dec.)
  const apyRaw = await getOperatorApy(nodeId);
  const apyPct = isFinite(apyRaw) ? Number(apyRaw) : 0;
  const apyEl = document.getElementById("nodeApy");
  if (apyEl) apyEl.innerHTML = `Operator APY: <strong>${apyPct.toFixed(2)}%</strong>`;

  const rewards = await getOperatorRewards(nodeId);
  const rwEl = document.getElementById("nodeRewards");
  if (rwEl) rwEl.innerHTML = `Operator rewards for <code>${nodeId}</code>: <strong>${rewards.toLocaleString("en-US",{maximumFractionDigits:2})} $Pecky</strong>`;

  const activated = await isNodeActivated(nodeId);
  if (!activated) {
    const locations = await listAvailableLocations();
    area.innerHTML = `
      <div style="display:grid; gap:10px;">
        <div>
          <label style="font-size:12px;opacity:.8;">Display name (≤18 chars)</label>
          <input id="nodeDisplayName" maxlength="18" placeholder="MyNode"
            style="width:100%;padding:8px;border-radius:10px;border:1px solid #1f2937;background:#0f172a;color:#e5e7eb;">
        </div>
        <div>
          <label style="font-size:12px;opacity:.8;">Location</label>
          <select id="nodeLocation"
            style="width:100%;padding:8px;border-radius:10px;border:1px solid #1f2937;background:#0f172a;color:#e5e7eb;">
            ${locations.map(l => `<option value="${l}">${l}</option>`).join("") || `<option value="">(no locations)</option>`}
          </select>
        </div>
        <button id="btnActivateNode" style="padding:8px 12px;border-radius:10px;border:1px solid #1f2937;background:#2563eb;color:#fff;cursor:pointer;width:auto;align-self:start;">Activate node</button>
      </div>
    `;
    document.getElementById("btnActivateNode")?.addEventListener("click", async () => {
      const name = document.getElementById("nodeDisplayName")?.value?.trim() || "";
      const loc  = document.getElementById("nodeLocation")?.value || "";
      try { const txh = await txActivateNode(nodeId, name, loc); showPopup(`Node activated`, { long:true }); setTimeout(() => renderRightAreaFor(nodeId), 900); }
      catch (e) { const msg = await getFailureReason(e?.hash || ""); showPopup(msg || "Activation failed", { long:true }); }
    });
    return;
  }

  // beheer (link/unlink rarity)
  const owned    = await getOwnedTokensForDropdown();
  const attached = await getAttachedMainNames(nodeId);
  const linkable = owned.filter(t => !attached.includes(t));

  const optHtml = (t) => `<option value="${t}">${t} — ${rarityLabel(t)}</option>`;
  area.innerHTML = `
    <div style="display:grid; gap:10px;">
      <div>
        <label style="font-size:12px;opacity:.8;">Link rarity NFT</label>
        <div style="display:flex; gap:8px;">
          <select id="rarityTokenSelect" style="flex:1;padding:8px;border-radius:10px;border:1px solid #1f2937;background:#0f172a;color:#e5e7eb;">
            ${linkable.length ? linkable.map(optHtml).join("") : `<option value="">(no linkable NFTs)</option>`}
          </select>
          <button id="btnAddRarity" style="padding:8px 12px;border-radius:10px;border:1px solid #1f2937;background:#1e293b;color:#fff;cursor:pointer;">Link</button>
        </div>
      </div>

      <div>
        <label style="font-size:12px;opacity:.8;">Unlink rarity NFT</label>
        <div style="display:flex; gap:8px;">
          <select id="rarityTokenRemoveSelect" style="flex:1;padding:8px;border-radius:10px;border:1px solid #1f2937;background:#0f172a;color:#e5e7eb;">
            ${attached.length ? attached.map(optHtml).join("") : `<option value="">(nothing linked)</option>`}
          </select>
          <button id="btnRemoveRarity" style="padding:8px 12px;border-radius:10px;border:1px solid #1f2937;background:#1e293b;color:#fff;cursor:pointer;">Unlink</button>
        </div>
      </div>

      <button id="btnClaimNode" style="margin-top:4px;padding:10px 14px;border:1px solid #1f2937;border-radius:12px;background:#2563eb;color:#fff;cursor:pointer;width:auto;align-self:start;">Claim rewards</button>
    </div>
  `;

  async function refreshDropdowns() {
    const attachedAfter = await getAttachedMainNames(nodeId);
    const linkableAfter = owned.filter(t => !attachedAfter.includes(t));
    const linkSel   = document.getElementById("rarityTokenSelect");
    const unlinkSel = document.getElementById("rarityTokenRemoveSelect");
    if (linkSel)   linkSel.innerHTML   = linkableAfter.length ? linkableAfter.map(optHtml).join("") : `<option value="">(no linkable NFTs)</option>`;
    if (unlinkSel) unlinkSel.innerHTML = attachedAfter.length ? attachedAfter.map(optHtml).join("") : `<option value="">(nothing linked)</option>`;
  }

  document.getElementById("btnAddRarity")?.addEventListener("click", async () => {
    const tokenName = document.getElementById("rarityTokenSelect")?.value?.trim();
    if (!/^TOKEN_\d{1,4}$/.test(tokenName || "")) return showPopup("Select a valid NFT");
    try { const txh = await txAddRarity(nodeId, tokenName); showPopup(`Linked ${tokenName}`, { long:true }); await refreshDropdowns(); }
    catch (e) { const msg = await getFailureReason(e?.hash || ""); showPopup(msg || "Link failed", { long:true }); }
  });
  document.getElementById("btnRemoveRarity")?.addEventListener("click", async () => {
    const tokenName = document.getElementById("rarityTokenRemoveSelect")?.value?.trim();
    if (!/^TOKEN_\d{1,5}$/.test(tokenName || "")) return showPopup("Nothing to unlink");
    try { const txh = await txRemoveRarity(nodeId, tokenName); showPopup(`Unlinked ${tokenName}`, { long:true }); await refreshDropdowns(); }
    catch (e) { const msg = await getFailureReason(e?.hash || ""); showPopup(msg || "Unlink failed", { long:true }); }
  });
  document.getElementById("btnClaimNode")?.addEventListener("click", async () => {
    try { const txh = await txClaimNodeReward(nodeId); showPopup(`Claimed node rewards`, { long:true }); }
    catch (e) { const msg = await getFailureReason(e?.hash || ""); showPopup(msg || "Claim failed", { long:true }); }
  });
}

// 6) Hoofd-render
async function renderStakePanel() {
  const mount = ensureNodePanelRoot();
  if (!mount) return;

  mount.innerHTML = `
    <div id="nodePanel" style="padding:16px; border:1px solid #1f2937; border-radius:14px;
      background:#0b1220; color:#e5e7eb; display:flex; flex-direction:column; align-items:center;">
      <div id="nodePanelContent">Loading node info...</div>
    </div>
  `;

  let owner = false;
  try { owner = await isNodeOwner(walletAddress); } catch { owner = false; }

  const content = document.getElementById("nodePanelContent");
  if (!content) return;

  if (!owner) {
    content.innerHTML = `
      <div style="text-align:center; padding:12px;">
        <strong>No node NFT found</strong><br>
        <span style="font-size:13px; color:#aaa;">Get your Pecky Smart NFT and unlock full operator powers!
Find yours on Crystara</span>
      </div>
    `;
    return;
  }

  const panel = skeletonNodePanel();
  mount.innerHTML = "";
  mount.appendChild(panel);

  const select = document.getElementById("nodeTokenSelect");
  select.innerHTML = `<option>Looking for node NFTs…</option>`;
  select.disabled = true;

  let owned = [];
  try { owned = await fetchOwnedNodeNfts(walletAddress); } catch { owned = []; }

  if (!owned.length) {
    mount.innerHTML = `
      <div id="nodePanel" style="padding:16px; border:1px solid #1f2937; border-radius:14px; background:#0b1220; color:#e5e7eb;">
        <div style="text-align:center; padding:12px;">
          <strong>No node NFT found</strong><br>
          <span style="font-size:13px; color:#aaa;">Get your Pecky Smart NFT and unlock full operator powers!
Find yours on Crystara</span>
        </div>
      </div>
    `;
    return;
  }

  select.innerHTML = "";
  owned.forEach(t => {
    const opt = document.createElement("option");
    opt.value = t; opt.textContent = t; select.appendChild(opt);
  });
  select.disabled = false;

  const currentNode = select.value || owned[0];
  select.value = currentNode;
  updateNodeGif(currentNode);
  await renderRightAreaFor(currentNode);

  select.onchange = async () => {
    const cur = select.value;
    updateNodeGif(cur);
    await renderRightAreaFor(cur);
  };

  // periodieke refresh
  if (window.__NODE_REWARD_INTERVAL__) clearInterval(window.__NODE_REWARD_INTERVAL__);
  window.__NODE_REWARD_INTERVAL__ = setInterval(async () => {
    const cur = document.getElementById("nodeTokenSelect")?.value || currentNode;
    const apyNow = await getOperatorApy(cur);
    const apyEl2 = document.getElementById("nodeApy");
    if (apyEl2) apyEl2.innerHTML = `Operator APY: <strong>${apyNow.toFixed(2)}%</strong>`;
    const rew = await getOperatorRewards(cur);
    const rwEl = document.getElementById("nodeRewards");
    if (rwEl) rwEl.innerHTML =
      `Operator rewards for <code>${cur}</code>: <strong>${rew.toLocaleString("en-US",{maximumFractionDigits:2})} $Pecky</strong>`;
  }, 30000);
}

// ====== PECKY: Public staking panels (Stake on Node, Your Stakes, Pending Unstakes) ======
// Drop-in patch for script.js (MAINNET)


// ---- fmtPeckyMicro ----
if (typeof fmtPeckyMicro !== "function") {
function fmtPeckyMicro(micro) {
  try {
    const microBig = typeof micro === "bigint" ? micro : BigInt(micro || 0);
    const pecky = Number(microBig) / 1_000_000;

    if (!isFinite(pecky)) return "0";

    if (pecky >= 1_000_000_000) {
      return (pecky / 1_000_000_000).toFixed(2) + "B";
    } else if (pecky >= 1_000_000) {
      return (pecky / 1_000_000).toFixed(2) + "M";
    } else if (pecky >= 1_000) {
      return (pecky / 1_000).toFixed(2) + "K";
    } else {
      // voor kleine bedragen 6 decimalen (want 1 Pecky = 1e6 micro)
      return pecky.toFixed(6);
    }
  } catch {
    return "0";
  }
}
}


// ---- fmtCountdown ----
if (typeof fmtCountdown !== "function") {
function fmtCountdown(secBig) {
  const now = Math.floor(Date.now() / 1000);
  const left = Number(secBig) - now;
  if (left <= 0) return "now";
  const d = Math.floor(left / 86400);
  const h = Math.floor((left % 86400) / 3600);
  const m = Math.floor((left % 3600) / 60);
  const parts = [];
  if (d) parts.push(`${d}d`);
  if (h) parts.push(`${h}h`);
  parts.push(`${m}m`);
  return parts.join(" ");
}
}


// ---- fmtDateTimeFromEpochSec ----
if (typeof fmtDateTimeFromEpochSec !== "function") {
function fmtDateTimeFromEpochSec(secBig) {
  const t = Number(secBig) * 1000;
  if (!isFinite(t)) return "-";
  const d = new Date(t);
  // kort, duidelijk
  return d.toLocaleString(undefined, {
    year: "2-digit", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit"
  });
}
}


// ---- getDisplayName ----
if (typeof getDisplayName !== "function") {
async function getDisplayName(nodeId) {
  try {
    const r = await supraView(`${STAKE_MODULE}::get_display_name`, [nodeId], []);
    const v = Array.isArray(r) ? r[0] : r;
    const name = (typeof v === "string" ? v : "").trim();
    return name || nodeId; // fallback op TOKEN_X
  } catch {
    return nodeId;
  }
}
}


// ---- getPeckyBalanceNumber ----
if (typeof getPeckyBalanceNumber !== "function") {
  async function getPeckyBalanceNumber(address) {
    try {
      const resourceType = `0x1::coin::CoinStore<${PECKY_TOKEN_TYPE}>`;
      const encoded = encodeURIComponent(resourceType);

      // Eerst v2 single-resource endpoint proberen
      let res = await fetch(`https://rpc-mainnet.supra.com/rpc/v2/accounts/${address}/resources/${encoded}`);
      let json = await res.json().catch(() => ({}));

      // Als v2 geen bruikbaar antwoord geeft, fallback naar v1 "all resources"
      if (!json?.data?.coin?.value && !Array.isArray(json?.result)) {
        res = await fetch(`https://rpc-mainnet.supra.com/rpc/v1/get_account_resources?address=${address}`);
        json = await res.json().catch(() => ({}));
      }

      // Ondersteun beide vormen:
      // v2 single: { data: { coin: { value: "..." } } }
      // v1 lijst:  { result: [ { type, data: { coin: { value: "..." } } } ] }
      let raw = "0";
      if (json?.data?.coin?.value) {
        raw = json.data.coin.value;
      } else if (Array.isArray(json?.result)) {
        const cs = json.result.find(r => r?.type === resourceType);
        raw = cs?.data?.coin?.value || "0";
      }

      const micro = BigInt(raw || 0);
      return { micro, pecky: Number(micro) / 1_000_000 };
    } catch {
      return { micro: 0n, pecky: 0 };
    }
  }
} // <-- sluit de if-guard

// ——— kleine logger die niet crasht ———
function dbg(...args) { try { console.debug("[stakes]", ...args); } catch {} }

// ——— view met timeout & nette fout ———
async function supraViewWithTimeout(functionId, args = [], typeArgs = [], ms = 8000) {
  const p = supraView(functionId, args, typeArgs);
  const t = new Promise((_, rej) => setTimeout(() => rej(new Error("VIEW_TIMEOUT")), ms));
  return Promise.race([p, t]);
}

// ——— meerdere view-namen proberen ———
async function supraViewTry(fnNames, args = [], typeArgs = []) {
  for (const fn of fnNames) {
    try {
      const r = await supraViewWithTimeout(fn, args, typeArgs, 8000);
      dbg("view ok:", fn, r);
      return { ok: true, fn, result: r };
    } catch (e) {
      dbg("view fail:", fn, e?.message || e);
    }
  }
  return { ok: false, fn: null, result: null };
}

// ——— bytes/hex naar string voor TOKEN_### ———
function hexToString(hex) {
  try {
    const s = hex.startsWith("0x") ? hex.slice(2) : hex;
    const bytes = s.match(/.{1,2}/g)?.map(h => parseInt(h, 16)) || [];
    return new TextDecoder().decode(new Uint8Array(bytes));
  } catch { return String(hex); }
}
function decodeMaybeBytes(x) {
  if (typeof x === "string") return x;
  if (x && typeof x === "object") {
    const h = x.bytes || x.data || x.hex;
    if (typeof h === "string") return hexToString(h);
  }
  if (Array.isArray(x) && x.length && typeof x[0] === "number") {
    return new TextDecoder().decode(new Uint8Array(x));
  }
  return String(x ?? "");
}

// ——— maak altijd [{ nodeId, micro }] van de view-output ———
function normalizeStakePairs(raw) {
  const out = [];
  const unwrap = (v) => (Array.isArray(v) && v.length === 1 && Array.isArray(v[0])) ? v[0] : v;

  const cand = unwrap(raw);

  // (a) [ [ids...], [amounts...] ]
  if (Array.isArray(cand) && cand.length === 2 && Array.isArray(cand[0]) && Array.isArray(cand[1])) {
    const ids = cand[0], ams = cand[1];
    for (let i = 0; i < Math.min(ids.length, ams.length); i++) {
      const nodeId = decodeMaybeBytes(ids[i]).trim();
      const micro  = BigInt(ams[i] || 0);
      if (/^TOKEN_\d+$/i.test(nodeId)) out.push({ nodeId, micro });
    }
    return out;
  }

  // (b) [ [nodeId, amount], ... ] of genest
  const list = unwrap(cand);
  if (Array.isArray(list)) {
    for (const row of list) {
      if (Array.isArray(row) && row.length >= 2) {
        const nodeId = decodeMaybeBytes(row[0]).trim();
        const micro  = BigInt(row[1] || 0);
        if (/^TOKEN_\d+$/i.test(nodeId)) out.push({ nodeId, micro });
      } else if (row && typeof row === "object") {
        const nodeId = decodeMaybeBytes(row.node_id ?? row.id ?? row.node ?? row[0]).trim();
        const micro  = BigInt((row.amount ?? row.value ?? row[1] ?? 0));
        if (/^TOKEN_\d+$/i.test(nodeId)) out.push({ nodeId, micro });
      }
    }
  }

  return out;
}

// ---- fetchUserStakePairs via get_user_stake_triplets ----
async function fetchUserStakePairs(userAddr) {
  if (!userAddr) return [];

  const FN = [
    `${STAKE_MODULE_ADDR}::stake::get_user_stake_triplets`,
    `${STAKE_MODULE_ADDR}::stake::get_user_stake_pairs`,
  ];

  let r = null;
  for (const fn of FN) {
    try {
      r = await supraView(fn, [userAddr], []);
      if (r) {
        console.debug("[fetchUserStakePairs] using", fn, r);
        break;
      }
    } catch (e) {
      console.warn("[fetchUserStakePairs] fail", fn, e);
    }
  }

  if (!r) return [];

  // Mogelijke vormen:
  // [[["TOKEN_1","TOKEN_2"],["NodeName1","NodeName2"],["1000","2000"]]]
  let arr = Array.isArray(r) ? r : [];
  if (arr.length === 1 && Array.isArray(arr[0])) arr = arr[0];

  // Als er exact 3 arrays in zitten → nodeIds, names, amounts
  if (Array.isArray(arr) && arr.length === 3) {
    const [ids, names, amts] = arr;
    const out = [];
    for (let i = 0; i < Math.min(ids.length, amts.length); i++) {
      const nodeId = String(ids[i]).trim();
      const name   = String(names?.[i] || nodeId).trim();
      const micro  = BigInt(amts[i] || 0);
      if (/^TOKEN_\d+$/i.test(nodeId)) out.push({ nodeId, displayName: name, micro });
    }
    return out;
  }

  // fallback → gebruik je bestaande normalisatie
  return normalizeStakePairs(arr);
}


// ——— micro → precieze $Pecky string (max 6 dec) ———
function microToPeckyExactStr(microBI) {
  try {
    const m = (typeof microBI === "bigint") ? microBI : BigInt(microBI || 0);
    const intPart = m / 1_000_000n;
    const fracPart = m % 1_000_000n;
    if (fracPart === 0n) return String(intPart);
    const fracStr = fracPart.toString().padStart(6, "0").replace(/0+$/, "");
    return `${intPart}.${fracStr}`;
  } catch { return "0"; }
}



// ---- ensureStakeAllMount ----
function ensureStakeAllMount() {
  const page = document.getElementById("page-staking");
  if (!page) return null;

  let mount = document.getElementById("stakeAllMount");
  if (!mount) {
    mount = document.createElement("div");
    mount.id = "stakeAllMount";
  }

  // eerste Meridian-kaart op de staking-pagina
  const meridianCard = page.querySelector(".staking-retro-card");
  if (meridianCard) {
    // plaats stakeAllMount BOVEN de Meridian-kaart
    if (mount.parentNode !== page || mount.nextSibling !== meridianCard) {
      page.insertBefore(mount, meridianCard);
    }
  } else {
    // fallback: zet 'm helemaal bovenaan
    if (mount.parentNode !== page) page.prepend(mount);
  }
  return mount;
}


// ---- setStakeGif ----
function setStakeGif(nodeId) {
  const img = document.getElementById("stakeAllGif");
  if (img) img.src = `https://smartnft.pecky.me/animation/pecky-node/${nodeId}.gif?cb=${Date.now()}`;
}


// ---- renderStakeAllPanel ----
async function renderStakeAllPanel() {
  const mount = ensureStakeAllMount();
  mount.innerHTML = `
    <div id="stakeAllPanel" class="staking-retro-card" style="margin:16px 0; padding-bottom:16px; max-width:520px; margin-left:auto; margin-right:auto;">
      <div class="staking-retro-title" style="font-size:1.2em; margin-bottom:10px; text-align:center;">
        Stake $Pecky on a Node
      </div>

      <!-- Pecky uitlegblok (NIEUW) -->
      <div id="pecky-staking-copy" class="staking-retro-copy" style="margin:8px 0 12px; line-height:1.55; font-size:13.5px; color:#5a4400; text-align:center;">
        <div class="staking-retro-copy-title" style="font-weight:700; margin-bottom:4px; color:#3b2d00;">Staking – The Pecky Way</div>
        <p style="margin:0 0 6px 0;">Stake your $PECKY on a <strong>node of your choice</strong> and let those golden eggs grow (≈ 8% APY).</p>
        <p style="margin:0 0 6px 0;">You can unstake anytime — but your chicks need <strong>2 days</strong> to hatch before you can claim.</p>
        <p style="margin:0;">Claim your rewards regularly (&lt; 30 days) to keep Pecky’s magic growing 🪶</p>
      </div>

      <div style="display:grid; gap:12px; grid-template-columns:1fr; max-width:680px;">
        <!-- Node kiezen -->
        <div>
          <label style="font-size:13px;color:#a06500;font-weight:600; display:block; margin-bottom:6px;">Choose active node</label>
          <select id="stakeAllNodeSelect"
            style="width:100%;padding:10px 14px;border-radius:14px;border:1.5px solid #ffae00;background:#fff; color:#222; font-size:15px; height:44px; box-sizing:border-box;">
            <option>Loading nodes…</option>
          </select>
        </div>

        <!-- GIF -->
        <div style="border:1.5px dashed #ffd36e;border-radius:14px; overflow:hidden; background:#fffbe8;">
          <img id="stakeAllGif" alt="Node" style="width:100%;height:auto;display:block;">
        </div>

        <!-- Amount -->
        <input id="stakeAllAmount" inputmode="decimal" placeholder="Amount in $Pecky"
          style="width:100%; padding:12px 14px; border-radius:14px; border:1.5px solid #ffae00; background:#fff; color:#222; font-size:15px; height:44px; box-sizing:border-box;">

        <!-- Quick % -->
        <div class="quick-row" style="display:grid; grid-template-columns:repeat(4,1fr); gap:8px;">
          <button class="staking-retro-main-btn pctFill" data-pct="25"  style="height:40px;">25%</button>
          <button class="staking-retro-main-btn pctFill" data-pct="50"  style="height:40px;">50%</button>
          <button class="staking-retro-main-btn pctFill" data-pct="75"  style="height:40px;">75%</button>
          <button class="staking-retro-main-btn pctFill" data-pct="100" style="height:40px;">MAX</button>
        </div>

        <!-- Stake knop -->
        <button id="stakeAllBtn" class="staking-retro-main-btn" style="font-size:15px; height:44px; border-radius:14px;">
          Stake
        </button>

        <div id="stakeAllMsg" style="font-size:13px; color:#b48512; text-align:center;"></div>

        <hr style="margin:10px 0 2px 0; border-top:1.7px dashed #ffd36e; opacity:.65;">
        <div style="font-size:13px; color:#888; text-align:center;">
          Users can stake and unstake anytime (unstakes are claimable after 2 days).
        </div>
      </div>
    </div>
  `;

  const sel = document.getElementById("stakeAllNodeSelect");
  const msg = document.getElementById("stakeAllMsg");
  const btn = document.getElementById("stakeAllBtn");
  const amountInput = document.getElementById("stakeAllAmount");

  // nodes laden (actief + sorteren op APY desc)
  let nodes = [];
  try { nodes = await fetchActiveNodesSorted(); }
  catch { msg.textContent = "Failed to load nodes."; }

  if (!nodes.length) {
    sel.innerHTML = `<option value="">No active nodes</option>`;
    sel.disabled = true;
    setStakeGif("TOKEN_1");
    return;
  }

  sel.innerHTML = "";
  nodes.forEach(({ nodeId, name }) => {
    const opt = document.createElement("option");
    opt.value = nodeId; opt.textContent = name || nodeId;
    sel.appendChild(opt);
  });
  sel.disabled = false;

  setStakeGif(sel.value);
  sel.onchange = () => setStakeGif(sel.value);

  // helper: parse naar micro BigInt (6 decimals), NL komma -> punt
  if (typeof toMicroBigInt !== "function") {
    window.toMicroBigInt = function(input) {
      const s = String(input ?? "").trim().replace(",", ".");
      if (!/^\d*(\.\d{0,18})?$/.test(s)) return null;
      const [intPart, fracPartRaw = ""] = s.split(".");
      const frac = (fracPartRaw + "000000").slice(0, 6);
      try {
        return BigInt(intPart || "0") * 1_000_000n + BigInt(frac || "0");
      } catch { return null; }
    };
  }

  // quick % fill (cache-first, net fallback)
  async function fillPct(pct) {
    if (!walletAddress) return showPopup("Connect wallet to use quick amounts");
    let pecky = __peckyBalanceCache?.pecky ?? 0;

    if (!isFinite(pecky) || pecky <= 0) {
      try {
        const { pecky: fromNet } = await getPeckyBalanceNumber(walletAddress);
        pecky = fromNet;
        __peckyBalanceCache = {
          micro: BigInt(Math.floor(pecky * 1_000_000)),
          pecky
        };
      } catch { pecky = 0; }
    }

    const v = (pecky * pct) / 100;
    amountInput.value = (Math.floor(v * 100000) / 100000).toString();
  }

  document.querySelectorAll("#stakeAllPanel .pctFill").forEach(b => {
    b.addEventListener("click", () => fillPct(Number(b.dataset.pct)));
  });

  // Stake klik
  btn.addEventListener("click", async () => {
    if (!walletAddress) return showPopup("Connect wallet first");
    const nodeId = sel.value;
    if (!nodeId) return showPopup("Choose a node");

    const microBI = toMicroBigInt(amountInput.value);
    if (microBI === null || microBI <= 0n) return showPopup("Enter a valid amount");

    // optioneel: check tegen wallet balance cache
    if (__peckyBalanceCache?.micro && microBI > __peckyBalanceCache.micro) {
      return showPopup("Amount exceeds your wallet balance");
    }

    try {
      btn.disabled = true; btn.style.opacity = "0.6";
      const txh = await txStakeOnNode(nodeId, microBI);
      showPopup(`Staked ${ (Number(microBI)/1_000_000).toFixed(6) } $Pecky on ${nodeId}`, { long: true });

      amountInput.value = "";
      // refreshen
      await getPeckyBalance(walletAddress);
      await renderUserStakesPanel();
      await renderPendingUnstakesPanel?.();
    } catch (e) {
      const reason = await getFailureReason(e?.hash || "");
      showPopup(reason || "Stake failed", { long: true });
    } finally {
      btn.disabled = false; btn.style.opacity = "1";
    }
  });
}


// ---- ensureMyStakesMount ----
function ensureMyStakesMount() {
  const page = document.getElementById("page-staking");
  if (!page) return null;

  let mount = document.getElementById("myStakesMount");
  if (!mount) {
    mount = document.createElement("div");
    mount.id = "myStakesMount";
  }

  const pending  = document.getElementById("pendingUnstakeMount");
  const stakeAll = document.getElementById("stakeAllMount");
  const meridian = page.querySelector(".staking-retro-card");

  if (pending) {
    // direct NA pending (dus eronder)
    if (mount.parentNode !== page || mount.previousSibling !== pending) {
      page.insertBefore(mount, pending.nextSibling || meridian || null);
    }
  } else if (stakeAll) {
    page.insertBefore(mount, stakeAll.nextSibling || meridian || null);
  } else if (meridian) {
    page.insertBefore(mount, meridian);
  } else {
    if (mount.parentNode !== page) page.prepend(mount);
  }
  return mount;
}





// ---- renderUserStakesPanel (mainnet version; uses get_user_stake_triplets) ----
async function renderUserStakesPanel() {
  const mount = ensureMyStakesMount();
  if (!walletAddress) { mount.innerHTML = ""; return; }

  // retro kaart + oranje knoppen
  mount.innerHTML = `
    <div id="myStakesPanel" class="staking-retro-card" style="margin:16px 0; padding-bottom:16px; border-radius:16px; max-width:720px; margin-left:auto; margin-right:auto;">
      <div class="staking-retro-title" style="font-size:1.2em; margin-bottom:10px; display:flex; align-items:center; justify-content:space-between; gap:12px;">
        <span>Your node stakes</span>
        <button id="myStakesRefresh" class="staking-retro-main-btn" style="height:36px; border-radius:12px; font-size:13px;">Refresh</button>
      </div>
      <div id="myStakesList" style="display:flex; flex-direction:column; gap:10px;"></div>
      <div id="myStakesError" style="font-size:13px; color:#b00020; display:none; text-align:center; margin-top:8px;"></div>

      <hr style="margin:12px 0 2px 0; border-top:1.7px dashed #ffd36e; opacity:.65;">
      <div style="font-size:12px; color:#888; text-align:center;">
        Unstake or claim rewards per node below.
      </div>
    </div>
  `;

  const list = document.getElementById("myStakesList");
  const err  = document.getElementById("myStakesError");
  const btnR = document.getElementById("myStakesRefresh");

  async function load() {
    list.textContent = "Loading…";
    err.style.display = "none";

    try {
      // Haalt nu { nodeId, micro, displayName } uit get_user_stake_triplets (via fetchUserStakePairs)
      let pairs = await fetchUserStakePairs(walletAddress);

      if (!pairs?.length) {
        list.innerHTML = `<div style="font-size:13px; color:#888; text-align:center;">No Pecky staked on nodes yet.</div>`;
        // Zorg dat pending unstakes paneel ook ververst wordt wanneer er niets staat
        await renderPendingUnstakesPanel?.();
        return;
      }

      // Optioneel: sorteer aflopend op staked amount
      pairs = pairs.slice().sort((a, b) => (Number(b.micro) - Number(a.micro)));

      list.innerHTML = "";
      for (const { nodeId, micro, displayName } of pairs) {
        // Alleen nog rewards ophalen; displayName komt al uit de triplets
        let rewardsMicro = 0n;
        try { rewardsMicro = await getUserRewards(walletAddress, nodeId); } catch {}

        const id = `unstake_${nodeId}`;
        const row = document.createElement("div");
        // retro row: dashed oranje, zacht geel vlak
        row.style.cssText = `
          display:grid; grid-template-columns: 1fr auto; gap:10px; align-items:center;
          padding:10px 12px; border:1.5px dashed #ffd36e; border-radius:14px; background:#fffbe8;
        `;
        row.innerHTML = `
          <div style="min-width:0;">
            <div style="font-weight:800; font-size:15px; line-height:1.2; color:#a06500;">${displayName || nodeId}</div>
            <div style="font-size:11px; color:#b48512; margin-top:2px;"><code>${nodeId}</code></div>
            <div style="font-size:12px; margin-top:6px; color:#7a5a11;">
              Staked: <strong>${fmtPeckyMicro(micro)}</strong> $Pecky
            </div>
            <div style="font-size:12px; color:#7a5a11;">
              Rewards: <strong>${fmtPeckyMicro(rewardsMicro)}</strong> $Pecky
            </div>

            <div style="margin-top:8px; display:flex; gap:8px; align-items:center; flex-wrap:wrap;">
              <div style="display:flex; gap:6px; flex:1;">
                <input id="${id}_amount" inputmode="decimal" placeholder="Amount to unstake"
                  style="flex:1; min-width:140px; padding:10px 12px; border-radius:12px; border:1.5px solid #ffae00; background:#fff; color:#222; height:42px; box-sizing:border-box;">
                <button id="${id}_max" class="staking-retro-main-btn" style="height:42px; border-radius:12px; font-size:13px;">MAX</button>
              </div>
              <button id="${id}_btn" class="staking-retro-main-btn" style="height:42px; border-radius:12px; font-size:13px;">Unstake</button>
              <button id="${id}_claim" class="staking-retro-main-btn" style="height:42px; border-radius:12px; font-size:13px;">Claim rewards</button>
            </div>
          </div>

          <div id="${id}_msg" style="font-size:12px; color:#9a7c2a; text-align:right;"></div>
        `;
        list.appendChild(row);

        // === Events ===

        // MAX → precieze decimale string (zonder afronding)
        document.getElementById(`${id}_max`)?.addEventListener("click", () => {
          const inp = document.getElementById(`${id}_amount`);
          inp.value = microToPeckyExactStr(micro);
        });

        // UNSTAKE
        document.getElementById(`${id}_btn`)?.addEventListener("click", async () => {
          const inp = document.getElementById(`${id}_amount`);
          const msg = document.getElementById(`${id}_msg`);
          const amt = toMicroBigInt(inp.value);

          if (amt === null || amt <= 0n)
            return showPopup("Enter a valid amount to unstake");
          if (amt > BigInt(micro))
            return showPopup(`You only have ${microToPeckyExactStr(micro)} $Pecky staked on ${displayName || nodeId}.`);

          try {
            msg.textContent = "Unstaking…";
            const btn = document.getElementById(`${id}_btn`);
            if (btn) { btn.disabled = true; btn.style.opacity = "0.6"; }

            const txh = await txUnstakeFromNode(nodeId, amt);
            showPopup(`Unstaked ${microToPeckyExactStr(amt)} $Pecky from ${displayName || nodeId}`, { long: true });
            inp.value = "";

            // Refresh alles inclusief pending unstakes
            await getPeckyBalance(walletAddress);
            await load();
            await renderPendingUnstakesPanel?.();
          } catch (e) {
            const reason = await getFailureReason(e?.hash || "");
            showPopup(reason || "Unstake failed", { long: true });
            msg.textContent = "";
          } finally {
            const btn = document.getElementById(`${id}_btn`);
            if (btn) { btn.disabled = false; btn.style.opacity = "1"; }
          }
        });

        // CLAIM (rewards)
        document.getElementById(`${id}_claim`)?.addEventListener("click", async () => {
          const msg = document.getElementById(`${id}_msg`);
          try {
            msg.textContent = "Claiming…";
            const c = document.getElementById(`${id}_claim`);
            if (c) { c.disabled = true; c.style.opacity = "0.6"; }

            const txh = await txClaimUserReward(nodeId);
            showPopup(`Claimed rewards for ${displayName || nodeId}`, { long: true });

            await getPeckyBalance(walletAddress);
            await load();
          } catch (e) {
            const reason = await getFailureReason(e?.hash || "");
            showPopup(reason || "Claim failed", { long: true });
            msg.textContent = "";
          } finally {
            const c = document.getElementById(`${id}_claim`);
            if (c) { c.disabled = false; c.style.opacity = "1"; }
          }
        });
      }

      // Na het (her)laden ook altijd pending unstakes updaten
      await renderPendingUnstakesPanel?.();

    } catch (e) {
      list.innerHTML = "";
      err.textContent = `Failed to load stakes: ${e?.message || e}`;
      err.style.display = "block";
      console.warn("UserStakes load error:", e);
    }
  }

  btnR?.addEventListener("click", load);
  await load();
}

// --- helpers (laten staan) ---
function microToPeckyExactStr(micro) {
  const int = BigInt(micro);
  const whole = int / 1_000_000n;
  const frac = (int % 1_000_000n).toString().padStart(6, "0").replace(/0+$/, "");
  return frac ? `${whole}.${frac}` : `${whole}`;
}

function toMicroBigInt(input) {
  const s = String(input ?? "").trim().replace(",", ".");
  if (!/^\d*(\.\d{0,18})?$/.test(s)) return null;
  const [intPart, fracPartRaw = ""] = s.split(".");
  const frac = (fracPartRaw + "000000").slice(0, 6);
  try {
    return BigInt(intPart || "0") * 1_000_000n + BigInt(frac || "0");
  } catch { return null; }
}

async function getUserRewards(userAddr, nodeId) {
  const fn = `${STAKE_MODULE}::get_user_rewards`;
  try {
    const r = await supraView(fn, [userAddr, nodeId], []);
    const v = Array.isArray(r) ? (r[0] ?? 0) : r;
    return BigInt(v ?? 0);
  } catch {
    return 0n;
  }
}



// ---- fetchActiveNodesSorted via nieuwe view (gesorteerd op totaal stake) ----
async function fetchActiveNodesSorted() {
  const fn = `${STAKE_MODULE}::list_active_display_names_with_token_id_sorted_by_stake`;

  let r;
  try {
    r = await supraView(fn, [], []);       // v2 view helper die je al hebt
  } catch (e) {
    console.warn("[fetchActiveNodesSorted] view error:", e);
    return [];
  }

  // Resultaat kan genest terugkomen: [ [ ["Name","TOKEN_11"], ["Name","TOKEN_16"], ... ] ]
  let arr = Array.isArray(r) ? r : [];
  if (arr.length === 1 && Array.isArray(arr[0])) arr = arr[0];

  const items = [];
  for (const row of arr) {
    let name = "", token = "";

    if (Array.isArray(row)) {
      // Verwacht formaat: ["Display Name", "TOKEN_XX"]
      name  = String(row[0] ?? "").trim();
      token = String(row[1] ?? "").trim();
    } else if (row && typeof row === "object") {
      // Safety voor eventueel object-formaat
      name  = String(row.display_name ?? row.name ?? "").trim();
      token = String(row.token_id ?? row.node_id ?? row.token ?? "").trim();
    }

    if (!/^TOKEN_\d+$/.test(token)) continue;
    if (!name) name = token;

    items.push({ nodeId: token, name });
  }

  // Server geeft al “sorted by stake”, dus geen extra sort hier.
  return items;
}

// ---- txClaimUserReward (MAINNET chainId=8) ----
async function txClaimUserReward(nodeId) {
  const provider = getProvider();
  if (!provider?.createRawTransactionData) throw new Error("Starkey wallet unsupported");

  const payload = [
    walletAddress,
    0,
    STAKE_MODULE_ADDR,
    STAKE_MODULE_NAME,
    "claim_user_reward",     // <-- entry function name
    [],
    [ bcsStr(nodeId) ],      // <-- nodeId bcs-serialized string
    {}
  ];

  const tx = await provider.createRawTransactionData(payload);
  return provider.sendTransaction({
    data: tx,
    from: walletAddress,
    to: STAKE_MODULE_ADDR,
    chainId: "8",
    value: ""
  });
}



// ---- txStakeOnNode (MAINNET chainId=8) ----
async function txStakeOnNode(nodeId, amountMicro) {
  const provider = getProvider();
  if (!provider?.createRawTransactionData) throw new Error("Starkey wallet unsupported");

  // Zorg dat we altijd een BigInt hebben
  const amtBI = (typeof amountMicro === "bigint") ? amountMicro : BigInt(amountMicro);
  if (amtBI <= 0n) throw new Error("Amount must be > 0");

  const payload = [
    walletAddress,
    0,
    STAKE_MODULE_ADDR,
    STAKE_MODULE_NAME,
    "stake_on_node",
    [],
    [ bcsStr(nodeId), bcsSerializeU64(amtBI) ],
    {}
  ];
  const tx = await provider.createRawTransactionData(payload);
  return provider.sendTransaction({
    data: tx,
    from: walletAddress,
    to: STAKE_MODULE_ADDR,
    chainId: "8",  // mainnet
    value: ""
  });
}

// ---- txUnstakeFromNode (MAINNET chainId=8) ----
async function txUnstakeFromNode(nodeId, amountMicro) {
  const provider = getProvider();
  if (!provider?.createRawTransactionData) throw new Error("Starkey wallet unsupported");

  const amtBI = (typeof amountMicro === "bigint") ? amountMicro : BigInt(amountMicro);
  if (amtBI <= 0n) throw new Error("Amount must be > 0");

  const payload = [
    walletAddress,
    0,
    STAKE_MODULE_ADDR,
    STAKE_MODULE_NAME,
    "unstake_from_node",
    [],
    [ bcsStr(nodeId), bcsSerializeU64(amtBI) ],
    {}
  ];

  const tx = await provider.createRawTransactionData(payload);
  return provider.sendTransaction({
    data: tx,
    from: walletAddress,
    to: STAKE_MODULE_ADDR,
    chainId: "8",  // gebruik testnet chainId=6 als je test
    value: ""
  });
}

// ---- txClaimUnstakes (MAINNET chainId=8) ----
async function txClaimUnstakes() {
  const provider = getProvider();
  if (!provider?.createRawTransactionData) throw new Error("Starkey wallet unsupported");

  // NB: entry-functienaam kan in jouw Move-module 'claim_pending_unstakes' of 'claim_unstakes' zijn.
  // Gebruik de juiste naam; begin met 'claim_pending_unstakes'.
  const ENTRY = "claim_unstake";

  const payload = [
    walletAddress,
    0,
    STAKE_MODULE_ADDR,
    STAKE_MODULE_NAME,
    ENTRY,
    [],
    [],          // geen args
    {}
  ];

  const tx = await provider.createRawTransactionData(payload);
  return provider.sendTransaction({
    data: tx,
    from: walletAddress,
    to: STAKE_MODULE_ADDR,
    chainId: "8",
    value: ""
  });
}


// ---- fetchPendingUnstakes (mainnet version) ----
async function fetchPendingUnstakes(address) {
  if (!address) return [];

  const fn = `${STAKE_MODULE}::get_pending_unstakes`;
  let result;
  try {
    result = await supraView(fn, [address], []);
  } catch (e) {
    console.warn("[fetchPendingUnstakes] RPC error:", e);
    return [];
  }

  // Normaliseer output
  let arr = Array.isArray(result) ? result : [];
  if (arr.length === 1 && Array.isArray(arr[0])) arr = arr[0];

  const out = [];
  for (const it of arr) {
    if (!it) continue;

    const tsRaw = Array.isArray(it) ? it[0] : it.release_time ?? 0;
    const amtRaw = Array.isArray(it) ? it[1] : it.amount ?? 0;
    const clRaw  = Array.isArray(it) ? it[2] : it.claimable ?? 0;

    const ts  = BigInt(tsRaw ?? 0);
    const amt = BigInt(amtRaw ?? 0);
    const claimable = typeof clRaw === "boolean"
      ? clRaw
      : Array.isArray(clRaw)
      ? !!clRaw[0]
      : Number(clRaw || 0) !== 0;

    if (amt > 0n) out.push({ release: ts, amountMicro: amt, claimable });
  }

  console.debug("[fetchPendingUnstakes] parsed:", out);
  return out;
}

// ---- ensurePendingUnstakeMount ----
function ensurePendingUnstakeMount() {
  const page = document.getElementById("page-staking");
  if (!page) return null;

  let mount = document.getElementById("pendingUnstakeMount");
  if (!mount) {
    mount = document.createElement("div");
    mount.id = "pendingUnstakeMount";
  }

  const stakeAll   = document.getElementById("stakeAllMount");
  const myStakes   = document.getElementById("myStakesMount");
  const meridian   = page.querySelector(".staking-retro-card");

  if (stakeAll) {
    // plaats direct NA stakeAll, maar nog vóór myStakes & Meridian
    if (mount.parentNode !== page || mount.previousSibling !== stakeAll) {
      page.insertBefore(mount, stakeAll.nextSibling || myStakes || meridian || null);
    }
  } else if (myStakes) {
    page.insertBefore(mount, myStakes);      // vóór myStakes
  } else if (meridian) {
    page.insertBefore(mount, meridian);      // vóór Meridian fallback
  } else {
    if (mount.parentNode !== page) page.prepend(mount);
  }
  return mount;
}


// ---- renderPendingUnstakesPanel ----
async function renderPendingUnstakesPanel() {
  const mount = ensurePendingUnstakeMount();
  if (!mount) return;

  // Als er geen wallet is, toon de kaart "read-only" met disabled knop
  if (!walletAddress) {
    mount.innerHTML = `
      <div id="pendingUnstakePanel" class="staking-retro-card" style="margin:16px 0; padding-bottom:16px; border-radius:16px; max-width:720px; margin-left:auto; margin-right:auto;">
        <div class="staking-retro-title" style="font-size:1.2em; margin-bottom:10px; display:flex; align-items:center; justify-content:space-between; gap:12px;">
          <span>Pending unstakes</span>
          <button id="btnClaimUnstaked" class="staking-retro-main-btn" style="height:40px; border-radius:14px; font-size:14px;" disabled>Claim unstaked</button>
        </div>
        <div id="pendingUnstakeList" style="display:flex; flex-direction:column; gap:10px;">
          <div style="font-size:13px; color:#888; text-align:center;">Connect wallet to see your pending unstakes.</div>
        </div>
        <hr style="margin:12px 0 2px 0; border-top:1.7px dashed #ffd36e; opacity:.65;">
        <div style="font-size:12px; color:#888; text-align:center;">
          Claims become available after the unlock time.
        </div>
      </div>
    `;
    return;
  }

  // retro kaart + oranje knoppen
  mount.innerHTML = `
    <div id="pendingUnstakePanel" class="staking-retro-card" style="margin:16px 0; padding-bottom:16px; border-radius:16px; max-width:720px; margin-left:auto; margin-right:auto;">
      <div class="staking-retro-title" style="font-size:1.2em; margin-bottom:10px; display:flex; align-items:center; justify-content:space-between; gap:12px;">
        <span>Pending unstakes</span>
        <button id="btnClaimUnstaked" class="staking-retro-main-btn" style="height:40px; border-radius:14px; font-size:14px;">Claim unstaked</button>
      </div>
      <div id="pendingUnstakeList" style="display:flex; flex-direction:column; gap:10px;"></div>

      <hr style="margin:12px 0 2px 0; border-top:1.7px dashed #ffd36e; opacity:.65;">
      <div style="font-size:12px; color:#888; text-align:center;">
        Claims become available after the unlock time.
      </div>
    </div>
  `;

  const list = document.getElementById("pendingUnstakeList");
  const btn  = document.getElementById("btnClaimUnstaked");
  list.textContent = "Loading…";

  let rows = [];
  try {
    rows = await fetchPendingUnstakes(walletAddress);
  } catch (e) {
    list.innerHTML = `<div style="font-size:13px; color:#c33; text-align:center;">Failed to load pending unstakes.</div>`;
    if (btn) { btn.disabled = true; btn.style.opacity = "0.6"; btn.title = "Load error"; }
    return;
  }

  if (!rows?.length) {
    list.innerHTML = `<div style="font-size:13px; color:#888; text-align:center;">No pending unstakes.</div>`;
    if (btn) { btn.disabled = true; btn.style.opacity = "0.6"; btn.title = "Nothing to claim"; }
    return;
  }

  const claimableCount = rows.filter(r => r.claimable).length;
  const anyClaimable   = claimableCount > 0;

  if (btn) {
    btn.disabled = !anyClaimable;
    btn.style.opacity = anyClaimable ? "1" : "0.6";
    btn.title = anyClaimable ? "" : "Nothing claimable yet";
    // laat aantal claimables zien
    btn.textContent = anyClaimable ? `Claim unstaked (${claimableCount})` : "Claim unstaked";
  }

  list.innerHTML = "";
  for (const r of rows) {
    const claimTxt = r.claimable ? "✓ claimable" : `release in ${fmtCountdown(r.release)}`;
    const whenTxt  = r.claimable ? "ready" : fmtDateTimeFromEpochSec(r.release);
    const amtTxt   = fmtPeckyMicro(r.amountMicro);

    const row = document.createElement("div");
    row.style.cssText = `
      display:grid; grid-template-columns: 1fr auto; gap:8px; align-items:center;
      padding:10px 12px; border:1.5px dashed #ffd36e; border-radius:14px; background:#fffbe8;
    `;
    row.innerHTML = `
      <div>
        <div style="font-size:13px; color:#7a5a11;">Release: <strong>${whenTxt}</strong> <span style="opacity:.75;">(${claimTxt})</span></div>
        <div style="font-size:13px; color:#7a5a11;">Amount: <strong>${amtTxt} $Pecky</strong></div>
      </div>
      <div style="font-size:12px; color:${r.claimable ? '#2a8f3a' : '#9a7c2a'}; text-align:right;">${r.claimable ? "ready" : "pending"}</div>
    `;
    list.appendChild(row);
  }

  // één duidelijke handler (herbindt na elke render)
  if (btn) {
    btn.onclick = async () => {
      if (btn.disabled) return;
      try {
        btn.disabled = true; btn.style.opacity = "0.6";
        const txh = await txClaimUnstakes(); // <-- jouw tx helper die ALLE claimbare unstakes claimt
        showPopup(`Claimed unstaked funds`, { long: true });

        // refresh balances & panels
        await getPeckyBalance(walletAddress);
        await renderPendingUnstakesPanel();
        await renderUserStakesPanel?.();
      } catch (e) {
        const reason = await getFailureReason?.(e?.hash || "");
        showPopup(reason || "Claim unstaked failed", { long: true });
        btn.disabled = !anyClaimable;
        btn.style.opacity = anyClaimable ? "1" : "0.6";
      }
    };
  }
}



async function getPeckyBotDays() {
  if (!walletAddress) return;
  const url = "https://rpc-mainnet.supra.com/rpc/v1/view";
  const payload = {
    function: `${PECKY_COIN_MODULE}::PeckyBotV2::get_remaining_days`,
    arguments: [walletAddress],
    type_arguments: []
  };
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    const data = await response.json();
    const daysLeft = data?.result?.[0] || 0;
    document.getElementById("botDaysLeft").textContent = `${daysLeft} days left active`;
    return daysLeft;
  } catch {
    document.getElementById("botDaysLeft").textContent = "Status unknown";
    return null;
  }
}



function flipCard(card) {
  card.classList.toggle("flipped");
}

// Vervangt de oude berekening met drie fetches
async function getCirculatingSupply() {
  try {
    // Haal totale vrijgegeven supply (in micro-PECKY) via on-chain view
    const r = await supraView(
      `${PECKY_COIN_MODULE}::Supply::total_released_all`,
      [],
      []
    );

    // Robust parse → naar BigInt (micro-units)
    let micro = 0n;
    let v = Array.isArray(r) ? r[0] : r;
    if (typeof v === "string") {
      micro = v.startsWith("0x") ? BigInt(v) : BigInt(v);
    } else if (typeof v === "bigint") {
      micro = v;
    } else if (typeof v === "number" && Number.isFinite(v)) {
      micro = BigInt(Math.trunc(v));
    } else {
      micro = 0n;
    }

    // Naar PECKY-units (6 decimals)
    const units = Number(micro) / 1_000_000;

    const el = document.getElementById("circulatingSupplyValue");
    if (el) el.textContent = formatMillions(units) + " $Pecky";
  } catch (err) {
    const el = document.getElementById("circulatingSupplyValue");
    if (el) el.textContent = "–";
    console.warn("circulating supply view failed:", err);
  }
}

document.getElementById("maxStakeBtn")?.addEventListener("click", async () => {
  if (!walletAddress) return showPopup("Connect wallet first");
  const input = document.getElementById("stakeAmountInput");
  const bal = await fetchSupraWalletBalance(walletAddress);
  let maxSupra = Number(bal) / 1e8 - 1; // 1 Supra reserveren voor fee
  if (maxSupra < 0) maxSupra = 0;
  input.value = maxSupra.toFixed(2).replace(/\.?0+$/, "");
});

async function updateBotPageStatusAlways() {
  const botStatusValue = document.getElementById("botActiveStatusValue");
  const botDaysLeft = document.getElementById("botDaysLeft");
  // Loggen om te zien of dit echt wordt aangeroepen
  console.log("updateBotPageStatusAlways() – botStatusValue:", !!botStatusValue, "botDaysLeft:", !!botDaysLeft, "wallet:", walletAddress);

  if (botStatusValue) await checkPeckyBotActive();
  if (botDaysLeft && typeof getPeckyBotDays === "function") await getPeckyBotDays();
}



/* ===================== TOEGEVOEGD: Discord helpers (on-chain) ===================== */
function bcsSerializeU128(numStr) {
  let x = BigInt(numStr);
  const bytes = [];
  for (let i = 0; i < 16; i++) { bytes.push(Number(x & 0xffn)); x >>= 8n; }
  return bytes;
}

async function isDiscordLinked(ownerAddr) {
  if (!ownerAddr) return false;
  const payload = {
    function: `${DISCORD_MODULE}::is_registered`,
    type_arguments: [],
    arguments: [ownerAddr]
  };
  try {
    const res = await fetch("https://rpc-mainnet.supra.com/rpc/v1/view", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    return !!data?.result?.[0];
  } catch {
    return false;
  }
}

async function getDiscordId(ownerAddr) {
  const payload = {
    function: `${DISCORD_MODULE}::get_discord_id`,
    type_arguments: [],
    arguments: [ownerAddr]
  };
  try {
    const res = await fetch("https://rpc-mainnet.supra.com/rpc/v1/view", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    const out = res.ok ? await res.json() : null;
    // returns (bool, u128) as strings
    if (out?.result?.length === 2 && out.result[0] === true) {
      return out.result[1];
    }
  } catch {}
  return null;
}

async function registerDiscord() {
  if (!walletAddress) return showPopup("Connect your wallet first.");
  const provider = getProvider();
  if (!provider?.createRawTransactionData) return showPopup("Starkey wallet unsupported.");

  const input = document.getElementById("discordIdInput");
  const idStr = (input?.value || "").trim();
  if (!/^\d{16,20}$/.test(idStr)) {
    return showPopup("Enter a valid Discord ID (numbers only).");
  }
    try {
    const idArg = bcsSerializeU128(idStr);
    const payload = [
      walletAddress,
      0,
      DISCORD_MODULE_ADDR,
      "discord_link",
      "register_discord",
      [],
      [idArg],
      {}
    ];

    const txData = await provider.createRawTransactionData(payload);
    const txHash = await provider.sendTransaction({
      data: txData,
      from: walletAddress,
      to: DISCORD_MODULE_ADDR,
      chainId: "8",
      value: ""
    });

    const statusEl = document.getElementById("discordStatusText");
    if (statusEl) statusEl.textContent = `Tx: ${txHash}`;

    showPopup("Discord linked!");
    if (input) input.value = "";

    if (typeof refreshDiscordUI === "function") {
      await refreshDiscordUI();
    }
  } catch (e) {
    console.error(e);
    showPopup("Failed to link Discord.");
  }
}

async function unregisterDiscord() {
  if (!walletAddress) return showPopup("Connect your wallet first.");
  const provider = getProvider();
  if (!provider?.createRawTransactionData) return showPopup("Starkey wallet unsupported.");

  try {
    const payload = [
      walletAddress,
      0,
      DISCORD_MODULE_ADDR,
      "discord_link",
      "unregister_discord",
      [],
      [],
      {}
    ];

    const txData = await provider.createRawTransactionData(payload);
    const txHash = await provider.sendTransaction({
      data: txData,
      from: walletAddress,
      to: DISCORD_MODULE_ADDR,
      chainId: "8",
      value: ""
    });

    const statusEl = document.getElementById("discordStatusText");
    if (statusEl) statusEl.textContent = `Tx: ${txHash}`;

    showPopup("Discord unlinked!");
    if (typeof refreshDiscordUI === "function") {
      await refreshDiscordUI();
    }
  } catch (e) {
    console.error(e);
    showPopup("Failed to unlink Discord.");
  }
}

async function refreshDiscordUI() {
  const form       = document.getElementById("discordLinkForm");   // container met input + link button
  const unlinkWrap = document.getElementById("discordUnlinkWrap"); // container met unlink button
  const status     = document.getElementById("discordStatusText"); // kleine statusregel
  const input      = document.getElementById("discordIdInput");    // numeric input voor Discord ID

  // Ontbreken elementen? Dan niets doen (veilig op andere pagina's)
  if (!form && !unlinkWrap && !status && !input) return;

  // Niet ingelogd
  if (!walletAddress) {
    if (form)       form.style.display = "flex";
    if (unlinkWrap) unlinkWrap.style.display = "none";
    if (status)     status.textContent = "Connect wallet to link your Discord.";
    return;
  }

  try {
    const linked = await isDiscordLinked(walletAddress);

    if (linked) {
      // Toon unlink state
      if (form)       form.style.display = "none";
      if (unlinkWrap) unlinkWrap.style.display = "block";

      // Discord ID ophalen (optioneel)
      let currentId = null;
      try {
        currentId = await getDiscordId(walletAddress);
      } catch {
        currentId = null;
      }
      if (status) status.textContent = currentId ? `Linked: ${currentId}` : "Discord linked.";
      if (input)  input.value = "";
    } else {
      // Toon link state
      if (form)       form.style.display = "flex";
      if (unlinkWrap) unlinkWrap.style.display = "none";
      if (status)     status.textContent = "Not linked yet.";
    }
  } catch (e) {
    console.error("refreshDiscordUI error:", e);
    if (form)       form.style.display = "flex";
    if (unlinkWrap) unlinkWrap.style.display = "none";
    if (status)     status.textContent = "Status unknown.";
  }
}

async function fetchPeckyBalanceOfAddress(addr) {
  try {
    const encoded = encodeURIComponent(PECKY_RESOURCE_TYPE);
    const url = `https://rpc-mainnet.supra.com/rpc/v1/accounts/${addr}/resources/${encoded}`;
    const res = await fetch(url);
    const data = await res.json();
    const raw = data?.result?.[0]?.coin?.value || "0";     // micro-Pecky (u64 als string)
    return BigInt(raw);
  } catch (e) {
    console.warn("fetchPeckyBalanceOfAddress error:", e);
    return 0n;
  }
}

/** Format micro-Pecky naar leesbaar met 6 decimals (zelfde als elders) */
function formatPeckyUnitsFromMicro(microBigInt) {
  const n = Number(microBigInt) / 1_000_000;
  if (n >= 1_000_000_000) return (n / 1_000_000_000).toFixed(2) + "B $Pecky";
  if (n >= 1_000_000)     return (n / 1_000_000).toFixed(2) + "M $Pecky";
  return n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " $Pecky";
}

/** Update de Info-pagina: burned balance + (optioneel) % van totale supply */
async function updateBurnInfo() {
  try {
    // Balance van de burn-wallet in micro-Pecky
    const burnedMicro = await fetchPeckyBalanceOfAddress(BURN_ADDRESS);

    // Tekstuele weergave
    const burnedEl = document.getElementById("burnedPeckyValue");
    if (burnedEl) burnedEl.textContent = formatPeckyUnitsFromMicro(burnedMicro);

    // (Optioneel) ruwe micro-waarde tonen
    const burnedRawEl = document.getElementById("burnedPeckyRaw");
    if (burnedRawEl) burnedRawEl.textContent = burnedMicro.toString();

    // (Optioneel) percentage van totale supply (je VAULT_TOTAL is in micro-Pecky)
    if (typeof VAULT_TOTAL !== "undefined" && VAULT_TOTAL > 0) {
      const pct = Math.min(100, (Number(burnedMicro) / Number(VAULT_TOTAL)) * 100);
      const pctEl = document.getElementById("burnedPeckyPercent");
      if (pctEl) pctEl.textContent = pct.toFixed(4) + "% of total supply";
    }
  } catch (e) {
    const burnedEl = document.getElementById("burnedPeckyValue");
    if (burnedEl) burnedEl.textContent = "–";
    console.warn("updateBurnInfo error:", e);
  }
}

/* Start/auto-refresh (voeg dit toe aan jouw bestaande DOMContentLoaded of laat apart staan) */
document.addEventListener("DOMContentLoaded", () => {
  // 1x laden + elke 30s verversen
  updateBurnInfo();
  setInterval(updateBurnInfo, 30000);
});
/* ==================== /BURN ADDRESS WIDGET ==================== */

window.addEventListener('DOMContentLoaded', getCirculatingSupply);
