import { useState } from 'react'
import { Icon } from '../components/Layout'
import { stakingInfo, currentUser } from '../data/mockData'

export default function Staking() {
  const [info] = useState(stakingInfo)
  const [stakeAmount, setStakeAmount] = useState('')
  const [selectedDuration, setSelectedDuration] = useState(info.durationBonuses[0])
  const walletConnected = currentUser.walletConnected

  const handleStake = () => {
    if (!walletConnected) return
    console.log('stake', stakeAmount, selectedDuration.days)
  }

  return (
    <div className="flex-1 lg:ml-[300px] w-full max-w-5xl flex flex-col gap-4 lg:gap-8">
      {/* Header */}
      <section className="border border-on-background/10 lg:neo-border lg:neo-shadow bg-surface-container p-4 lg:p-8">
        <h1 className="text-[1.6rem] lg:text-display-lg font-extrabold uppercase leading-none mb-1 lg:mb-2">
          CLT Staking
        </h1>
        <p className="text-sm lg:text-headline-md text-on-surface-variant max-w-2xl">
          Lock your CLT tokens to earn rewards and boost your influence score.
        </p>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-7 gap-4 lg:gap-8">
        {/* Left: Stake Panel */}
        <div className="lg:col-span-3 flex flex-col gap-4 lg:gap-6">
          <section className="bg-surface-container border border-on-background/10 lg:neo-border lg:neo-shadow p-4 lg:p-6">
            <h3 className="font-headline-md text-sm lg:text-headline-md uppercase mb-3 lg:mb-4">Your Stake</h3>
            {!walletConnected ? (
              <>
                <p className="text-sm lg:text-body-lg text-on-surface-variant mb-4 lg:mb-6">
                  Your wallet is not currently connected. To view your rewards and stake CLT, please connect a compatible wallet.
                </p>
                <button className="w-full bg-primary text-on-primary font-bold border border-on-background/20 lg:border-4 lg:border-on-background px-6 lg:px-10 py-3 lg:py-4 text-sm lg:text-headline-md lg:neo-shadow active:translate-y-1 active:shadow-none transition-all uppercase">
                  Connect Wallet
                </button>
                <div className="flex items-center gap-2 text-[11px] lg:text-[12px] text-on-surface-variant mt-3 lg:mt-4">
                  <Icon name="info" />
                  <span>Supports MetaMask, WalletConnect, Coinbase Wallet</span>
                </div>
              </>
            ) : (
              <>
                <div className="flex justify-between mb-2">
                  <span className="text-[11px] lg:text-[12px] uppercase text-on-surface-variant">Staked</span>
                  <span className="font-bold text-sm lg:text-base">{currentUser.cltStaked.toLocaleString()} CLT</span>
                </div>
                <div className="flex justify-between mb-4 lg:mb-6">
                  <span className="text-[11px] lg:text-[12px] uppercase text-on-surface-variant">APR</span>
                  <span className="font-bold text-primary-container text-sm lg:text-base">{info.apr}%</span>
                </div>
                <input
                  type="number"
                  value={stakeAmount}
                  onChange={(e) => setStakeAmount(e.target.value)}
                  placeholder="Amount to stake"
                  className="w-full border border-on-background/15 lg:neo-border bg-background p-2 lg:p-3 text-sm lg:text-body-md mb-3 lg:mb-4 focus:outline-none"
                />
                <div className="flex flex-col gap-2 mb-4 lg:mb-6">
                  {info.durationBonuses.map((dur) => (
                    <button
                      key={dur.days}
                      onClick={() => setSelectedDuration(dur)}
                      className={`flex justify-between items-center p-2 lg:p-3 border border-on-background/15 lg:neo-border font-bold transition-colors text-sm ${
                        selectedDuration.days === dur.days
                          ? 'bg-primary-container text-on-primary-fixed'
                          : 'bg-surface-container hover:bg-primary-container/20'
                      }`}
                    >
                      <span>{dur.label} — {dur.description}</span>
                      <span>{dur.bonus > 0 ? `+${dur.bonus}%` : 'Base'}</span>
                    </button>
                  ))}
                </div>
                <button
                  onClick={handleStake}
                  className="w-full bg-primary text-on-primary font-bold border border-on-background/20 lg:border-4 lg:border-on-background py-3 lg:py-4 text-sm lg:text-headline-md lg:neo-shadow active:translate-y-1 active:shadow-none transition-all uppercase"
                >
                  Stake CLT
                </button>
              </>
            )}
          </section>
        </div>

        {/* Right: Info Panels */}
        <div className="lg:col-span-4 flex flex-col gap-4 lg:gap-6">
          {/* Score Weights */}
          <section className="bg-on-background text-surface border border-on-background/10 lg:neo-border lg:neo-shadow p-4 lg:p-6">
            <h3 className="font-headline-md text-sm lg:text-headline-md uppercase mb-4 lg:mb-6 border-b-2 border-primary-container pb-2">
              Score Weights
            </h3>
            <div className="flex flex-col gap-3 lg:gap-4">
              {[
                { label: 'Social Reputation', value: info.scoreWeights.socialReputation },
                { label: 'Staking Power', value: info.scoreWeights.stakingPower },
                { label: 'Consistency', value: info.scoreWeights.consistency },
              ].map((w) => (
                <div key={w.label} className="flex justify-between items-center">
                  <span className="text-[11px] lg:text-[12px] uppercase font-bold">{w.label}</span>
                  <span className="font-headline-md text-primary-container font-extrabold text-sm lg:text-base">{w.value}%</span>
                </div>
              ))}
            </div>
            <p className="mt-4 lg:mt-6 italic text-[11px] lg:text-[12px] border-l-4 border-primary-container pl-3 lg:pl-4 text-surface/70">
              Stake more to increase your staking power weight and climb the leaderboard faster.
            </p>
          </section>

          {/* Amount Boosts */}
          <section className="bg-surface-container border border-on-background/10 lg:neo-border lg:neo-shadow p-4 lg:p-6">
            <h3 className="font-headline-md text-sm lg:text-headline-md uppercase mb-4 lg:mb-6 flex items-center gap-2">
              <Icon name="bolt" filled />
              Amount Boosts
            </h3>
            <div className="grid grid-cols-2 gap-2 lg:gap-3">
              {info.amountBoosts.map((boost, i) => (
                <div
                  key={i}
                  className={`border border-on-background/15 lg:neo-border p-3 lg:p-4 ${
                    boost.multiplier >= 50
                      ? 'bg-primary-container text-on-primary-fixed lg:neo-shadow-sm'
                      : 'bg-background'
                  }`}
                >
                  <p className="text-[10px] lg:text-[12px] uppercase font-bold text-on-surface-variant">{boost.threshold}</p>
                  <p className="font-headline-md text-sm lg:text-headline-md mt-1">{boost.label}</p>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>

      <div className="h-20 md:h-0" />
    </div>
  )
}
