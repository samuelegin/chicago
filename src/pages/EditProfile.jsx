import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
import { UserProfileService, uploadFile } from '@/api/services';
import { ArrowLeft, Camera, Check, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

function GlassInput({ label, value, onChange, placeholder, type = 'text', multiline = false }) {
  const [focused, setFocused] = useState(false);
  const sharedStyle = {
    background: '#000',
    border: `1px solid ${focused ? '#00eefc' : 'rgba(255,255,255,0.08)'}`,
    borderRadius: '0.75rem',
    color: '#e5e2e1',
    fontFamily: 'Geist, sans-serif',
    fontSize: 14,
    padding: '14px 16px',
    width: '100%',
    outline: 'none',
    transition: 'border-color 0.2s, box-shadow 0.2s',
    boxShadow: focused ? '0 0 0 3px rgba(0,238,252,0.08)' : 'none',
    caretColor: '#00eefc',
    resize: 'none',
  };

  return (
    <div>
      <label
        style={{
          fontFamily: 'JetBrains Mono, monospace',
          fontSize: 11,
          fontWeight: 500,
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          color: focused ? '#00eefc' : '#999077',
          display: 'block',
          marginBottom: 8,
          transition: 'color 0.2s',
        }}
      >
        {label}
      </label>
      {multiline ? (
        <textarea
          rows={4}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={{ ...sharedStyle, lineHeight: 1.6 }}
        />
      ) : (
        <input
          type={type}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={sharedStyle}
        />
      )}
    </div>
  );
}

export default function EditProfile() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [profile,     setProfile]     = useState(null);
  const [username,    setUsername]    = useState('');
  const [displayName, setDisplayName] = useState('');
  const [bio,         setBio]         = useState('');
  const [twitter,     setTwitter]     = useState('');
  const [website,     setWebsite]     = useState('');
  const [avatarFile,  setAvatarFile]  = useState(null);
  const [avatarPrev,  setAvatarPrev]  = useState(null);
  const [saving,      setSaving]      = useState(false);
  const [saved,       setSaved]       = useState(false);
  const fileRef = useRef();

  useEffect(() => {
    if (!user) return;
    (async () => {
      const profiles = await UserProfileService.getByUserId(user.id);
      if (profiles.length > 0) {
        const p = profiles[0];
        setProfile(p);
        setUsername(p.username    || '');
        setDisplayName(p.display_name || '');
        setBio(p.bio              || '');
        setTwitter(p.twitter      || '');
        setWebsite(p.website      || '');
        setAvatarPrev(p.avatar_url || null);
      }
    })();
  }, [user]);

  const handleAvatar = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setAvatarFile(f);
    setAvatarPrev(URL.createObjectURL(f));
  };

  const handleSave = async () => {
    if (!profile || saving) return;
    setSaving(true);
    try {
      let avatar_url = profile.avatar_url;
      if (avatarFile) {
        const { file_url } = await uploadFile(avatarFile);
        avatar_url = file_url;
      }
      await UserProfileService.update(profile.id, {
        username,
        display_name: displayName,
        bio,
        twitter,
        website,
        avatar_url,
      });
      setSaved(true);
      toast.success('Profile updated!');
      setTimeout(() => navigate('/profile'), 900);
    } catch (err) {
      toast.error('Failed to save. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (!profile) return (
    <div className="flex justify-center py-24">
      <Loader2 className="w-5 h-5 animate-spin" style={{ color: '#e9c400' }} />
    </div>
  );

  return (
    <div
      className="min-h-screen pb-32"
      style={{
        background: `
          radial-gradient(at 0% 0%, rgba(87,0,201,0.1) 0px, transparent 50%),
          radial-gradient(at 100% 100%, rgba(0,222,233,0.07) 0px, transparent 50%),
          #050505
        `,
      }}
    >
      {/* Header */}
      <div
        className="sticky top-0 z-10 flex items-center justify-between px-4 h-14"
        style={{
          background: 'rgba(5,5,5,0.85)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(255,255,255,0.07)',
        }}
      >
        <button
          onClick={() => navigate('/profile')}
          className="flex items-center gap-2 p-2 -ml-2 rounded-xl transition-all"
          style={{ color: 'rgba(208,198,171,0.7)' }}
          onMouseEnter={e => e.currentTarget.style.color = '#e5e2e1'}
          onMouseLeave={e => e.currentTarget.style.color = 'rgba(208,198,171,0.7)'}
        >
          <ArrowLeft className="w-5 h-5" strokeWidth={2} />
          <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 13 }}>Back</span>
        </button>

        <h1 style={{ fontFamily: 'Sora, sans-serif', fontSize: 16, fontWeight: 700, color: '#fff' }}>
          Edit Profile
        </h1>

        {/* Save button */}
        <motion.button
          whileTap={{ scale: 0.92 }}
          onClick={handleSave}
          disabled={saving || saved}
          className="flex items-center gap-1.5 px-4 py-2 rounded-full font-bold transition-all disabled:opacity-60"
          style={{
            background: saved ? 'rgba(34,197,94,0.2)' : '#ffd700',
            color: saved ? '#22c55e' : '#000',
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: 13,
            border: saved ? '1px solid rgba(34,197,94,0.4)' : 'none',
            boxShadow: saved ? '0 0 14px rgba(34,197,94,0.25)' : '0 0 14px rgba(255,215,0,0.3)',
          }}
        >
          {saving ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : saved ? (
            <><Check className="w-3.5 h-3.5" strokeWidth={2.5} /> Saved</>
          ) : (
            'Save'
          )}
        </motion.button>
      </div>

      <div className="max-w-[480px] mx-auto px-4 pt-8 space-y-8">

        {/* Avatar picker */}
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            {/* Gold/cyan gradient ring */}
            <div
              className="rounded-full p-[3px]"
              style={{
                background: 'linear-gradient(135deg, #e9c400, #00eefc, #ffe16d)',
                boxShadow: '0 0 28px rgba(233,196,0,0.2)',
              }}
            >
              <div
                className="rounded-full overflow-hidden flex items-center justify-center"
                style={{ width: 100, height: 100, background: '#0e0e0e' }}
              >
                {avatarPrev ? (
                  <img src={avatarPrev} alt="avatar" className="w-full h-full object-cover" />
                ) : (
                  <span style={{ fontSize: 36, fontWeight: 800, color: '#e9c400', fontFamily: 'Sora, sans-serif' }}>
                    {(username || '?')[0].toUpperCase()}
                  </span>
                )}
              </div>
            </div>

            {/* Camera overlay */}
            <button
              onClick={() => fileRef.current?.click()}
              className="absolute inset-0 rounded-full flex items-center justify-center transition-all"
              style={{ background: 'rgba(0,0,0,0)', backdropFilter: 'blur(0px)' }}
              onMouseEnter={e => {
                e.currentTarget.style.background = 'rgba(0,0,0,0.55)';
                e.currentTarget.style.backdropFilter = 'blur(2px)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = 'rgba(0,0,0,0)';
                e.currentTarget.style.backdropFilter = 'blur(0px)';
              }}
            >
              <Camera className="w-6 h-6 text-white opacity-0 transition-opacity"
                style={{ opacity: 'inherit' }}
              />
            </button>

            {/* Always-visible small camera badge */}
            <button
              onClick={() => fileRef.current?.click()}
              className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full flex items-center justify-center transition-all"
              style={{
                background: '#ffd700',
                border: '2px solid #050505',
                boxShadow: '0 0 10px rgba(255,215,0,0.4)',
              }}
            >
              <Camera className="w-3.5 h-3.5" strokeWidth={2.2} style={{ color: '#000' }} />
            </button>
          </div>

          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleAvatar} />

          <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: '#999077', letterSpacing: '0.05em' }}>
            TAP TO CHANGE PHOTO
          </p>
        </div>

        {/* Form fields — glass card */}
        <div
          className="rounded-2xl p-5 space-y-5"
          style={{
            background: 'rgba(255,255,255,0.03)',
            backdropFilter: 'blur(12px)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderTop: '1px solid rgba(255,215,0,0.1)',
          }}
        >
          <GlassInput
            label="Display Name"
            value={displayName}
            onChange={setDisplayName}
            placeholder="Your name"
          />
          <GlassInput
            label="Username"
            value={username}
            onChange={setUsername}
            placeholder="@handle"
          />
          <GlassInput
            label="Bio"
            value={bio}
            onChange={setBio}
            placeholder="Tell the community about yourself…"
            multiline
          />
        </div>

        {/* Social links — glass card */}
        <div
          className="rounded-2xl p-5 space-y-5"
          style={{
            background: 'rgba(255,255,255,0.03)',
            backdropFilter: 'blur(12px)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderTop: '1px solid rgba(0,238,252,0.1)',
          }}
        >
          <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, fontWeight: 500, letterSpacing: '0.1em', color: '#999077', textTransform: 'uppercase' }}>
            Social Links
          </p>
          <GlassInput
            label="Twitter / X"
            value={twitter}
            onChange={setTwitter}
            placeholder="@username"
          />
          <GlassInput
            label="Website"
            value={website}
            onChange={setWebsite}
            placeholder="https://yoursite.com"
            type="url"
          />
        </div>

        {/* Bottom save button */}
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={handleSave}
          disabled={saving || saved}
          className="w-full py-4 rounded-2xl font-bold text-[15px] transition-all disabled:opacity-50"
          style={{
            background: 'linear-gradient(135deg, #ffd700, #ffe16d)',
            color: '#000',
            fontFamily: 'Sora, sans-serif',
            boxShadow: '0 0 28px rgba(255,215,0,0.3)',
          }}
          onMouseEnter={e => e.currentTarget.style.boxShadow = '0 0 40px rgba(255,215,0,0.5)'}
          onMouseLeave={e => e.currentTarget.style.boxShadow = '0 0 28px rgba(255,215,0,0.3)'}
        >
          {saving ? 'Saving…' : saved ? '✓ Saved!' : 'Save Changes'}
        </motion.button>

      </div>
    </div>
  );
}
