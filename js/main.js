/**
 * Main game initialization and loop - with debug controls
 */
class Game {
    constructor() {
        // Initialize core components
        this.scene = new Scene();
        this.camera = new GameCamera();
        this.controls = new Controls();
        this.vehicle = new Vehicle(this.scene);
        
        // Complete the resize handler in scene.js
        this.scene.handleResize = () => {
            this.camera.updateAspect(window.innerWidth / window.innerHeight);
            this.scene.renderer.setSize(window.innerWidth, window.innerHeight);
        };
        
        // Setup debug controls
        this.setupDebugControls();
        
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
        // Update vehicle based on controls
        this.vehicle.update(this.controls);
        
        // Update ball physics
        this.scene.updateBall();
        
        // Check for collision between vehicle and ball
        this.scene.checkVehicleCollision(this.vehicle);
        
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
    new Game();
});