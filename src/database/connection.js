// Database connection configuration
// Based on ARCHITECTURE.md specifications

const knex = require('knex');
require('dotenv').config();

const config = {
  client: 'pg',
  connection: {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'password',
    database: process.env.DB_NAME || 'washington_events'
  },
  pool: {
    min: 2,
    max: 10
  },
  migrations: {
    directory: './src/database/migrations'
  }
};

// For development, use SQLite if PostgreSQL not available
if (process.env.NODE_ENV === 'development' && !process.env.DB_HOST) {
  config.client = 'sqlite3';
  config.connection = {
    filename: './data/washington_events.db'
  };
}

const db = knex(config);

module.exports = db;
