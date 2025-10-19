// Express API Server
// Based on DEVELOPMENT_PLAN.md Week 2 requirements

const express = require('express');
const cors = require('cors');
const db = require('../database/connection');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint for Railway
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    service: 'Washington Events API'
  });
});

// Events API endpoints
app.get('/api/events', async (req, res) => {
  try {
    const { date, location, category, page = 1, limit = 20 } = req.query;
    
    let query = db('events').select('*');
    
    // Apply filters
    if (date) {
      query = query.where('start_datetime', '>=', date);
    }
    
    if (location) {
      query = query.where('location_name', 'ilike', `%${location}%`);
    }
    
    if (category) {
      query = query.where('category', category);
    }
    
    // Pagination
    const offset = (page - 1) * limit;
    const events = await query.limit(limit).offset(offset);
    
    res.json({
      events,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: events.length
      }
    });
    
  } catch (error) {
    console.error('Error fetching events:', error);
    res.status(500).json({ error: 'Failed to fetch events' });
  }
});

app.get('/api/events/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const event = await db('events').where('id', id).first();
    
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }
    
    res.json(event);
    
  } catch (error) {
    console.error('Error fetching event:', error);
    res.status(500).json({ error: 'Failed to fetch event' });
  }
});

// Calendar export endpoint
app.get('/api/events/export/:id.ics', (req, res) => {
  // TODO: Implement calendar export
  res.json({ message: 'Calendar export coming soon' });
});

// Sources endpoint (admin)
app.get('/api/sources', async (req, res) => {
  try {
    const sources = await db('sources').select('*');
    res.json(sources);
  } catch (error) {
    console.error('Error fetching sources:', error);
    res.status(500).json({ error: 'Failed to fetch sources' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Washington Events API running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
});

module.exports = app;
