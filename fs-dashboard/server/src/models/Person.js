/**
 * Person model for face recognition
 */
export class Person {
    constructor({
        person_id = null,
        name,
        description = null,
        metadata = {},
        is_active = true,
        created_at = null,
        updated_at = null
    }) {
        this.person_id = person_id;
        this.name = name;
        this.description = description;
        this.metadata = metadata;
        this.is_active = is_active;
        this.created_at = created_at;
        this.updated_at = updated_at;
    }

    toJSON() {
        return {
            person_id: this.person_id,
            name: this.name,
            description: this.description,
            metadata: this.metadata,
            is_active: this.is_active,
            created_at: this.created_at,
            updated_at: this.updated_at
        };
    }
}

/**
 * Embedding model
 */
export class Embedding {
    constructor({
        id = null,
        person_id,
        vector = null,
        vector_db_id = null,
        source_camera_id = null,
        confidence = null,
        image_url = null,
        metadata = {},
        created_at = null
    }) {
        this.id = id;
        this.person_id = person_id;
        this.vector = vector;
        this.vector_db_id = vector_db_id;
        this.source_camera_id = source_camera_id;
        this.confidence = confidence;
        this.image_url = image_url;
        this.metadata = metadata;
        this.created_at = created_at;
    }

    toJSON() {
        return {
            id: this.id,
            person_id: this.person_id,
            vector: this.vector,
            vector_db_id: this.vector_db_id,
            source_camera_id: this.source_camera_id,
            confidence: this.confidence,
            image_url: this.image_url,
            metadata: this.metadata,
            created_at: this.created_at
        };
    }
}

/**
 * Alert model
 */
export class Alert {
    constructor({
        id = null,
        camera_id,
        alert_type = 'unknown_person',
        timestamp = null,
        image_url = null,
        thumbnail_url = null,
        recognized = false,
        recognized_person_id = null,
        confidence = null,
        metadata = {},
        status = 'new',
        acknowledged_by = null,
        acknowledged_at = null,
        created_at = null
    }) {
        this.id = id;
        this.camera_id = camera_id;
        this.alert_type = alert_type;
        this.timestamp = timestamp || new Date();
        this.image_url = image_url;
        this.thumbnail_url = thumbnail_url;
        this.recognized = recognized;
        this.recognized_person_id = recognized_person_id;
        this.confidence = confidence;
        this.metadata = metadata;
        this.status = status;
        this.acknowledged_by = acknowledged_by;
        this.acknowledged_at = acknowledged_at;
        this.created_at = created_at;
    }

    static validateAlertType(type) {
        const validTypes = ['unknown_person', 'known_person', 'system_error'];
        return validTypes.includes(type);
    }

    static validateStatus(status) {
        const validStatuses = ['new', 'acknowledged', 'resolved', 'false_positive'];
        return validStatuses.includes(status);
    }

    toJSON() {
        return {
            id: this.id,
            camera_id: this.camera_id,
            alert_type: this.alert_type,
            timestamp: this.timestamp,
            image_url: this.image_url,
            thumbnail_url: this.thumbnail_url,
            recognized: this.recognized,
            recognized_person_id: this.recognized_person_id,
            confidence: this.confidence,
            metadata: this.metadata,
            status: this.status,
            acknowledged_by: this.acknowledged_by,
            acknowledged_at: this.acknowledged_at,
            created_at: this.created_at
        };
    }
}
