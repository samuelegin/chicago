import { useState, useRef } from 'react'
import { marketplaceCampaigns, marketplacePricing, networkStats } from '../data/mockData'

const CATEGORIES = ['DeFi', 'NFT', 'Gaming', 'Infrastructure', 'Social', 'Other']
const PLACEMENTS = [
  { id: 'feed', label: 'Main Feed', badge: 'Recommended' },
  { id: 'sidebar', label: 'Sidebar Sticky', badge: null },
  { id: 'trending', label: 'Trending Section', badge: null },
]

export default function Marketplace() {
  const [campaigns] = useState(marketplaceCampaigns)
  const [pricing, setPricing] = useState(marketplacePricing)
  const [selectedCategory, setSelectedCategory] = useState('DeFi')
  const [selectedPlacement, setSelectedPlacement] = useState('feed')
  const [paymentMethod, setPaymentMethod] = useState('ETH')
  const [dragOver, setDragOver] = useState(false)
  const [uploadedFile, setUploadedFile] = useState(null)
  const fileInputRef = useRef(null)
  const stats = networkStats

  const handleSelectDuration = (label) => {
    const dur = pricing.durations.find((d) => d.label === label)
    setPricing((prev) => ({ ...prev, selectedDuration: label, totalCostEth: dur.priceEth }))
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file) setUploadedFile(file.name)
  }

  return (
    <div className="flex-1 lg:ml-[300px] w-full flex flex-col gap-4 lg:gap-8 pb-24 md:pb-8">

      {/* Hero Header */}
      <section className="p-4 lg:px-0 pt-4 lg:pt-8">
        <h2 className="font-extrabold uppercase leading-none text-[2rem] lg:text-[72px] lg:leading-[80px] lg:tracking-[-0.04em] mb-2">
          Marketplace
        </h2>
        <p className="text-sm lg:text-[24px] lg:leading-[32px] lg:font-bold text-on-surface-variant max-w-2xl">
          Boost your presence across the Chicago network. High-impact placements for modern Web3 protocols.
        </p>
      </section>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6 px-4 lg:px-0">

        {/* ── Campaign Creation Form ── */}
        <div className="lg:col-span-7 flex flex-col gap-4 lg:gap-6">
          <div className="bg-surface border border-on-background/10 lg:border-4 lg:border-on-surface p-5 lg:p-8 neo-shadow">

            {/* Form Title */}
            <div className="flex items-center gap-2 mb-5 lg:mb-6">
              <span className="material-symbols-outlined text-primary text-2xl lg:text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>campaign</span>
              <h3 className="font-extrabold uppercase text-sm lg:text-[24px] lg:leading-[32px]">Place an Ad</h3>
            </div>

            <div className="flex flex-col gap-4 lg:gap-6">

              {/* Target Category */}
              <div>
                <label className="block font-bold uppercase text-[10px] lg:text-[14px] lg:tracking-[0.05em] mb-3">
                  Target Category
                </label>
                <div className="flex flex-wrap gap-2">
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-3 py-1.5 lg:px-4 lg:py-2 font-bold uppercase text-[10px] lg:text-[14px] lg:tracking-[0.05em] border-2 transition-colors ${
                        selectedCategory === cat
                          ? 'bg-primary text-on-primary border-on-surface'
                          : 'bg-surface text-on-surface border-on-surface hover:bg-surface-container'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Duration & Payment */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold uppercase text-[10px] lg:text-[14px] lg:tracking-[0.05em] mb-3">
                    Duration
                  </label>
                  <div className="flex border-2 lg:border-4 border-on-surface overflow-hidden">
                    {pricing.durations.map((dur, i) => (
                      <button
                        key={dur.label}
                        type="button"
                        onClick={() => handleSelectDuration(dur.label)}
                        className={`flex-1 py-2 lg:py-3 font-bold text-sm lg:text-base transition-colors ${
                          i < pricing.durations.length - 1 ? 'border-r-2 lg:border-r-4 border-on-surface' : ''
                        } ${
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
                <div>
                  <label className="block font-bold uppercase text-[10px] lg:text-[14px] lg:tracking-[0.05em] mb-3">
                    Payment Method
                  </label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-full border-2 lg:border-4 border-on-surface bg-surface p-2 lg:p-3 font-medium text-sm lg:text-base focus:ring-0 focus:outline-none focus:border-primary"
                  >
                    <option value="ETH">Pay with ETH</option>
                    <option value="CLT">Pay with CLT</option>
                  </select>
                </div>
              </div>

              {/* Campaign Name & URL */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold uppercase text-[10px] lg:text-[14px] lg:tracking-[0.05em] mb-3">
                    Campaign Name
                  </label>
                  <input
                    type="text"
                    placeholder="Enter campaign name"
                    className="w-full border-2 lg:border-4 border-on-surface bg-surface p-2 lg:p-3 text-sm lg:text-base focus:ring-0 focus:outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block font-bold uppercase text-[10px] lg:text-[14px] lg:tracking-[0.05em] mb-3">
                    Destination URL
                  </label>
                  <input
                    type="url"
                    placeholder="https://your-project.xyz"
                    className="w-full border-2 lg:border-4 border-on-surface bg-surface p-2 lg:p-3 text-sm lg:text-base focus:ring-0 focus:outline-none focus:border-primary"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block font-bold uppercase text-[10px] lg:text-[14px] lg:tracking-[0.05em] mb-3">
                  Campaign Description
                </label>
                <textarea
                  placeholder="Describe your campaign mission..."
                  rows={3}
                  className="w-full border-2 lg:border-4 border-on-surface bg-surface p-2 lg:p-3 text-sm lg:text-base focus:ring-0 focus:outline-none focus:border-primary resize-none"
                />
              </div>

              {/* Visual Asset Upload */}
              <div>
                <label className="block font-bold uppercase text-[10px] lg:text-[14px] lg:tracking-[0.05em] mb-3">
                  Visual Asset (Image/GIF)
                </label>
                <div
                  onDrop={handleDrop}
                  onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
                  onDragLeave={() => setDragOver(false)}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 lg:border-4 border-dashed p-6 lg:p-8 text-center cursor-pointer transition-colors ${
                    dragOver
                      ? 'border-primary bg-primary-container/20'
                      : 'border-on-surface bg-surface-container-low hover:bg-surface-container'
                  }`}
                >
                  <span
                    className="material-symbols-outlined text-3xl lg:text-4xl mb-2 block text-on-surface-variant"
                    style={{ fontVariationSettings: "'FILL' 0" }}
                  >
                    upload_file
                  </span>
                  {uploadedFile ? (
                    <p className="font-bold text-sm text-primary">{uploadedFile}</p>
                  ) : (
                    <>
                      <p className="font-bold text-[11px] lg:text-[14px] text-on-surface-variant">Click to upload or drag &amp; drop</p>
                      <p className="text-[9px] lg:text-[10px] uppercase mt-1 opacity-50">High-res PNG, JPG or GIF (max 5MB)</p>
                    </>
                  )}
                  <input ref={fileInputRef} type="file" className="hidden" onChange={(e) => setUploadedFile(e.target.files[0]?.name)} />
                </div>
              </div>

              {/* Placement Selection */}
              <div>
                <label className="block font-bold uppercase text-[10px] lg:text-[14px] lg:tracking-[0.05em] mb-3">
                  Placement Selection
                </label>
                <div className="flex flex-col gap-0">
                  {PLACEMENTS.map((p) => (
                    <label
                      key={p.id}
                      className={`flex items-center justify-between p-3 lg:p-4 border-2 lg:border-4 cursor-pointer transition-colors -mb-[2px] lg:-mb-[4px] last:mb-0 ${
                        selectedPlacement === p.id
                          ? 'border-primary bg-primary-container/10 z-10 relative'
                          : 'border-on-surface hover:bg-primary-container/5'
                      }`}
                    >
                      <div className="flex items-center gap-3 lg:gap-4">
                        <input
                          type="radio"
                          name="placement"
                          checked={selectedPlacement === p.id}
                          onChange={() => setSelectedPlacement(p.id)}
                          className="w-4 h-4 lg:w-6 lg:h-6 border-2 lg:border-4 border-on-surface text-primary focus:ring-0"
                        />
                        <span className="font-bold text-sm lg:text-[18px]">{p.label}</span>
                      </div>
                      {p.badge && (
                        <span className="font-bold bg-on-surface text-inverse-on-surface px-2 py-0.5 uppercase text-[9px] lg:text-[12px]">
                          {p.badge}
                        </span>
                      )}
                    </label>
                  ))}
                </div>
              </div>

              {/* Pricing Summary & Submit */}
              <div className="mt-2 p-4 lg:p-6 bg-on-surface text-inverse-on-surface flex flex-col md:flex-row md:items-center justify-between gap-3 lg:gap-4">
                <div>
                  <p className="font-bold uppercase text-[10px] lg:text-[14px] text-primary-fixed-dim lg:tracking-[0.05em]">
                    Final Pricing
                  </p>
                  <h4 className="font-extrabold text-lg lg:text-[40px] lg:leading-[48px]">
                    Total: {pricing.totalCostEth} ETH
                  </h4>
                </div>
                <button
                  type="button"
                  className="bg-primary text-on-primary border-2 lg:border-4 border-white px-6 lg:px-8 py-3 lg:py-4 font-extrabold uppercase text-sm lg:text-[24px] lg:shadow-[4px_4px_0px_0px_rgba(212,175,55,1)] hover:bg-primary-container transition-all active:scale-95"
                >
                  Submit for Review
                </button>
              </div>

            </div>
          </div>
        </div>

        {/* ── Right Column: Management + Insights ── */}
        <div className="lg:col-span-5 flex flex-col gap-4 lg:gap-6">

          {/* Active Campaigns */}
          <div>
            <div className="flex items-center justify-between mb-3 lg:mb-4">
              <h3 className="font-extrabold uppercase text-sm lg:text-[24px] lg:leading-[32px]">Management</h3>
              <span className="font-bold bg-on-surface-variant text-inverse-on-surface px-2 lg:px-3 py-0.5 lg:py-1 text-[9px] lg:text-[14px] uppercase">
                {campaigns.filter(c => c.status === 'active').length} Active
              </span>
            </div>

            <div className="flex flex-col gap-4 lg:gap-6">
              {campaigns.map((camp) => (
                <div
                  key={camp.id}
                  className="bg-surface border border-on-background/10 lg:border-4 lg:border-on-surface neo-shadow flex flex-col group overflow-hidden"
                >
                  {/* Campaign Image */}
                  <div className="relative overflow-hidden h-36 lg:h-52 bg-primary-container">
                    <img
                      src={camp.image}
                      alt={camp.title}
                      className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500"
                    />
                    {camp.status === 'active' && (
                      <div className="absolute top-3 left-3 bg-primary text-on-primary border-2 border-on-surface px-2 py-0.5 font-bold uppercase text-[9px] lg:text-[12px]">
                        Active
                      </div>
                    )}
                  </div>

                  {/* Campaign Details */}
                  <div className="p-4 lg:p-6 border-t border-on-background/10 lg:border-t-4 lg:border-on-surface">
                    <h4 className="font-extrabold text-sm lg:text-[24px] lg:leading-[32px] mb-3 lg:mb-4 leading-tight">
                      {camp.title}
                    </h4>
                    <div className="grid grid-cols-2 border-t border-on-background/10 lg:border-t-2 lg:border-on-surface/10 pt-3 lg:pt-4 gap-3 lg:gap-4 mb-4 lg:mb-6">
                      <div className="flex flex-col">
                        <span className="font-bold uppercase text-[9px] lg:text-[14px] opacity-60">Impressions</span>
                        <span className="font-extrabold text-lg lg:text-[24px]">{camp.impressions.toLocaleString()}</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="font-bold uppercase text-[9px] lg:text-[14px] opacity-60">Clicks</span>
                        <span className="font-extrabold text-lg lg:text-[24px]">{camp.clicks.toLocaleString()}</span>
                      </div>
                    </div>

                    {/* Budget bar */}
                    <div className="mb-3 lg:mb-4">
                      <div className="flex justify-between text-[9px] lg:text-[11px] font-bold uppercase opacity-60 mb-1">
                        <span>Budget spent</span>
                        <span>{camp.spent} / {camp.budget} ETH</span>
                      </div>
                      <div className="h-1.5 lg:h-2 border border-on-background/10 lg:border-2 lg:border-on-surface bg-surface-container overflow-hidden">
                        <div
                          className="h-full bg-primary transition-all"
                          style={{ width: `${(camp.spent / camp.budget) * 100}%` }}
                        />
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <button className="flex-1 bg-on-surface text-inverse-on-surface py-2 lg:py-3 font-bold uppercase text-[10px] lg:text-[14px] border-2 border-on-surface hover:bg-surface hover:text-on-surface transition-colors">
                        Edit Ad
                      </button>
                      <button className="aspect-square w-9 lg:w-12 bg-surface border-2 border-on-surface flex items-center justify-center hover:bg-error/10 hover:border-error transition-colors">
                        <span className="material-symbols-outlined text-sm lg:text-base">pause</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Network Insights */}
          <div className="bg-primary-container border border-on-background/10 lg:border-4 lg:border-on-surface p-5 lg:p-8 lg:neo-shadow relative overflow-hidden">
            <div className="relative z-10">
              <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4 mb-4 lg:mb-6">
                <div>
                  <h3 className="font-extrabold uppercase text-lg lg:text-[40px] lg:leading-[48px] mb-1 lg:mb-2">
                    Network Insights
                  </h3>
                  <p className="text-sm lg:text-[18px] text-on-primary-container max-w-xs">
                    Our network reach has grown by 40% this month. <strong>DeFi</strong> campaigns have the highest conversion rate.
                  </p>
                </div>
                <div className="flex gap-2 lg:gap-4 shrink-0">
                  <div className="bg-surface border-2 lg:border-4 border-on-surface p-3 lg:p-4 text-center">
                    <div className="font-bold uppercase text-[9px] lg:text-[14px] opacity-60">Avg. CTR</div>
                    <div className="font-extrabold text-xl lg:text-[40px] lg:leading-[48px]">3.2%</div>
                  </div>
                  <div className="bg-surface border-2 lg:border-4 border-on-surface p-3 lg:p-4 text-center">
                    <div className="font-bold uppercase text-[9px] lg:text-[14px] opacity-60">Reach</div>
                    <div className="font-extrabold text-xl lg:text-[40px] lg:leading-[48px]">2.8M</div>
                  </div>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-2 lg:gap-4">
                {[
                  { label: 'Total Users', value: stats.totalUsers },
                  { label: 'Total Staked', value: stats.totalStaked },
                  { label: 'Active Campaigns', value: stats.activeCampaigns },
                  { label: 'Total Volume', value: stats.totalVolume },
                ].map((s) => (
                  <div key={s.label} className="bg-surface border-2 lg:border-4 border-on-surface p-3 lg:p-4">
                    <p className="font-bold uppercase text-[9px] lg:text-[14px] opacity-60">{s.label}</p>
                    <p className="font-extrabold text-lg lg:text-[24px]">{s.value}</p>
                  </div>
                ))}
              </div>
            </div>
            {/* Decorative element */}
            <div className="absolute -bottom-16 -right-16 w-56 h-56 lg:w-80 lg:h-80 bg-on-surface/5 rotate-45 pointer-events-none" />
          </div>

        </div>
      </div>

    </div>
  )
}
