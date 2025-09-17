/**
 * Camera model with status management
 */
export class Camera {
    constructor({
        id = null,
        name,
        connection_string,
        status = 'disabled',
        location = null,
        description = null,
        metadata = {},
        created_at = null,
        updated_at = null
    }) {
        this.id = id;
        this.name = name;
        this.connection_string = connection_string;
        this.status = status;
        this.location = location;
        this.description = description;
        this.metadata = metadata;
        this.created_at = created_at;
        this.updated_at = updated_at;
    }

    static validateStatus(status) {
        const validStatuses = ['enabled', 'disabled'];
        return validStatuses.includes(status);
    }

    toJSON() {
        return {
            id: this.id,
            name: this.name,
            connection_string: this.connection_string,
            status: this.status,
            location: this.location,
            description: this.description,
            metadata: this.metadata,
            created_at: this.created_at,
            updated_at: this.updated_at
        };
    }

    // Return camera data without sensitive connection string
    toPublicJSON() {
        const data = this.toJSON();
        delete data.connection_string;
        return data;
    }
}

/**
 * Camera runtime status model
 */
export class CameraRuntime {
    constructor({
        camera_id,
        pod_name = null,
        worker_status = 'stopped',
        last_heartbeat = null,
        health_status = null,
        error_count = 0,
        last_error = null,
        created_at = null,
        updated_at = null
    }) {
        this.camera_id = camera_id;
        this.pod_name = pod_name;
        this.worker_status = worker_status;
        this.last_heartbeat = last_heartbeat;
        this.health_status = health_status;
        this.error_count = error_count;
        this.last_error = last_error;
        this.created_at = created_at;
        this.updated_at = updated_at;
    }

    static validateWorkerStatus(status) {
        const validStatuses = ['starting', 'running', 'stopping', 'stopped', 'error'];
        return validStatuses.includes(status);
    }

    toJSON() {
        return {
            camera_id: this.camera_id,
            pod_name: this.pod_name,
            worker_status: this.worker_status,
            last_heartbeat: this.last_heartbeat,
            health_status: this.health_status,
            error_count: this.error_count,
            last_error: this.last_error,
            created_at: this.created_at,
            updated_at: this.updated_at
        };
    }
}
