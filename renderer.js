function formatMoney(num) {
  if (!num && num !== 0) return "...";
  if (num >= 1e12) return "$" + (num / 1e12).toFixed(2) + "T";
  if (num >= 1e9) return "$" + (num / 1e9).toFixed(2) + "B";
  if (num >= 1e6) return "$" + (num / 1e6).toFixed(2) + "M";
  if (num >= 1e3) return "$" + (num / 1e3).toFixed(2) + "K";
  return "$" + num.toLocaleString();
}

// =============== ALERT SOUND (chỉ 1 lần mỗi 5s) ===============
let lastAlertTime = 0;
function playAlertSound() {
  let now = Date.now();
  if (now - lastAlertTime > 5000) { // 5s mới kêu lại
    const audio = new Audio('https://cdn.pixabay.com/audio/2022/07/26/audio_124bfa4e4b.mp3');
    audio.volume = 0.5;
    audio.play();
    lastAlertTime = now;
  }
}

// ========== Loading Spinner ==========
function setLoading(isLoading) {
  const spinner = document.getElementById('loading-spinner');
  if (spinner) spinner.style.display = isLoading ? '' : 'none';
}

// Funding rate + OI BTC, ETH từ Binance Futures API (public)
async function fetchDerivativesData() {
  try {
    const btcFunding = await fetch('https://fapi.binance.com/fapi/v1/premiumIndex?symbol=BTCUSDT').then(r=>r.json());
    const ethFunding = await fetch('https://fapi.binance.com/fapi/v1/premiumIndex?symbol=ETHUSDT').then(r=>r.json());
    const btcOI = await fetch('https://fapi.binance.com/fapi/v1/openInterest?symbol=BTCUSDT').then(r=>r.json());
    const ethOI = await fetch('https://fapi.binance.com/fapi/v1/openInterest?symbol=ETHUSDT').then(r=>r.json());
    document.getElementById('funding_btc').textContent = btcFunding.lastFundingRate
      ? (parseFloat(btcFunding.lastFundingRate)*100).toFixed(4) + " %"
      : "N/A";
    document.getElementById('funding_eth').textContent = ethFunding.lastFundingRate
      ? (parseFloat(ethFunding.lastFundingRate)*100).toFixed(4) + " %"
      : "N/A";
    document.getElementById('oi_btc').textContent = btcOI.openInterest
      ? Number(btcOI.openInterest).toLocaleString() + " BTC"
      : "N/A";
    document.getElementById('oi_eth').textContent = ethOI.openInterest
      ? Number(ethOI.openInterest).toLocaleString() + " ETH"
      : "N/A";
  } catch(e) {
    document.getElementById('funding_btc').textContent = "Error";
    document.getElementById('funding_eth').textContent = "Error";
    document.getElementById('oi_btc').textContent = "Error";
    document.getElementById('oi_eth').textContent = "Error";
  }
}

// Whale Alert + Liquidation Alert DEMO (tích hợp sau)
async function fetchWhaleLiqData() {
  try {
    // DEMO random số lượng lớn
    let btcWhale = Math.floor(Math.random() * (8000 - 2000) + 2000);
    let ethWhale = Math.floor(Math.random() * (40000 - 8000) + 8000);
    document.getElementById('whale_btc').textContent = btcWhale.toLocaleString() + " BTC";
    document.getElementById('whale_eth').textContent = ethWhale.toLocaleString() + " ETH";

    let btcLiq = Math.floor(Math.random() * (40_000_000 - 10_000_000) + 10_000_000);
    let ethLiq = Math.floor(Math.random() * (10_000_000 - 2_000_000) + 2_000_000);
    document.getElementById('liq_btc').textContent = "$" + btcLiq.toLocaleString();
    document.getElementById('liq_eth').textContent = "$" + ethLiq.toLocaleString();

    // ====== Alert màu & âm thanh ======
    // Whale BTC alert
    if (btcWhale > 6000) {
      document.getElementById('whale_btc').style.background = "#d32f2f";
      document.getElementById('whale_btc').style.color = "#fff";
      playAlertSound();
    } else {
      document.getElementById('whale_btc').style.background = "";
      document.getElementById('whale_btc').style.color = "";
    }
    // Whale ETH alert
    if (ethWhale > 30000) {
      document.getElementById('whale_eth').style.background = "#d32f2f";
      document.getElementById('whale_eth').style.color = "#fff";
      playAlertSound();
    } else {
      document.getElementById('whale_eth').style.background = "";
      document.getElementById('whale_eth').style.color = "";
    }
    // Liquidation BTC alert
    if (btcLiq > 30_000_000) {
      document.getElementById('liq_btc').style.background = "#b71c1c";
      document.getElementById('liq_btc').style.color = "#fff";
      playAlertSound();
    } else {
      document.getElementById('liq_btc').style.background = "";
      document.getElementById('liq_btc').style.color = "";
    }
    // Liquidation ETH alert
    if (ethLiq > 7_000_000) {
      document.getElementById('liq_eth').style.background = "#b71c1c";
      document.getElementById('liq_eth').style.color = "#fff";
      playAlertSound();
    } else {
      document.getElementById('liq_eth').style.background = "";
      document.getElementById('liq_eth').style.color = "";
    }
  } catch(e) {
    document.getElementById('whale_btc').textContent = "Error";
    document.getElementById('whale_eth').textContent = "Error";
    document.getElementById('liq_btc').textContent = "Error";
    document.getElementById('liq_eth').textContent = "Error";
  }
}

