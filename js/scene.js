/**
 * Scene setup and management
 */
class Scene {
    constructor() {
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(CONFIG.colors.sky);
        
        // Initialize renderer
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.shadowMap.enabled = true;
        document.body.appendChild(this.renderer.domElement);
        
        // Create lights and ground
        this.createLights();
        this.createGround();
        
        // Create ball
        this.ball = this.createBall();
        
        // Create spin visualization - using a canvas-based approach instead of FontLoader
        this.createSpinVisualization();
        
        // Set up window resize handler
        window.addEventListener('resize', () => this.handleResize());
        
        // Debug mode
        this.debugMode = true;
    }
    
    createLights() {
        // Ambient light
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        this.scene.add(ambientLight);
        
        // Directional light (sun)
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(10, 20, 10);
        directionalLight.castShadow = true;
        this.scene.add(directionalLight);
    }
    
    createGround() {
        // Ground plane
        const groundGeometry = new THREE.PlaneGeometry(
            CONFIG.scene.groundSize, 
            CONFIG.scene.groundSize
        );
        const groundMaterial = new THREE.MeshStandardMaterial({ 
            color: CONFIG.colors.ground,
            roughness: 0.8,
            metalness: 0.2
        });
        const ground = new THREE.Mesh(groundGeometry, groundMaterial);
        ground.rotation.x = -Math.PI / 2;
        ground.receiveShadow = true;
        
        this.scene.add(ground);
        this.ground = ground;
        
        // Grid for visual reference
        const grid = new THREE.GridHelper(
            CONFIG.scene.groundSize, 
            CONFIG.scene.gridDivisions, 
            0x000000, 
            0x000000
        );
        grid.position.y = 0.01; // Slightly above ground to prevent z-fighting
        this.scene.add(grid);
    }
    
    createBall() {
        // Create a textured ball
        const ballGeometry = new THREE.SphereGeometry(CONFIG.ball.radius, 32, 32);
        
        // Create texture-mapped ball material
        const ballMaterial = new THREE.MeshStandardMaterial({ 
            color: 0xFFFFFF,
            roughness: 0.2,
            metalness: 0.1,
            map: this.createBallTexture(),
            transparent: true,
            opacity: 0.9 // Slightly transparent to see axes inside
        });
        
        const ball = new THREE.Mesh(ballGeometry, ballMaterial);
        // Start the ball higher in the air
        ball.position.set(10, 20, 0); 
        ball.castShadow = true;
        ball.receiveShadow = true;
        
        // Add physics properties to the ball - with proper 3D angular velocity
        ball.velocity = new THREE.Vector3(0, 0, 0);
        ball.angularVelocity = new THREE.Vector3(0, 0, 0);
        ball.mass = CONFIG.ball.mass;
        ball.restitution = CONFIG.ball.restitution;
        ball.friction = CONFIG.ball.friction;
        
        this.scene.add(ball);
        return ball;
    }
    
    createBallTexture() {
        // Create a canvas for the texture
        const canvas = document.createElement('canvas');
        canvas.width = 512;
        canvas.height = 512;
        const ctx = canvas.getContext('2d');
        
        // Fill the background white
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Draw black hexagonal pattern
        ctx.fillStyle = 'black';
        
        // Draw hexagons
        const hexSize = 60;
        const centers = [
            {x: 256, y: 256}, // Center
            {x: 256, y: 100}, // Top
            {x: 256, y: 412}, // Bottom
            {x: 100, y: 180}, // Top left
            {x: 412, y: 180}, // Top right
            {x: 100, y: 332}, // Bottom left
            {x: 412, y: 332}, // Bottom right
        ];
        
        // Draw hexagons at each center point
        centers.forEach(center => {
            ctx.beginPath();
            for (let i = 0; i < 6; i++) {
                const angle = (Math.PI / 3) * i;
                const x = center.x + hexSize * Math.cos(angle);
                const y = center.y + hexSize * Math.sin(angle);
                if (i === 0) {
                    ctx.moveTo(x, y);
                } else {
                    ctx.lineTo(x, y);
                }
            }
            ctx.closePath();
            ctx.fill();
        });
        
        // Create a Three.js texture
        const texture = new THREE.CanvasTexture(canvas);
        return texture;
    }
    
