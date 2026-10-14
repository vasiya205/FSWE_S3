import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { fetchProtectedJson, fetchTutors } from '../services/api'

export default function DashboardPage() {
  const { user, token, logout } = useAuth()
  const [tutors, setTutors] = useState([])
  const [bookings, setBookings] = useState([])
  const [error, setError] = useState('')
  const [bookingActionError, setBookingActionError] = useState('')
  const [updatingBookingId, setUpdatingBookingId] = useState(null)

  useEffect(() => {
    if (!user) return
    fetchTutors()
      .then((profiles) => setTutors(
        user.role === 'TUTOR'
          ? profiles.filter((profile) => profile.userId !== user.id)
          : profiles
      ))
      .catch(() => setError('Unable to load tutor matches'))
    if (user.role === 'STUDENT') {
      fetchProtectedJson('/api/bookings/my', token)
        .then(setBookings)
        .catch(() => setError('Unable to load your bookings'))
    }
    if (user.role === 'TUTOR') {
      fetchProtectedJson('/api/bookings/incoming', token)
        .then(setBookings)
        .catch(() => setError('Unable to load incoming bookings'))
    }
  }, [user, token])

  if (!user) {
    return <div className="page empty-page"><p>Please login to access your dashboard.</p></div>
  }

  const roleTitle = user.role === 'STUDENT' ? 'Student dashboard' : user.role === 'TUTOR' ? 'Tutor dashboard' : 'Admin dashboard'

  const updateBookingStatus = async (bookingId, status) => {
    setBookingActionError('')
    setUpdatingBookingId(bookingId)
    try {
      const updatedBooking = await fetchProtectedJson(`/api/bookings/${bookingId}/status`, token, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      })
      setBookings((currentBookings) =>
        currentBookings.map((booking) => booking.id === bookingId ? updatedBooking : booking)
      )
    } catch (actionError) {
      setBookingActionError(actionError.message || 'Unable to update booking status.')
    } finally {
      setUpdatingBookingId(null)
    }
  }

  return (
    <div className="page">
      <div className="dashboard-header">
        <div>
          <p className="eyebrow">Welcome back</p>
          <h2>{user.fullName}</h2>
          <p>{roleTitle}</p>
        </div>
        <button className="secondary-btn" onClick={logout}>Logout</button>
      </div>

      {error && <p className="error-msg">{error}</p>}

      <div className="dashboard-panels">
        <div className="panel">
          <h3>Quick actions</h3>
          <ul className="quick-actions">
            <li><Link to="/tutors">Search tutors</Link></li>
            {user.role === 'TUTOR' && <li><Link to="/tutor-profile">Manage profile</Link></li>}
          </ul>
        </div>

        <div className="panel">
          <h3>{user.role === 'TUTOR' ? 'Other tutors' : 'Suggested tutors'}</h3>
          {tutors.slice(0, 3).map((tutor) => (
            <div className="mini-card" key={tutor.id}>
              <strong>{tutor.qualification}</strong>
              <span>{tutor.subject} · ₹{tutor.hourlyRate}</span>
            </div>
          ))}
          {tutors.length === 0 && <p>No other tutor profiles yet.</p>}
        </div>
      </div>

      <div className="panel full-width-panel">
        <h3>{user.role === 'STUDENT' ? 'Your bookings' : 'Incoming bookings'}</h3>
        {bookingActionError && <p className="error-msg" role="alert">{bookingActionError}</p>}
        {bookings.length === 0 ? <p>No bookings yet.</p> : bookings.map((booking) => (
          <div className="booking-row" key={booking.id}>
            <div>
              <strong>{booking.subject}</strong>
              <p>{new Date(booking.startDateTime).toLocaleString()} - {new Date(booking.endDateTime).toLocaleString()}</p>
              {user.role === 'TUTOR' && <p>{booking.notes}</p>}
            </div>
            <div className="booking-actions">
              <span className="status-badge">{booking.status}</span>
              {user.role === 'TUTOR' && booking.status === 'PENDING' && (
                <>
                  <button
                    className="primary-btn booking-action-btn"
                    type="button"
                    disabled={updatingBookingId === booking.id}
                    onClick={() => updateBookingStatus(booking.id, 'ACCEPTED')}
                  >
                    {updatingBookingId === booking.id ? 'Updating...' : 'Accept'}
                  </button>
                  <button
                    className="secondary-btn booking-action-btn"
                    type="button"
                    disabled={updatingBookingId === booking.id}
                    onClick={() => updateBookingStatus(booking.id, 'REJECTED')}
                  >
                    Reject
                  </button>
                </>
              )}
              {user.role === 'STUDENT' && booking.status === 'PENDING' && (
                <button
                  className="secondary-btn booking-action-btn"
                  type="button"
                  disabled={updatingBookingId === booking.id}
                  onClick={() => updateBookingStatus(booking.id, 'CANCELLED')}
                >
                  {updatingBookingId === booking.id ? 'Cancelling...' : 'Cancel'}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
