/**
 * Camera Manager - Manages lifecycle of camera worker pods in Kubernetes
 * This is a proof of concept that listens to camera events and creates/destroys workers
 */
import { cameraEventPublisher } from '../../events/CameraEventPublisher.js';
import { CameraRuntimeDAL } from '../../db/CameraDAL.js';

export class CameraManager {
    constructor() {
        this.workers = new Map(); // camera_id -> worker_info
        this.isRunning = false;
        this.setupEventListeners();
    }

    /**
     * Start the camera manager
     */
    start() {
        if (this.isRunning) return;
        
        this.isRunning = true;
        console.log('Camera Manager started - listening for camera events');
        
        // TODO: Reconcile existing enabled cameras on startup
        this.reconcileExistingCameras();
    }

    /**
     * Stop the camera manager
     */
    stop() {
        this.isRunning = false;
        console.log('Camera Manager stopped');
    }

    /**
     * Setup event listeners for camera lifecycle events
     */
    setupEventListeners() {
        // Listen for camera enabled events
        cameraEventPublisher.on('camera.enabled', async (event) => {
            try {
                await this.handleCameraEnabled(event);
            } catch (error) {
                console.error('Error handling camera enabled event:', error);
            }
        });

        // Listen for camera disabled events
        cameraEventPublisher.on('camera.disabled', async (event) => {
            try {
                await this.handleCameraDisabled(event);
            } catch (error) {
                console.error('Error handling camera disabled event:', error);
            }
        });

        // Listen for camera deleted events
        cameraEventPublisher.on('camera.deleted', async (event) => {
            try {
                await this.handleCameraDeleted(event);
            } catch (error) {
                console.error('Error handling camera deleted event:', error);
            }
        });

        // Listen for worker errors
        cameraEventPublisher.on('worker.error', async (event) => {
            try {
                await this.handleWorkerError(event);
            } catch (error) {
                console.error('Error handling worker error event:', error);
            }
        });
    }

    /**
     * Handle camera enabled event - create worker
     */
    async handleCameraEnabled(event) {
        const { camera_id, camera } = event;
        
        console.log(`Creating worker for camera: ${camera_id}`);

        // Update runtime status to starting
        await CameraRuntimeDAL.upsertRuntime({
            camera_id,
            worker_status: 'starting',
            pod_name: null,
            last_heartbeat: null,
            health_status: 'starting',
            error_count: 0
        });

        try {
            // Create worker (mock implementation for now)
            const workerInfo = await this.createWorker(camera);
            
            // Store worker info
            this.workers.set(camera_id, workerInfo);

            // Update runtime status to running
            await CameraRuntimeDAL.upsertRuntime({
                camera_id,
                worker_status: 'running',
                pod_name: workerInfo.podName,
                last_heartbeat: new Date().toISOString(),
                health_status: 'healthy'
            });

            console.log(`Worker created successfully for camera: ${camera_id}, pod: ${workerInfo.podName}`);

        } catch (error) {
            console.error(`Failed to create worker for camera ${camera_id}:`, error);
            
            // Update runtime status to error
            await CameraRuntimeDAL.upsertRuntime({
                camera_id,
                worker_status: 'error',
                last_error: error.message,
                error_count: 1
            });
        }
    }

    /**
     * Handle camera disabled event - destroy worker
     */
    async handleCameraDisabled(event) {
        const { camera_id } = event;
        
        console.log(`Destroying worker for camera: ${camera_id}`);

        // Update runtime status to stopping
        await CameraRuntimeDAL.upsertRuntime({
            camera_id,
            worker_status: 'stopping'
        });

        try {
            const workerInfo = this.workers.get(camera_id);
            if (workerInfo) {
                await this.destroyWorker(camera_id, workerInfo);
                this.workers.delete(camera_id);
            }

            // Update runtime status to stopped
            await CameraRuntimeDAL.upsertRuntime({
                camera_id,
                worker_status: 'stopped',
                pod_name: null,
                last_heartbeat: null,
                health_status: 'stopped'
            });

            console.log(`Worker destroyed successfully for camera: ${camera_id}`);

        } catch (error) {
            console.error(`Failed to destroy worker for camera ${camera_id}:`, error);
            
            // Update runtime status to error
            await CameraRuntimeDAL.upsertRuntime({
                camera_id,
                worker_status: 'error',
                last_error: error.message
            });
        }
    }

