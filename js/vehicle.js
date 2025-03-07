/**
 * Vehicle setup and simplified physics
 */
class Vehicle {
    constructor(scene) {
        // Store reference to scene for adding objects
        this.scene = scene;
        
        // Vehicle physics properties
        this.position = new THREE.Vector3(0, 0.5, 0);
        this.rotation = 0; // Yaw in radians
        this.velocity = 0; // Current forward velocity
        this.acceleration = 0;
        this.steeringAngle = 0;
        this.driftFactor = 0;
        
        // Surface interaction data - with safe defaults
        this.surfaceNormal = new THREE.Vector3(0, 1, 0); // Default is ground (up)
        this.isOnGround = true;
        this.isOnWall = false;
        this.isOnRamp = false;
        this.currentFriction = CONFIG.physics.groundFriction;
        this.gravityDirection = new THREE.Vector3(0, -1, 0); // Default gravity direction (down)
        
        // Gravity velocity (separate from forward velocity)
        this.gravityVelocity = 0;
        
        // Create the vehicle mesh
        this.createVehicleMesh();
    }
    
    createVehicleMesh() {
        // Vehicle body
        const bodyGeometry = new THREE.BoxGeometry(2, 0.8, 4);
        const bodyMaterial = new THREE.MeshStandardMaterial({ 
            color: CONFIG.colors.vehicleBody 
        });
        this.mesh = new THREE.Mesh(bodyGeometry, bodyMaterial);
        this.mesh.position.copy(this.position);
        this.mesh.castShadow = true;
        this.mesh.receiveShadow = true;
        this.scene.add(this.mesh);
        
        // Create front hood (sloped and lower)
        const hoodGeometry = new THREE.BoxGeometry(1.9, 0.2, 1.2);
        const hoodMaterial = new THREE.MeshStandardMaterial({ 
            color: CONFIG.colors.vehicleBody
        });
        const hood = new THREE.Mesh(hoodGeometry, hoodMaterial);
        hood.position.set(0, -0.2, 1.8); // Lower and toward front
        hood.rotation.x = -0.2; // Slight slope
        this.mesh.add(hood);
        
        // Create wheels array
        this.wheelMeshes = [];
        this.addWheels();
        
        // Add vehicle details
        this.addVehicleDetails();
    }
    
    addWheels() {
        const wheelGeometry = new THREE.CylinderGeometry(0.5, 0.5, 0.2, 16);
        const wheelMaterial = new THREE.MeshStandardMaterial({ 
            color: CONFIG.colors.wheels 
        });
        
        // Wheel positions (FL, FR, RL, RR)
        const wheelPositions = [
            new THREE.Vector3(-1, -0.3, 1.5),  // Front Left
            new THREE.Vector3(1, -0.3, 1.5),   // Front Right
            new THREE.Vector3(-1, -0.3, -1.5), // Rear Left
            new THREE.Vector3(1, -0.3, -1.5)   // Rear Right
        ];
        
        for (let i = 0; i < wheelPositions.length; i++) {
            const wheel = new THREE.Mesh(wheelGeometry, wheelMaterial);
            wheel.position.copy(wheelPositions[i]);
            wheel.rotation.z = Math.PI / 2; // Align wheel correctly
            wheel.castShadow = true;
            this.mesh.add(wheel);
            this.wheelMeshes.push(wheel);
        }
    }
    
    addVehicleDetails() {
        // Cabin
        const cabinGeometry = new THREE.BoxGeometry(1.8, 0.8, 2);
        const cabinMaterial = new THREE.MeshStandardMaterial({ 
            color: CONFIG.colors.cabin,
            metalness: 0.8,
            roughness: 0.2
        });
        const cabin = new THREE.Mesh(cabinGeometry, cabinMaterial);
        cabin.position.set(0, 0.9, 0);
        cabin.castShadow = true;
        this.mesh.add(cabin);
        
        // Headlights
        const headlightGeometry = new THREE.SphereGeometry(0.2, 16, 16);
        const headlightMaterial = new THREE.MeshStandardMaterial({ 
            color: CONFIG.colors.headlights,
            emissive: CONFIG.colors.headlights,
            emissiveIntensity: 0.5
        });
        
        const leftHeadlight = new THREE.Mesh(headlightGeometry, headlightMaterial);
        leftHeadlight.position.set(-0.7, 0, 2);
        leftHeadlight.scale.z = 0.5;
        this.mesh.add(leftHeadlight);
        
        const rightHeadlight = new THREE.Mesh(headlightGeometry, headlightMaterial);
        rightHeadlight.position.set(0.7, 0, 2);
        rightHeadlight.scale.z = 0.5;
        this.mesh.add(rightHeadlight);
    }
    
    update(controls) {
        this.updateSteering(controls);
        this.updateVelocity(controls);
        
        // Safe version that does nothing but sets defaults
        this.updateSurfaceDetection();
        
        this.updatePosition();
        this.updateWheels();
    }
    
    // Add a safe version of updateSurfaceDetection that just sets defaults
    updateSurfaceDetection() {
        // Set default values - simple ground physics only
        this.isOnGround = true;
        this.isOnWall = false;
        this.isOnRamp = false;
        this.surfaceNormal = new THREE.Vector3(0, 1, 0);
        this.currentFriction = CONFIG.physics.groundFriction;
        this.gravityDirection = new THREE.Vector3(0, -1, 0);
    }
    
