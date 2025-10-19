-- Washington Events Database Schema
-- Based on ARCHITECTURE.md specifications

-- Events table - stores all scraped events
CREATE TABLE events (
    id SERIAL PRIMARY KEY,
    title VARCHAR(500) NOT NULL,
    description TEXT,
    start_datetime TIMESTAMP NOT NULL,
    end_datetime TIMESTAMP,
    location_name VARCHAR(200),
    location_address TEXT,
    category VARCHAR(100),
    age_group VARCHAR(20) CHECK (age_group IN ('kids', 'family', 'adults', 'all')),
    is_free BOOLEAN DEFAULT false,
    price_min DECIMAL(10,2),
    price_max DECIMAL(10,2),
    registration_url TEXT,
    image_url TEXT,
    source_id INTEGER REFERENCES sources(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Sources table - stores event source configurations
CREATE TABLE sources (
    id SERIAL PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    url TEXT NOT NULL,
    type VARCHAR(50) NOT NULL,
    scraper_config JSONB,
    last_successful_scrape TIMESTAMP,
    is_active BOOLEAN DEFAULT true,
    priority INTEGER DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Scraper learnings table - stores ACE agent learnings
CREATE TABLE scraper_learnings (
    id SERIAL PRIMARY KEY,
    source_id INTEGER REFERENCES sources(id),
    learning_type VARCHAR(100) NOT NULL,
    pattern JSONB NOT NULL,
    success_count INTEGER DEFAULT 0,
    fail_count INTEGER DEFAULT 0,
    confidence_score DECIMAL(3,2) DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX idx_events_start_datetime ON events(start_datetime);
CREATE INDEX idx_events_source_id ON events(source_id);
CREATE INDEX idx_events_category ON events(category);
CREATE INDEX idx_events_location_name ON events(location_name);
CREATE INDEX idx_sources_is_active ON sources(is_active);
CREATE INDEX idx_scraper_learnings_source_id ON scraper_learnings(source_id);
CREATE INDEX idx_scraper_learnings_confidence ON scraper_learnings(confidence_score);

-- Insert initial sources from wa_events_sources.csv
INSERT INTO sources (name, url, type, is_active, priority) VALUES
('Seattle Public Library', 'https://www.spl.org/event-calendar', 'Library Calendar', true, 1),
('King County Library System', 'https://kcls.bibliocommons.com', 'Library API', true, 1),
('Seattle Parks & Recreation', 'https://parkways.seattle.gov/events/', 'Municipal Blog', true, 1),
('Visit Seattle', 'https://visitseattle.org/things-to-do/events/', 'Tourism Board', true, 2),
('ParentMap', 'https://www.parentmap.com/calendar', 'Publication', true, 1);
