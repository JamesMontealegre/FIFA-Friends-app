import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { UserAvatar } from '../auth/UserAvatar'
import clsx from 'clsx'
import { useState } from 'react'

const NAV_LINKS = [
  { to: '/', label: 'Inicio' },
  { to: '/teams', label: 'Selecciones' },
  { to: '/tournaments', label: 'Torneos' },
  { to: '/palmares', label: 'Palmares' },
]

export function Navbar() {
  const { user } = useAuth()
  const { pathname } = useLocation()
  const [mobileOpen, setMobileOpen] = useState(false)

  if (!user) return null

  return (
    <nav className="bg-surface-light border-b border-neon/20 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-14">
          <Link to="/" className="font-bold text-lg text-neon neon-text">
            FIFA Friends
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={clsx(
                  'px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                  pathname === link.to
                    ? 'bg-neon/15 text-neon'
                    : 'text-gray-400 hover:bg-white/5 hover:text-gray-200',
                )}
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <UserAvatar />
            {/* Mobile hamburger */}
            <button
              className="md:hidden p-2 text-gray-400 hover:bg-white/10 rounded-lg"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {mobileOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile nav */}
        {mobileOpen && (
          <div className="md:hidden pb-3 border-t border-white/10">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setMobileOpen(false)}
                className={clsx(
                  'block px-3 py-2 rounded-lg text-sm font-medium mt-1',
                  pathname === link.to
                    ? 'bg-neon/15 text-neon'
                    : 'text-gray-400 hover:bg-white/5',
                )}
              >
                {link.label}
              </Link>
            ))}
          </div>
        )}
      </div>
    </nav>
  )
}