    // Create visible axes to show ball rotation - FIXED to remove FontLoader dependency
    createSpinVisualization() {
        // Create a group to hold all visualization elements
        this.visualizationGroup = new THREE.Group();
        this.scene.add(this.visualizationGroup);
        
        // Create the three colored axes
        const axisLength = CONFIG.ball.radius * 1.5;
        const axisWidth = 0.2;
        
        // X axis - RED
        const xAxisGeometry = new THREE.CylinderGeometry(axisWidth, axisWidth, axisLength, 8);
        const xAxisMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
        this.xAxis = new THREE.Mesh(xAxisGeometry, xAxisMaterial);
        xAxisGeometry.rotateZ(Math.PI / 2); // Rotate to align with X axis
        this.visualizationGroup.add(this.xAxis);
        
        // X axis arrow
        const xArrowGeometry = new THREE.ConeGeometry(axisWidth * 2, axisLength/5, 8);
        const xArrow = new THREE.Mesh(xArrowGeometry, xAxisMaterial);
        xArrowGeometry.rotateZ(-Math.PI / 2); // Rotate to align with X axis
        xArrow.position.set(axisLength/2, 0, 0);
        this.xAxis.add(xArrow);
        
        // Y axis - GREEN
        const yAxisGeometry = new THREE.CylinderGeometry(axisWidth, axisWidth, axisLength, 8);
        const yAxisMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
        this.yAxis = new THREE.Mesh(yAxisGeometry, yAxisMaterial);
        this.visualizationGroup.add(this.yAxis);
        
        // Y axis arrow
        const yArrowGeometry = new THREE.ConeGeometry(axisWidth * 2, axisLength/5, 8);
        const yArrow = new THREE.Mesh(yArrowGeometry, yAxisMaterial);
        yArrow.position.set(0, axisLength/2, 0);
        this.yAxis.add(yArrow);
        
        // Z axis - BLUE
        const zAxisGeometry = new THREE.CylinderGeometry(axisWidth, axisWidth, axisLength, 8);
        const zAxisMaterial = new THREE.MeshBasicMaterial({ color: 0x0000ff });
        this.zAxis = new THREE.Mesh(zAxisGeometry, zAxisMaterial);
        zAxisGeometry.rotateX(Math.PI / 2); // Rotate to align with Z axis
        this.visualizationGroup.add(this.zAxis);
        
        // Z axis arrow
        const zArrowGeometry = new THREE.ConeGeometry(axisWidth * 2, axisLength/5, 8);
        const zArrow = new THREE.Mesh(zArrowGeometry, zAxisMaterial);
        zArrowGeometry.rotateX(-Math.PI / 2); // Rotate to align with Z axis
        zArrow.position.set(0, 0, axisLength/2);
        this.zAxis.add(zArrow);
        
        // Create spin markers
        this.spinMarkers = {
            x: new THREE.Mesh(
                new THREE.SphereGeometry(0.3, 8, 8),
                new THREE.MeshBasicMaterial({ color: 0xff0000 }) // Red for X-axis
            ),
            y: new THREE.Mesh(
                new THREE.SphereGeometry(0.3, 8, 8),
                new THREE.MeshBasicMaterial({ color: 0x00ff00 }) // Green for Y-axis
            ),
            z: new THREE.Mesh(
                new THREE.SphereGeometry(0.3, 8, 8),
                new THREE.MeshBasicMaterial({ color: 0x0000ff }) // Blue for Z-axis
            )
        };
        
        // Add markers to the scene
        this.scene.add(this.spinMarkers.x);
        this.scene.add(this.spinMarkers.y);
        this.scene.add(this.spinMarkers.z);
        
        // Create canvas-based text display (no FontLoader needed)
        this.createTextElement();
    }
    
    // Create a visual text element to display spin values - FIXED to use Canvas instead of FontLoader
    createTextElement() {
        // Create a canvas for the text display
        this.infoCanvas = document.createElement('canvas');
        this.infoCanvas.width = 256;
        this.infoCanvas.height = 128;
        this.infoContext = this.infoCanvas.getContext('2d');
        
        // Create a texture from the canvas
        this.infoTexture = new THREE.CanvasTexture(this.infoCanvas);
        
        // Create a plane to display the info
        const infoGeometry = new THREE.PlaneGeometry(6, 3);
        const infoMaterial = new THREE.MeshBasicMaterial({ 
            map: this.infoTexture, 
            transparent: true,
            side: THREE.DoubleSide
        });
        this.infoPanel = new THREE.Mesh(infoGeometry, infoMaterial);
        this.infoPanel.position.set(0, 10, 0);
        this.scene.add(this.infoPanel);
    }
    
