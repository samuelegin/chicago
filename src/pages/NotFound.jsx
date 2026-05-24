import { useNavigate } from 'react-router-dom'

export default function NotFound() {
  const navigate = useNavigate()
  return (
    <div className="min-h-screen bg-surface flex items-center justify-center p-6">
      <div
        className="w-full max-w-md bg-surface border-4 border-on-background p-10 flex flex-col items-center gap-6 text-center"
        style={{ boxShadow: '8px 8px 0px 0px var(--neo-border-color)' }}
      >
        <div
          className="w-20 h-20 bg-primary-container border-4 border-on-background flex items-center justify-center"
          style={{ boxShadow: '4px 4px 0px 0px #d4af37' }}
        >
          <span className="font-extrabold text-[32px] text-on-primary-fixed">404</span>
        </div>
        <div>
          <h1 className="font-extrabold text-[28px] uppercase tracking-tight leading-none">Page Not Found</h1>
          <p className="text-on-surface-variant text-sm mt-2">That page doesn't exist or was moved.</p>
        </div>
        <div className="flex gap-3 w-full">
          <button
            onClick={() => navigate(-1)}
            className="flex-1 py-3 border-4 border-on-background font-bold text-[12px] uppercase tracking-widest hover:bg-surface-container transition-colors"
            style={{ boxShadow: '3px 3px 0px 0px var(--neo-border-color)' }}
          >
            Go Back
          </button>
          <button
            onClick={() => navigate('/')}
            className="flex-1 py-3 bg-primary-container text-on-primary-fixed border-4 border-on-background font-bold text-[12px] uppercase tracking-widest hover:brightness-105 transition-all"
            style={{ boxShadow: '3px 3px 0px 0px var(--neo-border-color)' }}
          >
            Home
          </button>
        </div>
      </div>
    </div>
  )
}
