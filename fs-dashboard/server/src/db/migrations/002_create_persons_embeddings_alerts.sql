-- Create persons and embeddings tables for face recognition
CREATE TABLE IF NOT EXISTS persons (
    person_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    metadata JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS embeddings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    person_id UUID REFERENCES persons(person_id) ON DELETE CASCADE,
    vector FLOAT8[], -- store vector or keep only in vector DB
    vector_db_id TEXT, -- pointer to vector DB entry
    source_camera_id UUID REFERENCES cameras(id),
    confidence FLOAT,
    image_url TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT NOW()
);

-- Create alerts table
CREATE TABLE IF NOT EXISTS alerts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    camera_id UUID REFERENCES cameras(id) ON DELETE CASCADE,
    alert_type TEXT CHECK (alert_type IN ('unknown_person', 'known_person', 'system_error')) DEFAULT 'unknown_person',
    timestamp TIMESTAMP DEFAULT NOW(),
    image_url TEXT,
    thumbnail_url TEXT,
    recognized BOOLEAN DEFAULT false,
    recognized_person_id UUID REFERENCES persons(person_id),
    confidence FLOAT,
    metadata JSONB DEFAULT '{}',
    status TEXT CHECK (status IN ('new', 'acknowledged', 'resolved', 'false_positive')) DEFAULT 'new',
    acknowledged_by UUID,
    acknowledged_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_persons_active ON persons(is_active);
CREATE INDEX IF NOT EXISTS idx_embeddings_person_id ON embeddings(person_id);
CREATE INDEX IF NOT EXISTS idx_embeddings_camera_id ON embeddings(source_camera_id);
CREATE INDEX IF NOT EXISTS idx_alerts_camera_id ON alerts(camera_id);
CREATE INDEX IF NOT EXISTS idx_alerts_timestamp ON alerts(timestamp);
CREATE INDEX IF NOT EXISTS idx_alerts_status ON alerts(status);
CREATE INDEX IF NOT EXISTS idx_alerts_recognized_person ON alerts(recognized_person_id);

-- Add updated_at trigger for persons
CREATE TRIGGER update_persons_updated_at BEFORE UPDATE ON persons
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