    // Update the information panel with current spin values
    updateInfoPanel() {
        if (!this.infoContext) return;
        
        // Clear the canvas
        this.infoContext.fillStyle = 'rgba(0, 0, 0, 0.7)';
        this.infoContext.fillRect(0, 0, this.infoCanvas.width, this.infoCanvas.height);
        
        // Add a border
        this.infoContext.strokeStyle = 'white';
        this.infoContext.lineWidth = 2;
        this.infoContext.strokeRect(2, 2, this.infoCanvas.width-4, this.infoCanvas.height-4);
        
        // Set text properties
        this.infoContext.fillStyle = 'white';
        this.infoContext.font = '16px Arial';
        
        // Display spin values
        this.infoContext.fillText(`X-Spin: ${this.ball.angularVelocity.x.toFixed(3)}`, 10, 30);
        this.infoContext.fillText(`Y-Spin: ${this.ball.angularVelocity.y.toFixed(3)}`, 10, 50);
        this.infoContext.fillText(`Z-Spin: ${this.ball.angularVelocity.z.toFixed(3)}`, 10, 70);
        
        // Display velocity values
        this.infoContext.fillText(`X-Vel: ${this.ball.velocity.x.toFixed(3)}`, 10, 100);
        this.infoContext.fillText(`Y-Vel: ${this.ball.velocity.y.toFixed(3)}`, 130, 100);
        this.infoContext.fillText(`Z-Vel: ${this.ball.velocity.z.toFixed(3)}`, 10, 120);
        
        // Update the texture
        this.infoTexture.needsUpdate = true;
        
        // Position the panel to follow the camera
        if (window.camera) {
            const offset = new THREE.Vector3(0, 8, -10);
            offset.applyQuaternion(window.camera.quaternion);
            this.infoPanel.position.copy(this.ball.position.clone().add(offset));
            this.infoPanel.lookAt(window.camera.position);
        }
    }
    
    updateBall() {
        // If first time initialization, ensure the ball has angular velocity
        if (!this.ball.angularVelocity) {
            this.ball.angularVelocity = new THREE.Vector3(0, 0, 0);
        }
        
        // Apply gravity when ball is above ground
        if (this.ball.position.y > CONFIG.ball.radius) {
            this.ball.velocity.y -= CONFIG.physics.gravity;
        }
        
        // Store the previous position and velocity for collision detection
        const previousPosition = this.ball.position.clone();
        const previousVelocity = new THREE.Vector3(
            this.ball.velocity.x,
            this.ball.velocity.y,
            this.ball.velocity.z
        );
        
        // Update position based on velocity
        this.ball.position.x += this.ball.velocity.x;
        this.ball.position.y += this.ball.velocity.y;
        this.ball.position.z += this.ball.velocity.z;
        
        // Check for and handle collisions with surfaces
        this.handleSurfaceCollisions(previousPosition, previousVelocity);
        
        // Apply spin-velocity correlation physics
        this.applySpinVelocityCorrelation();
        
        // Apply continuous ground friction if the ball is rolling on the ground
        if (this.ball.position.y <= CONFIG.ball.radius + 0.1) {
            // Get horizontal velocity
            const horizontalVelocity = new THREE.Vector3(
                this.ball.velocity.x,
                0,
                this.ball.velocity.z
            );
            const horizontalSpeed = horizontalVelocity.length();
            
            // Apply stronger rolling friction (more decay)
            if (horizontalSpeed > 0.001) {
                const rollingFriction = 0.985;
                this.ball.velocity.x *= rollingFriction;
                this.ball.velocity.z *= rollingFriction;
            }
        }
        
        // Cap maximum speed to prevent runaway velocity
        const maxSpeed = 0.3;
        const currentSpeed = this.ball.velocity.length();
        if (currentSpeed > maxSpeed) {
            this.ball.velocity.multiplyScalar(maxSpeed / currentSpeed);
        }
        
        // Apply air resistance with unified decay rates
        const airResistanceVelocity = 0.99;
        const airResistanceSpin = 0.99;
        
        // Apply air resistance to velocity and spin
        this.ball.velocity.multiplyScalar(airResistanceVelocity);
        this.ball.angularVelocity.multiplyScalar(airResistanceSpin);
        
        // Apply angular velocity to rotation
        this.applyRotation();
        
        // Update visualizations
        if (this.debugMode) {
            this.updateVisualization();
        }
    }

