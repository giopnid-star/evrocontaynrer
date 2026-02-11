-- PostgreSQL Database Schema for Evrocontayner
-- Auto-created by server.js on startup, but kept here for reference

-- Contacts table (form submissions)
CREATE TABLE IF NOT EXISTS contacts (
  id SERIAL PRIMARY KEY,
  name TEXT,
  email TEXT,
  message TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  sent BOOLEAN DEFAULT false,
  message_id TEXT
);

-- Users table (authentication)
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  name TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_login TIMESTAMP,
  verified BOOLEAN DEFAULT false,
  verification_token TEXT,
  session_token TEXT,
  session_expires TIMESTAMP
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_contacts_sent ON contacts(sent);
CREATE INDEX IF NOT EXISTS idx_contacts_created_at ON contacts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_contacts_email ON contacts(email);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_session_token ON users(session_token);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at DESC);

-- Sample queries for management

-- View all recent contacts
-- SELECT * FROM contacts ORDER BY created_at DESC LIMIT 10;

-- Count unsent messages
-- SELECT COUNT(*) FROM contacts WHERE sent = false;

-- Find user by email
-- SELECT * FROM users WHERE email = 'example@email.com';

-- Clean expired sessions
-- UPDATE users SET session_token = NULL, session_expires = NULL WHERE session_expires < NOW();
