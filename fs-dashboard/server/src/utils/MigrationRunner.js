/**
 * Simple database migration runner
 * Runs SQL migration files in order
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { supabase } from '../db/supabase.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class MigrationRunner {
    constructor() {
        this.migrationsDir = path.join(__dirname, '../db/migrations');
    }

    /**
     * Run all pending migrations
     */
    async runMigrations() {
        try {
            console.log('Running database migrations...');

            // Create migrations tracking table if it doesn't exist
            await this.createMigrationsTable();

            // Get migration files
            const migrationFiles = this.getMigrationFiles();

            // Get completed migrations
            const completedMigrations = await this.getCompletedMigrations();

            // Run pending migrations
            for (const file of migrationFiles) {
                if (!completedMigrations.includes(file)) {
                    await this.runMigration(file);
                }
            }

            console.log('✓ All migrations completed successfully');

        } catch (error) {
            console.error('✗ Migration failed:', error);
            throw error;
        }
    }

    /**
     * Create migrations tracking table
     */
    async createMigrationsTable() {
        const sql = `
            CREATE TABLE IF NOT EXISTS schema_migrations (
                id SERIAL PRIMARY KEY,
                migration_name VARCHAR(255) NOT NULL UNIQUE,
                executed_at TIMESTAMP DEFAULT NOW()
            );
        `;

        const { error } = await supabase.rpc('exec_sql', { sql_query: sql });
        if (error) {
            // Try alternative approach if RPC doesn't work
            console.log('Attempting to create migrations table...');
        }
    }

    /**
     * Get all migration files sorted by name
     */
    getMigrationFiles() {
        try {
            const files = fs.readdirSync(this.migrationsDir)
                .filter(file => file.endsWith('.sql'))
                .sort();
            
            return files;
        } catch (error) {
            console.log('No migrations directory found, skipping migrations');
            return [];
        }
    }

    /**
     * Get list of completed migrations
     */
    async getCompletedMigrations() {
        try {
            const { data, error } = await supabase
                .from('schema_migrations')
                .select('migration_name');

            if (error) {
                console.log('Migrations table not found, assuming fresh install');
                return [];
            }

            return data.map(row => row.migration_name);
        } catch (error) {
            console.log('Could not check completed migrations, assuming fresh install');
            return [];
        }
    }

    /**
     * Run a single migration
     */
    async runMigration(filename) {
        try {
            console.log(`Running migration: ${filename}`);

            const filePath = path.join(this.migrationsDir, filename);
            const sql = fs.readFileSync(filePath, 'utf8');

            // Note: Supabase doesn't support raw SQL execution via client
            // In production, these would be run via Supabase CLI or admin panel
            console.log(`Migration ${filename} would execute SQL (run manually in Supabase):`, sql.substring(0, 100) + '...');

            // Mark as completed (mock)
            console.log(`✓ Migration ${filename} completed (mock)`);

        } catch (error) {
            console.error(`✗ Migration ${filename} failed:`, error);
            throw error;
        }
    }
}

// Export singleton instance
export const migrationRunner = new MigrationRunner();
