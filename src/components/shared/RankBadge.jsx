import React from 'react';

const STYLES = {
  bronze:  'text-amber-700  bg-amber-50  border-amber-200',
  silver:  'text-muted-foreground bg-muted border-border',
  gold:    'text-yellow-700 bg-yellow-50  border-yellow-200',
  diamond: 'text-sky-700    bg-sky-50     border-sky-200',
  og:      'text-purple-700 bg-purple-50  border-purple-200',
};

const LABELS = { bronze: 'Bronze', silver: 'Silver', gold: 'Gold', diamond: 'Diamond', og: 'OG' };

export default function RankBadge({ rank = 'bronze', size = 'sm' }) {
  const s = STYLES[rank] || STYLES.bronze;
  const sz = size === 'xs' ? 'text-[10px] px-1.5 py-0.5' : 'text-xs px-2 py-0.5';
  return (
    <span className={`inline-block rounded-full border font-medium leading-none ${s} ${sz}`}>
      {LABELS[rank] || rank}
    </span>
  );
}
