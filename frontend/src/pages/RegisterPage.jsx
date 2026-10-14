import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function RegisterPage() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ fullName: '', email: '', password: '', role: 'STUDENT' })
  const [error, setError] = useState('')

  const handleChange = (event) => {
    setForm({ ...form, [event.target.name]: event.target.value })
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    try {
      await register(form.fullName, form.email, form.password, form.role)
      navigate('/dashboard')
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <div className="page auth-page">
      <form className="auth-card" onSubmit={handleSubmit}>
        <h2>Create account</h2>
        <label>
          Full name
          <input name="fullName" value={form.fullName} onChange={handleChange} required />
        </label>
        <label>
          Email
          <input name="email" type="email" value={form.email} onChange={handleChange} required />
        </label>
        <label>
          Password
          <input name="password" type="password" value={form.password} onChange={handleChange} required />
        </label>
        <label>
          Account type
          <select name="role" value={form.role} onChange={handleChange}>
            <option value="STUDENT">Student</option>
            <option value="TUTOR">Tutor</option>
          </select>
        </label>
        {error && <p className="error-msg">{error}</p>}
        <button className="primary-btn" type="submit">Register</button>
        <p className="toggle-text">
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </form>
    </div>
  )
}
