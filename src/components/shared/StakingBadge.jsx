import React from 'react';
import { getStakingTier } from '@/lib/constants';

export default function StakingBadge({ amount = 0 }) {
  const tier = getStakingTier(amount);
  if (tier.multiplier <= 1.0) return null;
  return (
    <span className="inline-block text-[11px] font-medium text-yellow-700 bg-yellow-50 border border-yellow-200 rounded-full px-2 py-0.5">
      {tier.label}
    </span>
  );
}
