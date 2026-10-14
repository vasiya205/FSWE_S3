import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { fetchProtectedJson, fetchTutors } from '../services/api'

function loadRazorpayCheckout() {
  if (window.Razorpay) return Promise.resolve()
  return new Promise((resolve, reject) => {
    const script = document.createElement('script')
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.onload = () => resolve()
    script.onerror = () => reject(new Error('Unable to load the secure Razorpay checkout. Check your internet connection.'))
    document.body.appendChild(script)
  })
}

export default function DashboardPage() {
  const { user, token, logout } = useAuth()
  const [tutors, setTutors] = useState([])
  const [bookings, setBookings] = useState([])
  const [error, setError] = useState('')
  const [bookingActionError, setBookingActionError] = useState('')
  const [updatingBookingId, setUpdatingBookingId] = useState(null)
  const [payingBookingId, setPayingBookingId] = useState(null)
  const [paymentMessages, setPaymentMessages] = useState({})

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

  const payForBooking = async (booking) => {
    setBookingActionError('')
    setPaymentMessages((current) => ({ ...current, [booking.id]: '' }))
    setPayingBookingId(booking.id)
    try {
      await loadRazorpayCheckout()
      const order = await fetchProtectedJson(`/api/bookings/${booking.id}/payments/order`, token, {
        method: 'POST',
        body: JSON.stringify({}),
      })
      const checkout = new window.Razorpay({
        key: order.keyId,
        amount: order.amount,
        currency: order.currency,
        name: 'Home Tutor Finder',
        description: `${booking.subject} lesson`,
        order_id: order.orderId,
        prefill: { name: user.fullName, email: user.email || '' },
        notes: { bookingId: String(booking.id) },
        theme: { color: '#76527d' },
        handler: async (result) => {
          try {
            const payment = await fetchProtectedJson(`/api/bookings/${booking.id}/payments/verify`, token, {
              method: 'POST',
              body: JSON.stringify({
                orderId: result.razorpay_order_id,
                paymentId: result.razorpay_payment_id,
                signature: result.razorpay_signature,
              }),
            })
            setBookings((current) => current.map((item) => item.id === booking.id
              ? { ...item, paymentStatus: payment.paymentStatus, paymentReference: payment.paymentId }
              : item))
          } catch (paymentError) {
            setBookingActionError(paymentError.message || 'Payment verification failed. Contact the project administrator.')
          } finally {
            setPayingBookingId(null)
          }
        },
        modal: {
          ondismiss: () => setPayingBookingId(null),
        },
      })
      checkout.on('payment.failed', () => {
        setPaymentMessages((current) => ({
          ...current,
          [booking.id]: 'Test payment was not completed. You can try again.',
        }))
        setPayingBookingId(null)
      })
      checkout.open()
    } catch (paymentError) {
      setBookingActionError(paymentError.message || 'Unable to start test payment.')
      setPayingBookingId(null)
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
              {booking.totalAmount != null && <p>Lesson fee: ₹{booking.totalAmount}</p>}
              {user.role === 'TUTOR' && <p>{booking.notes}</p>}
              {booking.paymentStatus === 'PAID' && (
                <>
                  <p className="payment-confirmation">
                    {user.role === 'TUTOR' ? 'Student payment confirmed' : 'Payment successful'} (TEST) — no real money was charged or transferred.
                  </p>
                  {booking.paymentReference && <p>Test payment reference: {booking.paymentReference}</p>}
                </>
              )}
              {paymentMessages[booking.id] && <p className="payment-confirmation" role="status">{paymentMessages[booking.id]}</p>}
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
              {user.role === 'STUDENT' && booking.status === 'ACCEPTED' && booking.paymentStatus !== 'PAID' && Number(booking.totalAmount) > 0 && (
                <button
                  className="primary-btn booking-action-btn"
                  type="button"
                  disabled={payingBookingId === booking.id}
                  onClick={() => payForBooking(booking)}
                >
                  {payingBookingId === booking.id ? 'Opening secure checkout...' : `Pay ₹${booking.totalAmount} (test)`}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
