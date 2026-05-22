import { useState } from 'react'
import { marketplaceCampaigns, marketplacePricing, networkStats } from '../data/mockData'

export default function Marketplace() {
  const [campaigns] = useState(marketplaceCampaigns)
  const [pricing, setPricing] = useState(marketplacePricing)
  const stats = networkStats

  const handleSelectDuration = (label) => {
    const dur = pricing.durations.find((d) => d.label === label)
    setPricing((prev) => ({ ...prev, selectedDuration: label, totalCostEth: dur.priceEth }))
  }

  return (
    <div className="flex-1 lg:ml-[300px] w-full max-w-5xl flex flex-col gap-4 lg:gap-8">
      {/* Header */}
      <section className="border border-on-background/10 lg:neo-border lg:neo-shadow bg-surface-container p-4 lg:p-8">
        <h2 className="text-[1.6rem] lg:text-display-lg font-extrabold uppercase leading-none mb-1 lg:mb-2">
          Marketplace
        </h2>
        <p className="text-sm lg:text-headline-md text-on-surface-variant max-w-2xl">
          Promote your project to the Chicago community. Reach thousands of active Web3 users.
        </p>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 lg:gap-8">
        {/* New Campaign Form */}
        <div className="lg:col-span-2 flex flex-col gap-4 lg:gap-6">
          <section className="bg-surface-container border border-on-background/10 lg:neo-border lg:neo-shadow p-4 lg:p-6">
            <h3 className="font-headline-md text-sm lg:text-headline-md uppercase mb-4 lg:mb-6">New Campaign</h3>
            <div className="flex flex-col gap-3 lg:gap-4">
              <input
                type="text"
                placeholder="Campaign title"
                className="border border-on-background/15 lg:neo-border bg-background p-2 lg:p-3 text-sm lg:text-body-md focus:outline-none"
              />
              <textarea
                placeholder="Description"
                rows={3}
                className="border border-on-background/15 lg:neo-border bg-background p-2 lg:p-3 text-sm lg:text-body-md focus:outline-none resize-none"
              />
              {/* Duration Selector */}
              <div>
                <p className="text-[10px] lg:text-[12px] uppercase font-bold text-on-surface-variant mb-2">Duration</p>
                <div className="flex border border-on-background/15 lg:neo-border overflow-hidden">
                  {pricing.durations.map((dur) => (
                    <button
                      key={dur.label}
                      onClick={() => handleSelectDuration(dur.label)}
                      className={`flex-1 py-2 lg:py-3 text-xs lg:text-sm font-bold transition-colors border-r border-on-background/15 lg:border-r-4 lg:border-on-background last:border-r-0 ${
                        pricing.selectedDuration === dur.label
                          ? 'bg-primary text-on-primary'
                          : 'bg-surface-container-high hover:bg-primary-container/20'
                      }`}
                    >
                      {dur.label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex justify-between items-end border border-on-background/15 lg:neo-border bg-background p-3 lg:p-4">
                <p className="text-[10px] lg:text-[12px] uppercase text-on-surface-variant font-bold">Final Pricing</p>
                <h4 className="font-headline-md text-sm lg:text-headline-md">
                  Total: {pricing.totalCostEth} ETH
                </h4>
              </div>
              <button className="w-full bg-primary-container text-on-primary-fixed font-bold border border-on-background/20 lg:neo-border lg:neo-shadow py-3 lg:py-4 uppercase text-sm lg:text-headline-md active:translate-y-1 active:shadow-none transition-all">
                Launch Campaign
              </button>
            </div>
          </section>
        </div>

        {/* Active Campaigns + Network Insights */}
        <div className="lg:col-span-3 flex flex-col gap-4 lg:gap-6">
          {/* Management */}
          <section className="bg-surface-container border border-on-background/10 lg:neo-border lg:neo-shadow p-4 lg:p-6">
            <h3 className="font-headline-md text-sm lg:text-headline-md uppercase mb-4 lg:mb-6">Management</h3>
            <div className="flex flex-col gap-3 lg:gap-4">
              {campaigns.map((camp) => (
                <article key={camp.id} className="border border-on-background/10 lg:neo-border bg-background p-3 lg:p-4 flex gap-3 lg:gap-4">
                  <img src={camp.image} alt={camp.title} className="w-14 h-14 lg:w-20 lg:h-20 object-cover border border-on-background/10 lg:neo-border shrink-0" />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-on-background text-xs lg:text-sm mb-1 leading-tight">{camp.title}</h4>
                    <p className="text-[9px] lg:text-[10px] font-mono text-on-surface-variant mb-1 lg:mb-2">{camp.advertiser}</p>
                    <div className="flex gap-3 lg:gap-4 text-[10px] lg:text-[11px]">
                      <span className="text-on-surface-variant">Clicks: <strong>{camp.clicks.toLocaleString()}</strong></span>
                      <span className="text-on-surface-variant">Impr: <strong>{camp.impressions.toLocaleString()}</strong></span>
                    </div>
                    {/* Budget bar */}
                    <div className="mt-1.5 lg:mt-2 h-1.5 lg:h-2 border border-on-background/10 lg:neo-border bg-background overflow-hidden">
                      <div
                        className="h-full bg-primary-container"
                        style={{ width: `${(camp.spent / camp.budget) * 100}%` }}
                      />
                    </div>
                    <p className="text-[9px] lg:text-[10px] text-on-surface-variant mt-1">
                      {camp.spent} / {camp.budget} ETH spent
                    </p>
                  </div>
                </article>
              ))}
            </div>
          </section>

          {/* Network Insights */}
          <section className="bg-primary-container text-on-primary-container border border-on-background/10 lg:neo-border lg:neo-shadow p-4 lg:p-6">
            <h3 className="text-lg lg:text-[24px] font-extrabold uppercase mb-1 lg:mb-2">Network Insights</h3>
            <p className="text-sm lg:text-body-lg mb-4 lg:mb-6">
              Reach a growing community of Web3 builders and collectors.
            </p>
            <div className="grid grid-cols-2 gap-2 lg:gap-4">
              {[
                { label: 'Total Users', value: stats.totalUsers },
                { label: 'Total Staked', value: stats.totalStaked },
                { label: 'Active Campaigns', value: stats.activeCampaigns },
                { label: 'Total Volume', value: stats.totalVolume },
              ].map((s) => (
                <div key={s.label} className="border border-on-background/15 lg:neo-border bg-background/20 p-2 lg:p-4">
                  <p className="text-[9px] lg:text-[10px] uppercase font-bold">{s.label}</p>
                  <p className="text-lg lg:text-[24px] font-extrabold">{s.value}</p>
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
