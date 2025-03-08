/**
 * Main game initialization and loop with minimal controller support
 */
class Game {
    constructor() {
        // Initialize core components
        this.scene = new Scene();
        this.camera = new GameCamera();
        this.controls = new Controls(this);
        this.vehicle = new Vehicle(this.scene);
        
        // Complete the resize handler in scene.js
        this.scene.handleResize = () => {
            this.camera.updateAspect(window.innerWidth / window.innerHeight);
            this.scene.renderer.setSize(window.innerWidth, window.innerHeight);
        };
        
        // Setup debug controls
        this.setupDebugControls();
        this.setupControlsInfo();
        
        // Last collision time for rumble effect timing
        this.lastCollisionTime = 0;
        
        // Start animation loop
        this.animate();
    }
    
    setupDebugControls() {
        // Create debug panel
        const debugPanel = document.createElement('div');
        debugPanel.style.position = 'absolute';
        debugPanel.style.top = '10px';
        debugPanel.style.right = '10px';
        debugPanel.style.background = 'rgba(0,0,0,0.7)';
        debugPanel.style.color = 'white';
        debugPanel.style.padding = '10px';
        debugPanel.style.borderRadius = '5px';
        debugPanel.style.fontFamily = 'Arial, sans-serif';
        debugPanel.style.zIndex = '1000';
        
        // Create debug toggle
        const debugToggle = document.createElement('button');
        debugToggle.textContent = 'Toggle Debug View';
        debugToggle.style.display = 'block';
        debugToggle.style.margin = '5px';
        debugToggle.style.padding = '5px 10px';
        debugToggle.addEventListener('click', () => {
            this.scene.toggleDebug();
        });
        debugPanel.appendChild(debugToggle);
        
        // Add spin control buttons
        this.addSpinControlButtons(debugPanel);
        
        // Add position reset button
        const resetButton = document.createElement('button');
        resetButton.textContent = 'Reset Ball Position';
        resetButton.style.display = 'block';
        resetButton.style.margin = '5px';
        resetButton.style.padding = '5px 10px';
        resetButton.addEventListener('click', () => {
            this.scene.ball.position.set(10, 20, 0);
            this.scene.ball.velocity.set(0, 0, 0);
            this.scene.ball.angularVelocity.set(0, 0, 0);
            this.scene.ball.quaternion.identity();
        });
        debugPanel.appendChild(resetButton);
        
        // Add the debug panel to the document
        document.body.appendChild(debugPanel);
    }
    
    setupControlsInfo() {
        // Create controls info panel
        const controlsPanel = document.createElement('div');
        controlsPanel.style.position = 'absolute';
        controlsPanel.style.top = '10px';
        controlsPanel.style.left = '10px';
        controlsPanel.style.background = 'rgba(0,0,0,0.7)';
        controlsPanel.style.color = 'white';
        controlsPanel.style.padding = '10px';
        controlsPanel.style.borderRadius = '5px';
        controlsPanel.style.fontFamily = 'Arial, sans-serif';
        controlsPanel.style.zIndex = '1000';
        controlsPanel.style.maxWidth = '250px';
        controlsPanel.style.fontSize = '12px';
        
        // Create toggle button for controls info
        const toggleButton = document.createElement('button');
        toggleButton.textContent = 'Show Controls';
        toggleButton.style.display = 'block';
        toggleButton.style.margin = '0 0 10px 0';
        toggleButton.style.padding = '5px 10px';
        toggleButton.style.width = '100%';
        
        // Controls info content
        const controlsInfo = document.createElement('div');
        controlsInfo.style.display = 'none';
        
        // Add keyboard controls
        const keyboardControls = document.createElement('div');
        keyboardControls.innerHTML = `
            <h3>Keyboard Controls:</h3>
            <p>W/S - Accelerate/Brake</p>
            <p>A/D - Steer Left/Right</p>
            <p>Space - Handbrake</p>
            <p>R - Reset Ball</p>
            <p>P - Toggle Debug</p>
            <p>Arrow Left/Right - Rotate Camera</p>
        `;
        controlsInfo.appendChild(keyboardControls);
        
        // Add controller controls
        const controllerControls = document.createElement('div');
        controllerControls.innerHTML = `
            <h3>Controller:</h3>
            <p>Left Stick - Steering</p>
            <p>Right Trigger - Accelerate</p>
            <p>Left Trigger - Brake/Reverse</p>
            <p>A Button - Accelerate</p>
            <p>X Button - Brake</p>
            <p>B Button - Handbrake</p>
            <p>Y Button - Reset Ball</p>
            <p>Back/Select - Toggle Debug</p>
        `;
        controlsInfo.appendChild(controllerControls);
        
        // Toggle controls visibility
        toggleButton.addEventListener('click', () => {
            if (controlsInfo.style.display === 'none') {
                controlsInfo.style.display = 'block';
                toggleButton.textContent = 'Hide Controls';
            } else {
                controlsInfo.style.display = 'none';
                toggleButton.textContent = 'Show Controls';
            }
        });
        
        controlsPanel.appendChild(toggleButton);
        controlsPanel.appendChild(controlsInfo);
        document.body.appendChild(controlsPanel);
    }
    
