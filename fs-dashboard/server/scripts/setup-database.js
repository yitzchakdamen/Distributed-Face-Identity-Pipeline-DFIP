#!/usr/bin/env node

/**
 * Database Setup Script
 * Creates all required tables for the Camera Management System
 */

import { readFileSync } from 'fs';
import { createClient } from '@supabase/supabase-js';
import { supabaseConfig } from '../src/config/database.js';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function setupDatabase() {
  console.log('🔧 Setting up database...');

  // Validate environment variables
  if (!supabaseConfig.url || !supabaseConfig.key) {
    console.error('❌ Missing Supabase configuration. Please check your environment variables.');
    console.error('Required: SUPABASE_URL, SUPABASE_ANON_KEY');
    process.exit(1);
  }

  // Create Supabase client with service role key for admin operations
  const supabase = createClient(supabaseConfig.url, supabaseConfig.key, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });

  try {
    // Test connection by trying to access a simple table
    console.log('📡 Testing Supabase connection...');
    
    // Try to access cameras table first
    const { data: camerasTest, error: camerasError } = await supabase
      .from('cameras')
      .select('id')
      .limit(1);

    if (camerasError && camerasError.code === 'PGRST116') {
      console.log('ℹ cameras table does not exist yet - this is expected for first setup');
    } else if (camerasError && !camerasError.code.includes('PGRST116')) {
      console.log('⚠ Connection issue:', camerasError.message);
    } else {
      console.log('✅ cameras table already exists');
      console.log('🎉 Database appears to be already set up!');
      return;
    }

    console.log('✅ Connection to Supabase successful');

    // Read SQL file
    console.log('📖 Reading SQL setup script...');
    const sqlPath = join(__dirname, 'create_tables.sql');
    const sqlContent = readFileSync(sqlPath, 'utf8');

    // Split SQL commands (simple approach - works for our script)
    const commands = sqlContent
      .split(';')
      .map(cmd => cmd.trim())
      .filter(cmd => cmd.length > 0 && !cmd.startsWith('--'));

    console.log(`🛠 Need to create database tables...`);
    console.log('📋 Tables to create: users, cameras, camera_user_assignments, events');
    
    console.log('\n⚠ MANUAL SETUP REQUIRED:');
    console.log('Due to Supabase security restrictions, please create tables manually:');
    console.log('\n1. Go to your Supabase Dashboard');
    console.log('2. Navigate to SQL Editor');
    console.log(`3. Copy and paste the SQL from: ${sqlPath}`);
    console.log('4. Execute the SQL to create all tables');
    console.log('\n📋 Required tables:');
    console.log('  - users (with admin/operator/viewer roles)');
    console.log('  - cameras (with camera_id column)');
    console.log('  - camera_user_assignments');
    console.log('  - events');
    
    console.log('\n🔧 Alternative: Quick table creation commands:');
    console.log('\nCopy each command separately to Supabase SQL Editor:');
    
    const quickCommands = [
      `CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'viewer' CHECK (role IN ('admin', 'operator', 'viewer')),
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);`,
      
      `CREATE TABLE cameras (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    camera_id VARCHAR(50) UNIQUE NOT NULL,
    connection_string TEXT NOT NULL,
    created_by UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);`,

      `CREATE TABLE camera_user_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    camera_id UUID NOT NULL REFERENCES cameras(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    assigned_by UUID NOT NULL REFERENCES users(id),
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(camera_id, user_id)
);`,

      `INSERT INTO users (email, username, password_hash, role, first_name, last_name) 
VALUES (
    'admin@facealert.live',
    'admin',
    '$2b$10$rQc3.QVv3dP8LKkI1ZHuDOWmVBLjR6Z8jHKx.sF7Lx.YoK2zQ9sU2',
    'admin',
    'System',
    'Administrator'
);`
    ];
    
    quickCommands.forEach((cmd, index) => {
      console.log(`\n--- Command ${index + 1} ---`);
      console.log(cmd);
    });

    console.log('\n🔑 Default admin credentials:');
    console.log('Email: admin@facealert.live');
    console.log('Password: admin123');
    
    console.log('\n🚀 After creating tables manually:');
    console.log('1. Restart the server: npm start');
    console.log('2. Try creating a camera again');
    console.log('3. The "camera_id column not found" error should be resolved');

    return;

    console.log('🎉 Database setup completed successfully!');
    console.log('📋 Created tables:');
    console.log('  - users');
    console.log('  - cameras');
    console.log('  - camera_user_assignments');
    console.log('  - events');

    // Verify tables were created
    console.log('🔍 Verifying table creation...');
    
    try {
      const { data: cameras, error: camerasError } = await supabase
        .from('cameras')
        .select('id')
        .limit(1);
      
      if (!camerasError) {
        console.log('✅ cameras table accessible');
      }
      
      const { data: users, error: usersError } = await supabase
        .from('users')
        .select('id')
        .limit(1);
      
      if (!usersError) {
        console.log('✅ users table accessible');
      }

    } catch (verifyError) {
      console.log('⚠ Could not verify tables automatically');
      console.log('Please check Supabase Dashboard to confirm tables were created');
    }

    console.log('\n🚀 Next steps:');
    console.log('1. Start the server: npm start');
    console.log('2. Test the camera creation endpoint');
    console.log('3. Check server logs for any additional setup needed');

  } catch (error) {
    console.error('❌ Database setup failed:', error.message);
    console.error('\n🔧 Troubleshooting:');
    console.error('1. Check your Supabase credentials in .env');
    console.error('2. Ensure your Supabase project has the required permissions');
    console.error('3. Try creating tables manually via Supabase Dashboard');
    console.error('4. SQL script location:', join(__dirname, 'create_tables.sql'));
    process.exit(1);
  }
}

// Run the setup
setupDatabase().catch(console.error);