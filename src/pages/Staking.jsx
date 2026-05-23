import { useState, useEffect } from 'react'
import { Icon } from '../components/Layout'
import { useAuth } from '../context/AuthContext'
import { getMyLeaderboardStats } from '../services/api'

const TEAM_FINANCE_URL = 'https://www.team.finance/whitelabel'

const BOOST_TIERS = [
  { threshold: '< 100 CLT',   label: 'No Boost',   multiplier: 0,  icon: 'do_not_disturb_on' },
  { threshold: '100+ CLT',    label: '+10% Boost',  multiplier: 10, icon: 'bolt' },
  { threshold: '500+ CLT',    label: '+25% Boost',  multiplier: 25, icon: 'bolt' },
  { threshold: '1,000+ CLT',  label: '+50% Boost',  multiplier: 50, icon: 'local_fire_department' },
]

const SCORE_WEIGHTS = [
  { label: 'Social Reputation', value: 70, icon: 'groups', desc: 'Likes, posts & comments earned' },
  { label: 'Staking Power',     value: 20, icon: 'toll',   desc: 'CLT staked on Team Finance' },
  { label: 'Consistency',       value: 10, icon: 'repeat',  desc: 'Daily activity streak' },
]

export default function Staking() {
  const { user: authUser } = useAuth()
  const [myStats, setMyStats] = useState(null)

  useEffect(() => {
    getMyLeaderboardStats().then(setMyStats).catch(() => {})
  }, [])

  const stakerStats = myStats?.stakers

  return (
    <div className="flex-1 lg:ml-[300px] w-full max-w-4xl flex flex-col gap-4 lg:gap-6">

      {/* Header */}
      <section className="border border-on-background/10 lg:neo-border lg:neo-shadow bg-surface-container p-4 lg:p-8">
        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-primary-container mb-1">CLT Staking</p>
        <h1 className="text-[1.6rem] lg:text-display-lg font-extrabold uppercase tracking-tight leading-none mb-2">
          Stake. Earn. Rank Up.
        </h1>
        <p className="text-sm text-on-surface-variant max-w-xl">
          Stake your CLT tokens on Team Finance to earn rewards and boost your influence score on Chicago.
          Your staking activity is tracked here automatically.
        </p>
      </section>

      {/* CTA Banner */}
      <a
        href={TEAM_FINANCE_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="group block bg-on-background text-surface border-4 border-on-background p-5 lg:p-7 hover:bg-primary-container hover:text-on-primary-fixed transition-colors"
        style={{ boxShadow: '4px 4px 0px 0px var(--neo-shadow-color)' }}
      >
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest opacity-60 mb-1">Stake on</p>
            <p className="font-extrabold text-xl lg:text-2xl uppercase tracking-tight">Team Finance</p>
            <p className="text-[12px] mt-1 opacity-70">team.finance/whitelabel</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="hidden sm:block text-[12px] font-bold uppercase tracking-wider opacity-70 group-hover:opacity-100">
              Stake Now
            </span>
            <div className="w-10 h-10 border-2 border-current flex items-center justify-center group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform">
              <Icon name="open_in_new" className="text-[20px]" />
            </div>
          </div>
        </div>
      </a>

      {/* My Staking Stats */}
      {stakerStats && (
        <section
          className="bg-surface border-4 border-on-background p-5 lg:p-6"
          style={{ boxShadow: '4px 4px 0px 0px rgba(212,175,55,1)' }}
        >
          <h2 className="font-bold text-[11px] uppercase tracking-[0.14em] mb-5 pb-3 border-b-[3px] border-on-background text-on-surface">
            Your Staking Stats
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: 'Rank',       value: `#${stakerStats.rank}`,                          icon: 'leaderboard' },
              { label: 'Percentile', value: stakerStats.percentile,                           icon: 'percent' },
              { label: 'CLT Staked', value: `${stakerStats.cltStaked?.toLocaleString()} CLT`, icon: 'toll' },
              { label: 'APR',        value: `${stakerStats.apr}%`,                            icon: 'trending_up' },
            ].map((stat) => (
              <div key={stat.label} className="border-2 border-on-background/20 p-3 bg-surface-container flex flex-col gap-1">
                <Icon name={stat.icon} className="text-[16px] text-primary-container" />
                <p className="font-extrabold text-lg lg:text-2xl leading-none text-on-surface">{stat.value}</p>
                <p className="text-[10px] uppercase font-bold tracking-widest text-on-surface-variant">{stat.label}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* How points are calculated */}
      <section
        className="bg-surface border-4 border-on-background p-5 lg:p-6"
        style={{ boxShadow: '4px 4px 0px 0px var(--neo-shadow-color)' }}
      >
        <h2 className="font-bold text-[11px] uppercase tracking-[0.14em] mb-5 pb-3 border-b-[3px] border-on-background text-on-surface">
          How Your Score Is Calculated
        </h2>
        <div className="flex flex-col gap-3">
          {SCORE_WEIGHTS.map((w) => (
            <div key={w.label} className="flex items-center gap-4">
              <div className="w-12 h-12 flex-shrink-0 bg-on-background text-surface flex items-center justify-center border-2 border-on-background">
                <Icon name={w.icon} className="text-[20px]" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-[13px] uppercase tracking-wide text-on-surface">{w.label}</span>
                  <span className="font-extrabold text-primary-container text-base">{w.value}%</span>
                </div>
                <div className="h-2 bg-surface-container border border-on-background/20 overflow-hidden">
                  <div
                    className="h-full bg-primary-container transition-all"
                    style={{ width: `${w.value}%` }}
                  />
                </div>
                <p className="text-[11px] text-on-surface-variant mt-1">{w.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Boost Tiers */}
      <section
        className="bg-surface border-4 border-on-background p-5 lg:p-6"
        style={{ boxShadow: '4px 4px 0px 0px var(--neo-shadow-color)' }}
      >
        <h2 className="font-bold text-[11px] uppercase tracking-[0.14em] mb-5 pb-3 border-b-[3px] border-on-background text-on-surface flex items-center gap-2">
          <Icon name="bolt" className="text-primary-container" />
          Staking Boost Tiers
        </h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {BOOST_TIERS.map((tier, i) => (
            <div
              key={i}
              className={`border-2 p-4 flex flex-col gap-2 ${
                tier.multiplier >= 50
                  ? 'border-primary-container bg-primary-container/10'
                  : 'border-on-background/20 bg-surface-container'
              }`}
            >
              <Icon
                name={tier.icon}
                className={`text-[22px] ${tier.multiplier >= 50 ? 'text-primary-container' : 'text-on-surface-variant'}`}
              />
              <p className="font-extrabold text-base text-on-surface leading-none">{tier.label}</p>
              <p className="text-[11px] font-bold uppercase tracking-widest text-on-surface-variant">{tier.threshold}</p>
            </div>
          ))}
        </div>
        <p className="mt-4 text-[12px] text-on-surface-variant border-l-4 border-primary-container pl-3">
          Staking more CLT unlocks higher score multipliers and climbs the leaderboard faster.
        </p>
      </section>

      <div className="h-20 md:h-0" />
    </div>
  )
}