    addSpinControlButtons(debugPanel) {
        // Create heading
        const spinHeading = document.createElement('div');
        spinHeading.textContent = 'Add Spin:';
        spinHeading.style.margin = '10px 5px 5px 5px';
        spinHeading.style.fontWeight = 'bold';
        debugPanel.appendChild(spinHeading);
        
        // X-axis spin controls
        const xSpinControls = document.createElement('div');
        xSpinControls.style.margin = '5px';
        
        const xMinusButton = document.createElement('button');
        xMinusButton.textContent = '-X Spin';
        xMinusButton.style.marginRight = '5px';
        xMinusButton.addEventListener('click', () => {
            this.scene.ball.angularVelocity.x -= 0.1;
        });
        
        const xPlusButton = document.createElement('button');
        xPlusButton.textContent = '+X Spin';
        xPlusButton.addEventListener('click', () => {
            this.scene.ball.angularVelocity.x += 0.1;
        });
        
        xSpinControls.appendChild(xMinusButton);
        xSpinControls.appendChild(xPlusButton);
        debugPanel.appendChild(xSpinControls);
        
        // Y-axis spin controls
        const ySpinControls = document.createElement('div');
        ySpinControls.style.margin = '5px';
        
        const yMinusButton = document.createElement('button');
        yMinusButton.textContent = '-Y Spin';
        yMinusButton.style.marginRight = '5px';
        yMinusButton.addEventListener('click', () => {
            this.scene.ball.angularVelocity.y -= 0.1;
        });
        
        const yPlusButton = document.createElement('button');
        yPlusButton.textContent = '+Y Spin';
        yPlusButton.addEventListener('click', () => {
            this.scene.ball.angularVelocity.y += 0.1;
        });
        
        ySpinControls.appendChild(yMinusButton);
        ySpinControls.appendChild(yPlusButton);
        debugPanel.appendChild(ySpinControls);
        
        // Z-axis spin controls
        const zSpinControls = document.createElement('div');
        zSpinControls.style.margin = '5px';
        
        const zMinusButton = document.createElement('button');
        zMinusButton.textContent = '-Z Spin';
        zMinusButton.style.marginRight = '5px';
        zMinusButton.addEventListener('click', () => {
            this.scene.ball.angularVelocity.z -= 0.1;
        });
        
        const zPlusButton = document.createElement('button');
        zPlusButton.textContent = '+Z Spin';
        zPlusButton.addEventListener('click', () => {
            this.scene.ball.angularVelocity.z += 0.1;
        });
        
        zSpinControls.appendChild(zMinusButton);
        zSpinControls.appendChild(zPlusButton);
        debugPanel.appendChild(zSpinControls);
        
        // Velocity controls heading
        const velocityHeading = document.createElement('div');
        velocityHeading.textContent = 'Add Velocity:';
        velocityHeading.style.margin = '10px 5px 5px 5px';
        velocityHeading.style.fontWeight = 'bold';
        debugPanel.appendChild(velocityHeading);
        
        // X-axis velocity controls
        const xVelControls = document.createElement('div');
        xVelControls.style.margin = '5px';
        
        const xVelMinusButton = document.createElement('button');
        xVelMinusButton.textContent = '-X Vel';
        xVelMinusButton.style.marginRight = '5px';
        xVelMinusButton.addEventListener('click', () => {
            this.scene.ball.velocity.x -= 0.05;
        });
        
        const xVelPlusButton = document.createElement('button');
        xVelPlusButton.textContent = '+X Vel';
        xVelPlusButton.addEventListener('click', () => {
            this.scene.ball.velocity.x += 0.05;
        });
        
        xVelControls.appendChild(xVelMinusButton);
        xVelControls.appendChild(xVelPlusButton);
        debugPanel.appendChild(xVelControls);
        
        // Z-axis velocity controls
        const zVelControls = document.createElement('div');
        zVelControls.style.margin = '5px';
        
        const zVelMinusButton = document.createElement('button');
        zVelMinusButton.textContent = '-Z Vel';
        zVelMinusButton.style.marginRight = '5px';
        zVelMinusButton.addEventListener('click', () => {
            this.scene.ball.velocity.z -= 0.05;
        });
        
        const zVelPlusButton = document.createElement('button');
        zVelPlusButton.textContent = '+Z Vel';
        zVelPlusButton.addEventListener('click', () => {
            this.scene.ball.velocity.z += 0.05;
        });
        
        zVelControls.appendChild(zVelMinusButton);
        zVelControls.appendChild(zVelPlusButton);
        debugPanel.appendChild(zVelControls);
    }
    
