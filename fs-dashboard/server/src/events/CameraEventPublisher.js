/**
 * Event publisher for camera lifecycle events
 * This will later be replaced with Kafka/Redis Streams
 */
import { EventEmitter } from 'events';

class CameraEventPublisher extends EventEmitter {
    constructor() {
        super();
        this.setMaxListeners(50); // Allow more listeners for multiple cameras
    }

    /**
     * Publish camera created event
     */
    publishCameraCreated(camera) {
        const event = {
            type: 'camera.created',
            camera_id: camera.id,
            camera: camera.toJSON(),
            timestamp: new Date().toISOString()
        };
        
        console.log('Publishing camera.created event:', event);
        this.emit('camera.created', event);
        this.emit('camera.event', event);
    }

    /**
     * Publish camera updated event
     */
    publishCameraUpdated(camera, previousStatus) {
        const event = {
            type: 'camera.updated',
            camera_id: camera.id,
            camera: camera.toJSON(),
            previous_status: previousStatus,
            timestamp: new Date().toISOString()
        };

        console.log('Publishing camera.updated event:', event);
        this.emit('camera.updated', event);
        this.emit('camera.event', event);

        // Publish specific status events
        if (camera.status === 'enabled' && previousStatus !== 'enabled') {
            this.publishCameraEnabled(camera);
        } else if (camera.status === 'disabled' && previousStatus !== 'disabled') {
            this.publishCameraDisabled(camera);
        }
    }

    /**
     * Publish camera enabled event
     */
    publishCameraEnabled(camera) {
        const event = {
            type: 'camera.enabled',
            camera_id: camera.id,
            camera: camera.toJSON(),
            timestamp: new Date().toISOString()
        };

        console.log('Publishing camera.enabled event:', event);
        this.emit('camera.enabled', event);
        this.emit('camera.event', event);
    }

    /**
     * Publish camera disabled event
     */
    publishCameraDisabled(camera) {
        const event = {
            type: 'camera.disabled',
            camera_id: camera.id,
            camera: camera.toJSON(),
            timestamp: new Date().toISOString()
        };

        console.log('Publishing camera.disabled event:', event);
        this.emit('camera.disabled', event);
        this.emit('camera.event', event);
    }

    /**
     * Publish camera deleted event
     */
    publishCameraDeleted(cameraId) {
        const event = {
            type: 'camera.deleted',
            camera_id: cameraId,
            timestamp: new Date().toISOString()
        };

        console.log('Publishing camera.deleted event:', event);
        this.emit('camera.deleted', event);
        this.emit('camera.event', event);
    }

    /**
     * Publish worker heartbeat event
     */
    publishWorkerHeartbeat(cameraId, status, healthInfo) {
        const event = {
            type: 'worker.heartbeat',
            camera_id: cameraId,
            status: status,
            health_info: healthInfo,
            timestamp: new Date().toISOString()
        };

        this.emit('worker.heartbeat', event);
    }

    /**
     * Publish worker error event
     */
    publishWorkerError(cameraId, error) {
        const event = {
            type: 'worker.error',
            camera_id: cameraId,
            error: error,
            timestamp: new Date().toISOString()
        };

        console.log('Publishing worker.error event:', event);
        this.emit('worker.error', event);
    }
}

// Singleton instance
export const cameraEventPublisher = new CameraEventPublisher();
