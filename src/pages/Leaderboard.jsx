import { useState } from 'react'
import { leaderboardEntries, leaderboardMyStats } from '../data/mockData'

const tierStyles = {
  gold: 'bg-primary-container border-b border-on-background/20 lg:border-b-4 lg:border-on-background hover:bg-primary-fixed transition-colors',
  silver: 'bg-secondary-container border-b border-on-background/20 lg:border-b-4 lg:border-on-background hover:bg-surface-container-high transition-colors',
  bronze: 'bg-surface-container border-b border-on-background/20 lg:border-b-4 lg:border-on-background hover:bg-surface-container-high transition-colors',
  default: 'bg-surface border-b border-on-background/20 lg:border-b-4 lg:border-on-background hover:bg-surface-container-high transition-colors',
}

const rankStyles = {
  gold: 'font-headline-md text-headline-md',
  silver: 'font-headline-md text-headline-md',
  bronze: 'font-headline-md text-headline-md text-primary',
  default: 'font-headline-md text-headline-md',
}

export default function Leaderboard() {
  const [entries] = useState(leaderboardEntries)
  const myStats = leaderboardMyStats

  return (
    <div className="flex-1 lg:ml-[300px] w-full max-w-4xl flex flex-col gap-4 lg:gap-8">
      {/* Header */}
      <section className="border border-on-background/10 lg:neo-border lg:neo-shadow p-4 lg:p-8 bg-surface-container">
        <h1 className="text-[1.6rem] lg:text-display-lg font-extrabold uppercase tracking-tight leading-none mb-1 lg:mb-2">
          Leaderboard
        </h1>
        <p className="text-sm lg:text-body-lg text-on-surface-variant max-w-2xl">
          The architecture of influence. Rank by contribution, staking, and engagement within the Chicago ecosystem.
        </p>
      </section>

      {/* Table */}
      <section className="border border-on-background/10 lg:neo-border lg:neo-shadow overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-on-background text-surface">
              <th className="p-2 lg:p-4 text-left text-[10px] lg:text-[12px] uppercase tracking-widest">Rank</th>
              <th className="p-2 lg:p-4 text-left text-[10px] lg:text-[12px] uppercase tracking-widest">User</th>
              <th className="p-2 lg:p-4 text-right text-[10px] lg:text-[12px] uppercase tracking-widest">Influence</th>
            </tr>
          </thead>
          <tbody>
            {entries.map((entry) => (
              <tr key={entry.id} className={tierStyles[entry.tier]}>
                <td className={`p-2 lg:p-4 text-sm lg:text-base ${rankStyles[entry.tier]}`}>
                  {String(entry.rank).padStart(2, '0')}
                </td>
                <td className="p-2 lg:p-4">
                  <div className="flex items-center gap-2 lg:gap-3">
                    <div className="w-8 h-8 lg:w-10 lg:h-10 border border-on-background/20 lg:neo-border overflow-hidden">
                      <img src={entry.avatar} alt={entry.name} className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <p className="font-bold text-on-background text-xs lg:text-sm">{entry.name}</p>
                      <p className="text-[9px] lg:text-[10px] text-on-surface-variant font-mono">{entry.handle}</p>
                    </div>
                  </div>
                </td>
                <td className="p-2 lg:p-4 font-bold text-sm lg:text-[18px] text-right">
                  {entry.influence.toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* My Stats Banner */}
      <section className="bg-on-background text-surface border border-on-background/10 lg:neo-border lg:neo-shadow p-4 lg:p-6 flex flex-col md:flex-row md:items-center justify-between gap-3 lg:gap-4">
        <div>
          <p className="text-[10px] lg:text-[12px] uppercase font-bold text-surface/60 mb-1">Your Rank</p>
          <p className="text-[36px] lg:text-[48px] font-extrabold leading-none">#{myStats.rank}</p>
        </div>
        <div className="flex flex-col gap-1 lg:gap-2 max-w-md">
          <p className="text-sm lg:text-body-md text-surface/80">
            You are in the {myStats.percentile} of all users. Stake {myStats.stakeToNextTier} more CLT to reach the next tier.
          </p>
          <p className="text-sm lg:text-body-md text-surface/70">
            Minting exclusively for top 500 ranked users.
          </p>
        </div>
        <div className="flex flex-col items-center">
          <span className="text-[10px] lg:text-[12px] uppercase font-bold text-surface/60">Influence Score</span>
          <span className="text-[24px] lg:text-[32px] font-extrabold text-primary-container">{myStats.influence.toLocaleString()}</span>
        </div>
      </section>

      <div className="h-20 md:h-0" />
    </div>
  )
}
