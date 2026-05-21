import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { currentUser } from '../data/mockData'

export default function EditProfile() {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    name: currentUser.name,
    bio: currentUser.bio,
    website: currentUser.website,
    twitter: currentUser.twitter,
    farcaster: currentUser.farcaster,
  })

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSave = () => {
    console.log('save profile', form)
    navigate('/profile')
  }

  return (
    <div className="flex-1 lg:ml-[300px] w-full max-w-2xl flex flex-col gap-4 lg:gap-8">
      <section className="bg-surface-container border border-on-background/10 lg:neo-border lg:neo-shadow p-4 lg:p-8">
        <h1 className="text-[1.4rem] lg:text-display-lg-mobile font-extrabold uppercase leading-none mb-5 lg:mb-8">Edit Profile</h1>
        <div className="flex flex-col gap-4 lg:gap-6">
          {/* Avatar */}
          <div className="flex items-center gap-4 lg:gap-6">
            <div className="w-16 h-16 lg:w-24 lg:h-24 border border-on-background/15 lg:neo-border overflow-hidden">
              <img src={currentUser.avatar} alt="Avatar" className="w-full h-full object-cover" />
            </div>
            <button className="px-4 lg:px-6 py-1.5 lg:py-2 border border-on-background/15 lg:neo-border font-bold text-[11px] lg:text-[12px] uppercase bg-background hover:bg-primary-container/10 transition-colors">
              Change Photo
            </button>
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
                  className="w-full border border-on-background/15 lg:neo-border bg-background p-2 lg:p-3 text-sm lg:text-body-md focus:outline-none resize-none"
                />
              ) : (
                <input
                  type="text"
                  name={field.name}
                  value={form[field.name]}
                  onChange={handleChange}
                  placeholder={field.placeholder}
                  className="w-full border border-on-background/15 lg:neo-border bg-background p-2 lg:p-3 text-sm lg:text-body-md focus:outline-none"
                />
              )}
            </div>
          ))}

          <div className="flex gap-3 lg:gap-4 pt-3 lg:pt-4">
            <button
              onClick={handleSave}
              className="flex-1 py-3 lg:py-4 bg-primary-container text-on-primary-fixed font-bold border border-on-background/20 lg:neo-border lg:neo-shadow uppercase text-sm lg:text-headline-md active:translate-y-1 active:shadow-none transition-all"
            >
              Save Changes
            </button>
            <button
              onClick={() => navigate('/profile')}
              className="px-5 lg:px-8 py-3 lg:py-4 bg-background font-bold border border-on-background/15 lg:neo-border uppercase text-sm hover:bg-surface-container transition-colors"
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
