-- Database setup script for Camera Management System
-- This script creates all required tables for the application

-- Users table (if not exists)
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'viewer' CHECK (role IN ('admin', 'operator', 'viewer')),
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Cameras table
CREATE TABLE IF NOT EXISTS cameras (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    camera_id VARCHAR(50) UNIQUE NOT NULL,
    connection_string TEXT NOT NULL,
    created_by UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Camera User Assignments table
CREATE TABLE IF NOT EXISTS camera_user_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    camera_id UUID NOT NULL REFERENCES cameras(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    assigned_by UUID NOT NULL REFERENCES users(id),
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(camera_id, user_id)
);

-- Events table (for face detection events)
CREATE TABLE IF NOT EXISTS events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    camera_id UUID NOT NULL REFERENCES cameras(id) ON DELETE CASCADE,
    person_id VARCHAR(255),
    image_path TEXT,
    confidence DECIMAL(5,4),
    time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_cameras_camera_id ON cameras(camera_id);
CREATE INDEX IF NOT EXISTS idx_cameras_created_by ON cameras(created_by);
CREATE INDEX IF NOT EXISTS idx_camera_assignments_camera_id ON camera_user_assignments(camera_id);
CREATE INDEX IF NOT EXISTS idx_camera_assignments_user_id ON camera_user_assignments(user_id);
CREATE INDEX IF NOT EXISTS idx_events_camera_id ON events(camera_id);
CREATE INDEX IF NOT EXISTS idx_events_time ON events(time);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);

-- Insert a default admin user (password: 'admin123')
-- Password hash for 'admin123' using bcrypt
INSERT INTO users (email, username, password_hash, role, first_name, last_name) 
VALUES (
    'admin@facealert.live',
    'admin',
    '$2b$10$rQc3.QVv3dP8LKkI1ZHuDOWmVBLjR6Z8jHKx.sF7Lx.YoK2zQ9sU2',
    'admin',
    'System',
    'Administrator'
) ON CONFLICT (email) DO NOTHING;

COMMENT ON TABLE cameras IS 'Stores camera configuration and metadata';
COMMENT ON TABLE camera_user_assignments IS 'Maps users to cameras they can view';
COMMENT ON TABLE events IS 'Stores face detection events from cameras';
COMMENT ON TABLE users IS 'User authentication and role management';