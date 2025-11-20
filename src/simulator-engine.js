const EventEmitter = require('events');

class SimulatorEngine extends EventEmitter {
    constructor() {
        super();
        this.isOpen = false;
        this.interval = null;
        this.currentShape = 'RECTANGLE';
        this.t = 0; // Time/parameter for shape generation

        // Simulation parameters
        this.frequency = 10; // Hz
        this.noise = 0.05; // mm random noise

        // Shape dimensions (mm)
        this.rectDims = { width: 100, height: 50 };
        this.cylDims = { radius: 30, height: 80 };
        this.coneDims = { radius: 40, height: 60 };

        // Complex shape: Calibration Master
        // Base: 100x100x20 rect
        // Step 1: Cylinder R=30, H=40
        // Step 2: Cylinder R=15, H=30
        // Top: Sphere R=15
        this.complexDims = {
            baseSize: 100,
            baseHeight: 20,
            step1Radius: 30,
            step1Height: 40,
            step2Radius: 15,
            step2Height: 30,
            sphereRadius: 15
        };
    }

    open(callback) {
        this.isOpen = true;
        setTimeout(() => {
            this.emit('open');
            if (callback) callback(null);
        }, 100);
    }

    close(callback) {
        this.stopSimulation();
        this.isOpen = false;
        this.emit('close');
        if (callback) callback(null);
    }

    write(data, callback) {
        const command = data.toString().trim();
        this.handleCommand(command);
        if (callback) callback(null);
    }

    // Mocking pipe for parser
    pipe(destination) {
        this.on('data', (data) => {
            destination.write(data);
        });
        return destination;
    }

    handleCommand(command) {
        // Handle shape change commands like "SIM_SHAPE:RECTANGLE"
        if (command.startsWith('SIM_SHAPE:')) {
            const shape = command.split(':')[1];
            if (['RECTANGLE', 'CYLINDER', 'CONE', 'COMPLEX'].includes(shape)) {
                this.currentShape = shape;
                this.t = 0; // Reset path
                this.emit('data', `ACK,Shape changed to ${shape}\n`);
            }
            return;
        }

        switch (command) {
            case 'START':
                this.startSimulation();
                this.emit('data', 'ACK,Simulation Started\n');
                break;
            case 'STOP':
                this.stopSimulation();
                this.emit('data', 'ACK,Simulation Stopped\n');
                break;
            case 'PAUSE':
                this.stopSimulation();
                this.emit('data', 'ACK,Simulation Paused\n');
                break;
            case 'RESUME':
                this.startSimulation();
                this.emit('data', 'ACK,Simulation Resumed\n');
                break;
            case 'INFO':
                this.emit('data', 'INFO,Simulator Firmware: v1.0.0\n');
                break;
            default:
                // Handle SETDIM command
                if (command.startsWith('SETDIM ')) {
                    const args = command.substring(7).split(',');
                    if (args.length === 4) {
                        // In a real simulator, we would update dimensions here
                        // For now, just acknowledge it to match hardware behavior
                        this.emit('data', `ACK,Dimensions updated: ${args.join(',')}\n`);
                    } else {
                        this.emit('data', 'ERROR,Invalid format. Use: SETDIM l1,l2,l3,l4\n');
                    }
                }
                break;
        }
    }

    startSimulation() {
        this.t = 0; // Reset time/path
        if (this.interval) clearInterval(this.interval);
        this.interval = setInterval(() => {
            this.generatePoint();
        }, 1000 / this.frequency);
    }

    stopSimulation() {
        if (this.interval) {
            clearInterval(this.interval);
            this.interval = null;
        }
    }