    // Simplified spin-velocity correlation
    applySpinVelocityCorrelation() {
        // Simplified spin-velocity correlation
        const isNearGround = this.ball.position.y <= CONFIG.ball.radius + 0.1;
        
        if (isNearGround) {
            // Get horizontal velocity
            const horizontalVelocity = new THREE.Vector3(
                this.ball.velocity.x,
                0,
                this.ball.velocity.z
            );
            const horizontalSpeed = horizontalVelocity.length();
            
            if (horizontalSpeed > 0.001) {
                // Direction of travel
                const direction = horizontalVelocity.clone().normalize();
                
                // Spin around axes perpendicular to travel direction affects velocity
                // This is the heart of backspin/topspin physics
                
                // Get the spin axis perpendicular to travel direction
                const spinAxis = new THREE.Vector3();
                spinAxis.crossVectors(new THREE.Vector3(0, 1, 0), direction);
                
                // Project current angular velocity onto this axis to get rolling component
                const rollSpinMagnitude = this.ball.angularVelocity.dot(spinAxis);
                
                // Positive roll spin = topspin = increases velocity
                // Negative roll spin = backspin = decreases velocity
                // v = ω × r (additional velocity = roll spin × radius)
                let spinEffect = rollSpinMagnitude * CONFIG.ball.radius * 0.1;
                
                // Cap positive acceleration from spin, but allow full negative effect from backspin
                if (spinEffect > 0) {
                    spinEffect = Math.min(spinEffect, 0.002); // Cap positive acceleration
                }
                
                // Apply spin effect to velocity
                this.ball.velocity.addScaledVector(direction, spinEffect);
                
                // Side spin (Y-axis) creates curved paths
                if (Math.abs(this.ball.angularVelocity.y) > 0.01) {
                    // Find perpendicular direction
                    const sideDirection = new THREE.Vector3();
                    sideDirection.crossVectors(new THREE.Vector3(0, 1, 0), direction);
                    
                    // Apply side force
                    const sideForce = this.ball.angularVelocity.y * 0.002;
                    this.ball.velocity.addScaledVector(sideDirection, sideForce);
                }
                
                // Gradually align spin with rolling direction over time (friction effect)
                // This is key for converting backspin to forward roll
                if (horizontalSpeed > 0.05) {
                    // Calculate ideal rolling spin
                    const idealRollSpin = spinAxis.clone().multiplyScalar(horizontalSpeed / CONFIG.ball.radius);
                    
                    // Gradual adjustment toward ideal rolling
                    const adjustRate = 0.05;
                    this.ball.angularVelocity.x = THREE.MathUtils.lerp(
                        this.ball.angularVelocity.x,
                        idealRollSpin.x,
                        adjustRate
                    );
                    
                    this.ball.angularVelocity.z = THREE.MathUtils.lerp(
                        this.ball.angularVelocity.z,
                        idealRollSpin.z,
                        adjustRate
                    );
                }
            }
        } 
        // Ball in air - simple Magnus effect
        else {
            const velocity = this.ball.velocity.clone();
            const speed = velocity.length();
            
            if (speed > 0.05) {
                // Calculate Magnus force (spin causes curved flight paths)
                const magnusForce = new THREE.Vector3();
                magnusForce.crossVectors(this.ball.angularVelocity, velocity);
                magnusForce.multiplyScalar(0.0007 * speed);
                
                // Apply Magnus force
                this.ball.velocity.add(magnusForce);
            }
            
            // Add air resistance 
            this.ball.velocity.multiplyScalar(0.995);
        }
    }

