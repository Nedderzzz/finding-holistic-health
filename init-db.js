const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const dbPath = './data/dev.db';
const dataDir = path.dirname(dbPath);
fs.mkdirSync(dataDir, { recursive: true });

const db = new Database(dbPath);
db.pragma('journal_mode = WAL');

// Create users table
db.exec('CREATE TABLE IF NOT EXISTS users (id TEXT PRIMARY KEY, email TEXT UNIQUE NOT NULL, first_name TEXT NOT NULL, last_name TEXT NOT NULL, created_at INTEGER NOT NULL, role TEXT NOT NULL DEFAULT \"USER\"); CREATE INDEX IF NOT EXISTS users_email_idx ON users(email);');

// Create providers table
db.exec('CREATE TABLE IF NOT EXISTS providers (id TEXT PRIMARY KEY, business_name TEXT NOT NULL, provider_name TEXT NOT NULL, specialties TEXT DEFAULT \"[]\", address_line_1 TEXT, city TEXT NOT NULL, state TEXT NOT NULL, zip TEXT, latitude REAL, longitude REAL, phone TEXT NOT NULL, website TEXT, description TEXT, status TEXT NOT NULL DEFAULT \"PENDING\", avg_rating REAL NOT NULL DEFAULT 0, review_count INTEGER NOT NULL DEFAULT 0, created_at INTEGER NOT NULL, updated_at INTEGER NOT NULL); CREATE INDEX IF NOT EXISTS providers_state_idx ON providers(state); CREATE INDEX IF NOT EXISTS providers_city_idx ON providers(city); CREATE INDEX IF NOT EXISTS providers_rating_idx ON providers(avg_rating); CREATE INDEX IF NOT EXISTS providers_status_idx ON providers(status);');

// Create reviews table
db.exec('CREATE TABLE IF NOT EXISTS reviews (id TEXT PRIMARY KEY, user_id TEXT NOT NULL, provider_id TEXT NOT NULL, rating INTEGER NOT NULL, content TEXT NOT NULL, status TEXT NOT NULL DEFAULT \"PENDING\", is_visible INTEGER NOT NULL DEFAULT 0, created_at INTEGER NOT NULL, updated_at INTEGER NOT NULL, FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE, FOREIGN KEY(provider_id) REFERENCES providers(id) ON DELETE CASCADE); CREATE INDEX IF NOT EXISTS reviews_user_id_idx ON reviews(user_id); CREATE INDEX IF NOT EXISTS reviews_provider_idx ON reviews(provider_id); CREATE INDEX IF NOT EXISTS reviews_status_idx ON reviews(status); CREATE INDEX IF NOT EXISTS reviews_visibility_idx ON reviews(is_visible);');

// Create review_reports table
db.exec('CREATE TABLE IF NOT EXISTS review_reports (id TEXT PRIMARY KEY, review_id TEXT NOT NULL, reported_by TEXT, reason TEXT NOT NULL, notes TEXT, status TEXT NOT NULL DEFAULT \"OPEN\", created_at INTEGER NOT NULL, updated_at INTEGER NOT NULL); CREATE INDEX IF NOT EXISTS reports_review_idx ON review_reports(review_id); CREATE INDEX IF NOT EXISTS reports_status_idx ON review_reports(status);');

// Create request_submissions table
db.exec('CREATE TABLE IF NOT EXISTS request_submissions (id TEXT PRIMARY KEY, business_name TEXT NOT NULL, provider_name TEXT NOT NULL, specialties TEXT DEFAULT \"[]\", address_line_1 TEXT, city TEXT NOT NULL, state TEXT NOT NULL, zip TEXT, phone TEXT NOT NULL, website TEXT, description TEXT, status TEXT NOT NULL DEFAULT \"RECEIVED\", created_at INTEGER NOT NULL, updated_at INTEGER NOT NULL); CREATE INDEX IF NOT EXISTS requests_status_idx ON request_submissions(status);');

// Create suggestions table
db.exec('CREATE TABLE IF NOT EXISTS suggestions (id TEXT PRIMARY KEY, suggested_by TEXT, business_name TEXT NOT NULL, provider_name TEXT NOT NULL, specialties TEXT DEFAULT \"[]\", address_line_1 TEXT, city TEXT NOT NULL, state TEXT NOT NULL, zip TEXT, phone TEXT, website TEXT, notes TEXT, status TEXT NOT NULL DEFAULT \"RECEIVED\", created_at INTEGER NOT NULL, updated_at INTEGER NOT NULL); CREATE INDEX IF NOT EXISTS suggestions_status_idx ON suggestions(status);');

// Create geocode_cache table
db.exec('CREATE TABLE IF NOT EXISTS geocode_cache (id TEXT PRIMARY KEY, query TEXT UNIQUE NOT NULL, latitude REAL NOT NULL, longitude REAL NOT NULL, source TEXT NOT NULL DEFAULT \"geocoded\", created_at INTEGER NOT NULL, updated_at INTEGER NOT NULL);');

// Create city_centroids table
db.exec('CREATE TABLE IF NOT EXISTS city_centroids (id TEXT PRIMARY KEY, city TEXT NOT NULL, state TEXT NOT NULL, latitude REAL NOT NULL, longitude REAL NOT NULL, created_at INTEGER NOT NULL, UNIQUE(city, state));');

// Create policy_content table
db.exec('CREATE TABLE IF NOT EXISTS policy_content (id TEXT PRIMARY KEY, slug TEXT UNIQUE NOT NULL, title TEXT NOT NULL, content TEXT NOT NULL, published INTEGER NOT NULL DEFAULT 0, version INTEGER NOT NULL DEFAULT 1, created_at INTEGER NOT NULL, updated_at INTEGER NOT NULL, published_at INTEGER); CREATE INDEX IF NOT EXISTS policy_slug_idx ON policy_content(slug);');

// Create csv_import_logs table
db.exec('CREATE TABLE IF NOT EXISTS csv_import_logs (id TEXT PRIMARY KEY, filename TEXT NOT NULL, created_count INTEGER NOT NULL DEFAULT 0, updated_count INTEGER NOT NULL DEFAULT 0, skipped_count INTEGER NOT NULL DEFAULT 0, error_count INTEGER NOT NULL DEFAULT 0, errors TEXT, created_at INTEGER NOT NULL);');

console.log('Database initialized successfully!');
db.close();