window.fetchMarketCaps = async function(force = false) {
  setLoading(true);
  document.getElementById('btc').textContent = "...";
  document.getElementById('eth').textContent = "...";
  document.getElementById('total').textContent = "...";
  document.getElementById('alt').textContent = "...";
  document.getElementById('btc_dom').textContent = "...";
  document.getElementById('eth_dom').textContent = "...";
  document.getElementById('updated').textContent = "Đang tải...";

  try {
    const [global, btc, eth] = await Promise.all([
      fetch('https://api.coingecko.com/api/v3/global').then(r=>r.json()),
      fetch('https://api.coingecko.com/api/v3/coins/bitcoin?localization=false&tickers=false&community_data=false&developer_data=false&sparkline=false').then(r=>r.json()),
      fetch('https://api.coingecko.com/api/v3/coins/ethereum?localization=false&tickers=false&community_data=false&developer_data=false&sparkline=false').then(r=>r.json())
    ]);
    const totalCap = global.data.total_market_cap.usd;
    const btcCap = btc.market_data.market_cap.usd;
    const ethCap = eth.market_data.market_cap.usd;
    const altCap = totalCap - btcCap - ethCap;
    const btcDom = global.data.market_cap_percentage.btc;
    const ethDom = global.data.market_cap_percentage.eth;
    const capChange = global.data.market_cap_change_percentage_24h_usd;

    document.getElementById('btc').textContent = formatMoney(btcCap);
    document.getElementById('eth').textContent = formatMoney(ethCap);
    document.getElementById('total').textContent = formatMoney(totalCap);
    document.getElementById('alt').textContent = formatMoney(altCap);
    document.getElementById('btc_dom').textContent = btcDom ? btcDom.toFixed(2) + " %" : "...";
    document.getElementById('eth_dom').textContent = ethDom ? ethDom.toFixed(2) + " %" : "...";
    const capChangeSpan = document.getElementById('cap_change');
    if (capChange !== undefined && capChange !== null) {
      capChangeSpan.textContent = (capChange > 0 ? "+" : "") + capChange.toFixed(2) + "%";
      capChangeSpan.className = "capchange " + (capChange >= 0 ? "positive" : "negative");
    } else {
      capChangeSpan.textContent = "...";
      capChangeSpan.className = "capchange";
    }
    const updated = new Date(global.data.updated_at * 1000).toLocaleString('vi-VN');
    document.getElementById('updated').textContent = "Cập nhật: " + updated;
    const btcPrice = btc.market_data.current_price.usd;
    const btcVol = btc.market_data.total_volume.usd;
    const ethPrice = eth.market_data.current_price.usd;
    const ethVol = eth.market_data.total_volume.usd;

    document.getElementById('btc_price').textContent = btcPrice ? btcPrice.toLocaleString('en-US', {style:'currency', currency:'USD'}) : "...";
    document.getElementById('btc_vol').textContent = btcVol ? formatMoney(btcVol) : "...";
    document.getElementById('eth_price').textContent = ethPrice ? ethPrice.toLocaleString('en-US', {style:'currency', currency:'USD'}) : "...";
    document.getElementById('eth_vol').textContent = ethVol ? formatMoney(ethVol) : "...";
  } catch (e) {
    document.getElementById('btc').textContent = "Error!";
    document.getElementById('eth').textContent = "Error!";
    document.getElementById('total').textContent = "Error!";
    document.getElementById('alt').textContent = "Error!";
    document.getElementById('btc_dom').textContent = "Error!";
    document.getElementById('eth_dom').textContent = "Error!";
    document.getElementById('cap_change').textContent = "Error!";
    document.getElementById('btc_price').textContent = "...";
    document.getElementById('btc_vol').textContent = "...";
    document.getElementById('eth_price').textContent = "...";
    document.getElementById('eth_vol').textContent = "...";
    document.getElementById('updated').textContent = "Không tải được dữ liệu!";
  }
  setLoading(false);
  if (force) blinkUpdate();
};

function setAutoRefresh() {
  let interval = parseInt(document.getElementById('interval').value || "0");
  if (window.capInterval) clearInterval(window.capInterval);
  if (interval > 0) {
    window.capInterval = setInterval(() => {
      fetchMarketCaps(true);
      fetchDerivativesData();
      fetchWhaleLiqData();
    }, interval * 1000);
    localStorage.setItem('cap_interval', interval);
  } else {
    localStorage.removeItem('cap_interval');
  }
}

function blinkUpdate() {
  const el = document.getElementById('updated');
  if (!el) return;
  el.style.opacity = 0.3;
  setTimeout(() => { el.style.opacity = 1; }, 150);
}

document.addEventListener("DOMContentLoaded", function() {
  document.getElementById('refresh-btn').addEventListener('click', function() {
    fetchMarketCaps(true);
    fetchDerivativesData();
    fetchWhaleLiqData();
  });
  document.getElementById('interval').addEventListener('change', setAutoRefresh);
  if (localStorage.getItem('cap_interval')) {
    document.getElementById('interval').value = localStorage.getItem('cap_interval');
  }
  setAutoRefresh();
  fetchMarketCaps();
  fetchDerivativesData();
  fetchWhaleLiqData();
  // Dark mode init
  if (localStorage.getItem('dark_mode') === 'true') {
    document.body.classList.add('dark');
  }
});

// =============== DARK/LIGHT MODE TOGGLE ===============
document.getElementById('toggle-theme').addEventListener('click', () => {
  let dark = document.body.classList.toggle('dark');
  localStorage.setItem('dark_mode', dark);
});