    handleSurfaceCollisions(previousPosition, previousVelocity) {
        const radius = CONFIG.ball.radius;
        const boundary = CONFIG.scene.groundSize / 2 - radius;
        
        // Ground collision
        if (this.ball.position.y < radius) {
            // Ground collision detected - correct position
            this.ball.position.y = radius;
            
            // No visual flash effect for ground collisions
            
            // Calculate bounce characteristics
            const impactSpeed = Math.abs(previousVelocity.y);
            const normalizedImpact = Math.min(1.0, impactSpeed / 0.2);
            
            // Log for debugging
            if (this.debugMode && impactSpeed > 0.05) {
                console.log("Ground bounce!", impactSpeed.toFixed(3));
                console.log("Before spin:", 
                    this.ball.angularVelocity.x.toFixed(3),
                    this.ball.angularVelocity.y.toFixed(3),
                    this.ball.angularVelocity.z.toFixed(3)
                );
            }
            
            // Dynamic restitution based on impact speed
            let bounceMultiplier = this.ball.restitution;
            
            // Low energy impacts should settle faster
            if (impactSpeed < 0.03) {
                bounceMultiplier *= (impactSpeed / 0.03);
                if (impactSpeed < 0.01) {
                    bounceMultiplier = 0;
                    this.ball.velocity.y = 0;
                }
            }
            
            // Get the horizontal motion before impact
            const horizontalVelocity = new THREE.Vector3(
                previousVelocity.x,
                0,
                previousVelocity.z
            );
            const horizontalSpeed = horizontalVelocity.length();
            
            // Simplified ground collision spin conversion: backspin to forward spin
            if (impactSpeed > 0.02) {
                // Get horizontal velocity direction and speed
                const direction = horizontalVelocity.clone().normalize();
                
                // Get current angular velocity components
                const currentSpin = this.ball.angularVelocity.clone();
                
                // Keep vertical spin (around Y axis) with some dampening
                this.ball.angularVelocity.y = currentSpin.y * 0.9;
                
                // Calculate the rolling spin axis (perpendicular to direction of travel)
                // For a ball rolling forward, this is the correct spin axis
                const rollAxis = new THREE.Vector3();
                rollAxis.crossVectors(new THREE.Vector3(0, 1, 0), direction).normalize();
                
                // Project current spin onto roll axis to see how much is rolling spin
                const currentRollSpin = rollAxis.clone().multiplyScalar(rollAxis.dot(currentSpin));
                
                // If we have significant backspin (negative roll spin)
                if (currentRollSpin.dot(rollAxis) < 0) {
                    // Friction converts backspin to forward roll over time
                    // Higher impact = more conversion from backspin to forward spin
                    const conversionFactor = Math.min(0.7, impactSpeed * 2);
                    
                    // Calculate a new spin that's partway between current and ideal rolling
                    const idealRollSpeed = horizontalSpeed / CONFIG.ball.radius;
                    const idealRollSpin = rollAxis.clone().multiplyScalar(idealRollSpeed);
                    
                    // Linear interpolation from current spin toward ideal roll spin
                    this.ball.angularVelocity.x = THREE.MathUtils.lerp(
                        currentSpin.x, 
                        idealRollSpin.x, 
                        conversionFactor
                    );
                    
                    this.ball.angularVelocity.z = THREE.MathUtils.lerp(
                        currentSpin.z, 
                        idealRollSpin.z, 
                        conversionFactor
                    );
                } else {
                    // If not backspin, just dampen existing spin
                    this.ball.angularVelocity.x = currentSpin.x * 0.8;
                    this.ball.angularVelocity.z = currentSpin.z * 0.8;
                    
                    // And add some rolling motion influence
                    const rollSpinX = direction.z * horizontalSpeed * 0.15;
                    const rollSpinZ = -direction.x * horizontalSpeed * 0.15;
                    
                    this.ball.angularVelocity.x += rollSpinX;
                    this.ball.angularVelocity.z += rollSpinZ;
                }
            }
            
            // Apply vertical bounce if not settling
            if (bounceMultiplier > 0) {
                this.ball.velocity.y = -previousVelocity.y * bounceMultiplier;
            }
            
            // Apply friction to horizontal movement on bounce
            const frictionFactor = this.calculateFrictionFactor(horizontalSpeed);
            this.ball.velocity.x *= frictionFactor;
            this.ball.velocity.z *= frictionFactor;
        }
        
        // X boundary (wall) collision
        if (Math.abs(this.ball.position.x) > boundary) {
            // Correct position
            this.ball.position.x = Math.sign(this.ball.position.x) * boundary;
            
            if (this.debugMode) {
                this.flashWall('x', Math.sign(this.ball.position.x));
            }
            
            // Calculate wall impact
            const impactSpeed = Math.abs(previousVelocity.x);
            let wallRestitution = this.ball.restitution;
            
            if (impactSpeed < 0.05) {
                wallRestitution *= 0.7; // Reduce bounce for low-speed collisions
            }
            
            // Reflect X velocity
            this.ball.velocity.x = -previousVelocity.x * wallRestitution;
            
            // Wall collision should affect spin
            // For X wall, the Z-axis spin should be affected
            this.ball.angularVelocity.z *= -0.8;
            
            // Y-axis spin (top spin) should be slightly affected
            this.ball.angularVelocity.y *= 0.9;
            
            // Apply physically accurate side force based on impact
            if (Math.abs(this.ball.velocity.z) < 0.05) {
                const tangentialForce = Math.abs(previousVelocity.x) * 0.01;
                const direction = Math.sign(this.ball.angularVelocity.y) || 1;
                this.ball.velocity.z += direction * tangentialForce;
            }
        }
        
        // Z boundary (wall) collision
        if (Math.abs(this.ball.position.z) > boundary) {
            // Correct position
            this.ball.position.z = Math.sign(this.ball.position.z) * boundary;
            
            if (this.debugMode) {
                this.flashWall('z', Math.sign(this.ball.position.z));
            }
            
            // Calculate wall impact
            const impactSpeed = Math.abs(previousVelocity.z);
            let wallRestitution = this.ball.restitution;
            
            if (impactSpeed < 0.05) {
                wallRestitution *= 0.7; // Reduce bounce for low-speed collisions
            }
            
            // Reflect Z velocity
            this.ball.velocity.z = -previousVelocity.z * wallRestitution;
            
            // For Z wall, the X-axis spin should be affected
            this.ball.angularVelocity.x *= -0.8;
            
            // Y-axis spin (top spin) should be slightly affected
            this.ball.angularVelocity.y *= 0.9;
            
            // Apply physically accurate side force based on impact
            if (Math.abs(this.ball.velocity.x) < 0.05) {
                const tangentialForce = Math.abs(previousVelocity.z) * 0.01;
                const direction = Math.sign(this.ball.angularVelocity.y) || 1;
                this.ball.velocity.x += direction * tangentialForce;
            }
        }
    }

