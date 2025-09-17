/**
 * Postgres Connection for Camera Management
 * Uses Supabase client for database operations
 */
import { supabase } from './supabase.js';
import { Camera, CameraRuntime } from '../models/Camera.js';

export class CameraDAL {
    /**
     * Create new camera
     */
    static async createCamera(cameraData) {
        try {
            const { data, error } = await supabase
                .from('cameras')
                .insert([{
                    name: cameraData.name,
                    connection_string: cameraData.connection_string,
                    status: cameraData.status || 'disabled',
                    location: cameraData.location,
                    description: cameraData.description,
                    metadata: cameraData.metadata || {}
                }])
                .select()
                .single();

            if (error) throw error;

            return new Camera(data);
        } catch (error) {
            console.error('Error creating camera:', error);
            throw error;
        }
    }

    /**
     * Get camera by ID
     */
    static async getCameraById(id) {
        try {
            const { data, error } = await supabase
                .from('cameras')
                .select('*')
                .eq('id', id)
                .single();

            if (error) {
                if (error.code === 'PGRST116') return null; // Not found
                throw error;
            }

            return new Camera(data);
        } catch (error) {
            console.error('Error getting camera by ID:', error);
            throw error;
        }
    }

    /**
     * Get all cameras with optional filters
     */
    static async getCameras(filters = {}) {
        try {
            let query = supabase.from('cameras').select('*');

            if (filters.status) {
                query = query.eq('status', filters.status);
            }

            if (filters.limit) {
                query = query.limit(filters.limit);
            }

            const { data, error } = await query.order('created_at', { ascending: false });

            if (error) throw error;

            return data.map(row => new Camera(row));
        } catch (error) {
            console.error('Error getting cameras:', error);
            throw error;
        }
    }

    /**
     * Update camera
     */
    static async updateCamera(id, updates) {
        try {
            const { data, error } = await supabase
                .from('cameras')
                .update(updates)
                .eq('id', id)
                .select()
                .single();

            if (error) throw error;

            return new Camera(data);
        } catch (error) {
            console.error('Error updating camera:', error);
            throw error;
        }
    }

    /**
     * Delete camera
     */
    static async deleteCamera(id) {
        try {
            const { error } = await supabase
                .from('cameras')
                .delete()
                .eq('id', id);

            if (error) throw error;

            return true;
        } catch (error) {
            console.error('Error deleting camera:', error);
            throw error;
        }
    }

    /**
     * Get cameras with runtime status
     */
    static async getCamerasWithRuntime() {
        try {
            const { data, error } = await supabase
                .from('cameras')
                .select(`
                    *,
                    camera_runtime (
                        pod_name,
                        worker_status,
                        last_heartbeat,
                        health_status,
                        error_count,
                        last_error
                    )
                `)
                .order('created_at', { ascending: false });

            if (error) throw error;

            return data.map(row => ({
                camera: new Camera(row),
                runtime: row.camera_runtime ? new CameraRuntime(row.camera_runtime) : null
            }));
        } catch (error) {
            console.error('Error getting cameras with runtime:', error);
            throw error;
        }
    }
}

export class CameraRuntimeDAL {
    /**
     * Create or update camera runtime status
     */
    static async upsertRuntime(runtimeData) {
        try {
            const { data, error } = await supabase
                .from('camera_runtime')
                .upsert(runtimeData, { onConflict: 'camera_id' })
                .select()
                .single();

            if (error) throw error;

            return new CameraRuntime(data);
        } catch (error) {
            console.error('Error upserting camera runtime:', error);
            throw error;
        }
    }

    /**
     * Get runtime status by camera ID
     */
    static async getRuntimeByCameraId(cameraId) {
        try {
            const { data, error } = await supabase
                .from('camera_runtime')
                .select('*')
                .eq('camera_id', cameraId)
                .single();

            if (error) {
                if (error.code === 'PGRST116') return null; // Not found
                throw error;
            }

            return new CameraRuntime(data);
        } catch (error) {
            console.error('Error getting camera runtime:', error);
            throw error;
        }
    }

    /**
     * Delete runtime record
     */
    static async deleteRuntime(cameraId) {
        try {
            const { error } = await supabase
                .from('camera_runtime')
                .delete()
                .eq('camera_id', cameraId);

            if (error) throw error;

            return true;
        } catch (error) {
            console.error('Error deleting camera runtime:', error);
            throw error;
        }
    }

    /**
     * Update heartbeat for camera
     */
    static async updateHeartbeat(cameraId, healthStatus = null) {
        try {
            const updates = {
                last_heartbeat: new Date().toISOString(),
                worker_status: 'running'
            };

            if (healthStatus) {
                updates.health_status = healthStatus;
            }

            const { data, error } = await supabase
                .from('camera_runtime')
                .update(updates)
                .eq('camera_id', cameraId)
                .select()
                .single();

            if (error) throw error;

            return new CameraRuntime(data);
        } catch (error) {
            console.error('Error updating heartbeat:', error);
            throw error;
        }
    }
}