    /**
     * Handle camera deleted event - cleanup worker and runtime
     */
    async handleCameraDeleted(event) {
        const { camera_id } = event;
        
        console.log(`Cleaning up worker for deleted camera: ${camera_id}`);

        try {
            // Destroy worker if exists
            const workerInfo = this.workers.get(camera_id);
            if (workerInfo) {
                await this.destroyWorker(camera_id, workerInfo);
                this.workers.delete(camera_id);
            }

            // Delete runtime record
            await CameraRuntimeDAL.deleteRuntime(camera_id);

            console.log(`Cleanup completed for deleted camera: ${camera_id}`);

        } catch (error) {
            console.error(`Failed to cleanup camera ${camera_id}:`, error);
        }
    }

    /**
     * Handle worker error event
     */
    async handleWorkerError(event) {
        const { camera_id, error } = event;
        
        console.log(`Handling worker error for camera: ${camera_id}`);

        try {
            // Get current runtime status
            const runtime = await CameraRuntimeDAL.getRuntimeByCameraId(camera_id);
            if (!runtime) return;

            const errorCount = (runtime.error_count || 0) + 1;

            // Update error count and status
            await CameraRuntimeDAL.upsertRuntime({
                camera_id,
                worker_status: 'error',
                last_error: error,
                error_count: errorCount
            });

            // If too many errors, mark as failed
            if (errorCount >= 5) {
                console.log(`Too many errors for camera ${camera_id}, marking as failed`);
                
                // Optionally disable the camera
                // await CameraDAL.updateCamera(camera_id, { status: 'disabled' });
            }

        } catch (error) {
            console.error(`Failed to handle worker error for camera ${camera_id}:`, error);
        }
    }

    /**
     * Create worker for camera (mock implementation)
     * In production, this would create Kubernetes Deployment/Pod
     */
    async createWorker(camera) {
        // Simulate Kubernetes deployment creation
        const podName = `camera-worker-${camera.id}`;
        
        // Mock delay for pod creation
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Mock worker info
        return {
            podName,
            namespace: 'default',
            image: 'camera-worker:latest',
            cameraId: camera.id,
            connectionString: camera.connection_string,
            createdAt: new Date().toISOString()
        };
    }

    /**
     * Destroy worker for camera (mock implementation)
     * In production, this would delete Kubernetes Deployment/Pod
     */
    async destroyWorker(cameraId, workerInfo) {
        // Simulate Kubernetes deployment deletion
        console.log(`Deleting pod: ${workerInfo.podName} for camera: ${cameraId}`);
        
        // Mock delay for pod deletion
        await new Promise(resolve => setTimeout(resolve, 500));
        
        return true;
    }

    /**
     * Reconcile existing enabled cameras on startup
     */
    async reconcileExistingCameras() {
        try {
            // TODO: Get all enabled cameras and ensure they have workers
            console.log('Reconciling existing enabled cameras...');
            
            // This would query the database for enabled cameras
            // and ensure they have running workers
            
        } catch (error) {
            console.error('Error reconciling existing cameras:', error);
        }
    }

    /**
     * Get worker status for camera
     */
    getWorkerStatus(cameraId) {
        return this.workers.get(cameraId) || null;
    }

    /**
     * Get all managed workers
     */
    getAllWorkers() {
        return Array.from(this.workers.entries()).map(([cameraId, workerInfo]) => ({
            camera_id: cameraId,
            ...workerInfo
        }));
    }
}

// Singleton instance
export const cameraManager = new CameraManager();
