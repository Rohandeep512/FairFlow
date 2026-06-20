CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE,
  phone VARCHAR(20),
  password_hash VARCHAR(255),
  role VARCHAR(10) NOT NULL CHECK (role IN ('admin', 'customer')),
  is_demo BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE organizations (
  id SERIAL PRIMARY KEY,
  admin_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  service_type VARCHAR(20) NOT NULL CHECK (service_type IN ('print', 'equipment', 'healthcare', 'support', 'food', 'general')),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE queue_sessions (
  id SERIAL PRIMARY KEY,
  org_id INTEGER REFERENCES organizations(id) ON DELETE CASCADE,
  algorithm VARCHAR(20) NOT NULL CHECK (algorithm IN ('fcfs', 'sjf', 'rr', 'priority')),
  aging_enabled BOOLEAN DEFAULT TRUE,
  time_quantum INTEGER,
  status VARCHAR(10) DEFAULT 'active' CHECK (status IN ('active', 'ended')),
  join_code VARCHAR(6) UNIQUE NOT NULL,
  ai_recommendation JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  ended_at TIMESTAMP
);

CREATE TABLE jobs (
  id SERIAL PRIMARY KEY,
  session_id INTEGER REFERENCES queue_sessions(id) ON DELETE CASCADE,
  customer_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  job_size NUMERIC NOT NULL,
  status VARCHAR(15) DEFAULT 'waiting' CHECK (status IN ('waiting', 'processing', 'completed')),
  arrival_time TIMESTAMP DEFAULT NOW(),
  start_time TIMESTAMP,
  completion_time TIMESTAMP,
  emergency_approved BOOLEAN DEFAULT FALSE,
  priority_stars INTEGER DEFAULT 0,
  priority_message TEXT,
  is_demo BOOLEAN DEFAULT FALSE,
  UNIQUE(session_id, customer_id)
);

CREATE TABLE emergency_requests (
  id SERIAL PRIMARY KEY,
  job_id INTEGER REFERENCES jobs(id) ON DELETE CASCADE,
  reason VARCHAR(255) NOT NULL,
  status VARCHAR(10) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  requested_at TIMESTAMP DEFAULT NOW(),
  resolved_at TIMESTAMP
);