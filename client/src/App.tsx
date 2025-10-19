import { useState, useEffect } from 'react'
import './App.css'

interface Event {
  id: number;
  title: string;
  description: string;
  start_datetime: string;
  location_name: string;
  location_address: string;
  category: string;
  is_free: boolean;
  price_min: number;
  image_url: string;
}

function App() {
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filters, setFilters] = useState({
    date: '',
    location: '',
    category: ''
  })

  // Fetch events from API
  useEffect(() => {
    fetchEvents()
  }, [])

  const fetchEvents = async () => {
    try {
      setLoading(true)
      // For now, use mock data since API isn't running yet
      const mockEvents = [
        {
          id: 1,
          title: "Seattle Children's Museum - Family Day",
          description: "Interactive exhibits and hands-on activities for kids of all ages",
          start_datetime: "2024-01-15T10:00:00Z",
          location_name: "Seattle Children's Museum",
          location_address: "305 Harrison St, Seattle, WA 98109",
          category: "Family",
          is_free: false,
          price_min: 12.50,
          image_url: "https://images.unsplash.com/photo-1544027993-37dbfe43562a?w=400"
        },
        {
          id: 2,
          title: "Story Time at Seattle Public Library",
          description: "Weekly story time for toddlers and preschoolers",
          start_datetime: "2024-01-16T10:30:00Z",
          location_name: "Central Library",
          location_address: "1000 4th Ave, Seattle, WA 98104",
          category: "Library",
          is_free: true,
          price_min: 0,
          image_url: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400"
        },
        {
          id: 3,
          title: "Woodland Park Zoo - Zoo Lights",
          description: "Magical holiday lights display throughout the zoo",
          start_datetime: "2024-01-20T17:00:00Z",
          location_name: "Woodland Park Zoo",
          location_address: "5500 Phinney Ave N, Seattle, WA 98103",
          category: "Family",
          is_free: false,
          price_min: 8.00,
          image_url: "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=400"
        }
      ]
      
      setEvents(mockEvents)
      setLoading(false)
    } catch (err) {
      setError('Failed to load events')
      setLoading(false)
    }
  }

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }))
  }

  const filteredEvents = events.filter(event => {
    if (filters.date && !event.start_datetime.includes(filters.date)) return false
    if (filters.location && !event.location_name.toLowerCase().includes(filters.location.toLowerCase())) return false
    if (filters.category && event.category !== filters.category) return false
    return true
  })

  if (loading) {
    return (
      <div className="loading">
        <h2>Loading Washington Events...</h2>
        <p>Finding the best family-friendly events for you!</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="error">
        <h2>Oops! Something went wrong</h2>
        <p>{error}</p>
        <button onClick={fetchEvents}>Try Again</button>
      </div>
    )
  }

  return (
    <div className="app">
      <header className="header">
        <h1>🎉 Washington Events</h1>
        <p>Discover family-friendly events across Western Washington</p>
        {/* HMR Test: This line was added to test Hot Module Replacement */}
        <div style={{background: '#FF6B6B', color: 'white', padding: '15px', borderRadius: '10px', margin: '15px 0', fontSize: '18px'}}>
          🔥 HMR is working perfectly! This component updated without page refresh. The color changed from green to red!
        </div>
      </header>

      <div className="filters">
        <h3>Filter Events</h3>
        <div className="filter-row">
          <input
            type="date"
            placeholder="Date"
            value={filters.date}
            onChange={(e) => handleFilterChange('date', e.target.value)}
          />
          <input
            type="text"
            placeholder="Location (e.g., Seattle)"
            value={filters.location}
            onChange={(e) => handleFilterChange('location', e.target.value)}
          />
          <select
            value={filters.category}
            onChange={(e) => handleFilterChange('category', e.target.value)}
          >
            <option value="">All Categories</option>
            <option value="Family">Family</option>
            <option value="Library">Library</option>
            <option value="Parks">Parks</option>
            <option value="Music">Music</option>
            <option value="Sports">Sports</option>
          </select>
        </div>
      </div>

      <div className="events">
        <h2>Upcoming Events ({filteredEvents.length})</h2>
        <div className="events-grid">
          {filteredEvents.map(event => (
            <div key={event.id} className="event-card">
              <div className="event-image">
                <img src={event.image_url} alt={event.title} />
                {event.is_free && <span className="free-badge">FREE</span>}
              </div>
              <div className="event-content">
                <h3>{event.title}</h3>
                <p className="event-description">{event.description}</p>
                <div className="event-details">
                  <p><strong>📍</strong> {event.location_name}</p>
                  <p><strong>📅</strong> {new Date(event.start_datetime).toLocaleDateString()}</p>
                  <p><strong>🕒</strong> {new Date(event.start_datetime).toLocaleTimeString()}</p>
                  <p><strong>💰</strong> {event.is_free ? 'Free' : `$${event.price_min}`}</p>
                </div>
                <div className="event-actions">
                  <button className="btn-primary">Learn More</button>
                  <button className="btn-secondary">Add to Calendar</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <footer className="footer">
        <p>Powered by ACE Self-Improving Scrapers 🤖</p>
        <p>© 2024 Washington Events - Find your next adventure!</p>
      </footer>
    </div>
  )
}

export default App