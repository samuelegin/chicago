export const RANKS = {
  bronze: { label: 'Bronze', emoji: '🥉', minScore: 0, color: 'text-amber-600', bg: 'bg-amber-600/10', border: 'border-amber-600/30' },
  silver: { label: 'Silver', emoji: '🥈', minScore: 1000, color: 'text-slate-300', bg: 'bg-slate-300/10', border: 'border-slate-300/30' },
  gold: { label: 'Gold', emoji: '🥇', minScore: 5000, color: 'text-yellow-400', bg: 'bg-yellow-400/10', border: 'border-yellow-400/30' },
  diamond: { label: 'Diamond', emoji: '💎', minScore: 10000, color: 'text-cyan-400', bg: 'bg-cyan-400/10', border: 'border-cyan-400/30' },
  og: { label: 'Chicago OG', emoji: '👑', minScore: 50000, color: 'text-purple-400', bg: 'bg-purple-400/10', border: 'border-purple-400/30' },
};

export const CATEGORIES = [
  { value: 'general', label: 'General', icon: '💬' },
  { value: 'meme', label: 'Meme', icon: '😂' },
  { value: 'crypto_insight', label: 'Crypto Insight', icon: '📊' },
  { value: 'humor', label: 'Humor', icon: '🎭' },
  { value: 'news', label: 'News', icon: '📰' },
];

export const STAKING_TIERS = [
  { min: 0,    max: 99,    multiplier: 1.0,  label: 'No Boost',   color: 'text-muted-foreground' },
  { min: 100,  max: 499,   multiplier: 1.10, label: '+10% Boost', color: 'text-green-400' },
  { min: 500,  max: 999,   multiplier: 1.25, label: '+25% Boost', color: 'text-cyan-400' },
  { min: 1000, max: Infinity, multiplier: 1.50, label: '+50% Boost', color: 'text-purple-400' },
];

// Duration bonus on top of amount multiplier
export const DURATION_BONUSES = [
  { days: 0,   bonus: 0,    label: 'No duration bonus' },
  { days: 7,   bonus: 0,    label: 'Minimum (7 days)' },   // min before any boost
  { days: 30,  bonus: 0.05, label: '+5% (30 days)' },
  { days: 90,  bonus: 0.15, label: '+15% (90 days)' },
  { days: 180, bonus: 0.30, label: '+30% (180 days)' },
];

export const STAKING_MIN_DAYS_FOR_BOOST = 7; // must hold at least 7 days before boost activates

// CIS formula weights
export const CIS_WEIGHTS = {
  social: 0.70,   // reputation / engagement
  staking: 0.20,  // stake boost contribution
  consistency: 0.10, // streaks
};

export function getDurationBonus(days) {
  const sorted = [...DURATION_BONUSES].reverse();
  return sorted.find(d => days >= d.days) || DURATION_BONUSES[0];
}

export function calcCombinedMultiplier(amountClt, lockDays) {
  const amountTier = getStakingTier(amountClt);
  const durationBonus = getDurationBonus(lockDays);
  // Combined = amount_multiplier + duration_bonus (additive on top)
  return Math.round((amountTier.multiplier + durationBonus.bonus) * 100) / 100;
}

export function calcCISBoostPoints(amountClt, lockDays, baseReputation = 0) {
  const multiplier = calcCombinedMultiplier(amountClt, lockDays);
  const stakingContrib = Math.round(amountClt * (multiplier - 1) * CIS_WEIGHTS.staking * 10);
  return stakingContrib;
}

export function getRankFromScore(score) {
  if (score >= 50000) return 'og';
  if (score >= 10000) return 'diamond';
  if (score >= 5000) return 'gold';
  if (score >= 1000) return 'silver';
  return 'bronze';
}

export function getStakingTier(amount) {
  return STAKING_TIERS.find(t => amount >= t.min && amount <= t.max) || STAKING_TIERS[0];
}

export function truncateWallet(address) {
  if (!address) return '';
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}