-- Create cameras table with status management
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS cameras (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    connection_string TEXT NOT NULL, -- encrypted at rest
    status TEXT CHECK (status IN ('enabled','disabled')) DEFAULT 'disabled',
    location TEXT,
    description TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Create camera runtime status table
CREATE TABLE IF NOT EXISTS camera_runtime (
    camera_id UUID PRIMARY KEY REFERENCES cameras(id) ON DELETE CASCADE,
    pod_name TEXT,
    worker_status TEXT CHECK (worker_status IN ('starting','running','stopping','stopped','error')),
    last_heartbeat TIMESTAMP,
    health_status TEXT,
    error_count INTEGER DEFAULT 0,
    last_error TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Create index for status queries
CREATE INDEX IF NOT EXISTS idx_cameras_status ON cameras(status);
CREATE INDEX IF NOT EXISTS idx_camera_runtime_status ON camera_runtime(worker_status);
CREATE INDEX IF NOT EXISTS idx_camera_runtime_heartbeat ON camera_runtime(last_heartbeat);

-- Create trigger to update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_cameras_updated_at BEFORE UPDATE ON cameras
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_camera_runtime_updated_at BEFORE UPDATE ON camera_runtime
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
