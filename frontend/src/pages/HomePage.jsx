import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function HomePage() {
  const { user } = useAuth()

  return (
    <div className="page home-page">
      <section className="hero">
        <div>
          <span className="eyebrow">Find trusted coaching near you</span>
          <h1>Home Tutor Finder</h1>
          <p>
            Connect students with qualified tutors for Maths, Science, Programming, and more.
          </p>
          <div className="cta-row">
            <Link className="primary-btn" to="/tutors">Browse tutors</Link>
            {!user ? (
              <Link className="secondary-btn" to="/login">Login</Link>
            ) : (
              <Link className="secondary-btn" to="/dashboard">Dashboard</Link>
            )}
          </div>
        </div>
      </section>

      <section className="feature-grid">
        <div className="feature-card">
          <h3>Subject-based matching</h3>
          <p>Search tutors by subject, location, experience and hourly rate.</p>
        </div>
        <div className="feature-card">
          <h3>Safe booking flow</h3>
          <p>Students can request slots and tutors can accept or reject bookings.</p>
        </div>
        <div className="feature-card">
          <h3>Role-specific dashboard</h3>
          <p>Students, tutors and admins have dedicated views and actions.</p>
        </div>
      </section>
    </div>
  )
}
