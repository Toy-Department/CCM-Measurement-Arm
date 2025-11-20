# CCM Digitizing Arm - Desktop Application

A professional Electron-based desktop application for controlling and visualizing data from the CCM 4-axis digitizing arm.

## Features

- **Real-time 3D Visualization**: Live point cloud display using Three.js
- **Geometry Analysis**: Circle, plane, and line fitting with best-fit calculations
- **Live Recording**: Automated point capture at configurable frequencies (1-20 Hz)
- **Manual Point Marking**: Mark boundary points and hole centers
- **Tool Library**: Manage multiple probe tools with offset compensation
- **CSV Export**: Export captured points and geometry results
- **Undo/Redo**: Full undo/redo support for all operations
- **Simulator Mode**: Test the application without hardware

## Installation

### Prerequisites

- **Node.js** (v18.0.0 or higher)
- **npm** (v9.0.0 or higher)

### Setup

1. Navigate to the App directory:
   ```bash
   cd App
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

## Running the Application

From the `App` directory:

```bash
npm start
```

## Building Executables

Build for your platform:

```bash
# Windows
npm run build-win

# macOS
npm run build-mac

# Linux
npm run build-linux
```

Executables will be created in the `App/dist` folder.

## Usage

1. **Connect Hardware**: Select your Arduino port from the dropdown and click "Connect"
2. **Start Recording**: Click "Live Data" to begin capturing position data
3. **Mark Points**: Use the marking buttons to capture specific points
4. **Geometry Analysis**: Switch to Circle/Plane/Line mode for advanced measurements
5. **Export Data**: Export your captured points to CSV format

## Development

### Project Structure

```
App/
├── src/                    # Core modules
│   ├── serial-handler.js   # Serial communication
│   ├── three-viewer.js     # 3D visualization
│   ├── geometry-calculator.js
│   ├── csv-exporter.js
│   ├── tool-library.js
│   └── undo-manager.js
├── assets/                 # Icons and images
├── docs/                   # Documentation
├── main.js                 # Electron main process
├── renderer.js             # Electron renderer process
├── index.html              # UI layout
└── styles.css              # Styling

```

### Key Technologies

- **Electron**: Desktop application framework
- **Three.js**: 3D visualization
- **SerialPort**: Hardware communication
- **Node.js**: Runtime environment

## Troubleshooting

### Serial Port Issues

If you don't see your Arduino port:
1. Click the "Refresh" button
2. Ensure the Arduino is connected via USB
3. Check that the firmware is uploaded to the Arduino

### Build Issues

If `npm install` fails:
```bash
npm rebuild --runtime=electron --target=33.0.0 --disturl=https://electronjs.org/headers --build-from-source
```

## License

See the [LICENSE](../LICENSE) file in the root directory.
