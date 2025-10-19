// Eventbrite API Scraper
// Based on DEVELOPMENT_PLAN.md Day 1 - First Working Scraper
// Implements ACE framework with trace logging

const BaseScraper = require('./base_scraper');

class EventbriteScraper extends BaseScraper {
  constructor(sourceConfig) {
    super(sourceConfig);
    this.apiKey = process.env.EVENTBRITE_API_KEY || 'YOUR_EVENTBRITE_API_KEY';
    this.baseUrl = 'https://www.eventbriteapi.com/v3';
  }

  async scrape() {
    const attempts = [];
    const results = [];

    try {
      this.logger.info(`Starting Eventbrite scrape for source: ${this.sourceConfig.name}`);

      // Attempt 1: Search for events in Seattle area
      const attempt1 = await this.searchEventsByLocation();
      attempts.push(attempt1);
      
      if (attempt1.success && attempt1.events.length > 0) {
        results.push(...attempt1.events);
      }

      // Attempt 2: Search by category if first attempt had few results
      if (results.length < 5) {
        const attempt2 = await this.searchEventsByCategory();
        attempts.push(attempt2);
        
        if (attempt2.success && attempt2.events.length > 0) {
          results.push(...attempt2.events);
        }
      }

      // Generate trace for ACE framework
      const trace = this.generateTrace(attempts, results);
      this.logTrace(trace);

      this.logger.info(`Eventbrite scrape completed: ${results.length} events found`);
      return results;

    } catch (error) {
      this.logger.error(`Eventbrite scrape failed: ${error.message}`);
      
      // Log failed attempt for ACE analysis
      const failedAttempt = {
        method: 'eventbrite_api',
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      };
      
      const trace = this.generateTrace([failedAttempt], []);
      this.logTrace(trace);
      
      throw error;
    }
  }

  async searchEventsByLocation() {
    const attempt = {
      method: 'search_by_location',
      timestamp: new Date().toISOString()
    };

    try {
      // Search for events in Seattle area
      const response = await this.makeRequest(`${this.baseUrl}/events/search/`, {
        params: {
          'location.address': 'Seattle, WA',
          'location.within': '50mi',
          'start_date.range_start': new Date().toISOString(),
          'start_date.range_end': this.getDateRangeEnd(),
          'expand': 'venue',
          'token': this.apiKey
        }
      });

      const events = this.parseEventbriteEvents(response.data.events || []);
      
      attempt.success = true;
      attempt.events = events;
      attempt.count = events.length;
      
      return attempt;

    } catch (error) {
      attempt.success = false;
      attempt.error = error.message;
      return attempt;
    }
  }

  async searchEventsByCategory() {
    const attempt = {
      method: 'search_by_category',
      timestamp: new Date().toISOString()
    };

    try {
      // Search for family-friendly events
      const response = await this.makeRequest(`${this.baseUrl}/events/search/`, {
        params: {
          'location.address': 'Seattle, WA',
          'location.within': '50mi',
          'categories': '103,110,113', // Family, Kids, Community
          'start_date.range_start': new Date().toISOString(),
          'start_date.range_end': this.getDateRangeEnd(),
          'expand': 'venue',
          'token': this.apiKey
        }
      });

      const events = this.parseEventbriteEvents(response.data.events || []);
      
      attempt.success = true;
      attempt.events = events;
      attempt.count = events.length;
      
      return attempt;

    } catch (error) {
      attempt.success = false;
      attempt.error = error.message;
      return attempt;
    }
  }

  parseEventbriteEvents(eventbriteEvents) {
    return eventbriteEvents.map(event => ({
      title: event.name?.text || 'Untitled Event',
      description: event.description?.text || '',
      start_datetime: this.parseEventbriteDate(event.start?.utc),
      end_datetime: this.parseEventbriteDate(event.end?.utc),
      location_name: event.venue?.name || 'TBD',
      location_address: this.formatAddress(event.venue),
      category: this.mapEventbriteCategory(event.category_id),
      age_group: 'all', // Eventbrite doesn't specify age groups
      is_free: event.is_free || false,
      price_min: event.is_free ? 0 : (event.ticket_availability?.minimum_ticket_price?.major_value || 0),
      price_max: event.is_free ? 0 : (event.ticket_availability?.maximum_ticket_price?.major_value || 0),
      registration_url: event.url || '',
      image_url: event.logo?.url || '',
      source_id: this.sourceConfig.id,
      raw_data: event // Store raw data for ACE analysis
    }));
  }

  parseEventbriteDate(dateString) {
    if (!dateString) return null;
    return new Date(dateString).toISOString();
  }

  formatAddress(venue) {
    if (!venue) return '';
    
    const parts = [
      venue.address?.address_1,
      venue.address?.address_2,
      venue.address?.city,
      venue.address?.region,
      venue.address?.postal_code
    ].filter(Boolean);
    
    return parts.join(', ');
  }

  mapEventbriteCategory(categoryId) {
    const categoryMap = {
      '103': 'Family',
      '110': 'Kids',
      '113': 'Community',
      '104': 'Music',
      '105': 'Sports',
      '106': 'Technology'
    };
    
    return categoryMap[categoryId] || 'General';
  }

  getDateRangeEnd() {
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + 30); // Next 30 days
    return endDate.toISOString();
  }
}

module.exports = EventbriteScraper;
