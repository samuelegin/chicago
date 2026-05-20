import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AdCampaignService } from '@/api/services';
import { Loader2, ExternalLink, Plus, X, Eye, MousePointer } from 'lucide-react';
import { toast } from 'sonner';

const STATUS_STYLES = {
  pending:  'text-amber-600  bg-amber-50  border-amber-200',
  approved: 'text-green-600  bg-green-50  border-green-200',
  active:   'text-primary    bg-yellow-50 border-yellow-200',
  rejected: 'text-red-600    bg-red-50    border-red-200',
  expired:  'text-neutral-500 bg-neutral-100 border-neutral-200',
};

const PRICING = { 1: { eth: 0.05, clt: 500 }, 3: { eth: 0.12, clt: 1200 }, 7: { eth: 0.25, clt: 2500 } };
const BLANK   = { project_name: '', description: '', website_url: '', x_account: '', banner_url: '', category: 'other', payment_type: 'eth', duration_days: 1, placement: 'feed', payment_amount: 0 };

function AdCard({ ad }) {
  const statusCls = STATUS_STYLES[ad.status] || STATUS_STYLES.pending;
  return (
    <div className="bg-white border border-border rounded-sm overflow-hidden">
      {ad.banner_url && (
        <img src={ad.banner_url} alt={ad.project_name} className="w-full h-40 object-cover" />
      )}
      <div className="px-4 py-3 space-y-2">
        <div className="flex items-start justify-between gap-2">
          <p className="text-sm font-semibold">{ad.project_name}</p>
          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border shrink-0 ${statusCls}`}>
            {ad.status}
          </span>
        </div>
        <p className="text-xs text-neutral-500 line-clamp-2">{ad.description}</p>
        <div className="flex items-center gap-4 text-xs text-neutral-400">
          <span className="flex items-center gap-1"><Eye className="w-3 h-3" />{(ad.impressions || 0).toLocaleString()}</span>
          <span className="flex items-center gap-1"><MousePointer className="w-3 h-3" />{(ad.clicks || 0).toLocaleString()}</span>
          <span>{ad.duration_days}d</span>
          <span className="font-medium text-foreground ml-auto">{ad.payment_amount} {(ad.payment_type || '').toUpperCase()}</span>
        </div>
        {ad.website_url && (
          <a href={ad.website_url} target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:opacity-70">
            Visit <ExternalLink className="w-3 h-3" />
          </a>
        )}
      </div>
    </div>
  );
}

export default function AdMarketplace() {
  const [showForm, setShowForm] = useState(false);
  const [form,     setForm]     = useState(BLANK);
  const queryClient = useQueryClient();

  const { data: ads = [], isLoading } = useQuery({
    queryKey: ['ads'],
    queryFn:  () => AdCampaignService.list('-created_date', 50),
  });

  const createMutation = useMutation({
    mutationFn: (data) => AdCampaignService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ads'] });
      setShowForm(false); setForm(BLANK);
      toast.success('Ad submitted for review');
    },
  });

  const price = PRICING[form.duration_days]?.[form.payment_type] || 0;

  const field = (placeholder, key, type = 'text', extra = {}) => (
    <input
      type={type}
      placeholder={placeholder}
      value={form[key] || ''}
      onChange={e => setForm({ ...form, [key]: e.target.value })}
      className="w-full text-sm border border-border rounded px-3 py-2 focus:outline-none focus:border-neutral-400"
      {...extra}
    />
  );

  const sel = (key, options) => (
    <select
      value={form[key]}
      onChange={e => {
        const val = key === 'duration_days' ? Number(e.target.value) : e.target.value;
        const newForm = { ...form, [key]: val };
        if (key === 'duration_days' || key === 'payment_type') {
          newForm.payment_amount = PRICING[newForm.duration_days]?.[newForm.payment_type] || 0;
        }
        setForm(newForm);
      }}
      className="w-full text-sm border border-border rounded px-3 py-2 focus:outline-none focus:border-neutral-400 bg-white"
    >
      {options.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
    </select>
  );

  return (
    <div className="max-w-[600px] mx-auto px-4 py-6 space-y-3">

      {/* Header */}
      <div className="bg-white border border-border rounded-sm px-4 py-3 flex items-center justify-between">
        <div>
          <h1 className="text-base font-semibold">Ad Marketplace</h1>
          <p className="text-xs text-neutral-500 mt-0.5">Promote your project to the Chicago community</p>
        </div>
        <button
          onClick={() => setShowForm(v => !v)}
          className="flex items-center gap-1.5 text-sm font-semibold border border-border rounded-md px-3 py-1.5 hover:bg-neutral-50 transition-colors"
        >
          {showForm ? <><X className="w-4 h-4" /> Cancel</> : <><Plus className="w-4 h-4" /> Submit Ad</>}
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-white border border-border rounded-sm px-4 py-4 space-y-3">
          <p className="text-sm font-semibold">Campaign Details</p>
          <div className="grid grid-cols-2 gap-2">
            {field('Project Name', 'project_name')}
            {field('X / Twitter handle', 'x_account')}
            {field('Website URL', 'website_url')}
            {field('Banner Image URL', 'banner_url')}
          </div>
          <textarea
            placeholder="Describe your project..."
            value={form.description}
            onChange={e => setForm({ ...form, description: e.target.value })}
            rows={3}
            className="w-full text-sm border border-border rounded px-3 py-2 focus:outline-none focus:border-neutral-400 resize-none"
          />
          <div className="grid grid-cols-3 gap-2">
            {sel('category', [['defi','DeFi'],['nft','NFT'],['gaming','Gaming'],['infrastructure','Infrastructure'],['social','Social'],['other','Other']])}
            {sel('duration_days', [['1','1 Day'],['3','3 Days'],['7','7 Days']])}
            {sel('payment_type', [['eth','Pay with ETH'],['clt','Pay with CLT']])}
          </div>
          {sel('placement', [['feed','Feed'],['sidebar','Sidebar'],['trending','Trending Section']])}

          <div className="flex items-center justify-between border border-border rounded px-3 py-2.5">
            <span className="text-xs text-neutral-500">Total cost</span>
            <span className="text-sm font-semibold">{price} {form.payment_type.toUpperCase()}</span>
          </div>

          <button
            onClick={() => createMutation.mutate({ ...form, status: 'pending' })}
            disabled={!form.project_name || !form.description || createMutation.isPending}
            className="w-full py-2.5 rounded text-sm font-semibold bg-primary text-white hover:bg-primary/90 transition-colors disabled:opacity-40"
          >
            {createMutation.isPending ? 'Submitting...' : 'Submit for Review'}
          </button>
        </div>
      )}

      {/* Ad list */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-5 h-5 animate-spin text-neutral-300" />
        </div>
      ) : ads.length === 0 ? (
        <div className="bg-white border border-border rounded-sm py-16 text-center">
          <p className="text-sm font-semibold">No campaigns yet</p>
          <p className="text-xs text-neutral-500 mt-1">Be the first to promote your project</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-3">
          {ads.map(ad => <AdCard key={ad.id} ad={ad} />)}
        </div>
      )}
    </div>
  );
}
