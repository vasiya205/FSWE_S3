import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { fetchTutors } from '../services/api'

const studyResources = [
  {
    title: 'Python Crash Course',
    author: 'Eric Matthes',
    subject: 'Programming',
    keywords: ['python', 'programming', 'computer science', 'machine learning', 'coding'],
    description: 'A hands-on introduction to Python fundamentals and practical projects.',
    cover: 'python',
    resourceUrl: 'https://nostarch.com/python-crash-course-3rd-edition',
    resourceLinkLabel: 'View book',
    accessLabel: 'Publisher page',
  },
  {
    title: 'Automate the Boring Stuff with Python',
    author: 'Al Sweigart',
    subject: 'Programming',
    keywords: ['python', 'programming', 'computer science', 'coding'],
    description: 'Practical Python examples for building useful everyday programs.',
    cover: 'automation',
    resourceUrl: 'https://automatetheboringstuff.com/',
    resourceLinkLabel: 'Read online',
    accessLabel: 'Free online book',
  },
  {
    title: 'University Physics, Volume 1',
    author: 'OpenStax',
    subject: 'Physics',
    keywords: ['physics', 'science', 'jee', 'mechanics'],
    description: 'An open textbook covering mechanics, waves, and related foundations.',
    cover: 'physics',
    resourceUrl: 'https://openstax.org/details/books/university-physics-volume-1',
    resourceLinkLabel: 'Read free textbook',
    accessLabel: 'Free open textbook',
  },
  {
    title: 'Concepts of Physics, Volume 1',
    author: 'H. C. Verma',
    subject: 'Physics',
    keywords: ['physics', 'science', 'jee', 'mechanics'],
    description: 'Concept-focused physics explanations with practice problems.',
    cover: 'concepts',
    resourceUrl: 'https://www.google.com/search?tbm=bks&q=Concepts+of+Physics+Volume+1+H+C+Verma',
    resourceLinkLabel: 'Find this book',
    accessLabel: 'Book lookup',
  },
  {
    title: 'Algebra and Trigonometry 2e',
    author: 'OpenStax',
    subject: 'Mathematics',
    keywords: ['math', 'mathematics', 'algebra', 'calculus', 'statistics'],
    description: 'An open textbook for algebra, functions, and trigonometry.',
    cover: 'algebra',
    resourceUrl: 'https://openstax.org/details/books/algebra-and-trigonometry-2e',
    resourceLinkLabel: 'Read free textbook',
    accessLabel: 'Free open textbook',
  },
  {
    title: 'Calculus: Early Transcendentals',
    author: 'James Stewart',
    subject: 'Mathematics',
    keywords: ['math', 'mathematics', 'calculus', 'statistics'],
    description: 'A structured reference for core calculus topics and problem-solving.',
    cover: 'calculus',
    resourceUrl: 'https://www.google.com/search?tbm=bks&q=Calculus+Early+Transcendentals+James+Stewart',
    resourceLinkLabel: 'Find this book',
    accessLabel: 'Book lookup',
  },
  {
    title: 'English Grammar in Use',
    author: 'Raymond Murphy',
    subject: 'English',
    keywords: ['english', 'grammar', 'literature', 'ielts', 'toefl', 'language'],
    description: 'A self-study grammar reference with explanations and exercises.',
    cover: 'english',
    resourceUrl: 'https://www.cambridge.org/gb/cambridgeenglish/catalog/grammar-vocabulary-and-pronunciation/english-grammar-use-5th-edition',
    resourceLinkLabel: 'View book',
    accessLabel: 'Publisher page',
  },
  {
    title: 'The Blue Book of Grammar and Punctuation',
    author: 'Jane Straus, Lester Kaufman & Tom Stern',
    subject: 'English',
    keywords: ['english', 'grammar', 'literature', 'ielts', 'toefl', 'writing'],
    description: 'A quick-reference guide to English grammar, usage, and punctuation.',
    cover: 'writing',
    resourceUrl: 'https://www.google.com/search?tbm=bks&q=The+Blue+Book+of+Grammar+and+Punctuation',
    resourceLinkLabel: 'Find this book',
    accessLabel: 'Book lookup',
  },
  {
    title: 'Madinah Arabic Lessons',
    author: 'Madinah Arabic',
    subject: 'Arabic',
    keywords: ['arabic', 'العربية', 'arabic language', 'لغة عربية'],
    description: 'Free online lessons to build Arabic vocabulary, grammar, and reading skills.',
    cover: 'arabic',
    resourceUrl: 'https://www.madinaharabic.com/',
    resourceLinkLabel: 'Start free lessons',
    accessLabel: 'Free online lessons',
  },
  {
    title: 'Al-Kitaab fii Ta’allum al-‘Arabiyya',
    author: 'Kristen Brustad, Mahmoud Al-Batal & Abbas Al-Tonsi',
    subject: 'Arabic',
    keywords: ['arabic', 'العربية', 'arabic language', 'لغة عربية'],
    description: 'A widely used Arabic language textbook series for classroom and independent study.',
    cover: 'arabic-book',
    resourceUrl: 'https://www.google.com/search?tbm=bks&q=Al-Kitaab+fii+Ta%27allum+al-%27Arabiyya+Part+One',
    resourceLinkLabel: 'Find this book',
    accessLabel: 'Book lookup',
  },
  {
    title: 'Rekhta Urdu E-books',
    author: 'Rekhta Foundation',
    subject: 'Urdu',
    keywords: ['urdu', 'اردو', 'urdu language', 'زبان اردو'],
    description: 'Explore Urdu poetry, fiction, and literature in a free online e-book collection.',
    cover: 'urdu',
    resourceUrl: 'https://www.rekhta.org/ebooks',
    resourceLinkLabel: 'Browse free e-books',
    accessLabel: 'Free online collection',
  },
  {
    title: 'Urdu: An Essential Grammar',
    author: 'Ruth Laila Schmidt',
    subject: 'Urdu',
    keywords: ['urdu', 'اردو', 'urdu language', 'زبان اردو'],
    description: 'A reference for Urdu grammar, script, and sentence structure.',
    cover: 'urdu-book',
    resourceUrl: 'https://www.google.com/search?tbm=bks&q=Urdu+An+Essential+Grammar+Ruth+Laila+Schmidt',
    resourceLinkLabel: 'Find this book',
    accessLabel: 'Book lookup',
  },
]