    update() {
        // Update controls (processes one-shot inputs)
        this.controls.update();
        
        // Update vehicle based on controls
        this.vehicle.update(this.controls);
        
        // Update ball physics
        this.scene.updateBall();
        
        // Check for collision between vehicle and ball
        const collision = this.scene.checkVehicleCollision(this.vehicle);
        
        // Provide haptic feedback on collision if controller is connected
        if (collision && this.controls.gamepad && this.controls.gamepad.isControllerConnected()) {
            // Limit frequency of rumble effects
            const currentTime = performance.now();
            if (currentTime - this.lastCollisionTime > 500) { // Minimum 500ms between rumbles
                // Rumble strength based on vehicle speed
                const speed = Math.abs(this.vehicle.getVelocity());
                const rumbleStrength = Math.min(1.0, speed * 5);
                this.controls.gamepad.rumble(rumbleStrength, 300);
                this.lastCollisionTime = currentTime;
            }
        }
        
        // Update camera to follow vehicle
        this.camera.updatePosition(
            this.vehicle.getPosition(),
            this.vehicle.getRotation()
        );
    }
    
    animate() {
        requestAnimationFrame(() => this.animate());
        this.update();
        this.scene.render(this.camera.camera);
    }
}

// Start the game when the page loads
window.addEventListener('DOMContentLoaded', () => {
    // Display loading screen
    const loadingScreen = document.createElement('div');
    loadingScreen.style.position = 'fixed';
    loadingScreen.style.top = '0';
    loadingScreen.style.left = '0';
    loadingScreen.style.width = '100%';
    loadingScreen.style.height = '100%';
    loadingScreen.style.backgroundColor = 'rgba(0, 0, 0, 0.9)';
    loadingScreen.style.display = 'flex';
    loadingScreen.style.flexDirection = 'column';
    loadingScreen.style.justifyContent = 'center';
    loadingScreen.style.alignItems = 'center';
    loadingScreen.style.zIndex = '9999';
    
    // Add loading text
    const loadingText = document.createElement('h1');
    loadingText.textContent = 'Vehicle Soccer Game';
    loadingText.style.color = 'white';
    loadingText.style.fontFamily = 'Arial, sans-serif';
    loadingText.style.marginBottom = '20px';
    
    // Add controller info
    const controllerInfo = document.createElement('p');
    controllerInfo.textContent = 'Xbox controller support enabled! Connect controller for best experience.';
    controllerInfo.style.color = '#4CAF50';
    controllerInfo.style.fontFamily = 'Arial, sans-serif';
    controllerInfo.style.marginBottom = '30px';
    
    // Add a start button
    const startButton = document.createElement('button');
    startButton.textContent = 'Start Game';
    startButton.style.padding = '10px 20px';
    startButton.style.fontSize = '18px';
    startButton.style.cursor = 'pointer';
    startButton.style.backgroundColor = '#4CAF50';
    startButton.style.color = 'white';
    startButton.style.border = 'none';
    startButton.style.borderRadius = '4px';
    
    startButton.addEventListener('click', () => {
        document.body.removeChild(loadingScreen);
        new Game();
    });
    
    // Add instruction text
    const instructions = document.createElement('p');
    instructions.innerHTML = 'Drive the vehicle to hit the ball.<br>Use the controller or keyboard (WASD) to drive.';
    instructions.style.color = 'white';
    instructions.style.fontFamily = 'Arial, sans-serif';
    instructions.style.marginTop = '20px';
    instructions.style.textAlign = 'center';
    
    // Append elements to loading screen
    loadingScreen.appendChild(loadingText);
    loadingScreen.appendChild(controllerInfo);
    loadingScreen.appendChild(startButton);
    loadingScreen.appendChild(instructions);
    
    // Add to document
    document.body.appendChild(loadingScreen);
});