    // Flash the ground briefly to visualize collision
    flashGround() {
        // Store original color
        const originalColor = this.ground.material.color.clone();
        
        // Flash to collision color
        this.ground.material.color.set(0xff5555); // Light red
        
        // Return to original color after a short delay
        setTimeout(() => {
            this.ground.material.color.copy(originalColor);
        }, 50);
    }
    
    // Flash the appropriate wall to visualize collision
    flashWall(axis, sign) {
        // Create temporary wall indicator if it doesn't exist
        if (!this.wallIndicator) {
            const indicatorGeometry = new THREE.BoxGeometry(5, 5, 5);
            const indicatorMaterial = new THREE.MeshBasicMaterial({ 
                color: 0xff5555,
                transparent: true,
                opacity: 0.5
            });
            this.wallIndicator = new THREE.Mesh(indicatorGeometry, indicatorMaterial);
            this.scene.add(this.wallIndicator);
        }
        
        // Position based on which wall was hit
        const groundSize = CONFIG.scene.groundSize / 2;
        if (axis === 'x') {
            this.wallIndicator.position.set(sign * groundSize, 5, this.ball.position.z);
        } else { // z axis
            this.wallIndicator.position.set(this.ball.position.x, 5, sign * groundSize);
        }
        
        // Make visible
        this.wallIndicator.visible = true;
        
        // Hide after a short delay
        setTimeout(() => {
            this.wallIndicator.visible = false;
        }, 50);
    }

    applyRotation() {
        // First apply rotation based on angular velocity (spinning in place)
        if (this.ball.angularVelocity.lengthSq() > 0.000001) {
            const axis = this.ball.angularVelocity.clone().normalize();
            const angle = this.ball.angularVelocity.length();
            
            const spinQuaternion = new THREE.Quaternion();
            spinQuaternion.setFromAxisAngle(axis, angle);
            this.ball.quaternion.premultiply(spinQuaternion);
        }
        
        // Now add rolling rotation if the ball is near the ground
        if (this.ball.position.y <= CONFIG.ball.radius + 0.1) {
            // Get horizontal velocity
            const horizontalVelocity = new THREE.Vector3(
                this.ball.velocity.x,
                0,
                this.ball.velocity.z
            );
            const speed = horizontalVelocity.length();
            
            // Only apply rolling if moving at reasonable speed
            if (speed > 0.001) {
                // Calculate the axis to rotate around (perpendicular to motion)
                const movementDirection = horizontalVelocity.clone().normalize();
                const rotationAxis = new THREE.Vector3();
                rotationAxis.crossVectors(new THREE.Vector3(0, 1, 0), movementDirection).normalize();
                
                // Rotation amount based on speed and ball radius
                const rotationAmount = speed / CONFIG.ball.radius;
                
                // Apply the rolling rotation
                const rollQuaternion = new THREE.Quaternion();
                rollQuaternion.setFromAxisAngle(rotationAxis, rotationAmount);
                this.ball.quaternion.premultiply(rollQuaternion);
                
                // Adjust angular velocity to match rolling motion
                // This helps maintain consistency between visual rotation and physics
                const rollingAngularVelocity = rotationAxis.clone().multiplyScalar(rotationAmount);
                
                // Blend existing angular velocity with rolling motion
                this.ball.angularVelocity.lerp(rollingAngularVelocity, 0.03);
            }
        }
    }
    
