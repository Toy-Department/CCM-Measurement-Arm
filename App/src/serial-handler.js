/*
 * ============================================================================
 * SERIAL HANDLER MODULE
 * ============================================================================
 */

const { SerialPort } = require('serialport');
const { ReadlineParser } = require('@serialport/parser-readline');
const SimulatorEngine = require('./simulator-engine');

class SerialHandler {
    constructor() {
        this.port = null;
        this.parser = null;
        this.isConnected = false;
        this.dataCallback = null;
        this.statusCallback = null;
    }

    async listPorts() {
        try {
            const ports = await SerialPort.list();
            const portList = ports.filter(port => port.vendorId || port.manufacturer);
            // Add Simulator option
            portList.push({
                path: 'Simulator',
                manufacturer: 'Virtual Device',
                vendorId: 'SIM'
            });
            return portList;
        } catch (error) {
            console.error('Error listing ports:', error);
            return [];
        }
    }

    async connect(portPath, onData, onStatus) {
        try {
            this.dataCallback = onData;
            this.statusCallback = onStatus;

            if (portPath === 'Simulator') {
                this.port = new SimulatorEngine();
            } else {
                this.port = new SerialPort({
                    path: portPath,
                    baudRate: 115200,
                    autoOpen: false
                });
            }

            this.parser = this.port.pipe(new ReadlineParser({ delimiter: '\n' }));

            this.port.on('open', () => {
                this.isConnected = true;
                this.statusCallback?.({ type: 'connected', message: 'Connected to Arduino' });
            });

            this.port.on('error', (err) => {
                this.isConnected = false;
                this.statusCallback?.({ type: 'error', message: `Error: ${err.message}` });
            });

            this.port.on('close', () => {
                this.isConnected = false;
                this.statusCallback?.({ type: 'disconnected', message: 'Disconnected' });
            });

            this.parser.on('data', (line) => this.handleIncomingData(line.trim()));

            await new Promise((resolve, reject) => {
                this.port.open((err) => err ? reject(err) : resolve());
            });

            await this.delay(2000);
            this.sendCommand('INFO');

            return { success: true };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    async disconnect() {
        if (this.port && this.port.isOpen) {
            await new Promise((resolve) => this.port.close(() => resolve()));
            this.isConnected = false;
        }
    }

    sendCommand(command) {
        if (!this.isConnected || !this.port || !this.port.isOpen) return false;
        try {
            this.port.write(command + '\r\n');
            return true;
        } catch (error) {
            console.error('Error sending command:', error);
            return false;
        }
    }

    handleIncomingData(line) {
        if (!line) return;
        const parts = line.split(',');
        const messageType = parts[0];

        switch (messageType) {
            case 'POS':
                if (parts.length === 9) {
                    this.dataCallback?.({
                        type: 'position',
                        timestamp: parseInt(parts[1]),
                        x: parseFloat(parts[2]),
                        y: parseFloat(parts[3]),
                        z: parseFloat(parts[4]),
                        theta1: parseFloat(parts[5]),
                        theta2: parseFloat(parts[6]),
                        theta3: parseFloat(parts[7]),
                        theta4: parseFloat(parts[8])
                    });
                }
                break;
            case 'ACK':
                const ackMessage = parts.slice(1).join(',');
                this.statusCallback?.({ type: 'info', message: ackMessage });

                // Check for simulation finished
                if (ackMessage.includes('Simulation Finished')) {
                    this.dataCallback?.({ type: 'simulation_finished', message: ackMessage });
                }
                break;
            case 'ERROR':
                this.statusCallback?.({ type: 'error', message: parts.slice(1).join(',') });
                break;
            case 'INFO':
            case 'VERSION':
                this.dataCallback?.({ type: messageType.toLowerCase(), message: parts.slice(1).join(',') });
                break;
            default:
                this.dataCallback?.({ type: 'raw', message: line });
        }
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    getConnectionStatus() {
        return this.isConnected;
    }
}

module.exports = SerialHandler;
