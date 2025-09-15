/**
 * Supabase Connection Module
 * Manages connection to Supabase for users data
 */
import { createClient } from "@supabase/supabase-js";
import { supabaseConfig } from "../config/database.js";

// Validate environment variables
if (!supabaseConfig.url || !supabaseConfig.key) {
  console.error("✘ Missing Supabase configuration. Please check your env variables.");
  process.exit(1);
}

// Create Supabase client
const supabase = createClient(supabaseConfig.url, supabaseConfig.key, supabaseConfig.options);

async function testSupabaseConnection() {
  try {
    // Simple query to test connection
    const { data, error } = await supabase.from("players").select("id").limit(1);

    if (error && error.code !== "PGRST116") {
      // PGRST116 means table doesn't exist yet, which is OK
      throw error;
    }

    console.log("✔ Supabase connection successful");
    return true;
  } catch (error) {
    console.error("✘ Supabase connection error:", error.message);
    return false;
  }
}

function getSupabaseClient() {
  return supabase;
}

export { supabase, testSupabaseConnection, getSupabaseClient };