    // Update the visualization elements
    updateVisualization() {
        // Move the axes visualization to the ball's position
        this.visualizationGroup.position.copy(this.ball.position);
        this.visualizationGroup.quaternion.copy(this.ball.quaternion);
        
        // Update spin markers
        const spinSpeed = this.ball.angularVelocity.length();
        const spinScale = 5; // Scale factor to make visualization more visible
        
        // Place markers in direction of spin
        this.spinMarkers.x.position.copy(this.ball.position.clone().add(
            new THREE.Vector3(0, this.ball.angularVelocity.x * spinScale, 0)
        ));
        
        this.spinMarkers.y.position.copy(this.ball.position.clone().add(
            new THREE.Vector3(this.ball.angularVelocity.y * spinScale, 0, 0)
        ));
        
        this.spinMarkers.z.position.copy(this.ball.position.clone().add(
            new THREE.Vector3(0, this.ball.angularVelocity.z * spinScale, 0)
        ));
        
        // Scale markers based on spin magnitude
        const xMag = Math.abs(this.ball.angularVelocity.x) / 0.1;
        const yMag = Math.abs(this.ball.angularVelocity.y) / 0.1;
        const zMag = Math.abs(this.ball.angularVelocity.z) / 0.1;
        
        this.spinMarkers.x.scale.set(xMag, xMag, xMag);
        this.spinMarkers.y.scale.set(yMag, yMag, yMag);
        this.spinMarkers.z.scale.set(zMag, zMag, zMag);
        
        // Update info panel
        this.updateInfoPanel();
    }

    calculateFrictionFactor(speed) {
        // Progressive friction - more at low speeds
        if (speed < 0.03) {
            return 0.92; // High friction to make the ball stop eventually
        } else if (speed < 0.08) {
            return 0.95; // Medium friction
        } else {
            return 0.98; // Low friction for fast rolling
        }
    }
    
