import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { UserProfileService, PostService, AdCampaignService } from '@/api/services';
import { useAuth } from '@/lib/AuthContext';
import { Loader2, Trash2, Ban, CheckCircle, XCircle } from 'lucide-react';
import { toast } from 'sonner';

const TABS = ['Users', 'Posts', 'Ads'];

function StatCard({ label, value }) {
  return (
    <div className="bg-card border border-border rounded-sm px-4 py-3 text-center">
      <p className="text-xl font-semibold text-foreground">{value}</p>
      <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
    </div>
  );
}

export default function Admin() {
  const { user } = useAuth();
  const [tab, setTab] = useState('Users');
  const queryClient = useQueryClient();

  const { data: users = [], isLoading: loadingUsers } = useQuery({ queryKey: ['admin-users'], queryFn: () => UserProfileService.list('-cis_score', 100) });
  const { data: posts = [], isLoading: loadingPosts } = useQuery({ queryKey: ['admin-posts'], queryFn: () => PostService.list('-created_date', 100) });
  const { data: ads   = [], isLoading: loadingAds   } = useQuery({ queryKey: ['admin-ads'],   queryFn: () => AdCampaignService.list('-created_date', 100) });

  const banUser   = useMutation({ mutationFn: ({ id, banned }) => UserProfileService.update(id, { is_banned: banned }), onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin-users'] }); toast.success('Updated'); } });
  const delPost   = useMutation({ mutationFn: (id) => PostService.delete(id),                                           onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin-posts'] }); toast.success('Removed'); } });
  const updateAd  = useMutation({ mutationFn: ({ id, status }) => AdCampaignService.update(id, { status }),             onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin-ads'] });   toast.success('Updated'); } });

  if (user?.role !== 'admin') return (
    <div className="flex flex-col items-center justify-center py-24 gap-3">
      <p className="text-sm font-semibold">Admin access required</p>
      <p className="text-xs text-muted-foreground">Contact the platform owner to request access</p>
    </div>
  );

  const isLoading = loadingUsers || loadingPosts || loadingAds;

  return (
    <div className="max-w-[700px] mx-auto px-4 py-6 space-y-4">

      {/* Header */}
      <div className="bg-card border border-border rounded-sm px-4 py-3">
        <h1 className="text-base font-semibold">Admin Panel</h1>
        <p className="text-xs text-muted-foreground mt-0.5">Manage users, content and campaigns</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-2">
        <StatCard label="Users"       value={users.length} />
        <StatCard label="Posts"       value={posts.length} />
        <StatCard label="Flagged"     value={posts.filter(p => p.is_flagged).length} />
        <StatCard label="Pending Ads" value={ads.filter(a => a.status === 'pending').length} />
      </div>

      {/* Tabs + content */}
      <div className="bg-card border border-border rounded-sm overflow-hidden">
        <div className="flex border-b border-border">
          {TABS.map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 py-2.5 text-xs font-semibold tracking-wider uppercase transition-colors ${
                tab === t
                  ? 'text-foreground border-b-2 border-foreground -mb-px'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <>
            {/* Users */}
            {tab === 'Users' && (
              <div className="divide-y divide-border">
                {users.map(u => (
                  <div key={u.id} className="flex items-center gap-3 px-4 py-3">
                    <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center shrink-0">
                      <span className="text-xs font-semibold text-muted-foreground">{(u.username || '?')[0].toUpperCase()}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold truncate">{u.username}</p>
                        {u.is_banned && <span className="text-[10px] font-semibold text-red-500 bg-red-500/10 border border-red-500/30 px-1.5 py-0.5 rounded-full">Banned</span>}
                      </div>
                      <p className="text-[11px] text-muted-foreground">CIS {u.cis_score || 0} · Posts {u.posts_count || 0}</p>
                    </div>
                    <button
                      onClick={() => banUser.mutate({ id: u.id, banned: !u.is_banned })}
                      className={`text-xs font-semibold border border-border rounded px-2.5 py-1 hover:bg-muted flex items-center gap-1 transition-colors ${u.is_banned ? 'text-foreground' : 'text-red-600 border-red-500/30 hover:bg-red-500/10'}`}
                    >
                      <Ban className="w-3 h-3" />
                      {u.is_banned ? 'Unban' : 'Ban'}
                    </button>
                  </div>
                ))}
                {users.length === 0 && <p className="text-sm text-muted-foreground text-center py-12">No users</p>}
              </div>
            )}

            {/* Posts */}
            {tab === 'Posts' && (
              <div className="divide-y divide-border">
                {posts.slice(0, 50).map(post => (
                  <div key={post.id} className="flex items-start gap-3 px-4 py-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-semibold">{post.author_name || 'Anonymous'}</p>
                        {post.is_flagged && (
                          <span className="text-[10px] font-semibold text-red-500 bg-red-500/10 border border-red-500/30 px-1.5 py-0.5 rounded-full">Flagged</span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">{post.content}</p>
                    </div>
                    <button
                      onClick={() => delPost.mutate(post.id)}
                      className="shrink-0 p-1.5 text-muted-foreground hover:text-red-500 transition-colors rounded"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                {posts.length === 0 && <p className="text-sm text-muted-foreground text-center py-12">No posts</p>}
              </div>
            )}

            {/* Ads */}
            {tab === 'Ads' && (
              <div className="divide-y divide-border">
                {ads.map(ad => (
                  <div key={ad.id} className="flex items-start gap-3 px-4 py-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-semibold">{ad.project_name}</p>
                        <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full border ${
                          ad.status === 'pending'  ? 'text-amber-600 bg-amber-500/10 border-amber-500/30' :
                          ad.status === 'approved' || ad.status === 'active' ? 'text-green-600 bg-green-500/10 border-green-500/30' :
                          'text-red-500 bg-red-500/10 border-red-500/30'
                        }`}>{ad.status}</span>
                      </div>
                      <p className="text-[11px] text-muted-foreground mt-0.5">
                        {ad.duration_days}d · {ad.placement} · {ad.payment_amount} {(ad.payment_type || '').toUpperCase()}
                      </p>
                    </div>
                    {ad.status === 'pending' && (
                      <div className="flex gap-1.5 shrink-0">
                        <button
                          onClick={() => updateAd.mutate({ id: ad.id, status: 'approved' })}
                          className="flex items-center gap-1 text-xs font-semibold text-green-600 border border-green-500/30 bg-green-500/10 hover:bg-green-500/20 rounded px-2 py-1 transition-colors"
                        >
                          <CheckCircle className="w-3 h-3" /> Approve
                        </button>
                        <button
                          onClick={() => updateAd.mutate({ id: ad.id, status: 'rejected' })}
                          className="flex items-center gap-1 text-xs font-semibold text-red-600 border border-red-500/30 bg-red-500/10 hover:bg-red-500/20 rounded px-2 py-1 transition-colors"
                        >
                          <XCircle className="w-3 h-3" /> Reject
                        </button>
                      </div>
                    )}
                  </div>
                ))}
                {ads.length === 0 && <p className="text-sm text-muted-foreground text-center py-12">No ad campaigns</p>}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
