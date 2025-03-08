/**
 * Simplified controls manager with minimal gamepad integration
 */
class Controls {
    constructor(game) {
        // Store game reference
        this.game = game;
        
        // Keyboard state
        this.keysPressed = {};
        this.keyJustPressed = {};
        
        // Initialize keyboard listeners
        window.addEventListener('keydown', (e) => this.handleKeyDown(e));
        window.addEventListener('keyup', (e) => this.handleKeyUp(e));
        
        // Initialize gamepad
        this.initGamepad();
        
        console.log('Controls initialized');
    }
    
    handleKeyDown(event) {
        const key = event.key.toLowerCase();
        
        // Track if this is a new press
        if (!this.keysPressed[key]) {
            this.keyJustPressed[key] = true;
            
            // Handle immediate actions
            this.checkOneTimeActions();
        }
        
        // Track the pressed state
        this.keysPressed[key] = true;
    }
    
    handleKeyUp(event) {
        this.keysPressed[event.key.toLowerCase()] = false;
    }
    
    initGamepad() {
        try {
            // Use the minimal controller implementation
            if (typeof MinimalGamepadController !== 'undefined') {
                this.gamepad = new MinimalGamepadController();
                console.log('Minimal gamepad initialized');
            } else {
                console.warn('MinimalGamepadController not found');
                this.gamepad = null;
            }
        } catch (e) {
            console.error('Error initializing gamepad:', e);
            this.gamepad = null;
        }
    }
    
    update() {
        // Check for one-shot gamepad actions
        this.checkGamepadActions();
        
        // Clear the "just pressed" flags after processing
        this.keyJustPressed = {};
    }
    
    checkOneTimeActions() {
        // Check for keyboard one-time actions
        if (this.keyJustPressed['r']) {
            this.resetBall();
        }
        
        if (this.keyJustPressed['p']) {
            this.toggleDebug();
        }
        
        if (this.keyJustPressed['arrowleft']) {
            this.rotateCameraLeft();
        }
        
        if (this.keyJustPressed['arrowright']) {
            this.rotateCameraRight();
        }
    }
    
    checkGamepadActions() {
        // Only check if gamepad is available
        if (this.gamepad) {
            // Reset ball
            if (this.gamepad.isResetPressed()) {
                this.resetBall();
            }
            
            // Toggle debug
            if (this.gamepad.isToggleDebugPressed()) {
                this.toggleDebug();
            }
        }
    }
    
    // ---- CORE INPUT METHODS ----
    
    isPressed(key) {
        return this.keysPressed[key] === true;
    }
    
    getSteeringInput() {
        // Start with keyboard
        let steering = 0;
        if (this.isPressed('a')) steering -= 1;
        if (this.isPressed('d')) steering += 1;
        
        // Add gamepad if available
        if (this.gamepad && this.gamepad.isControllerConnected()) {
            const gamepadSteering = this.gamepad.getSteeringInput();
            if (Math.abs(gamepadSteering) > 0.1) {
                steering = gamepadSteering;
            }
        }
        
        return steering;
    }
    
    getThrottleInput() {
        // Start with keyboard
        let throttle = 0;
        if (this.isPressed('w')) throttle += 1;
        if (this.isPressed('s')) throttle -= 1;
        
        // Add gamepad if available
        if (this.gamepad && this.gamepad.isControllerConnected()) {
            const gamepadThrottle = this.gamepad.getThrottleInput();
            if (Math.abs(gamepadThrottle) > 0.1) {
                throttle = gamepadThrottle;
            }
        }
        
        return throttle;
    }
    
    isHandbrakeActive() {
        // Keyboard space
        let handbrake = this.isPressed(' ');
        
        // Add gamepad if available
        if (this.gamepad && this.gamepad.isControllerConnected()) {
            handbrake = handbrake || this.gamepad.isHandbrakeActive();
        }
        
        return handbrake;
    }
    
    // ---- ACTION METHODS ----
    
    resetBall() {
        try {
            if (this.game && this.game.scene && this.game.scene.ball) {
                this.game.scene.ball.position.set(10, 20, 0);
                this.game.scene.ball.velocity.set(0, 0, 0);
                this.game.scene.ball.angularVelocity.set(0, 0, 0);
                this.game.scene.ball.quaternion.identity();
                
                // Provide feedback if controller connected
                if (this.gamepad && this.gamepad.isControllerConnected()) {
                    this.gamepad.rumble(0.3, 200);
                }
            }
        } catch (e) {
            console.error('Error resetting ball:', e);
        }
    }
    
    toggleDebug() {
        try {
            if (this.game && this.game.scene) {
                this.game.scene.toggleDebug();
                
                // Provide feedback if controller connected
                if (this.gamepad && this.gamepad.isControllerConnected()) {
                    this.gamepad.rumble(0.2, 100);
                }
            }
        } catch (e) {
            console.error('Error toggling debug:', e);
        }
    }
    
    rotateCameraLeft() {
        try {
            if (this.game && this.game.camera) {
                this.game.camera.rotateOffsetLeft();
            }
        } catch (e) {
            console.error('Error rotating camera left:', e);
        }
    }
    
    rotateCameraRight() {
        try {
            if (this.game && this.game.camera) {
                this.game.camera.rotateOffsetRight();
            }
        } catch (e) {
            console.error('Error rotating camera right:', e);
        }
    }
}