/**
 * Minimal Xbox controller implementation - stability focused
 */
class MinimalGamepadController {
    constructor() {
        // Simple state tracking
        this.gamepadIndex = null;
        this.lastButtonStates = {};
        
        // Debug counter
        this.pollCount = 0;
        
        // Add a debug element
        this.addDebugElement();
        
        // Start the polling loop
        this.startPolling();
        
        console.log('Minimal gamepad controller initialized');
    }
    
    addDebugElement() {
        // Create a small debug display to help diagnose issues
        this.debugElement = document.createElement('div');
        this.debugElement.style.position = 'absolute';
        this.debugElement.style.right = '10px';
        this.debugElement.style.bottom = '10px';
        this.debugElement.style.background = 'rgba(0,0,0,0.5)';
        this.debugElement.style.color = 'white';
        this.debugElement.style.padding = '5px';
        this.debugElement.style.fontFamily = 'monospace';
        this.debugElement.style.fontSize = '10px';
        this.debugElement.style.zIndex = '9999';
        document.body.appendChild(this.debugElement);
    }
    
    updateDebug(message) {
        if (this.debugElement) {
            this.debugElement.innerHTML = message;
        }
    }
    
    getGamepad() {
        // Simple method to get the current gamepad state
        try {
            const gamepads = navigator.getGamepads ? navigator.getGamepads() : [];
            
            // If we have a stored index, try to use that first
            if (this.gamepadIndex !== null && 
                gamepads[this.gamepadIndex] && 
                gamepads[this.gamepadIndex].connected) {
                return gamepads[this.gamepadIndex];
            }
            
            // Otherwise look for any connected gamepad
            for (let i = 0; i < gamepads.length; i++) {
                if (gamepads[i] && gamepads[i].connected) {
                    this.gamepadIndex = i;
                    return gamepads[i];
                }
            }
        } catch (e) {
            console.error('Error getting gamepad:', e);
        }
        
        // No gamepad found
        this.gamepadIndex = null;
        return null;
    }
    
    startPolling() {
        const pollGamepad = () => {
            // Increment poll count for debugging
            this.pollCount++;
            
            try {
                const gamepad = this.getGamepad();
                
                // Update debug display
                if (this.pollCount % 30 === 0) { // Update every ~30 frames to reduce overhead
                    let debugMsg = `Poll: ${this.pollCount}`;
                    if (gamepad) {
                        debugMsg += `<br>Gamepad: ${gamepad.id.substring(0, 20)}`;
                        debugMsg += `<br>Buttons: ${gamepad.buttons.length}`;
                        debugMsg += `<br>Axes: ${gamepad.axes.length}`;
                    } else {
                        debugMsg += '<br>No gamepad connected';
                    }
                    this.updateDebug(debugMsg);
                }
            } catch (e) {
                console.error('Error in gamepad polling:', e);
                this.updateDebug(`Error: ${e.message}<br>Poll: ${this.pollCount}`);
            }
            
            // Continue polling
            window.requestAnimationFrame(pollGamepad);
        };
        
        // Start the polling loop
        window.requestAnimationFrame(pollGamepad);
    }
    
    // Get steering input from left stick or d-pad (-1 to 1)
    getSteeringInput() {
        const gamepad = this.getGamepad();
        if (!gamepad) return 0;
        
        try {
            // Get left stick X axis
            const leftStickX = gamepad.axes[0] || 0;
            
            // Apply a simple deadzone
            if (Math.abs(leftStickX) < 0.15) return 0;
            
            // Also check D-pad if available
            let dpadValue = 0;
            if (gamepad.buttons.length >= 16) {
                if (gamepad.buttons[14] && gamepad.buttons[14].pressed) dpadValue = -1;
                if (gamepad.buttons[15] && gamepad.buttons[15].pressed) dpadValue = 1;
            }
            
            // Return either analog or digital input, preferring the larger value
            return dpadValue !== 0 ? dpadValue : leftStickX;
        } catch (e) {
            return 0;
        }
    }
    
    // Get throttle input (-1 to 1)
    getThrottleInput() {
        const gamepad = this.getGamepad();
        if (!gamepad) return 0;
        
        try {
            // Check for right trigger (acceleration)
            let accelerate = 0;
            if (gamepad.buttons.length > 7 && gamepad.buttons[7]) {
                accelerate = gamepad.buttons[7].value || 0;
            }
            
            // Check for left trigger (braking)
            let brake = 0;
            if (gamepad.buttons.length > 6 && gamepad.buttons[6]) {
                brake = gamepad.buttons[6].value || 0;
            }
            
            // Check for A button (alternate acceleration)
            if (gamepad.buttons.length > 0 && gamepad.buttons[0] && gamepad.buttons[0].pressed) {
                accelerate = Math.max(accelerate, 1);
            }
            
            // Check for X button (alternate braking)
            if (gamepad.buttons.length > 2 && gamepad.buttons[2] && gamepad.buttons[2].pressed) {
                brake = Math.max(brake, 1);
            }
            
            // Return the combined input
            return accelerate - brake;
        } catch (e) {
            return 0;
        }
    }
    
    // Check if handbrake is active (B button)
    isHandbrakeActive() {
        const gamepad = this.getGamepad();
        if (!gamepad) return false;
        
        try {
            // B button is typically index 1
            return gamepad.buttons.length > 1 && 
                   gamepad.buttons[1] && 
                   gamepad.buttons[1].pressed;
        } catch (e) {
            return false;
        }
    }
    
    // Check if a button was just pressed (for one-shot actions)
    buttonJustPressed(buttonIndex) {
        const gamepad = this.getGamepad();
        if (!gamepad || buttonIndex >= gamepad.buttons.length) return false;
        
        try {
            const key = `button_${buttonIndex}`;
            const isPressed = gamepad.buttons[buttonIndex] && gamepad.buttons[buttonIndex].pressed;
            const wasPressed = this.lastButtonStates[key] || false;
            
            // Update button state
            this.lastButtonStates[key] = isPressed;
            
            // Return true only on the rising edge (just pressed)
            return isPressed && !wasPressed;
        } catch (e) {
            return false;
        }
    }
    
    // Check if reset button is pressed (Y button - index 3)
    isResetPressed() {
        return this.buttonJustPressed(3);
    }
    
    // Check if debug toggle is pressed (Back/Select button - index 8)
    isToggleDebugPressed() {
        return this.buttonJustPressed(8) || this.buttonJustPressed(9); // Back or Start
    }
    
    // Check if any controller is connected
    isControllerConnected() {
        return this.getGamepad() !== null;
    }
    
}

// Make globally available
window.MinimalGamepadController = MinimalGamepadController;