    updateSteering(controls) {
        const steeringInput = controls.getSteeringInput();
        const physics = CONFIG.physics;
        
        if (steeringInput !== 0) {
            // Apply steering based on input
            this.steeringAngle += steeringInput * physics.steeringSpeed;
            
            // Clamp to max steering angle
            this.steeringAngle = Math.max(
                -physics.maxSteeringAngle,
                Math.min(physics.maxSteeringAngle, this.steeringAngle)
            );
        } else {
            // Return steering to center gradually
            if (this.steeringAngle > 0) {
                this.steeringAngle = Math.max(0, this.steeringAngle - physics.steeringReturnSpeed);
            } else if (this.steeringAngle < 0) {
                this.steeringAngle = Math.min(0, this.steeringAngle + physics.steeringReturnSpeed);
            }
        }
    }
    
    updateVelocity(controls) {
        const throttleInput = controls.getThrottleInput();
        const handbrake = controls.isHandbrakeActive();
        const physics = CONFIG.physics;
        
        // Calculate acceleration based on input
        if (throttleInput > 0) {
            // Accelerating
            this.acceleration = physics.accelerationRate * throttleInput;
        } else if (throttleInput < 0) {
            // Braking/Reversing
            this.acceleration = physics.brakeRate * throttleInput;
        } else {
            // No input - gradually slow down
            this.acceleration = 0;
        }
        
        // Apply acceleration to velocity
        this.velocity += this.acceleration;
        
        // Apply friction
        this.velocity *= physics.groundFriction;
        
        // Apply handbrake
        if (handbrake) {
            this.velocity *= 0.95;
        }
        
        // Clamp velocity to speed limits
        if (this.velocity > physics.maxSpeed) {
            this.velocity = physics.maxSpeed;
        } else if (this.velocity < -physics.maxReverseSpeed) {
            this.velocity = -physics.maxReverseSpeed;
        }
        
        // Simple drift effect based on speed and steering
        if (Math.abs(this.velocity) > physics.driftThreshold && 
            Math.abs(this.steeringAngle) > physics.maxSteeringAngle / 2) {
            this.driftFactor = Math.min(this.driftFactor + 0.01, 0.3);
        } else {
            this.driftFactor *= 0.95;
        }
    }
    
    updatePosition() {
        // Calculate turning rate based on steering angle and velocity
        let turningRate = 0;
        
        if (Math.abs(this.velocity) > 0.01) {
            // Direction awareness (different steering for forward/reverse)
            const directionFactor = this.velocity > 0 ? 1 : -1;
            
            // Base turning rate
            turningRate = -this.steeringAngle * directionFactor * Math.abs(this.velocity) * 0.7;
        }
        
        // Update rotation
        this.rotation += turningRate;
        
        // Calculate movement based on velocity and rotation
        let moveX = Math.sin(this.rotation) * this.velocity;
        let moveZ = Math.cos(this.rotation) * this.velocity;
        
        // Apply drift effect perpendicular to forward direction
        moveX += Math.sin(this.rotation + Math.PI/2) * this.driftFactor * this.velocity;
        moveZ += Math.cos(this.rotation + Math.PI/2) * this.driftFactor * this.velocity;
        
        // Update position
        this.position.x += moveX;
        this.position.z += moveZ;
        
        // Keep vehicle on the ground
        const halfGroundSize = CONFIG.scene.groundSize / 2;
        
        // Simple boundary checking
        if (this.position.x > halfGroundSize) {
            this.position.x = halfGroundSize;
            this.velocity *= 0.5;
        } else if (this.position.x < -halfGroundSize) {
            this.position.x = -halfGroundSize;
            this.velocity *= 0.5;
        }
        
        if (this.position.z > halfGroundSize) {
            this.position.z = halfGroundSize;
            this.velocity *= 0.5;
        } else if (this.position.z < -halfGroundSize) {
            this.position.z = -halfGroundSize;
            this.velocity *= 0.5;
        }
        
        // Update mesh position and rotation
        this.mesh.position.copy(this.position);
        this.mesh.rotation.y = this.rotation;
    }
    
    updateWheels() {
        // Update front wheel steering
        if (this.wheelMeshes.length >= 2) {
            this.wheelMeshes[0].rotation.y = -this.steeringAngle; // Front Left
            this.wheelMeshes[1].rotation.y = -this.steeringAngle; // Front Right
            
            // Update wheel rotation animation
            for (const wheel of this.wheelMeshes) {
                wheel.rotation.x += this.velocity * 0.5;
            }
        }
    }
    
    getPosition() {
        return this.position;
    }
    
    getRotation() {
        return this.rotation;
    }
    
    getVelocity() {
        return this.velocity;
    }
    
    getDirection() {
        return new THREE.Vector3(
            Math.sin(this.rotation),
            0,
            Math.cos(this.rotation)
        );
    }
    
    applyImpulse(impulseX, impulseZ) {
        // Convert impulse to vehicle's local coordinate system
        const cosAngle = Math.cos(this.rotation);
        const sinAngle = Math.sin(this.rotation);
        
        // Rotate impulse to align with vehicle direction
        const localImpulseX = impulseX * cosAngle + impulseZ * sinAngle;
        const localImpulseZ = -impulseX * sinAngle + impulseZ * cosAngle;
        
        // Forward impulse directly affects velocity
        this.velocity += localImpulseZ * 0.05; 
        
        // Sideways impulse affects rotation (causes vehicle to spin)
        this.rotation += localImpulseX * 0.03;
    }
}