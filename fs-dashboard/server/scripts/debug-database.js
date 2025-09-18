#!/usr/bin/env node

/**
 * Debug Script - Check database schema and test camera creation
 */

import { createClient } from '@supabase/supabase-js';
import { supabaseConfig } from '../src/config/database.js';

async function debugDatabase() {
  console.log('🔍 Debugging database schema...');

  const supabase = createClient(supabaseConfig.url, supabaseConfig.key);

  try {
    // Test cameras table structure
    console.log('\n📋 Testing cameras table...');
    const { data: cameras, error: camerasError } = await supabase
      .from('cameras')
      .select('*')
      .limit(1);

    if (camerasError) {
      console.error('❌ Error accessing cameras table:', camerasError);
    } else {
      console.log('✅ cameras table accessible');
      console.log('Columns available:', cameras.length > 0 ? Object.keys(cameras[0]) : 'No data to show columns');
    }

    // Test users table
    console.log('\n👥 Testing users table...');
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, email, role')
      .limit(1);

    if (usersError) {
      console.error('❌ Error accessing users table:', usersError);
    } else {
      console.log('✅ users table accessible');
      console.log('Available users:', users.length);
    }

    // Try creating a test camera
    console.log('\n🎥 Testing camera creation...');
    const testCamera = {
      name: 'Debug Test Camera',
      camera_id: 'DEBUG_TEST_' + Date.now(),
      connection_string: 'rtsp://test:test@127.0.0.1:554/test'
    };

    // First, let's see if we can get a user to use as created_by
    const { data: adminUsers, error: adminError } = await supabase
      .from('users')
      .select('id')
      .eq('role', 'admin')
      .limit(1);

    if (adminError || !adminUsers || adminUsers.length === 0) {
      console.log('⚠ No admin user found. Creating test user first...');
      
      const { data: newUser, error: userCreateError } = await supabase
        .from('users')
        .insert([{
          email: 'debug@test.com',
          username: 'debug',
          password_hash: '$2b$10$test',
          role: 'admin',
          first_name: 'Debug',
          last_name: 'User'
        }])
        .select()
        .single();

      if (userCreateError) {
        console.error('❌ Could not create test user:', userCreateError);
        return;
      } else {
        console.log('✅ Created test user');
        testCamera.created_by = newUser.id;
      }
    } else {
      testCamera.created_by = adminUsers[0].id;
      console.log('✅ Using existing admin user');
    }

    // Now try to create the camera
    const { data: newCamera, error: cameraError } = await supabase
      .from('cameras')
      .insert([testCamera])
      .select()
      .single();

    if (cameraError) {
      console.error('❌ Camera creation failed:', cameraError);
      
      // Check if it's a column issue
      if (cameraError.message.includes('camera_id')) {
        console.log('\n🔧 SOLUTION FOUND:');
        console.log('The error suggests the camera_id column is missing or not properly configured.');
        console.log('This matches the original error message.');
        console.log('\n📝 To fix this:');
        console.log('1. Go to Supabase Dashboard → SQL Editor');
        console.log('2. Run: ALTER TABLE cameras ADD COLUMN IF NOT EXISTS camera_id VARCHAR(50) UNIQUE;');
        console.log('3. Or recreate the cameras table with the correct schema');
      }
    } else {
      console.log('✅ Camera created successfully!');
      console.log('Camera data:', newCamera);
      
      // Clean up test camera
      await supabase.from('cameras').delete().eq('id', newCamera.id);
      console.log('🧹 Cleaned up test camera');
    }

  } catch (error) {
    console.error('❌ Debug failed:', error.message);
  }
}

debugDatabase().catch(console.error);