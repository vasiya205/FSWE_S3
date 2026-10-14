import { BrowserRouter, Link, Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import DashboardPage from './pages/DashboardPage'
import TutorListPage from './pages/TutorListPage'
import TutorDetailPage from './pages/TutorDetailPage'
import TutorProfilePage from './pages/TutorProfilePage'
import AdminDashboardPage from './pages/AdminDashboardPage'

function AppShell() {
  const { user } = useAuth()

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="brand">Home Tutor Finder</div>
        <nav>
          <Link to="/">Home</Link>
          <Link to="/tutors">Tutors</Link>
          {user ? (
            <>
              {user.role === 'TUTOR' && <Link to="/tutor-profile">Tutor profile</Link>}
              <Link to="/dashboard">Dashboard</Link>
            </>
          ) : (
            <>
              <Link to="/login">Login</Link>
              <Link to="/register">Register</Link>
            </>
          )}
        </nav>
      </header>

      <main>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/tutors" element={<TutorListPage />} />
          <Route path="/tutors/:id" element={<TutorDetailPage />} />
          <Route
            path="/tutor-profile"
            element={user?.role === 'TUTOR' ? <TutorProfilePage /> : <Navigate to="/dashboard" replace />}
          />
          <Route
            path="/dashboard"
            element={user ? (user.role === 'ADMIN' ? <AdminDashboardPage /> : <DashboardPage />) : <Navigate to="/login" replace />}
          />
        </Routes>
      </main>
    </div>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppShell />
      </BrowserRouter>
    </AuthProvider>
  )
}
