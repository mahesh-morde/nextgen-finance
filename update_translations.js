const fs = require('fs');
const path = require('path');

const keysToAdd = {
  COMMON: {
    PRO_MEMBER: 'Pro Member'
  },
  DASHBOARD: {
    FEED_MSG_1: 'Detected unusual volume in <span class="fw-bold text-dark">RELIANCE.NS</span> suggesting potential breakout.',
    FEED_MSG_2: 'Portfolio outperforming NIFTY 50 by <span class="text-success fw-bold">+1.2%</span> today.',
    FEED_MSG_3: 'Rebalancing recommendation generated based on current risk profile.',
    RISK_PROFILE: 'Risk Profile',
    PROFILE_Conservative: 'Conservative',
    PROFILE_Moderate: 'Moderate',
    PROFILE_Aggressive: 'Aggressive',
    SAFE: 'Safe',
    MOD: 'Mod',
    AGG: 'Agg',
    RISK_INSIGHT_CONS: 'AI suggests a heavy allocation in bonds and large-cap blue-chip stocks (TCS, HDFC Bank) to preserve capital.',
    RISK_INSIGHT_MOD: 'Your portfolio is balanced. AI is dynamically hedging against downside risk while seeking moderate growth opportunities.',
    RISK_INSIGHT_AGG: 'AI recommends capitalizing on high-growth mid-caps and volatile sectors. Expect higher short-term fluctuations.',
    RISK_SCORE_LABEL: 'RISK SCORE',
    LIVE_TRACKING: 'Live tracking across holdings'
  },
  PORTFOLIO: {
    ALL: 'All',
    'TAB_Equity': 'Equity',
    'TAB_Mutual Fund': 'Mutual Fund',
    'TAB_Crypto': 'Crypto',
    'TAB_Commodity': 'Commodity',
    'TAB_Fixed Income': 'Fixed Income',
    INVESTED: 'Invested',
    CURRENT: 'Current',
    OVERALL_PL: 'Overall P&L',
    AVG_PRICE: 'Avg. Price',
    DAY_PL: 'Day P&L',
    DAY_PERCENT: 'Day %',
    OVERALL_PERCENT: 'Overall %'
  },
  RISK: {
    TOLERANCE: 'Risk Tolerance (Volatility)',
    BEST_CASE: 'Best Case',
    TOP_OUTCOME: 'Top 10% Outcome',
    EXPECTED: 'Expected',
    MEDIAN_OUTCOME: 'Median Outcome',
    WORST_CASE: 'Worst Case',
    BOTTOM_OUTCOME: 'Bottom 10% Outcome',
    AI_INSIGHT_CONS: 'At Risk Level <4, the Generative AI model detects a heavy defensive posture (approx. 70% debt instruments). While this insulates the portfolio from market shocks (-12% max drawdown predicted), it severely limits upside potential, barely outpacing the projected 6% inflation rate.',
    AI_INSIGHT_MOD: 'The AI model confirms a balanced 60/40 equity-to-debt ratio. This alignment is optimal for the requested time horizon. Predictive algorithms show steady compound growth while softening major market corrections by approx 40%.',
    AI_INSIGHT_AGG: 'At Risk Level >7, the AI detects aggressive positioning with 90%+ equity allocation, heavily skewed towards high-beta Indian small-caps. Pattern analysis indicates a 35% probability of a severe drawdown in the first 3 years, but maximum long-term wealth generation potential.'
  },
  SETTINGS: {
    PROFILE_DETAILS: 'Profile Details',
    FIRST_NAME: 'First Name',
    LAST_NAME: 'Last Name',
    EMAIL: 'Email Address',
    AI_CONFIG: 'AI Copilot Configuration',
    PRIMARY_LLM: 'Primary LLM Provider',
    LANG_DESC: 'Set your dashboard language.',
    CURRENCY: 'Currency',
    CURRENCY_DESC: 'Display currency for assets.',
    THEME_DESC: 'Choose visual appearance.',
    NOTIFICATIONS: 'Notifications',
    PRICE_ALERTS: 'Price Alerts',
    PRICE_ALERTS_DESC: 'Get notified of 5% swings.',
    AI_INSIGHTS_NOTIF: 'AI Insights',
    AI_INSIGHTS_DESC: 'Weekly portfolio analysis.',
    PORTFOLIO_UPDATES: 'Portfolio Updates',
    PORTFOLIO_UPDATES_DESC: 'Daily summary emails.'
  }
};

const dir = path.join(__dirname, 'public', 'i18n');
const files = ['en.json', 'es.json', 'hi.json', 'kn.json'];

files.forEach(file => {
  const filePath = path.join(dir, file);
  if (fs.existsSync(filePath)) {
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    
    Object.keys(keysToAdd).forEach(category => {
      if (!data[category]) {
        data[category] = {};
      }
      Object.keys(keysToAdd[category]).forEach(key => {
        if (!data[category][key]) {
          data[category][key] = keysToAdd[category][key];
        }
      });
    });
    
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    console.log(`Updated ${file}`);
  }
});
