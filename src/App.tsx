import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './context/AuthContext'
import { Navbar } from './components/layout/Navbar'
import { ProtectedRoute } from './components/auth/ProtectedRoute'

import { LoginPage } from './pages/LoginPage'
import { DashboardPage } from './pages/DashboardPage'
import { TeamsPage } from './pages/TeamsPage'
import { TournamentsPage } from './pages/TournamentsPage'
import { TournamentCreatePage } from './pages/TournamentCreatePage'
import { TournamentDetailPage } from './pages/TournamentDetailPage'
import { MatchDetailPage } from './pages/MatchDetailPage'
import { PalmaresPage } from './pages/PalmaresPage'
import { UserHistoryPage } from './pages/UserHistoryPage'
import { HistorialPage } from './pages/HistorialPage'
import { JoinTournamentPage } from './pages/JoinTournamentPage'
import { NotFoundPage } from './pages/NotFoundPage'

const queryClient = new QueryClient()

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <div className="min-h-screen bg-surface">
            <Navbar />
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
              <Route path="/teams" element={<ProtectedRoute><TeamsPage /></ProtectedRoute>} />
              <Route path="/tournaments" element={<ProtectedRoute><TournamentsPage /></ProtectedRoute>} />
              <Route path="/join" element={<ProtectedRoute><JoinTournamentPage /></ProtectedRoute>} />
              <Route path="/tournaments/new" element={<ProtectedRoute adminOnly><TournamentCreatePage /></ProtectedRoute>} />
              <Route path="/tournaments/:id" element={<ProtectedRoute><TournamentDetailPage /></ProtectedRoute>} />
              <Route path="/tournaments/:id/matches/:matchId" element={<ProtectedRoute><MatchDetailPage /></ProtectedRoute>} />
              <Route path="/palmares" element={<ProtectedRoute><PalmaresPage /></ProtectedRoute>} />
              <Route path="/historial" element={<ProtectedRoute><HistorialPage /></ProtectedRoute>} />
              <Route path="/history/:uid" element={<ProtectedRoute><UserHistoryPage /></ProtectedRoute>} />
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </div>
          <Toaster position="bottom-right" />
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  )
}
