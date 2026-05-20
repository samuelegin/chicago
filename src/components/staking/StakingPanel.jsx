import React, { useState } from 'react';
import { StakeRecordService, UserProfileService } from '@/api/services';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Loader2, CheckCircle } from 'lucide-react';
import useWallet from '@/hooks/useWallet';
import {
  STAKING_TIERS, DURATION_BONUSES, STAKING_MIN_DAYS_FOR_BOOST,
  getStakingTier, getDurationBonus, calcCombinedMultiplier, calcCISBoostPoints, truncateWallet
} from '@/lib/constants';
import { addDays, isPast } from 'date-fns';

const LOCK_OPTIONS = [
  { days: 7,   label: '7 days'   },
  { days: 30,  label: '30 days'  },
  { days: 90,  label: '90 days'  },
  { days: 180, label: '180 days' },
];

function ActiveStake({ stake, onUnstake }) {
  const boostAt     = new Date(stake.boost_unlocks_at);
  const boostActive = stake.boost_active && isPast(boostAt);
  const daysLeft    = Math.max(0, Math.ceil((boostAt - Date.now()) / 86400000));

  return (
    <div className="border border-border rounded-sm px-4 py-3 space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold">Active Stake</p>
        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
          boostActive
            ? 'text-green-600 bg-green-500/10 border-green-500/30'
            : 'text-amber-600 bg-amber-500/10 border-amber-500/30'
        }`}>
          {boostActive ? 'Boosting' : `Unlocks in ${daysLeft}d`}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
        <div>
          <p className="text-[11px] text-muted-foreground">Amount</p>
          <p className="font-semibold">{stake.amount_clt.toLocaleString()} CLT</p>
        </div>
        <div>
          <p className="text-[11px] text-muted-foreground">Lock Duration</p>
          <p className="font-semibold">{stake.lock_days} days</p>
        </div>
        <div>
          <p className="text-[11px] text-muted-foreground">Multiplier</p>
          <p className="font-semibold text-primary">{stake.combined_multiplier}x</p>
        </div>
        <div>
          <p className="text-[11px] text-muted-foreground">CIS Boost</p>
          <p className="font-semibold text-primary">+{stake.cis_boost_points} pts</p>
        </div>
      </div>

      <button
        onClick={() => onUnstake(stake)}
        className="text-xs text-red-500 hover:text-red-700 font-medium transition-colors"
      >
        Unstake (removes multiplier)
      </button>
    </div>
  );
}

export default function StakingPanel({ profile, onStakeUpdate }) {
  const { address, cltBalance, connecting, error: walletError, connect, disconnect } = useWallet();
  const [amount,   setAmount]   = useState('');
  const [lockDays, setLockDays] = useState(30);
  const [done,     setDone]     = useState(false);

  const amountNum  = parseFloat(amount) || 0;
  const tier       = getStakingTier(amountNum);
  const durBonus   = getDurationBonus(lockDays);
  const combined   = calcCombinedMultiplier(amountNum, lockDays);
  const cisBoost   = calcCISBoostPoints(amountNum, lockDays);

  React.useEffect(() => { if (address && done) setDone(false); }, [address]);

  const { data: stakes = [], refetch } = useQuery({
    queryKey: ['stakes', profile?.user_id],
    queryFn:  () => StakeRecordService.getActiveByUser(profile.user_id),
    enabled:  !!profile?.user_id,
  });

  const activeStake = stakes[0] ?? null;

  const stakeMutation = useMutation({
    mutationFn: async () => {
      const s = await StakeRecordService.create({
        user_id:             profile.user_id,
        amount_clt:          amountNum,
        lock_days:           lockDays,
        status:              'active',
        boost_active:        false,
        amount_multiplier:   tier.multiplier,
        duration_multiplier: 1 + durBonus.bonus,
        combined_multiplier: combined,
        cis_boost_points:    cisBoost,
        on_chain_verified:   false,
        boost_unlocks_at:    addDays(new Date(), STAKING_MIN_DAYS_FOR_BOOST).toISOString(),
      });
      await UserProfileService.update(profile.id, { clt_staked: amountNum, staking_multiplier: combined });
      return s;
    },
    onSuccess: () => {
      toast.success('Stake registered — boost activates in 7 days');
      refetch(); onStakeUpdate?.(); setDone(true);
    },
  });

  const unstakeMutation = useMutation({
    mutationFn: async (stake) => {
      await StakeRecordService.update(stake.id, { status: 'unstaked', boost_active: false });
      await UserProfileService.update(profile.id, { clt_staked: 0, staking_multiplier: 1.0 });
    },
    onSuccess: () => {
      toast.warning('Unstaked — multiplier removed');
      refetch(); onStakeUpdate?.(); setDone(false);
    },
  });

  return (
    <div className="bg-card border border-border rounded-sm px-4 py-4 space-y-4">
      <p className="text-sm font-semibold">Your Stake</p>

      {/* Active stake */}
      {activeStake && (
        <ActiveStake stake={activeStake} onUnstake={s => unstakeMutation.mutate(s)} />
      )}

      {/* Connect wallet */}
      {!address && (
        <div className="space-y-3">
          {walletError && (
            <p className="text-xs text-red-500">{walletError}</p>
          )}
          <button
            onClick={connect}
            disabled={connecting}
            className="w-full py-2.5 rounded border border-border text-sm font-semibold hover:bg-muted transition-colors flex items-center justify-center gap-2"
          >
            {connecting ? <><Loader2 className="w-4 h-4 animate-spin" /> Connecting…</> : 'Connect Wallet'}
          </button>
          <p className="text-[11px] text-muted-foreground text-center">Supports MetaMask and EIP-1193 wallets</p>
        </div>
      )}

      {/* Stake form */}
      {address && !done && (
        <div className="space-y-4">
          {/* Wallet info */}
          <div className="flex items-center justify-between text-xs border border-border rounded px-3 py-2">
            <span className="font-mono text-muted-foreground">{truncateWallet(address)}</span>
            <div className="flex items-center gap-3">
              {cltBalance !== null && <span className="font-semibold">{Math.floor(cltBalance).toLocaleString()} CLT</span>}
              <button onClick={() => { disconnect(); }} className="text-muted-foreground hover:text-red-500 transition-colors">Disconnect</button>
            </div>
          </div>

          {/* Amount */}
          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">Amount (CLT)</label>
            <div className="flex gap-2">
              <input
                type="number"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                placeholder="0"
                min="1"
                className="flex-1 text-sm border border-border rounded px-3 py-2 focus:outline-none focus:border-primary font-mono"
              />
              {cltBalance !== null && (
                <button
                  onClick={() => setAmount(String(Math.floor(cltBalance)))}
                  className="text-xs font-semibold border border-border rounded px-3 py-2 hover:bg-muted transition-colors"
                >
                  Max
                </button>
              )}
            </div>
            {/* Tier info */}
            {amountNum > 0 && (
              <p className="text-[11px] text-primary mt-1 font-medium">
                Tier: {tier.label} ({tier.multiplier}x amount boost)
              </p>
            )}
          </div>

          {/* Lock duration */}
          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">Lock Duration</label>
            <div className="grid grid-cols-4 gap-1.5">
              {LOCK_OPTIONS.map(opt => (
                <button
                  key={opt.days}
                  onClick={() => setLockDays(opt.days)}
                  className={`py-2 rounded text-xs font-semibold border transition-colors ${
                    lockDays === opt.days
                      ? 'bg-foreground text-white border-foreground'
                      : 'border-border text-muted-foreground hover:border-foreground'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Preview */}
          {amountNum > 0 && (
            <div className="border border-border rounded px-3 py-3 space-y-2 bg-muted/50">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Preview</p>
              <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-sm">
                <div>
                  <p className="text-[11px] text-muted-foreground">Amount bonus</p>
                  <p className="font-semibold">{tier.label}</p>
                </div>
                <div>
                  <p className="text-[11px] text-muted-foreground">Duration bonus</p>
                  <p className="font-semibold">{durBonus.label}</p>
                </div>
                <div>
                  <p className="text-[11px] text-muted-foreground">Combined multiplier</p>
                  <p className="font-semibold text-primary">{combined}x</p>
                </div>
                <div>
                  <p className="text-[11px] text-muted-foreground">CIS boost</p>
                  <p className="font-semibold text-primary">+{cisBoost} pts</p>
                </div>
              </div>
              <p className="text-[11px] text-muted-foreground">Boost activates after 7-day minimum. Early unstake removes multiplier.</p>
            </div>
          )}

          <button
            onClick={() => stakeMutation.mutate()}
            disabled={!amountNum || amountNum <= 0 || stakeMutation.isPending}
            className="w-full py-2.5 rounded text-sm font-semibold bg-primary text-white hover:bg-primary/90 transition-colors disabled:opacity-40 flex items-center justify-center gap-2"
          >
            {stakeMutation.isPending
              ? <><Loader2 className="w-4 h-4 animate-spin" /> Staking…</>
              : `Stake ${amountNum > 0 ? `${amountNum.toLocaleString()} CLT` : ''}`
            }
          </button>
        </div>
      )}

      {done && (
        <div className="flex items-center gap-2 justify-center text-sm text-green-600 py-2">
          <CheckCircle className="w-4 h-4" />
          Stake registered successfully
        </div>
      )}
    </div>
  );
}
