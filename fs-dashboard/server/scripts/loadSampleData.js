/**
 * Load sample data for testing
 * Creates test cameras and demonstrates the camera manager functionality
 */
import { CameraDAL } from '../src/db/CameraDAL.js';
import { cameraEventPublisher } from '../src/events/CameraEventPublisher.js';

export async function loadSampleData() {
    try {
        console.log('Loading sample data...');

        // Sample cameras
        const sampleCameras = [
            {
                name: 'Front Entrance Camera',
                connection_string: 'rtsp://admin:password@192.168.1.100:554/stream',
                status: 'disabled',
                location: 'Front Entrance',
                description: 'Main entrance monitoring camera',
                metadata: {
                    zone: 'entrance',
                    priority: 'high',
                    recording: true
                }
            },
            {
                name: 'Parking Lot Camera',
                connection_string: 'rtsp://admin:password@192.168.1.101:554/stream',
                status: 'disabled',
                location: 'Parking Lot',
                description: 'Parking area surveillance',
                metadata: {
                    zone: 'parking',
                    priority: 'medium',
                    recording: false
                }
            },
            {
                name: 'Back Exit Camera',
                connection_string: 'rtsp://admin:password@192.168.1.102:554/stream',
                status: 'disabled',
                location: 'Back Exit',
                description: 'Emergency exit monitoring',
                metadata: {
                    zone: 'exit',
                    priority: 'high',
                    recording: true
                }
            }
        ];

        // Create sample cameras
        const createdCameras = [];
        for (const cameraData of sampleCameras) {
            try {
                const camera = await CameraDAL.createCamera(cameraData);
                createdCameras.push(camera);
                
                // Publish camera created event
                cameraEventPublisher.publishCameraCreated(camera);
                
                console.log(`✓ Created camera: ${camera.name} (${camera.id})`);
                
            } catch (error) {
                console.log(`⚠ Camera ${cameraData.name} might already exist, skipping...`);
            }
        }

        console.log(`✓ Sample data loaded successfully - ${createdCameras.length} cameras created`);

        // Demonstrate enabling a camera (triggers worker creation)
        if (createdCameras.length > 0) {
            const firstCamera = createdCameras[0];
            console.log(`\nDemo: Enabling camera ${firstCamera.name}...`);
            
            setTimeout(async () => {
                try {
                    const updatedCamera = await CameraDAL.updateCamera(firstCamera.id, { status: 'enabled' });
                    cameraEventPublisher.publishCameraUpdated(updatedCamera, 'disabled');
                    console.log(`✓ Demo: Camera ${firstCamera.name} enabled - worker should be created`);
                } catch (error) {
                    console.error('Demo enable failed:', error);
                }
            }, 2000);
        }

        return createdCameras;

    } catch (error) {
        console.error('Failed to load sample data:', error);
        throw error;
    }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
    loadSampleData()
        .then(() => {
            console.log('Sample data loading completed');
            process.exit(0);
        })
        .catch((error) => {
            console.error('Sample data loading failed:', error);
            process.exit(1);
        });
}
