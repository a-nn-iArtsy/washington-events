// Base Scraper Class
// Based on ACE paper summary and DEVELOPMENT_PLAN.md Day 1 requirements

const axios = require('axios');
const cheerio = require('cheerio');
const winston = require('winston');

class BaseScraper {
  constructor(sourceConfig) {
    this.sourceConfig = sourceConfig;
    this.logger = winston.createLogger({
      level: 'info',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
      ),
      transports: [
        new winston.transports.Console(),
        new winston.transports.File({ filename: 'logs/scraper.log' })
      ]
    });
    
    // Rate limiting configuration
    this.delayMs = parseInt(process.env.SCRAPING_DELAY_MS) || 1000;
    this.lastRequestTime = 0;
  }

  // Rate limiting - ensures we don't overwhelm servers
  async rateLimit() {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;
    
    if (timeSinceLastRequest < this.delayMs) {
      const waitTime = this.delayMs - timeSinceLastRequest;
      this.logger.info(`Rate limiting: waiting ${waitTime}ms`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
    
    this.lastRequestTime = Date.now();
  }

  // Check robots.txt compliance
  async checkRobotsTxt(url) {
    try {
      const robotsUrl = new URL('/robots.txt', url).href;
      const response = await axios.get(robotsUrl, { timeout: 5000 });
      
      // Basic robots.txt checking - in production, use a proper parser
      const robotsContent = response.data.toLowerCase();
      if (robotsContent.includes('disallow: /')) {
        this.logger.warn(`Robots.txt may restrict access to ${url}`);
        return false;
      }
      
      return true;
    } catch (error) {
      this.logger.warn(`Could not fetch robots.txt for ${url}: ${error.message}`);
      return true; // Assume allowed if we can't check
    }
  }

  // Make HTTP request with error handling
  async makeRequest(url, options = {}) {
    await this.rateLimit();
    
    try {
      // Check robots.txt compliance
      const robotsAllowed = await this.checkRobotsTxt(url);
      if (!robotsAllowed) {
        throw new Error('Robots.txt disallows scraping this URL');
      }

      const response = await axios({
        url,
        method: 'GET',
        timeout: 30000,
        headers: {
          'User-Agent': 'Washington Events Aggregator (Educational Purpose)',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5',
          'Accept-Encoding': 'gzip, deflate',
          'Connection': 'keep-alive',
          ...options.headers
        },
        ...options
      });

      return response;
    } catch (error) {
      this.logger.error(`Request failed for ${url}: ${error.message}`);
      throw error;
    }
  }

  // Parse HTML content with Cheerio
  parseHtml(html) {
    return cheerio.load(html);
  }

  // Extract text content safely
  extractText($, selector, defaultValue = '') {
    try {
      const element = $(selector);
      return element.length > 0 ? element.text().trim() : defaultValue;
    } catch (error) {
      this.logger.warn(`Failed to extract text from selector ${selector}: ${error.message}`);
      return defaultValue;
    }
  }

  // Extract attribute value safely
  extractAttribute($, selector, attribute, defaultValue = '') {
    try {
      const element = $(selector);
      return element.length > 0 ? element.attr(attribute) || defaultValue : defaultValue;
    } catch (error) {
      this.logger.warn(`Failed to extract attribute ${attribute} from selector ${selector}: ${error.message}`);
      return defaultValue;
    }
  }

  // Parse date string to ISO format
  parseDate(dateString) {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        throw new Error('Invalid date');
      }
      return date.toISOString();
    } catch (error) {
      this.logger.warn(`Failed to parse date "${dateString}": ${error.message}`);
      return null;
    }
  }

  // Abstract method - must be implemented by subclasses
  async scrape() {
    throw new Error('scrape() method must be implemented by subclass');
  }

  // Generate trace for ACE framework
  generateTrace(attempts, results) {
    return {
      timestamp: new Date().toISOString(),
      sourceId: this.sourceConfig.id,
      sourceName: this.sourceConfig.name,
      attempts: attempts,
      results: results,
      success: results.length > 0,
      errorCount: attempts.filter(a => a.error).length
    };
  }

  // Log trace for ACE Reflector agent
  logTrace(trace) {
    this.logger.info('Scraper trace generated', trace);
    
    // Save trace to file for ACE analysis
    const fs = require('fs');
    const path = require('path');
    
    const traceDir = path.join(process.cwd(), 'traces');
    if (!fs.existsSync(traceDir)) {
      fs.mkdirSync(traceDir, { recursive: true });
    }
    
    const traceFile = path.join(traceDir, `trace_${this.sourceConfig.id}_${Date.now()}.json`);
    fs.writeFileSync(traceFile, JSON.stringify(trace, null, 2));
  }
}

module.exports = BaseScraper;
