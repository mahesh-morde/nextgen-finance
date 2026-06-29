const fs = require('fs');

const dataPath = './public/data/market-data.json';
const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

// Helper to generate fake history
function generateHistory(basePrice, volatility, trend) {
  const history = [];
  const now = Date.now();
  let currentPrice = basePrice;
  for (let i = 90; i >= 0; i--) {
    const change = currentPrice * (Math.random() * volatility * 2 - volatility) + trend;
    currentPrice += change;
    history.push({
      timestamp: now - (i * 24 * 60 * 60 * 1000),
      open: currentPrice * 0.99,
      high: currentPrice * 1.02,
      low: currentPrice * 0.98,
      close: currentPrice,
      volume: Math.floor(Math.random() * 1000000)
    });
  }
  return history;
}

const mockAssets = [
  // Mutual Funds
  { symbol: 'PARAGPARIKH', name: 'Parag Parikh Flexi Cap', basePrice: 65, vol: 0.01, trend: 0.05, class: 'Mutual Fund' },
  { symbol: 'AXISBLUECHIP', name: 'Axis Bluechip Fund', basePrice: 45, vol: 0.01, trend: 0.03, class: 'Mutual Fund' },
  { symbol: 'SBINIFTY', name: 'SBI Nifty Index Fund', basePrice: 180, vol: 0.012, trend: 0.1, class: 'Mutual Fund' },
  { symbol: 'HDFCSMALLCAP', name: 'HDFC Small Cap Fund', basePrice: 110, vol: 0.02, trend: 0.15, class: 'Mutual Fund' },
  
  // Crypto
  { symbol: 'BTC-USD', name: 'Bitcoin', basePrice: 5500000, vol: 0.04, trend: 5000, class: 'Crypto' },
  { symbol: 'ETH-USD', name: 'Ethereum', basePrice: 280000, vol: 0.05, trend: 200, class: 'Crypto' },
  { symbol: 'SOL-USD', name: 'Solana', basePrice: 12000, vol: 0.06, trend: 50, class: 'Crypto' },
  { symbol: 'ADA-USD', name: 'Cardano', basePrice: 45, vol: 0.05, trend: 0.1, class: 'Crypto' },
  { symbol: 'DOGE-USD', name: 'Dogecoin', basePrice: 12, vol: 0.08, trend: -0.05, class: 'Crypto' },
  
  // Commodities
  { symbol: 'GOLD', name: 'Gold (10g)', basePrice: 62000, vol: 0.005, trend: 10, class: 'Commodity' },
  { symbol: 'SILVER', name: 'Silver (1kg)', basePrice: 75000, vol: 0.008, trend: 15, class: 'Commodity' },
  { symbol: 'CRUDEOIL', name: 'Crude Oil', basePrice: 6800, vol: 0.015, trend: -5, class: 'Commodity' },
  
  // Fixed Income
  { symbol: 'EPF', name: 'Employees Provident Fund', basePrice: 1500000, vol: 0.0001, trend: 1000, class: 'Fixed Income' },
  { symbol: 'PPF', name: 'Public Provident Fund', basePrice: 800000, vol: 0.0001, trend: 500, class: 'Fixed Income' },
  { symbol: 'SGB2029', name: 'SGB Aug 2029', basePrice: 6150, vol: 0.005, trend: 2, class: 'Fixed Income' },
  { symbol: 'HDFCFD', name: 'HDFC Bank FD 7.1%', basePrice: 500000, vol: 0.00001, trend: 100, class: 'Fixed Income' },
  
  // US Equities
  { symbol: 'AAPL', name: 'Apple Inc.', basePrice: 14500, vol: 0.015, trend: 10, class: 'Equity' },
  { symbol: 'TSLA', name: 'Tesla Inc.', basePrice: 16000, vol: 0.03, trend: -15, class: 'Equity' },
  { symbol: 'MSFT', name: 'Microsoft Corp.', basePrice: 32000, vol: 0.015, trend: 20, class: 'Equity' },
  { symbol: 'NVDA', name: 'NVIDIA Corp.', basePrice: 65000, vol: 0.04, trend: 150, class: 'Equity' }
];

mockAssets.forEach(asset => {
  const history = generateHistory(asset.basePrice, asset.vol, asset.trend);
  const latestPrice = history[history.length - 1].close;
  const prevPrice = history[history.length - 2].close;
  const change = latestPrice - prevPrice;
  const changePercent = (change / prevPrice) * 100;
  
  data[asset.symbol] = {
    symbol: asset.symbol,
    name: asset.name,
    price: latestPrice,
    changePercent: changePercent,
    change: change,
    assetClass: asset.class,
    history: history
  };
});

fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
console.log('Successfully updated market-data.json with expanded multi-asset data!');
