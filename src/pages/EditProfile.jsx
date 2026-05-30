import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getCurrentUser, updateProfile } from '../services/api'

export default function EditProfile() {
  const navigate = useNavigate()
  const { user: authUser } = useAuth()
  const [form, setForm] = useState({
    name: '',
    bio: '',
    website: '',
    twitter: '',
    farcaster: '',
  })
  const [avatarPreview, setAvatarPreview] = useState('')
  const [originalAvatar, setOriginalAvatar] = useState('')
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState('')
  const fileInputRef = useRef(null)

  useEffect(() => {
    getCurrentUser().then(u => {
      setForm({ name: u.name || '', bio: u.bio || '', website: u.website || '', twitter: u.twitter || '', farcaster: u.farcaster || '' })
      setAvatarPreview(u.avatar || '')
      setOriginalAvatar(u.avatar || '')
    }).catch(() => {
      if (authUser) {
        setForm({ name: authUser.name || '', bio: '', website: '', twitter: '', farcaster: '' })
        setAvatarPreview(authUser.avatar || '')
        setOriginalAvatar(authUser.avatar || '')
      }
    })
  }, [authUser])

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => setAvatarPreview(ev.target.result) // base64 data URI
    reader.readAsDataURL(file)
    e.target.value = ''
  }

  const handleSave = async () => {
    setSaving(true)
    setSaveError('')
    try {
      await updateProfile({ ...form, avatar: avatarPreview })
      navigate('/profile')
    } catch (err) {
      setSaveError(err.message || 'Failed to save. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="flex-1 lg:ml-[300px] w-full max-w-2xl flex flex-col gap-4 lg:gap-8">
      <section className="bg-surface-container border border-on-background/10 lg:neo-border lg:neo-shadow p-4 lg:p-8 rounded-lg">
        <h1 className="text-[1.4rem] lg:text-display-lg-mobile font-extrabold uppercase leading-none mb-5 lg:mb-8">Edit Profile</h1>
        <div className="flex flex-col gap-4 lg:gap-6">

          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handlePhotoChange}
          />

          {/* Avatar row */}
          <div className="flex items-center gap-4 lg:gap-6">
            {/* Clickable avatar with camera overlay */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="relative group w-16 h-16 lg:w-24 lg:h-24 border border-on-background/15 lg:neo-border overflow-hidden shrink-0 focus:outline-none rounded-lg"
            >
              <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/55 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="material-symbols-outlined text-white text-[18px] lg:text-[22px]">photo_camera</span>
                <span className="text-white text-[8px] lg:text-[9px] font-bold uppercase mt-0.5">Change</span>
              </div>
            </button>

            <div className="flex flex-col gap-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-4 lg:px-6 py-1.5 lg:py-2 border border-on-background/15 lg:neo-border font-bold text-[11px] lg:text-[12px] uppercase bg-background hover:bg-primary-container/10 transition-colors rounded"
              >
                Change Photo
              </button>
              {avatarPreview !== originalAvatar && (
                <button
                  type="button"
                  onClick={() => setAvatarPreview(originalAvatar)}
                  className="text-[10px] text-on-surface-variant hover:text-error transition-colors underline self-start"
                >
                  Remove new photo
                </button>
              )}
              <p className="text-[9px] lg:text-[10px] text-on-surface-variant">JPG, PNG, GIF or WEBP</p>
            </div>
          </div>

          {[
            { label: 'Display Name', name: 'name', placeholder: 'Enter your name', type: 'text' },
            { label: 'Bio', name: 'bio', placeholder: 'Tell the Chicago hub about your Web3 journey...', type: 'textarea' },
            { label: 'Website', name: 'website', placeholder: 'Website URL', type: 'text' },
            { label: 'Twitter / X', name: 'twitter', placeholder: 'Twitter/X', type: 'text' },
            { label: 'Farcaster', name: 'farcaster', placeholder: 'Farcaster', type: 'text' },
          ].map((field) => (
            <div key={field.name}>
              <label className="block text-[10px] lg:text-[12px] uppercase font-bold text-on-surface-variant mb-1 lg:mb-2">
                {field.label}
              </label>
              {field.type === 'textarea' ? (
                <textarea
                  name={field.name}
                  value={form[field.name]}
                  onChange={handleChange}
                  placeholder={field.placeholder}
                  rows={3}
                  className="w-full border border-on-background/15 lg:neo-border bg-background p-2 lg:p-3 text-sm lg:text-body-md focus:outline-none resize-none rounded-lg"
                />
              ) : (
                <input
                  type="text"
                  name={field.name}
                  value={form[field.name]}
                  onChange={handleChange}
                  placeholder={field.placeholder}
                  className="w-full border border-on-background/15 lg:neo-border bg-background p-2 lg:p-3 text-sm lg:text-body-md focus:outline-none rounded-lg"
                />
              )}
            </div>
          ))}

          {saveError && (
            <div className="flex items-center gap-2 border border-error bg-error-container text-on-error-container px-4 py-3 rounded-lg">
              <span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>error</span>
              <p className="font-bold text-[12px]">{saveError}</p>
            </div>
          )}

          <div className="flex gap-3 lg:gap-4 pt-3 lg:pt-4">
            <button
              onClick={handleSave} disabled={saving}
              className="flex-1 py-3 lg:py-4 bg-primary-container text-on-primary-fixed font-bold border border-on-background/20 lg:neo-border lg:neo-shadow uppercase text-sm lg:text-headline-md active:translate-y-1 active:shadow-none transition-all rounded-lg"
            >
              Save Changes
            </button>
            <button
              onClick={() => navigate('/profile')}
              className="px-5 lg:px-8 py-3 lg:py-4 bg-background font-bold border border-on-background/15 lg:neo-border uppercase text-sm hover:bg-surface-container transition-colors rounded-lg"
            >
              Cancel
            </button>
          </div>
        </div>
      </section>
      <div className="h-20 md:h-0" />
    </div>
  )
}
