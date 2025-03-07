/**
 * Input controls management
 */
class Controls {
    constructor() {
        this.keysPressed = {};
        
        // Set up event listeners
        window.addEventListener('keydown', (event) => {
            this.keysPressed[event.key.toLowerCase()] = true;
        });
        
        window.addEventListener('keyup', (event) => {
            this.keysPressed[event.key.toLowerCase()] = false;
        });
    }
    
    isPressed(key) {
        return this.keysPressed[key] === true;
    }
    
    /**
     * Get steering input (-1 to 1)
     * Negative values = left, Positive values = right
     */
    getSteeringInput() {
        let steeringInput = 0;
        
        if (this.isPressed('a')) steeringInput -= 1;
        if (this.isPressed('d')) steeringInput += 1;
        
        return steeringInput;
    }
    
    /**
     * Get throttle input (-1 to 1)
     * Negative values = reverse, Positive values = forward
     */
    getThrottleInput() {
        let throttleInput = 0;
        
        if (this.isPressed('w')) throttleInput += 1;
        if (this.isPressed('s')) throttleInput -= 1;
        
        return throttleInput;
    }
    
    /**
     * Is handbrake active?
     */
    isHandbrakeActive() {
        return this.isPressed(' ');
    }
}