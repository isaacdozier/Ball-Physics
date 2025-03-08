/**
 * Camera setup and management with enhanced controls
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
        
        // Track camera angle for rotation
        this.cameraAngle = 0;
        
        // Camera animation properties
        this.targetOffset = this.offset.clone();
        this.isAnimating = false;
        this.animationProgress = 0;
        this.animationDuration = 30; // frames
    }
    
    updatePosition(vehiclePosition, vehicleRotation) {
        // Create a rotation matrix based on the vehicle's rotation
        const rotationMatrix = new THREE.Matrix4();
        rotationMatrix.makeRotationY(vehicleRotation + this.cameraAngle);
        
        // If animating camera movement, interpolate offset
        if (this.isAnimating) {
            this.animationProgress++;
            
            // Calculate smooth interpolation factor (ease-out)
            const t = this.animationProgress / this.animationDuration;
            const smoothT = 1 - Math.pow(1 - t, 3); // Cubic ease-out
            
            // Interpolate offset
            this.offset.lerp(this.targetOffset, smoothT);
            
            // End animation if complete
            if (this.animationProgress >= this.animationDuration) {
                this.isAnimating = false;
                this.offset.copy(this.targetOffset);
            }
        }
        
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
    
    /**
     * Rotate camera left (counterclockwise around vehicle)
     */
    rotateOffsetLeft() {
        // Rotate 45 degrees left
        this.cameraAngle += Math.PI / 4;
        
        // Normalize angle
        this.normalizeAngle();
        
        // Start animation
        this.startCameraAnimation();
    }
    
    /**
     * Rotate camera right (clockwise around vehicle)
     */
    rotateOffsetRight() {
        // Rotate 45 degrees right
        this.cameraAngle -= Math.PI / 4;
        
        // Normalize angle
        this.normalizeAngle();
        
        // Start animation
        this.startCameraAnimation();
    }
    
    /**
     * Keep angle in -2π to 2π range
     */
    normalizeAngle() {
        // Keep angle in range
        while (this.cameraAngle > Math.PI * 2) {
            this.cameraAngle -= Math.PI * 2;
        }
        
        while (this.cameraAngle < -Math.PI * 2) {
            this.cameraAngle += Math.PI * 2;
        }
    }
    
    /**
     * Start a smooth camera transition animation
     */
    startCameraAnimation() {
        // Reset animation progress
        this.animationProgress = 0;
        this.isAnimating = true;
        
        // Copy base offset from config to ensure we're using original values
        this.targetOffset = CONFIG.camera.offset.clone();
    }
}