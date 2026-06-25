import { useState, useRef, useEffect } from 'react'
import { useAuth } from '../../hooks/useAuth'

export function UserAvatar() {
  const { userDoc, isAdmin, signOut } = useAuth()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  if (!userDoc) return null

  return (
    <div className="flex items-center gap-2">
      {/* Avatar + dropdown */}
      <div className="relative" ref={ref}>
        <button
          onClick={() => setOpen(!open)}
          className="flex items-center gap-2 rounded-full hover:ring-2 ring-neon/50 transition-all"
        >
          {userDoc.photoURL ? (
            <img src={userDoc.photoURL} alt="" className="w-8 h-8 rounded-full border border-neon/30" referrerPolicy="no-referrer" />
          ) : (
            <div className="w-8 h-8 rounded-full bg-neon/20 text-neon flex items-center justify-center text-sm font-medium">
              {userDoc.displayName?.[0] ?? '?'}
            </div>
          )}
        </button>

        {open && (
          <div className="absolute right-0 mt-2 w-60 rounded-lg bg-surface-light shadow-lg shadow-black/50 border border-neon/20 py-2 z-50">
            <div className="px-4 py-2 border-b border-white/10">
              <p className="font-medium text-sm text-gray-200 truncate">{userDoc.displayName}</p>
              <p className="text-xs text-gray-500 truncate">{userDoc.email}</p>
              <div className="flex gap-1.5 mt-1.5">
                {isAdmin && (
                  <span className="inline-block px-2 py-0.5 text-[10px] bg-neon/20 text-neon rounded-full font-bold uppercase tracking-wide">
                    Admin
                  </span>
                )}
                <span className={`inline-block px-2 py-0.5 text-[10px] rounded-full font-bold uppercase tracking-wide ${
                  userDoc.tier === 'pro'
                    ? 'bg-primary/20 text-primary-light'
                    : 'bg-amber-500/20 text-amber-400'
                }`}>
                  {userDoc.tier === 'pro' ? 'PRO' : '5\u2605 ONLY'}
                </span>
              </div>
            </div>
            <button
              onClick={signOut}
              className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-red-500/10 transition-colors"
            >
              Cerrar sesion
            </button>
          </div>
        )}
      </div>

      {/* Always-visible logout button */}
      <button
        onClick={signOut}
        title="Cerrar sesion"
        className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
        </svg>
      </button>
    </div>
  )
}
