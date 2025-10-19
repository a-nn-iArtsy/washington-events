# 🎉 Washington Events - Self-Improving Event Aggregator

A revolutionary event aggregator for Western Washington that uses Stanford's ACE framework to automatically adapt and improve its scraping capabilities.

## ✨ Features

- **🤖 Self-Improving**: Uses ACE framework to automatically adapt when websites change
- **📅 50+ Sources**: Scrapes events from libraries, parks, tourism sites, and more
- **🎨 Modern UI**: Beautiful React frontend with filters and search
- **💰 Monetized**: Subscription tiers and payment processing ready
- **📱 Mobile-First**: Responsive design for all devices
- **🔄 Real-Time**: Always up-to-date event information

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL (or use Railway's free database)
- GitHub account
- Railway account (free)
- Vercel account (free)

### 1. Clone Repository
```bash
git clone https://github.com/a-nn-iArtsy/washington-events.git
cd washington-events
```

### 2. Install Dependencies
```bash
npm install
cd client && npm install && cd ..
```

### 3. Set Up Environment
```bash
cp .env.example .env
# Edit .env with your database credentials
```

### 4. Set Up Database
```bash
npm run setup-db
```

### 5. Start Development
```bash
# Backend (Terminal 1)
npm run dev

# Frontend (Terminal 2)
cd client && npm run dev
```

## 🌐 Deployment

### Backend (Railway)
1. Go to [railway.app](https://railway.app)
2. Connect GitHub repository
3. Add PostgreSQL database
4. Set environment variables
5. Deploy!

### Frontend (Vercel)
1. Go to [vercel.com](https://vercel.com)
2. Import GitHub repository
3. Set root directory to `client`
4. Deploy!

## 💰 Monetization

### Subscription Tiers
- **Free**: Basic event listings (20 events/page)
- **Pro ($9.99/month)**: Unlimited events, calendar exports, advanced filters
- **Business ($29.99/month)**: Analytics, promotion tools, API access

### Revenue Projections
- **Month 6**: $500/month (50 Pro users)
- **Month 12**: $2,000/month (200 Pro users)
- **Month 24**: $8,000/month (500 Pro + ads)

## 🏗️ Architecture

### ACE Framework
- **Generator Agent**: Executes scraping with fallbacks
- **Reflector Agent**: Analyzes patterns and learns
- **Critic Agent**: Reviews recommendations for flaws
- **Curator Agent**: Applies delta updates to configs

### Tech Stack
- **Backend**: Node.js, Express, PostgreSQL
- **Frontend**: React, Vite, TypeScript
- **Scraping**: Cheerio, Axios, Puppeteer
- **Payments**: Stripe
- **Hosting**: Railway (backend), Vercel (frontend)

## 📊 Database Schema

### Events Table
- id, title, description
- start_datetime, end_datetime
- location_name, location_address
- category, age_group, is_free
- price_min, price_max
- registration_url, image_url
- source_id (foreign key)

### Sources Table
- id, name, url, type
- scraper_config (JSON)
- last_successful_scrape
- is_active, priority

### Scraper Learnings Table
- id, source_id
- learning_type, pattern (JSON)
- success_count, fail_count
- confidence_score

## 🔧 Development

### Available Scripts
```bash
npm start          # Start production server
npm run dev        # Start development server
npm test           # Run tests
npm run setup-db   # Set up database
npm run scrape     # Run scrapers
npm run watchdog   # Start monitoring
```

### Adding New Scrapers
1. Create scraper in `src/scrapers/`
2. Extend `BaseScraper` class
3. Implement `scrape()` method
4. Add to sources database
5. Test with real data

## 🤝 Contributing

1. Fork the repository
2. Create feature branch
3. Make changes
4. Test thoroughly
5. Submit pull request

## 📄 License

MIT License - see LICENSE file for details

## 🆘 Support

- **Issues**: [GitHub Issues](https://github.com/a-nn-iArtsy/washington-events/issues)
- **Discussions**: [GitHub Discussions](https://github.com/a-nn-iArtsy/washington-events/discussions)
- **Email**: support@washington-events.com

## 🎯 Roadmap

- [ ] Add 50+ event sources
- [ ] Implement calendar exports
- [ ] Add email notifications
- [ ] Build analytics dashboard
- [ ] Launch mobile app
- [ ] Expand to other states

---

**Built with ❤️ for the Washington community**

*Powered by ACE Self-Improving Framework*
