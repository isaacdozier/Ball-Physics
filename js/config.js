/**
 * Game configuration and constants with enhanced ball physics
 */
const CONFIG = {
    // Physics
    physics: {
        maxSpeed: 0.2,
        maxReverseSpeed: 0.1,
        accelerationRate: 0.005,
        brakeRate: 0.01,
        maxSteeringAngle: Math.PI / 6, // 30 degrees
        steeringSpeed: Math.PI / 60,
        steeringReturnSpeed: Math.PI / 120,
        friction: 0.98,
        driftThreshold: 0.15,
        gravity: 0.015, // Reduced for better gameplay
        groundFriction: 0.98,
        mass: 1000 // Vehicle mass for comparison with ball
    },
    
    // Camera
    camera: {
        fov: 75,
        near: 0.1,
        far: 1000,
        offset: new THREE.Vector3(0, 5, -10)
    },
    
    // Colors
    colors: {
        sky: 0x87CEEB,
        ground: 0x1a5c1a,
        vehicleBody: 0x3366cc,
        wheels: 0x333333,
        cabin: 0x333333,
        headlights: 0xffffcc
    },
    
    // Scene
    scene: {
        groundSize: 100,
        gridDivisions: 100
    },
    
    // Ball settings
    ball: {
        radius: 2,
        mass: 12,
        restitution: 0.75,
        friction: 0.96,
        spinTransfer: 0.15  // New property: how much spin affects velocity
    }
};