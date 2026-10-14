import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { fetchProtectedJson, fetchTutorById } from '../services/api'

export default function TutorDetailPage() {
  const { id } = useParams()
  const { user, token } = useAuth()
  const navigate = useNavigate()
  const [tutor, setTutor] = useState(null)
  const [booking, setBooking] = useState({ subject: '', startDateTime: '', endDateTime: '', notes: '', hourlyRate: '' })
  const [message, setMessage] = useState('')

  useEffect(() => {
    fetchTutorById(id).then(setTutor)
  }, [id])

  if (!tutor) return <div className="page"><p>Loading profile...</p></div>

  const handleBook = async (event) => {
    event.preventDefault()
    if (!user || user.role !== 'STUDENT') {
      navigate('/login')
      return
    }

    try {
      await fetchProtectedJson('/api/bookings', token, {
        method: 'POST',
        body: JSON.stringify({
          tutorUserId: tutor.userId,
          subject: booking.subject || tutor.subject,
          startDateTime: booking.startDateTime,
          endDateTime: booking.endDateTime,
          notes: booking.notes || 'Requested lesson',
        }),
      })
      setMessage('Booking request sent successfully.')
    } catch (err) {
      setMessage(err.message)
    }
  }

  return (
    <div className="page tutor-detail-page">
      <div className="card detail-card">
        <h2>{tutor.subject}</h2>
        <p><strong>Qualification:</strong> {tutor.qualification}</p>
        <p><strong>Location:</strong> {tutor.location}</p>
        <p><strong>Experience:</strong> {tutor.experienceYears} years</p>
        <p><strong>Rate:</strong> ₹{tutor.hourlyRate}/hour</p>
        <p>{tutor.bio}</p>
      </div>

      <form className="card booking-form" onSubmit={handleBook}>
        <h3>Request a lesson</h3>
        <label>
          Subject
          <input name="subject" value={booking.subject} onChange={(e) => setBooking({ ...booking, subject: e.target.value })} placeholder={tutor.subject} />
        </label>
        <label>
          Start time
          <input type="datetime-local" value={booking.startDateTime} onChange={(e) => setBooking({ ...booking, startDateTime: e.target.value })} />
        </label>
        <label>
          End time
          <input type="datetime-local" value={booking.endDateTime} onChange={(e) => setBooking({ ...booking, endDateTime: e.target.value })} />
        </label>
        <label>
          Notes
          <textarea value={booking.notes} onChange={(e) => setBooking({ ...booking, notes: e.target.value })} rows="3" />
        </label>
        <button className="primary-btn" type="submit">Send booking request</button>
        {message && <p className="success-msg">{message}</p>}
      </form>
    </div>
  )
}
