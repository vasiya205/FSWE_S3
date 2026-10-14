import { useCallback, useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { fetchProtectedJson } from '../services/api'

export default function AdminDashboardPage() {
  const { user, token, logout } = useAuth()
  const [users, setUsers] = useState([])
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [updatingKey, setUpdatingKey] = useState('')

  const loadData = useCallback(async () => {
    setError('')
    setLoading(true)
    try {
      const [loadedUsers, loadedBookings] = await Promise.all([
        fetchProtectedJson('/api/auth/admin/users', token),
        fetchProtectedJson('/api/admin/bookings', token),
      ])
      setUsers(loadedUsers)
      setBookings(loadedBookings)
    } catch (loadError) {
      setError(loadError.message || 'Unable to load administration data.')
    } finally {
      setLoading(false)
    }
  }, [token])

  useEffect(() => {
    loadData()
  }, [loadData])

  const updateUserEnabled = async (targetUser) => {
    const key = `user-${targetUser.id}`
    setUpdatingKey(key)
    setError('')
    try {
      const updatedUser = await fetchProtectedJson(`/api/auth/admin/users/${targetUser.id}/enabled`, token, {
        method: 'PATCH',
        body: JSON.stringify({ enabled: !targetUser.enabled }),
      })
      setUsers((current) => current.map((item) => item.id === updatedUser.id ? updatedUser : item))
    } catch (actionError) {
      setError(actionError.message || 'Unable to update account.')
    } finally {
      setUpdatingKey('')
    }
  }

  const cancelBooking = async (booking) => {
    const key = `booking-${booking.id}`
    setUpdatingKey(key)
    setError('')
    try {
      const updatedBooking = await fetchProtectedJson(`/api/admin/bookings/${booking.id}/cancel`, token, {
        method: 'PATCH',
      })
      setBookings((current) => current.map((item) => item.id === updatedBooking.id ? updatedBooking : item))
    } catch (actionError) {
      setError(actionError.message || 'Unable to cancel booking.')
    } finally {
      setUpdatingKey('')
    }
  }

  if (loading) return <div className="page"><p>Loading admin dashboard...</p></div>

  return (
    <div className="page admin-dashboard">
      <div className="dashboard-header">
        <div>
          <p className="eyebrow">Administration</p>
          <h2>Welcome, {user.fullName}</h2>
          <p>Manage registered accounts and review booking activity.</p>
        </div>
        <div className="admin-header-actions">
          <button className="secondary-btn" onClick={loadData} type="button">Refresh</button>
          <button className="secondary-btn" onClick={logout} type="button">Logout</button>
        </div>
      </div>

      {error && <p className="error-msg" role="alert">{error}</p>}

      <section className="panel full-width-panel">
        <h3>Users ({users.length})</h3>
        {users.length === 0 ? <p>No user accounts found.</p> : (
          <div className="admin-list">
            {users.map((account) => (
              <div className="admin-row" key={account.id}>
                <div>
                  <strong>{account.fullName}</strong>
                  <p>{account.email} · {account.role}</p>
                  <span className={`account-state ${account.enabled ? 'account-enabled' : 'account-disabled'}`}>
                    {account.enabled ? 'Enabled' : 'Disabled'}
                  </span>
                </div>
                {account.id !== user.id && (
                  <button
                    className={account.enabled ? 'secondary-btn booking-action-btn' : 'primary-btn booking-action-btn'}
                    type="button"
                    disabled={updatingKey === `user-${account.id}`}
                    onClick={() => updateUserEnabled(account)}
                  >
                    {updatingKey === `user-${account.id}` ? 'Updating...' : account.enabled ? 'Disable account' : 'Enable account'}
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="panel full-width-panel">
        <h3>Bookings ({bookings.length})</h3>
        {bookings.length === 0 ? <p>No bookings found.</p> : (
          <div className="admin-list">
            {bookings.map((booking) => (
              <div className="admin-row" key={booking.id}>
                <div>
                  <strong>{booking.subject}</strong>
                  <p>
                    Student #{booking.studentUserId} · Tutor #{booking.tutorUserId}
                  </p>
                  <p>
                    {new Date(booking.startDateTime).toLocaleString()} - {new Date(booking.endDateTime).toLocaleString()}
                  </p>
                  <span className="status-badge">{booking.status}</span>
                </div>
                {(booking.status === 'PENDING' || booking.status === 'ACCEPTED') && (
                  <button
                    className="secondary-btn booking-action-btn"
                    type="button"
                    disabled={updatingKey === `booking-${booking.id}`}
                    onClick={() => cancelBooking(booking)}
                  >
                    {updatingKey === `booking-${booking.id}` ? 'Cancelling...' : 'Cancel booking'}
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
