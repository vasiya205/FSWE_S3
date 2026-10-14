import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { fetchProtectedJson } from '../services/api'

const emptyProfile = {
  qualification: '',
  subject: '',
  location: '',
  experienceYears: '',
  bio: '',
  hourlyRate: '',
}

export default function TutorProfilePage() {
  const { user, token } = useAuth()
  const [form, setForm] = useState(emptyProfile)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  useEffect(() => {
    let active = true

    fetchProtectedJson('/api/tutors/me', token)
      .then((profile) => {
        if (!active) return
        setForm({
          qualification: profile.qualification,
          subject: profile.subject,
          location: profile.location,
          experienceYears: String(profile.experienceYears),
          bio: profile.bio,
          hourlyRate: String(profile.hourlyRate),
        })
      })
      .catch((loadError) => {
        if (!active) return
        if (loadError.status !== 404) {
          setError(loadError.message || 'Unable to load your tutor profile.')
        }
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [token])

  const handleChange = (event) => {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setMessage('')
    setSaving(true)

    try {
      const profile = await fetchProtectedJson('/api/tutors/profile', token, {
        method: 'POST',
        body: JSON.stringify({
          userId: user.id,
          qualification: form.qualification,
          subject: form.subject,
          location: form.location,
          experienceYears: Number(form.experienceYears),
          bio: form.bio,
          hourlyRate: Number(form.hourlyRate),
        }),
      })
      setForm({
        qualification: profile.qualification,
        subject: profile.subject,
        location: profile.location,
        experienceYears: String(profile.experienceYears),
        bio: profile.bio,
        hourlyRate: String(profile.hourlyRate),
      })
      setMessage('Tutor profile saved. Students can now find you in tutor search.')
    } catch (saveError) {
      setError(saveError.message || 'Unable to save your tutor profile.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="page"><p>Loading your tutor profile...</p></div>

  return (
    <div className="page">
      <div className="panel profile-panel">
        <p className="eyebrow">Tutor profile</p>
        <h2>Introduce yourself to students</h2>
        <p>Add your details so students can discover and book lessons with you.</p>

        {error && <p className="error-msg" role="alert">{error}</p>}
        {message && <p className="success-msg" role="status">{message}</p>}

        <form className="profile-form" onSubmit={handleSubmit}>
          <label>
            Qualification
            <input name="qualification" value={form.qualification} onChange={handleChange} required maxLength="255" />
          </label>
          <label>
            Subject taught
            <input name="subject" value={form.subject} onChange={handleChange} required maxLength="255" />
          </label>
          <label>
            Location
            <input name="location" value={form.location} onChange={handleChange} required maxLength="255" />
          </label>
          <label>
            Years of experience
            <input name="experienceYears" type="number" min="0" step="1" value={form.experienceYears} onChange={handleChange} required />
          </label>
          <label>
            Hourly rate (₹)
            <input name="hourlyRate" type="number" min="0" step="0.01" value={form.hourlyRate} onChange={handleChange} required />
          </label>
          <label className="profile-bio">
            About you
            <textarea name="bio" value={form.bio} onChange={handleChange} required rows="4" />
          </label>
          <button className="primary-btn" type="submit" disabled={saving}>
            {saving ? 'Saving...' : 'Save tutor profile'}
          </button>
        </form>
      </div>
    </div>
  )
}
