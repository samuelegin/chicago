import React, { useState, useEffect } from 'react';
import { UserProfileService } from '@/api/services';
import { useAuth } from '@/lib/AuthContext';
import { Loader2 } from 'lucide-react';
import StakingPanel from '@/components/staking/StakingPanel';
import { STAKING_TIERS, DURATION_BONUSES, CIS_WEIGHTS } from '@/lib/constants';

function InfoRow({ label, value, highlight }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-border last:border-0">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className={`text-sm font-semibold ${highlight ? 'text-primary' : 'text-foreground'}`}>{value}</span>
    </div>
  );
}

export default function Staking() {
  const [profile, setProfile] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;
    (async () => {
      const profiles = await UserProfileService.getByUserId(user.id);
      if (profiles.length > 0) {
        setProfile(profiles[0]);
      } else {
        const p = await UserProfileService.create({
          user_id:  user.id,
          username: user.full_name || user.email?.split('@')[0] || 'User',
        });
        setProfile(p);
      }
    })();
  }, [user]);

  return (
    <div className="max-w-[600px] mx-auto px-4 py-6 space-y-3">

      {/* Header */}
      <div className="bg-card border border-border rounded-sm px-5 py-4">
        <h1 className="text-base font-semibold">CLT Staking</h1>
        <p className="text-xs text-muted-foreground mt-0.5">
          Lock CLT tokens to boost your Influence Score and unlock rank tiers
        </p>
      </div>

      {/* Staking panel */}
      {profile ? (
        <StakingPanel profile={profile} onStakeUpdate={() => setProfile(p => ({ ...p }))} />
      ) : (
        <div className="bg-card border border-border rounded-sm flex justify-center py-12">
          <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
        </div>
      )}

      {/* Info cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">

        {/* Amount boosts */}
        <div className="bg-card border border-border rounded-sm px-4 py-3">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Amount Boosts</p>
          {STAKING_TIERS.map(t => (
            <InfoRow
              key={t.min}
              label={t.min === 0 ? '< 100 CLT' : `${t.min.toLocaleString()}+ CLT`}
              value={t.label}
              highlight={t.multiplier > 1}
            />
          ))}
        </div>

        {/* Duration bonuses */}
        <div className="bg-card border border-border rounded-sm px-4 py-3">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Duration Bonuses</p>
          {DURATION_BONUSES.filter(d => d.days > 0).map(d => (
            <InfoRow
              key={d.days}
              label={`${d.days} day lock`}
              value={d.label}
              highlight={d.bonus > 0}
            />
          ))}
        </div>

        {/* CIS weights */}
        <div className="bg-card border border-border rounded-sm px-4 py-3">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Score Weights</p>
          <InfoRow label="Social reputation"   value={`${CIS_WEIGHTS.social * 100}%`} />
          <InfoRow label="Staking power"       value={`${CIS_WEIGHTS.staking * 100}%`} highlight />
          <InfoRow label="Consistency"         value={`${CIS_WEIGHTS.consistency * 100}%`} />
          <p className="text-[11px] text-muted-foreground mt-2">Content quality always outweighs token holdings</p>
        </div>

        {/* Rules */}
        <div className="bg-card border border-border rounded-sm px-4 py-3">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Rules</p>
          {[
            'Boost activates after 7-day minimum',
            'Early unstake removes multiplier',
            'Stake → unstake cycling is penalized',
            'Full bonus only on completed locks',
          ].map((r, i) => (
            <div key={i} className="py-2 border-b border-border last:border-0 text-sm text-muted-foreground">{r}</div>
          ))}
        </div>
      </div>
    </div>
  );
}
