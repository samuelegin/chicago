import { useState, useEffect } from 'react'
import { Icon } from '../components/Layout'
import { getLeaderboard, getMyLeaderboardStats } from '../services/api'

// ── Tier styling ──────────────────────────────────────────────
const tierRow = {
  gold:    'bg-primary-container/30 border-b-2 border-on-background/10 hover:bg-primary-container/50 transition-colors',
  silver:  'bg-secondary-container/30 border-b-2 border-on-background/10 hover:bg-secondary-container/50 transition-colors',
  bronze:  'bg-surface-container-high border-b-2 border-on-background/10 hover:bg-surface-container-highest transition-colors',
  default: 'bg-surface border-b border-on-background/8 hover:bg-surface-container transition-colors',
}

const tierMedal = { gold: '🥇', silver: '🥈', bronze: '🥉', default: null }

const rankBadge = {
  gold:    'text-primary-container font-black text-lg',
  silver:  'text-on-surface-variant font-black text-lg',
  bronze:  'text-amber-700 font-black text-lg',
  default: 'text-on-surface-variant font-bold text-sm',
}

// ── Tab config ────────────────────────────────────────────────
const TABS = [
  { key: 'creators',  label: 'Creators',  icon: 'draw',         desc: 'Ranked by total posts, likes & comments earned' },
  { key: 'stakers',   label: 'Stakers',   icon: 'toll',         desc: 'Ranked by CLT staked and lock duration bonus'   },
  { key: 'rising',    label: 'Rising',    icon: 'trending_up',  desc: 'Biggest rank climbers this week'               },
  { key: 'influence', label: 'Influence', icon: 'bolt',         desc: 'Weighted score: engagement + staking + quality' },
]

// ── User row ──────────────────────────────────────────────────
function UserCell({ entry }) {
  return (
    <div className="flex items-center gap-2 lg:gap-3">
      <div className="relative shrink-0">
        <img
          src={entry.avatar}
          alt={entry.name}
          className="w-8 h-8 lg:w-10 lg:h-10 border border-on-background/20 lg:neo-border object-cover"
        />
        {tierMedal[entry.tier] && (
          <span className="absolute -top-1.5 -right-1.5 text-[11px]">{tierMedal[entry.tier]}</span>
        )}
      </div>
      <div className="min-w-0">
        <p className="font-bold text-on-background text-xs lg:text-sm truncate">{entry.name}</p>
        <p className="text-[9px] lg:text-[10px] text-on-surface-variant font-mono">{entry.handle}</p>
      </div>
    </div>
  )
}

// ── Stat pill ─────────────────────────────────────────────────
function Pill({ label, value, highlight }) {
  return (
    <div className={`flex flex-col items-center px-2 lg:px-3 py-1 border ${highlight ? 'border-primary-container/60 bg-primary-container/10' : 'border-on-background/10 bg-surface-container'}`}>
      <span className={`font-black text-xs lg:text-sm ${highlight ? 'text-primary-container' : 'text-on-background'}`}>{value}</span>
      <span className="text-[8px] lg:text-[9px] uppercase tracking-widest text-on-surface-variant font-bold">{label}</span>
    </div>
  )
}