    generatePoint() {
        this.t += 0.05; // Increment parameter
        let x, y, z;
        let finished = false;

        // Add some random noise
        const noiseX = (Math.random() - 0.5) * this.noise;
        const noiseY = (Math.random() - 0.5) * this.noise;
        const noiseZ = (Math.random() - 0.5) * this.noise;

        switch (this.currentShape) {
            case 'RECTANGLE':
                // Trace a rectangle path
                const perimeter = 2 * (this.rectDims.width + this.rectDims.height);
                const pos = (this.t * 20);

                if (pos >= perimeter) {
                    finished = true;
                    x = 0; y = 0; z = 0; // Reset to start or hold last pos?
                } else if (pos < this.rectDims.width) {
                    x = pos; y = 0;
                } else if (pos < this.rectDims.width + this.rectDims.height) {
                    x = this.rectDims.width; y = pos - this.rectDims.width;
                } else if (pos < 2 * this.rectDims.width + this.rectDims.height) {
                    x = this.rectDims.width - (pos - (this.rectDims.width + this.rectDims.height)); y = this.rectDims.height;
                } else {
                    x = 0; y = this.rectDims.height - (pos - (2 * this.rectDims.width + this.rectDims.height));
                }
                z = 0;
                break;

            case 'CYLINDER':
                // Spiral up a cylinder
                const angle = this.t;
                const zPos = (this.t * 2);

                if (zPos >= this.cylDims.height) {
                    finished = true;
                    x = this.cylDims.radius * Math.cos(angle);
                    y = this.cylDims.radius * Math.sin(angle);
                    z = this.cylDims.height;
                } else {
                    x = this.cylDims.radius * Math.cos(angle);
                    y = this.cylDims.radius * Math.sin(angle);
                    z = zPos;
                }
                break;

            case 'CONE':
                // Spiral up a cone
                const h = (this.t * 2);

                if (h >= this.coneDims.height) {
                    finished = true;
                    x = 0; y = 0; z = this.coneDims.height;
                } else {
                    const r = this.coneDims.radius * (1 - h / this.coneDims.height);
                    x = r * Math.cos(this.t);
                    y = r * Math.sin(this.t);
                    z = h;
                }
                break;

            case 'COMPLEX':
                // Twisted Star Spiral Cone
                // Creates a 5-pointed star that spirals up while rotating and shrinking in a cone
                const maxHeight = 100; // Total height of the cone
                const baseRadius = 50; // Radius at the base
                const starPoints = 5; // Number of star points
                const twistRate = 3; // How many full rotations while going up
                const spiralTurns = 8; // Number of complete spirals

                const progress = (this.t * 3); // Speed of traversal

                if (progress >= maxHeight) {
                    finished = true;
                    x = 0; y = 0; z = maxHeight;
                } else {
                    // Current height
                    const currentZ = progress;

                    // Cone radius decreases as we go up
                    const coneRadius = baseRadius * (1 - currentZ / maxHeight);

                    // Spiral angle (multiple rotations as we go up)
                    const spiralAngle = (currentZ / maxHeight) * spiralTurns * 2 * Math.PI;

                    // Twist angle (rotation of the star itself)
                    const twistAngle = (currentZ / maxHeight) * twistRate * 2 * Math.PI;

                    // Star pattern angle (which point of the star we're on)
                    const starAngle = (this.t * 2) % (2 * Math.PI);

                    // Create star shape using modulated radius
                    // This creates the pointed star effect
                    const starModulation = 0.5 + 0.5 * Math.cos(starPoints * starAngle);

                    // Combine all transformations:
                    // 1. Star shape modulation
                    // 2. Cone shrinking
                    // 3. Spiral rotation
                    // 4. Twist rotation
                    const effectiveRadius = coneRadius * starModulation;
                    const totalAngle = spiralAngle + twistAngle + starAngle;

                    x = effectiveRadius * Math.cos(totalAngle);
                    y = effectiveRadius * Math.sin(totalAngle);
                    z = currentZ;
                }
                break;
        }

        if (finished) {
            this.stopSimulation();
            this.emit('data', 'ACK,Simulation Finished\n');
            return;
        }

        // Apply noise
        x += noiseX;
        y += noiseY;
        z += noiseZ;

        // Mock angles (just for display)
        const theta1 = (this.t * 10) % 360;
        const theta2 = (this.t * 5) % 360;
        const theta3 = (this.t * 2) % 360;
        const theta4 = (this.t * 1) % 360;

        const timestamp = Date.now();
        const message = `POS,${timestamp},${x.toFixed(3)},${y.toFixed(3)},${z.toFixed(3)},${theta1.toFixed(2)},${theta2.toFixed(2)},${theta3.toFixed(2)},${theta4.toFixed(2)}\n`;

        this.emit('data', message);
    }
}

module.exports = SimulatorEngine;