export default function TutorListPage() {
  const [tutors, setTutors] = useState([])
  const [filters, setFilters] = useState({ subject: '', location: '' })
  const [error, setError] = useState('')

  const loadTutors = (nextFilters = filters) => {
    setError('')
    fetchTutors(nextFilters).then(setTutors).catch(() => setError('Unable to load tutors. Please try again.'))
  }

  useEffect(() => {
    loadTutors()
  }, [])

  const handleChange = (event) => {
    const next = { ...filters, [event.target.name]: event.target.value }
    setFilters(next)
    loadTutors(next)
  }

  const normalizedSubject = filters.subject.trim().toLowerCase()
  const matchingResources = normalizedSubject
    ? studyResources.filter((resource) =>
      resource.keywords.some((keyword) => keyword.includes(normalizedSubject) || normalizedSubject.includes(keyword))
    )
    : studyResources

  return (
    <div className="page">
      <section className="tutor-search-intro">
        <p className="eyebrow">Find your learning match</p>
        <h1>Explore tutors</h1>
        <p>Search trusted tutors and discover resources to support your next learning goal.</p>
      </section>

      <div className="filters">
        <input
          aria-label="Filter tutors and resources by subject"
          name="subject"
          value={filters.subject}
          onChange={handleChange}
          placeholder="Search by subject (e.g. Mathematics)"
        />
        <input
          aria-label="Filter tutors by location"
          name="location"
          value={filters.location}
          onChange={handleChange}
          placeholder="Location"
        />
      </div>

      <section aria-labelledby="tutor-results-heading">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Learn from experienced educators</p>
            <h2 id="tutor-results-heading">Available tutors</h2>
          </div>
          <span className="result-count">{tutors.length} {tutors.length === 1 ? 'tutor' : 'tutors'}</span>
        </div>
        {error && <p className="error-msg" role="alert">{error}</p>}
        {tutors.length === 0 && !error ? (
          <div className="empty-results"><h3>No tutors found</h3><p>Try another subject or location.</p></div>
        ) : (
          <div className="card-grid tutor-card-grid">
            {tutors.map((tutor) => (
              <article className="card tutor-card" key={tutor.id}>
                <span className="tutor-subject-tag">{tutor.subject}</span>
                <h3>{tutor.qualification}</h3>
                <p className="tutor-location">{tutor.location}</p>
                <p>{tutor.experienceYears} years of teaching experience</p>
                <p className="tutor-rate">₹{tutor.hourlyRate}<span>/hour</span></p>
                <Link className="primary-btn compact" to={`/tutors/${tutor.id}`}>View profile</Link>
              </article>
            ))}
          </div>
        )}
      </section>

      <section className="resources-section" aria-labelledby="resources-heading">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Keep learning between lessons</p>
            <h2 id="resources-heading">Books &amp; study resources</h2>
            <p className="section-description">Reading ideas to complement your tutoring sessions.</p>
          </div>
        </div>
        {matchingResources.length === 0 ? (
          <div className="empty-results">
            <p>No book suggestions for that subject yet. Try Mathematics, Physics, English, Programming, Arabic, or Urdu.</p>
          </div>
        ) : (
          <div className="resource-grid">
            {matchingResources.map((resource) => (
              <article className="resource-card" key={resource.title}>
                <div className={`book-cover book-cover-${resource.cover}`} aria-hidden="true">
                  <span className="book-cover-subject">{resource.subject}</span>
                  <span className="book-cover-title">{resource.title}</span>
                  <span className="book-cover-author">{resource.author}</span>
                </div>
                <div className="resource-details">
                  <span className="resource-category">{resource.subject} · {resource.accessLabel}</span>
                  <h3>{resource.title}</h3>
                  <p className="resource-author">by {resource.author}</p>
                  <p>{resource.description}</p>
                  <a
                    className="resource-link"
                    href={resource.resourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {resource.resourceLinkLabel}<span aria-hidden="true"> ↗</span>
                  </a>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