// ── CREATORS table ────────────────────────────────────────────
function CreatorsTable({ entries }) {
  return (
    <table className="w-full">
      <thead>
        <tr className="bg-on-background text-surface">
          <th className="p-2 lg:p-4 text-left text-[9px] lg:text-[11px] uppercase tracking-widest w-12">#</th>
          <th className="p-2 lg:p-4 text-left text-[9px] lg:text-[11px] uppercase tracking-widest">Creator</th>
          <th className="p-2 lg:p-4 text-right text-[9px] lg:text-[11px] uppercase tracking-widest hidden sm:table-cell">Posts</th>
          <th className="p-2 lg:p-4 text-right text-[9px] lg:text-[11px] uppercase tracking-widest hidden sm:table-cell">Likes</th>
          <th className="p-2 lg:p-4 text-right text-[9px] lg:text-[11px] uppercase tracking-widest">Comments</th>
        </tr>
      </thead>
      <tbody>
        {entries.map(e => (
          <tr key={e.id} className={tierRow[e.tier]}>
            <td className={`p-2 lg:p-4 ${rankBadge[e.tier]}`}>{String(e.rank).padStart(2,'0')}</td>
            <td className="p-2 lg:p-4"><UserCell entry={e} /></td>
            <td className="p-2 lg:p-4 text-right font-mono text-xs lg:text-sm hidden sm:table-cell">{e.posts.toLocaleString()}</td>
            <td className="p-2 lg:p-4 text-right font-mono text-xs lg:text-sm hidden sm:table-cell">{e.likes.toLocaleString()}</td>
            <td className="p-2 lg:p-4 text-right font-black text-xs lg:text-base text-primary-container">{e.comments.toLocaleString()}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

// ── STAKERS table ─────────────────────────────────────────────
function StakersTable({ entries }) {
  return (
    <table className="w-full">
      <thead>
        <tr className="bg-on-background text-surface">
          <th className="p-2 lg:p-4 text-left text-[9px] lg:text-[11px] uppercase tracking-widest w-12">#</th>
          <th className="p-2 lg:p-4 text-left text-[9px] lg:text-[11px] uppercase tracking-widest">Staker</th>
          <th className="p-2 lg:p-4 text-right text-[9px] lg:text-[11px] uppercase tracking-widest">CLT Staked</th>
          <th className="p-2 lg:p-4 text-right text-[9px] lg:text-[11px] uppercase tracking-widest hidden sm:table-cell">Lock</th>
          <th className="p-2 lg:p-4 text-right text-[9px] lg:text-[11px] uppercase tracking-widest">APR</th>
        </tr>
      </thead>
      <tbody>
        {entries.map(e => (
          <tr key={e.id} className={tierRow[e.tier]}>
            <td className={`p-2 lg:p-4 ${rankBadge[e.tier]}`}>{String(e.rank).padStart(2,'0')}</td>
            <td className="p-2 lg:p-4"><UserCell entry={e} /></td>
            <td className="p-2 lg:p-4 text-right font-black text-xs lg:text-base text-primary-container">
              {e.cltStaked.toLocaleString()} <span className="text-[9px] font-normal text-on-surface-variant">CLT</span>
            </td>
            <td className="p-2 lg:p-4 text-right font-mono text-xs hidden sm:table-cell">
              <span className="px-2 py-0.5 bg-surface-container border border-on-background/10 text-[10px] font-bold">{e.lockDays}D</span>
            </td>
            <td className="p-2 lg:p-4 text-right font-bold text-xs lg:text-sm text-green-600">{e.apr}%</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

// ── RISING table ──────────────────────────────────────────────
function RisingTable({ entries }) {
  return (
    <table className="w-full">
      <thead>
        <tr className="bg-on-background text-surface">
          <th className="p-2 lg:p-4 text-left text-[9px] lg:text-[11px] uppercase tracking-widest w-12">#</th>
          <th className="p-2 lg:p-4 text-left text-[9px] lg:text-[11px] uppercase tracking-widest">User</th>
          <th className="p-2 lg:p-4 text-right text-[9px] lg:text-[11px] uppercase tracking-widest">Rank Jump</th>
          <th className="p-2 lg:p-4 text-right text-[9px] lg:text-[11px] uppercase tracking-widest hidden sm:table-cell">Posts</th>
          <th className="p-2 lg:p-4 text-right text-[9px] lg:text-[11px] uppercase tracking-widest hidden sm:table-cell">Likes</th>
        </tr>
      </thead>
      <tbody>
        {entries.map(e => (
          <tr key={e.id} className={tierRow[e.tier]}>
            <td className={`p-2 lg:p-4 ${rankBadge[e.tier]}`}>{String(e.rank).padStart(2,'0')}</td>
            <td className="p-2 lg:p-4"><UserCell entry={e} /></td>
            <td className="p-2 lg:p-4 text-right">
              <span className="inline-flex items-center gap-1 font-black text-xs lg:text-base text-green-600">
                <Icon name="arrow_upward" className="text-[14px]" />+{e.rankChange}
              </span>
            </td>
            <td className="p-2 lg:p-4 text-right font-mono text-xs hidden sm:table-cell">{e.weeklyPosts}</td>
            <td className="p-2 lg:p-4 text-right font-mono text-xs hidden sm:table-cell">{e.weeklyLikes.toLocaleString()}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

// ── INFLUENCE table ───────────────────────────────────────────
function InfluenceTable({ entries }) {
  return (
    <table className="w-full">
      <thead>
        <tr className="bg-on-background text-surface">
          <th className="p-2 lg:p-4 text-left text-[9px] lg:text-[11px] uppercase tracking-widest w-12">#</th>
          <th className="p-2 lg:p-4 text-left text-[9px] lg:text-[11px] uppercase tracking-widest">User</th>
          <th className="p-2 lg:p-4 text-right text-[9px] lg:text-[11px] uppercase tracking-widest">Score</th>
          <th className="p-2 lg:p-4 text-right text-[9px] lg:text-[11px] uppercase tracking-widest hidden sm:table-cell">Eng. Rate</th>
          <th className="p-2 lg:p-4 text-right text-[9px] lg:text-[11px] uppercase tracking-widest hidden sm:table-cell">Quality</th>
        </tr>
      </thead>
      <tbody>
        {entries.map(e => (
          <tr key={e.id} className={tierRow[e.tier]}>
            <td className={`p-2 lg:p-4 ${rankBadge[e.tier]}`}>{String(e.rank).padStart(2,'0')}</td>
            <td className="p-2 lg:p-4"><UserCell entry={e} /></td>
            <td className="p-2 lg:p-4 text-right font-black text-xs lg:text-base text-primary-container">{e.score.toLocaleString()}</td>
            <td className="p-2 lg:p-4 text-right font-mono text-xs hidden sm:table-cell">{e.engRate}</td>
            <td className="p-2 lg:p-4 text-right hidden sm:table-cell">
              <div className="flex items-center justify-end gap-1.5">
                <div className="w-16 h-1.5 bg-surface-container-high overflow-hidden">
                  <div className="h-full bg-primary-container" style={{ width: `${e.quality}%` }} />
                </div>
                <span className="text-[10px] font-bold text-on-surface-variant">{e.quality}</span>
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

// ── My Stats Banner ───────────────────────────────────────────
function MyStatsBanner({ tab, myStats }) {
  if (!myStats) return null
  const s = myStats[tab]
  if (!s) return null

  const statsByTab = {
    creators:  [{ label: 'Posts', value: s.posts }, { label: 'Likes', value: s.likes?.toLocaleString() }, { label: 'Comments', value: s.comments }],
    stakers:   [{ label: 'CLT Staked', value: `${s.cltStaked?.toLocaleString()} CLT` }, { label: 'Lock', value: `${s.lockDays}D` }, { label: 'APR', value: `${s.apr}%` }],
    rising:    [{ label: 'Rank Jump', value: `+${s.rankChange}` }, { label: 'Posts', value: s.weeklyPosts }, { label: 'Likes', value: s.weeklyLikes }],
    influence: [{ label: 'Score', value: s.score?.toLocaleString() }, { label: 'Eng. Rate', value: s.engRate }, { label: 'Quality', value: s.quality }],
  }

  const mainValue = {
    creators:  s.likes?.toLocaleString(),
    stakers:   `${s.cltStaked?.toLocaleString()} CLT`,
    rising:    `+${s.rankChange}`,
    influence: s.score?.toLocaleString(),
  }

  return (
    <section className="bg-on-background text-surface border border-on-background/10 lg:neo-border lg:neo-shadow p-4 lg:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div>
        <p className="text-[10px] uppercase font-bold text-surface/50 mb-0.5">Your Rank</p>
        <p className="text-[40px] lg:text-[52px] font-extrabold leading-none">#{s.rank}</p>
        <p className="text-[11px] text-surface/50 mt-1">{s.percentile} of all users</p>
      </div>
      <div className="flex gap-2 flex-wrap">
        {statsByTab[tab].map((st, i) => (
          <Pill key={i} label={st.label} value={st.value} highlight={i === 0} />
        ))}
      </div>
      <div className="flex flex-col items-end">
        <span className="text-[10px] uppercase font-bold text-surface/50 mb-1">
          {tab === 'creators' ? 'Total Likes' : tab === 'stakers' ? 'Staked' : tab === 'rising' ? 'Rank Jump' : 'Influence Score'}
        </span>
        <span className="text-[24px] lg:text-[32px] font-extrabold text-primary-container">{mainValue[tab]}</span>
      </div>
    </section>
  )
}

// ── Main Page ─────────────────────────────────────────────────
export default function Leaderboard() {
  const [activeTab, setActiveTab] = useState('creators')
  const [data, setData] = useState([])
  const [myStats, setMyStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const currentTab = TABS.find(t => t.key === activeTab)

  useEffect(() => {
    setLoading(true)
    getLeaderboard(activeTab)
      .then(setData)
      .finally(() => setLoading(false))
  }, [activeTab])

  useEffect(() => {
    getMyLeaderboardStats().then(setMyStats).catch(() => {})
  }, [])

  return (
    <div className="flex-1 lg:ml-[300px] w-full max-w-4xl flex flex-col gap-4 lg:gap-6">

      {/* Header */}
      <section className="border border-on-background/10 lg:neo-border lg:neo-shadow p-4 lg:p-8 bg-surface-container">
        <h1 className="text-[1.6rem] lg:text-display-lg font-extrabold uppercase tracking-tight leading-none mb-1 lg:mb-2">
          Leaderboard
        </h1>
        <p className="text-sm text-on-surface-variant">{currentTab.desc}</p>
      </section>

      {/* Tab Bar */}
      <div className="flex border border-on-background/10 lg:neo-border overflow-hidden">
        {TABS.map((tab, i) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex-1 flex flex-col items-center gap-0.5 lg:gap-1 py-2.5 lg:py-4 px-1 lg:px-3 border-r border-on-background/10 last:border-r-0 transition-all
              ${activeTab === tab.key
                ? 'bg-primary-container text-on-primary-fixed'
                : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
              }`}
          >
            <Icon
              name={tab.icon}
              className={`text-[18px] lg:text-[22px] ${activeTab === tab.key ? 'text-on-primary-fixed' : ''}`}
            />
            <span className="text-[10px] lg:text-[12px] font-bold uppercase tracking-wider">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Top 3 Podium (gold/silver/bronze) */}
      {data.length >= 3 && (
      <div className="grid grid-cols-3 gap-2 lg:gap-4">
        {data.slice(0, 3).map((e, i) => {
          const order = [1, 0, 2] // silver | gold | bronze visual order
          const heights = ['h-20 lg:h-24', 'h-28 lg:h-32', 'h-16 lg:h-20']
          const podiumColors = [
            'bg-secondary-container/40 border-secondary-container',
            'bg-primary-container/40 border-primary-container',
            'bg-amber-100 border-amber-300',
          ]
          const entry = data[order[i]]
          return (
            <div key={entry.id} className={`flex flex-col items-center ${i === 1 ? '-mt-3 lg:-mt-5' : ''}`}>
              <img src={entry.avatar} alt={entry.name} className="w-10 h-10 lg:w-14 lg:h-14 border-2 border-on-background/20 object-cover mb-1" />
              <span className="text-[10px] font-bold text-on-background text-center truncate w-full text-center">{entry.name}</span>
              <div className={`w-full mt-2 flex items-center justify-center border-2 ${podiumColors[i]} ${heights[i]}`}>
                <span className="text-xl lg:text-2xl">{tierMedal[entry.tier] || `#${entry.rank}`}</span>
              </div>
            </div>
          )
        })}
      </div>
      )}

      {/* Full Table */}
      <section className="border border-on-background/10 lg:neo-border lg:neo-shadow overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-12 text-on-surface-variant">Loading…</div>
        ) : (
          <>
            {activeTab === 'creators'  && <CreatorsTable  entries={data}  />}
            {activeTab === 'stakers'   && <StakersTable   entries={data}   />}
            {activeTab === 'rising'    && <RisingTable    entries={data}    />}
            {activeTab === 'influence' && <InfluenceTable entries={data} />}
          </>
        )}
      </section>

      {/* My Stats */}
      <MyStatsBanner tab={activeTab} myStats={myStats} />

      <div className="h-20 md:h-0" />
    </div>
  )
}
