/**
 * Camera setup and management
 */
class GameCamera {
    constructor() {
        this.camera = new THREE.PerspectiveCamera(
            CONFIG.camera.fov,
            window.innerWidth / window.innerHeight,
            CONFIG.camera.near,
            CONFIG.camera.far
        );
        
        // Store the camera offset
        this.offset = CONFIG.camera.offset.clone();
    }
    
    updatePosition(vehiclePosition, vehicleRotation) {
        // Create a rotation matrix based on the vehicle's rotation
        const rotationMatrix = new THREE.Matrix4();
        rotationMatrix.makeRotationY(vehicleRotation);
        
        // Apply the rotation to the camera offset
        const rotatedOffset = this.offset.clone().applyMatrix4(rotationMatrix);
        
        // Position the camera
        this.camera.position.copy(vehiclePosition).add(rotatedOffset);
        
        // Look at the vehicle
        this.camera.lookAt(vehiclePosition);
    }
    
    updateAspect(aspect) {
        this.camera.aspect = aspect;
        this.camera.updateProjectionMatrix();
    }
}