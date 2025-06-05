-- Initialize TaskFlow database
-- This script runs when PostgreSQL container starts for the first time

-- Create tasks table
CREATE TABLE IF NOT EXISTS tasks (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'in-progress', 'completed')),
    priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create users table for future authentication
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_priority ON tasks(priority);
CREATE INDEX IF NOT EXISTS idx_tasks_created_at ON tasks(created_at);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Insert sample data
INSERT INTO tasks (title, description, status, priority) VALUES
    ('Setup Docker Environment', 'Configure Docker containers for development and production', 'completed', 'high'),
    ('Implement REST API', 'Create comprehensive REST API for task management', 'in-progress', 'high'),
    ('Add User Authentication', 'Implement JWT-based authentication system', 'pending', 'medium'),
    ('Create Frontend Dashboard', 'Build responsive web dashboard', 'pending', 'medium'),
    ('Setup CI/CD Pipeline', 'Configure GitHub Actions for automated deployment', 'in-progress', 'high'),
    ('Add Database Integration', 'Connect application to PostgreSQL database', 'completed', 'high'),
    ('Implement Caching', 'Add Redis caching for better performance', 'pending', 'low'),
    ('Security Hardening', 'Add security headers and rate limiting', 'completed', 'high'),
    ('Performance Monitoring', 'Add application performance monitoring', 'pending', 'medium'),
    ('Documentation', 'Create comprehensive API documentation', 'pending', 'low')
ON CONFLICT DO NOTHING;

-- Create a demo user
INSERT INTO users (username, email, password_hash) VALUES
    ('demo', 'demo@taskflow.com', '$2a$10$example.hash.for.demo.user.only')
ON CONFLICT DO NOTHING;

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers to automatically update updated_at
CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON tasks 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();