    checkVehicleCollision(vehicle) {
        const vehiclePos = vehicle.getPosition();
        const ballPos = this.ball.position;
        
        // Get vehicle data
        const vehicleDir = vehicle.getDirection();
        const vehicleSpeed = Math.abs(vehicle.getVelocity());
        const vehicleVelocityVector = vehicleDir.clone().multiplyScalar(vehicleSpeed * Math.sign(vehicle.getVelocity()));
        
        // Distance calculation in horizontal plane (XZ)
        const dx = ballPos.x - vehiclePos.x;
        const dz = ballPos.z - vehiclePos.z;
        const dy = ballPos.y - vehiclePos.y;
        
        const horizontalDistance = Math.sqrt(dx * dx + dz * dz);
        const horizontalThreshold = CONFIG.ball.radius + 1.5; // Collision distance
        
        // Only check for collision if ball is close enough horizontally AND low enough to hit
        if (horizontalDistance < horizontalThreshold && dy < 2.5 && dy > -0.5) {
            // Normal vector pointing from vehicle to ball (horizontal only)
            const normal = new THREE.Vector3(dx, 0, dz).normalize();
            
            // Resolve overlap - push ball outside the collision radius
            const overlap = horizontalThreshold - horizontalDistance;
            this.ball.position.x += normal.x * overlap * 1.1; // Extra push to prevent sticking
            this.ball.position.z += normal.z * overlap * 1.1;
            
            // Calculate impact properties
            const impactDirectness = Math.abs(vehicleDir.dot(normal)); // How head-on is the collision (1=direct, 0=glancing)
            const glancingFactor = 1 - impactDirectness; // 0=direct hit, 1=pure glancing blow
            
            // Get relative velocity between vehicle and ball at impact point
            const ballVelocity = new THREE.Vector3(
                this.ball.velocity.x,
                0,
                this.ball.velocity.z
            );
            
            // Calculate relative velocity component along the normal vector
            const relativeVelocityAlongNormal = vehicleVelocityVector.clone().sub(ballVelocity).dot(normal);
            
            // Only apply collision impulse if objects are moving toward each other
            if (relativeVelocityAlongNormal > 0) {
                // Base impulse strength from vehicle
                const baseImpulse = Math.max(0.08, vehicleSpeed) * 1.5;
                
                // Impulse is stronger for direct hits, weaker for glancing blows
                const directionalMultiplier = 0.6 + (impactDirectness * 0.4); // Between 0.6-1.0
                const impulseStrength = baseImpulse * directionalMultiplier;
                
                // Calculate impact point relative to ball center (for spin calculation)
                const impactPoint = normal.clone().multiplyScalar(-CONFIG.ball.radius);
                
                // Initialize new velocity
                const newVelocity = new THREE.Vector3();
                
                // Direct component: ball flies away from impact along normal vector
                newVelocity.add(normal.clone().multiplyScalar(impulseStrength));
                
                // Glancing component: ball partially continues in vehicle's direction for glancing hits
                if (glancingFactor > 0.3) {
                    // For significant glancing blows, transfer some of vehicle's directional momentum
                    newVelocity.add(vehicleDir.clone().multiplyScalar(impulseStrength * glancingFactor * 0.5));
                }
                
                // Apply final horizontal velocity
                this.ball.velocity.x = newVelocity.x;
                this.ball.velocity.z = newVelocity.z;
                
                // Vertical component: ball gets lifted more for direct hits, less for glancing
                const verticalImpulse = Math.max(0.1, impulseStrength * (0.3 + impactDirectness * 0.3));
                this.ball.velocity.y = Math.max(this.ball.velocity.y, verticalImpulse);
                
                // Calculate spin effects based on impact
                this.calculateCollisionSpin(normal, impactPoint, impulseStrength, glancingFactor, vehicleDir);
                
                // Apply counter-impulse to vehicle based on ball's mass
                const vehicleImpulse = 0.03 * (CONFIG.ball.mass / CONFIG.physics.mass);
                vehicle.applyImpulse(-normal.x * vehicleImpulse, -normal.z * vehicleImpulse);
                
                return true;
            }
        }
        
        return false;
    }

    calculateCollisionSpin(normal, impactPoint, impulseStrength, glancingFactor, vehicleDir) {
        // Simple physics: car hit creates backspin primarily
        
        // Reset existing spin for more predictable physics
        this.ball.angularVelocity.set(0, 0, 0);
        
        // Calculate impact direction in world space
        const impactDir = vehicleDir.clone();
        
        // Primary spin axis is perpendicular to both impact direction and up vector
        // This creates backspin (ball rotating opposite to direction of travel)
        const spinAxis = new THREE.Vector3();
        spinAxis.crossVectors(impactDir, new THREE.Vector3(0, 1, 0)).normalize();
        
        // Stronger impact = more backspin (negative because it's backspin)
        const backspinAmount = -impulseStrength * 0.2;
        
        // Apply primary backspin
        this.ball.angularVelocity.addScaledVector(spinAxis, backspinAmount);
        
        // For angled/glancing hits, add proportional side spin
        if (glancingFactor > 0.3) {
            // Add some Y-axis spin (top spin) proportional to glancing angle
            const sideSpinAmount = glancingFactor * impulseStrength * 0.15;
            
            // Direction of side spin depends on which side was hit
            const sideSign = Math.sign(normal.cross(vehicleDir).y);
            this.ball.angularVelocity.y += sideSign * sideSpinAmount;
        }
    }
    
    // Toggle debug visualization
    toggleDebug() {
        this.debugMode = !this.debugMode;
        this.visualizationGroup.visible = this.debugMode;
        for (const marker in this.spinMarkers) {
            this.spinMarkers[marker].visible = this.debugMode;
        }
        if (this.infoPanel) {
            this.infoPanel.visible = this.debugMode;
        }
    }
    
    handleResize() {
        if (window.innerWidth > 0 && window.innerHeight > 0) {
            this.renderer.setSize(window.innerWidth, window.innerHeight);
        }
    }
    
    add(object) {
        this.scene.add(object);
    }
    
    render(camera) {
        // Store camera reference for info panel positioning
        window.camera = camera;
        this.renderer.render(this.scene, camera);
    }
}