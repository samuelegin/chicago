import React from 'react';
import { getRankFromScore, RANKS } from '@/lib/constants';

export default function CISDisplay({ score = 0 }) {
  const rank     = getRankFromScore(score);
  const cfg      = RANKS[rank];
  const rankKeys = Object.keys(RANKS);
  const idx      = rankKeys.indexOf(rank);
  const next     = idx < rankKeys.length - 1 ? RANKS[rankKeys[idx + 1]] : null;
  const pct      = next
    ? Math.min(((score - cfg.minScore) / (next.minScore - cfg.minScore)) * 100, 100)
    : 100;

  return (
    <div className="space-y-1.5">
      <div className="flex justify-between items-center text-xs">
        <span className="text-neutral-500">Influence Score</span>
        <span className="font-semibold text-foreground">{score.toLocaleString()}</span>
      </div>
      <div className="h-1 rounded-full bg-neutral-100 overflow-hidden">
        <div className="h-full rounded-full bg-primary transition-all duration-500" style={{ width: `${pct}%` }} />
      </div>
      {next && (
        <div className="flex justify-between text-[10px] text-neutral-400">
          <span>{cfg.label}</span>
          <span>{next.label} · {next.minScore.toLocaleString()}</span>
        </div>
      )}
    </div>
  );
}
