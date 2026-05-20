import React, { useState, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Image, BarChart3, X, Sparkles } from 'lucide-react';
import { PostService, uploadFile } from '@/api/services';
import { CATEGORIES } from '@/lib/constants';

function Avatar({ name, avatar }) {
  return (
    <div className="w-9 h-9 rounded-full bg-neutral-100 border border-border overflow-hidden shrink-0 flex items-center justify-center">
      {avatar
        ? <img src={avatar} alt={name} className="w-full h-full object-cover" />
        : <span className="text-sm font-bold text-neutral-400">{(name || '?')[0].toUpperCase()}</span>
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
      className={`bg-white border rounded-xl px-4 py-3.5 transition-all duration-200 ${
        focused ? 'border-amber-300 shadow-md shadow-amber-100' : 'border-border'
      }`}
      style={{ boxShadow: focused ? '0 4px 20px rgba(245,158,11,0.1)' : '0 1px 4px rgba(0,0,0,0.04)' }}
    >
      <div className="flex gap-3 items-start">
        <Avatar name={userProfile?.username} avatar={userProfile?.avatar_url} />
        <div className="flex-1 min-w-0">
          <textarea
            rows={focused ? 3 : 1}
            placeholder="What's on your mind?"
            value={content}
            onChange={e => setContent(e.target.value)}
            onFocus={() => setFocused(true)}
            className="w-full resize-none text-[14px] text-foreground placeholder:text-neutral-400 focus:outline-none bg-transparent leading-relaxed"
          />

          {imgPreview && (
            <div className="relative mt-2 rounded-lg overflow-hidden border border-border">
              <img src={imgPreview} alt="" className="w-full max-h-60 object-cover" />
              <button
                onClick={() => { setImageFile(null); setImgPreview(null); setPostType('text'); }}
                className="absolute top-2 right-2 bg-black/60 text-white rounded-full p-1 hover:bg-black/80 transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          )}

          {postType === 'poll' && (
            <div className="mt-2 space-y-1.5">
              {pollOptions.map((o, i) => (
                <div key={i} className="flex gap-2 items-center">
                  <input
                    placeholder={`Option ${i + 1}`}
                    value={o}
                    onChange={e => { const n = [...pollOptions]; n[i] = e.target.value; setPollOptions(n); }}
                    className="flex-1 text-sm border border-border rounded-lg px-3 py-2 focus:outline-none focus:border-amber-300 transition-colors"
                  />
                  {i > 1 && (
                    <button onClick={() => setPollOptions(pollOptions.filter((_, j) => j !== i))}>
                      <X className="w-4 h-4 text-neutral-400 hover:text-neutral-600" />
                    </button>
                  )}
                </div>
              ))}
              {pollOptions.length < 4 && (
                <button onClick={() => setPollOptions([...pollOptions, ''])}
                  className="text-xs font-bold text-amber-600 hover:text-amber-700 transition-colors">
                  + Add option
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      <AnimatePresence>
        {focused && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="flex items-center mt-3 pt-3 border-t border-neutral-100 gap-2">
              <select
                value={category}
                onChange={e => setCategory(e.target.value)}
                className="text-xs text-neutral-500 border-none bg-transparent focus:outline-none cursor-pointer font-medium"
              >
                {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>

              <button
                onClick={() => fileRef.current?.click()}
                className="ml-auto p-1.5 rounded-lg text-neutral-400 hover:text-amber-500 hover:bg-amber-50 transition-colors"
              >
                <Image strokeWidth={1.8} className="w-4 h-4" />
              </button>
              <button
                onClick={() => setPostType(t => t === 'poll' ? 'text' : 'poll')}
                className={`p-1.5 rounded-lg transition-colors ${
                  postType === 'poll'
                    ? 'text-amber-500 bg-amber-50'
                    : 'text-neutral-400 hover:text-amber-500 hover:bg-amber-50'
                }`}
              >
                <BarChart3 strokeWidth={1.8} className="w-4 h-4" />
              </button>

              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImg} />

              <button
                onClick={submit}
                disabled={!content.trim() || submitting}
                className="ml-1 flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-bold text-white bg-gradient-to-r from-amber-500 to-yellow-400 shadow-sm shadow-amber-200 disabled:opacity-40 disabled:cursor-not-allowed hover:shadow-md hover:shadow-amber-200 transition-all"
              >
                <Sparkles className="w-3.5 h-3.5" strokeWidth={2.2} />
                {submitting ? 'Posting…' : 'Share'}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
