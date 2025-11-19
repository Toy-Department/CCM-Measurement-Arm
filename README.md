A desktop application for interfacing with 4-axis CCM digitizing arms. This software provides real-time coordinate tracking, advanced geometry analysis, and 3D visualization for reverse engineering and measurement tasks.

## TL;DR
Connects to a serial-based digitizing arm (or uses a built-in simulator) to capture 3D points. It calculates geometry (Circles, Planes, Lines, and more) from captured points, visualizes them in 3D, and exports data to CSV. Built with Electron, Node.js, and Three.js.

## Key Features

### 🛠️ Core Functionality
*   **Real-time Tracking**: Reads joint angles (Theta 1-4) and calculates X, Y, Z coordinates using forward kinematics.
*   **Point Capture**: Record individual points or stream points continuously with "Live Recording".
*   **Unit Support**: Toggle instantly between Millimeters (mm) and Inches (in).
*   **Undo/Redo**: Full history support for point capture and deletion.

### 📐 Geometry Modes
*   **Manual**: Capture raw 3D points.
*   **Circle**: Calculate diameter, center point, and circularity from 3+ points.
*   **Plane**: Calculate flatness and normal vectors from 3+ points.
*   **Line**: Calculate length and direction from 2+ points.

### 🧊 3D Visualization
*   **Interactive Viewer**: Real-time 3D plotting of captured points and calculated geometries.
*   **Controls**: Orbit, pan, and zoom to inspect measurements.
*   **Tools**: "Home" view reset and "Screenshot" capture.

### 🔌 Connectivity & Simulation
*   **Serial Connection**: Auto-detects and connects to the digitizing arm via USB/Serial.
*   **Simulator Mode**: Built-in physics simulator to test functionality without hardware.
    *   Simulates complex shapes: Rectangle, Cylinder, Cone, and Calibration Master.

### 💾 Data Management
*   **Export**: Save captured points and geometry data to CSV.
*   **Status Log**: Detailed event logging with auto-scrolling and timestamps.

## Tech Stack
*   **Framework**: [Electron](https://www.electronjs.org/) (v33.0.0)
*   **Runtime**: [Node.js](https://nodejs.org/) (v20.18.0)
*   **3D Engine**: [Three.js](https://threejs.org/) (v0.160.0)
*   **Hardware Interface**: [SerialPort](https://serialport.io/) (v12.0.0)

## Installation & Usage

### Prerequisites
*   Node.js (v18.0.0 or higher)
*   npm (v9.0.0 or higher)

## Project Structure
*   **`main.js`**: Electron main process entry point. Handles window creation and lifecycle.
*   **`renderer.js`**: Core application logic. Handles UI interactions, serial communication, and geometry calculations.
*   **`index.html`**: Main UI layout and structure.
*   **`styles.css`**: Application styling (Dark/Light themes, layout).
*   **`src/`**:
    *   `three-viewer.js`: 3D visualization logic.
    *   `simulator-engine.js`: Virtual arm simulator logic.
    *   `geometry-engine.js`: Math and geometry calculation algorithms.
    *   `kinematics.js`: Forward kinematics calculations.

## 🤖 Hardware & Firmware (Arduino)

This project is designed to work with a custom 4-axis articulated digitizing arm powered by an Arduino Mega 2560.

### Firmware Overview
The firmware enables an Arduino Mega 2560 to read 4 rotary encoders and calculate real-time 3D coordinates (X, Y, Z). Data is transmitted via serial to this PC application.

### Hardware Requirements
*   **Microcontroller**: Arduino Mega 2560 (Required for 6+ hardware interrupts)
*   **Encoders**: 4x Incremental Quadrature Encoders (600 PPR recommended)
*   **Connection**: USB cable

### Arm Configuration (CONFIG B - Articulated Robot Arm)

```
        Wrist (Axis 4)
           |
           |  Link 4 (<#>mm)
           o------------o Tip
          /
         /  Link 3 (<#>mm)
        /
    Elbow (Axis 3)
       /
      /  Link 2 (<#>mm)
     /
 Shoulder (Axis 2)
    |
    |  Link 1 (<#>mm)
    |
  Base (Axis 1)
    |
=========
```

## License
MIT

**Built with ❤️ for the maker community**
