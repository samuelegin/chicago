import React, { useState, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Image, BarChart3, Smile, X, Send } from 'lucide-react';
import { PostService, uploadFile } from '@/api/services';
import { CATEGORIES } from '@/lib/constants';

function Avatar({ name, avatar }) {
  return (
    <div
      className="w-9 h-9 rounded-full overflow-hidden shrink-0 flex items-center justify-center"
      style={{ background: '#0e0e0e', border: '1px solid rgba(255,255,255,0.1)' }}
    >
      {avatar
        ? <img src={avatar} alt={name} className="w-full h-full object-cover" />
        : <span className="text-sm font-bold" style={{ color: '#999077', fontFamily: 'Sora, sans-serif' }}>
            {(name || '?')[0].toUpperCase()}
          </span>
      }
    </div>
  );
}

export default function CreatePost({ userProfile, onPostCreated }) {
  const [content,     setContent]     = useState('');
  const [category,    setCategory]    = useState('general');
  const [postType,    setPostType]    = useState('text');
  const [imageFile,   setImageFile]   = useState(null);
  const [imgPreview,  setImgPreview]  = useState(null);
  const [pollOptions, setPollOptions] = useState(['', '']);
  const [submitting,  setSubmitting]  = useState(false);
  const [focused,     setFocused]     = useState(false);
  const fileRef = useRef();

  const handleImg = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setImageFile(f);
    setImgPreview(URL.createObjectURL(f));
    setPostType('image');
  };

  const submit = async () => {
    if (!content.trim()) return;
    setSubmitting(true);
    try {
      let image_url = null;
      if (imageFile) {
        const { file_url } = await uploadFile(imageFile);
        image_url = file_url;
      }
      await PostService.create({
        content, category,
        post_type:     postType,
        author_id:     userProfile?.user_id   || '',
        author_name:   userProfile?.username  || 'Anonymous',
        author_avatar: userProfile?.avatar_url || '',
        image_url,
        poll_options: postType === 'poll'
          ? pollOptions.filter(o => o.trim()).map(t => ({ text: t, votes: 0 }))
          : undefined,
      });
      setContent(''); setImageFile(null); setImgPreview(null);
      setPollOptions(['', '']); setPostType('text'); setFocused(false);
      onPostCreated?.();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="glass-card rounded-[28px] overflow-hidden transition-all duration-300"
      style={{
        borderColor: focused ? 'rgba(255,215,0,0.28)' : 'rgba(255,255,255,0.10)',
        boxShadow: focused ? '0 18px 56px rgba(255,215,0,0.12)' : '0 10px 28px rgba(0,0,0,0.12)',
      }}
    >
      {/* Top: avatar + textarea */}
      <div className="flex flex-col gap-3 px-4 pt-4 pb-3 sm:flex-row sm:px-5 sm:pt-5 sm:pb-4 border-b border-white/10">
        <Avatar name={userProfile?.username} avatar={userProfile?.avatar_url} />
        <textarea
          rows={focused ? 4 : 3}
          placeholder="Share your latest insight..."
          value={content}
          onChange={e => setContent(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          className="flex-1 min-h-[108px] sm:min-h-[140px] resize-none text-[15px] leading-7 focus:outline-none bg-transparent"
          style={{
            color: '#e5e2e1',
            fontFamily: 'Geist, sans-serif',
            caretColor: '#00eefc',
          }}
        />
      </div>

      {/* Image preview */}
      {imgPreview && (
        <div className="px-4 pb-4 sm:px-5">
          <div className="relative rounded-[22px] overflow-hidden border border-white/10 bg-slate-950">
            <img src={imgPreview} alt="" className="w-full max-h-44 object-cover" />
            <button
              onClick={() => { setImageFile(null); setImgPreview(null); setPostType('text'); }}
              className="absolute top-3 right-3 rounded-full p-2"
              style={{ background: 'rgba(0,0,0,0.7)', color: '#fff' }}
              type="button"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Poll options */}
      {postType === 'poll' && (
        <div className="px-4 pb-4 space-y-3 sm:px-5">
          {pollOptions.map((o, i) => (
            <div key={i} className="flex gap-2 items-center">
              <input
                placeholder={`Option ${i + 1}`}
                value={o}
                onChange={e => { const n = [...pollOptions]; n[i] = e.target.value; setPollOptions(n); }}
                className="flex-1 text-[14px] px-4 py-3 rounded-2xl focus:outline-none transition-all"
                style={{
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.12)',
                  color: '#e5e2e1',
                  fontFamily: 'Geist, sans-serif',
                }}
                onFocus={e => e.currentTarget.style.borderColor = 'rgba(255,215,0,0.4)'}
                onBlur={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)'}
              />
              {i > 1 && (
                <button onClick={() => setPollOptions(pollOptions.filter((_, j) => j !== i))} type="button">
                  <X className="w-4 h-4" style={{ color: 'rgba(208,198,171,0.5)' }} />
                </button>
              )}
            </div>
          ))}
          {pollOptions.length < 4 && (
            <button
              onClick={() => setPollOptions([...pollOptions, ''])}
              className="text-xs font-bold"
              style={{ color: '#ffd700', fontFamily: 'JetBrains Mono, monospace' }}
              type="button"
            >
              + Add option
            </button>
          )}
        </div>
      )}

      {/* Bottom toolbar */}
      <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
        <div className="flex flex-col gap-2 px-4 py-2 sm:flex-row sm:items-center sm:justify-between sm:px-5">
          <div className="flex items-center gap-1.5">
            <IconBtn onClick={() => fileRef.current?.click()} active={false}>
              <Image strokeWidth={1.8} className="w-[16px] h-[16px]" />
            </IconBtn>
            <IconBtn
              onClick={() => setPostType(t => t === 'poll' ? 'text' : 'poll')}
              active={postType === 'poll'}
            >
              <BarChart3 strokeWidth={1.8} className="w-[16px] h-[16px]" />
            </IconBtn>
            <IconBtn onClick={() => {}} active={false}>
              <Smile strokeWidth={1.8} className="w-[16px] h-[16px]" />
            </IconBtn>
          </div>

          <button
            onClick={submit}
            disabled={!content.trim() || submitting}
            className="inline-flex items-center gap-1.5 rounded-full font-bold transition-all disabled:opacity-30 disabled:cursor-not-allowed"
            style={{
              background: 'linear-gradient(135deg, #ffd566 0%, #f8af1b 100%)',
              color: '#040404',
              fontFamily: 'Sora, sans-serif',
              fontSize: 13,
              padding: '9px 16px',
              boxShadow: '0 12px 26px rgba(255,215,0,0.14)',
              whiteSpace: 'nowrap',
              minWidth: 'auto',
            }}
            type="button"
          >
            {submitting ? 'Posting…' : 'Share'}
            <Send className="w-3 h-3" strokeWidth={2.5} />
          </button>
        </div>

        <div className="px-4 pb-4 sm:px-5">
          <select
            value={category}
            onChange={e => setCategory(e.target.value)}
            className="text-[12px] font-bold focus:outline-none cursor-pointer border-none bg-transparent"
            style={{ color: 'rgba(208,198,171,0.55)', fontFamily: 'JetBrains Mono, monospace' }}
          >
            {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
          </select>
        </div>
      </div>
    </div>
  );
}

function IconBtn({ onClick, active, children }) {
  return (
    <button
      onClick={onClick}
      className="p-2 rounded-xl transition-all"
      style={{
        color: active ? '#ffd700' : 'rgba(208,198,171,0.5)',
        background: active ? 'rgba(255,215,0,0.1)' : 'transparent',
      }}
      onMouseEnter={e => {
        if (!active) {
          e.currentTarget.style.color = '#e5e2e1';
          e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
        }
      }}
      onMouseLeave={e => {
        if (!active) {
          e.currentTarget.style.color = 'rgba(208,198,171,0.5)';
          e.currentTarget.style.background = 'transparent';
        }
      }}
    >
      {children}
    </button>
  );
}
