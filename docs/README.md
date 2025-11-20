# CCM Digitizing Arm v1.0.0

> **Document Control:** v1.0.0 | Last Updated: 2025-01-20 | Compatible with Firmware v1.0.0

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Electron](https://img.shields.io/badge/Electron-33.0.0-blue.svg)](https://www.electronjs.org/)
[![Node](https://img.shields.io/badge/Node-20.18.0-green.svg)](https://nodejs.org/)

A professional desktop application for interfacing with 4-axis articulated digitizing arms. Designed for reverse engineering, quality control, and 3D measurement tasks with real-time coordinate tracking, advanced geometry analysis, and interactive 3D visualization.

![CCM Digitizing Arm Interface](docs/images/app-screenshot.png)

---

## 🎯 Quick Links

- **[Quick Start Guide](QUICKSTART.md)** - Get up and running in 5 minutes
- **[Hardware Setup](HARDWARE.md)** - Arduino firmware and wiring guide
- **[Contributing](CONTRIBUTING.md)** - Help improve this project
- **[Changelog](CHANGELOG.md)** - Version history and updates

---

## ✨ Key Features

### 🛠️ Core Functionality
- **Real-Time Tracking**: Reads 4-axis encoder data and calculates X, Y, Z coordinates using forward kinematics
- **Point Capture**: Record individual boundary/hole points or stream continuous data with Live Recording
- **Unit Support**: Instant toggle between Millimeters (mm) and Inches (in)
- **Undo/Redo**: Full history support for all point operations

### 📐 Geometry Analysis
- **Manual Mode**: Capture raw 3D coordinate points
- **Circle Fit**: Calculate diameter, center point, and circularity from 3+ points
- **Plane Fit**: Calculate flatness and normal vectors from 3+ points
- **Line Fit**: Calculate length and direction from 2+ points

### 🧊 3D Visualization
- **Interactive Viewer**: Real-time 3D plotting with color-coded axes (X=Red, Y=Green, Z=Blue)
- **Orbit Controls**: Pan, zoom, and rotate to inspect measurements from any angle
- **Screenshot Export**: Capture views for documentation and reports

### 🔌 Connectivity
- **Serial Connection**: Auto-detects Arduino-based digitizing arms via USB
- **Simulator Mode**: Built-in physics simulator for testing without hardware
  - Simulates Rectangle, Cylinder, Cone, and complex calibration patterns

### 💾 Data Management
- **CSV Export**: Save captured points and geometry results for analysis in Excel, MATLAB, etc.
- **Status Logging**: Detailed event log with timestamps for troubleshooting

---

## 🖥️ System Requirements

| Component | Requirement |
|-----------|-------------|
| **OS** | Windows 10/11, macOS 10.15+, or Linux (Ubuntu 20.04+) |
| **Node.js** | v18.0.0 or higher |
| **npm** | v9.0.0 or higher |
| **RAM** | 4 GB minimum, 8 GB recommended |
| **Display** | 1280x720 minimum resolution |

---

## 🚀 Installation

### 1. Clone the Repository
```bash
git clone https://github.com/Toy-Department/ccm-digitizing-arm.git
cd ccm-digitizing-arm
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Run the Application
```bash
npm start
```

### 4. Build for Production (Optional)
```bash
# Windows
npm run build-win

# macOS
npm run build-mac

# Linux
npm run build-linux
```

---

## 📖 Usage Overview

### Connecting to Hardware
1. Connect your Arduino-based digitizing arm via USB
2. Click **Refresh** to scan for available ports
3. Select your device from the dropdown
4. Click **Connect**

### Connecting to Simulator
1. Select **"Simulator (Virtual Arm)"** from the port dropdown
2. Click **Connect**
3. Choose a simulation shape (Rectangle, Cylinder, Cone, Calibration Master)

### Capturing Points
1. Enable **Live Recording** checkbox to stream points continuously
2. Adjust **Frequency** slider (1-20 Hz) for desired sampling rate
3. Click **▶️ Live Data** to start recording
4. Click **🔷 Mark as Boundary** or **⭕ Mark as Hole Center** to capture individual points
5. Click **⏹️ Stop Recording** when finished

### Geometry Modes
1. Select a mode from the **Geometry Mode** dropdown:
   - **Manual Points**: Capture raw coordinates
   - **Circle**: Mark 3+ points on a circular feature
   - **Plane**: Mark 3+ points on a flat surface
   - **Line**: Mark 2+ points along a straight edge
2. Follow the on-screen prompts to mark temporary points
3. Click **Calculate** to compute the geometry

### Exporting Data
1. Go to **File → Export CSV** (or press `Ctrl+E`)
2. Choose a save location
3. Open the CSV file in Excel, MATLAB, or your preferred analysis tool

---

## 🔧 Tech Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| [Electron](https://www.electronjs.org/) | v33.0.0 | Cross-platform desktop framework |
| [Node.js](https://nodejs.org/) | v20.18.0 | JavaScript runtime |
| [Three.js](https://threejs.org/) | v0.160.0 | 3D visualization engine |
| [SerialPort](https://serialport.io/) | v12.0.0 | Hardware communication |

---

## 📁 Project Structure

```
ccm-digitizing-arm/
├── main.js                 # Electron main process (window management)
├── renderer.js             # Core application logic (UI, serial, geometry)
├── index.html              # Main UI layout
├── styles.css              # Application styling
├── src/
│   ├── three-viewer.js     # 3D visualization module
│   ├── simulator-engine.js # Virtual arm simulator
│   ├── geometry-calculator.js # Geometry algorithms (circle, plane, line)
│   ├── kinematics.js       # Forward kinematics calculations
│   ├── csv-exporter.js     # CSV file generation
│   ├── undo-manager.js     # Undo/redo functionality
│   └── serial-handler.js   # Serial port communication
├── package.json            # Node.js dependencies and scripts
├── README.md               # This file
├── QUICKSTART.md           # Quick start guide
├── HARDWARE.md             # Arduino firmware and wiring
├── CONTRIBUTING.md         # Contribution guidelines
├── CHANGELOG.md            # Version history
└── LICENSE                 # MIT License
```

---

## 🤝 Contributing

We welcome contributions! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines on:
- Reporting bugs
- Suggesting features
- Submitting pull requests
- Code style and standards

---

## 📜 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **Three.js Community** for the excellent 3D rendering library
- **Electron Team** for making cross-platform desktop apps accessible
- **SerialPort Contributors** for robust hardware communication

---

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/Toy-Department/ccm-digitizing-arm/issues)
- **Discussions**: [GitHub Discussions](https://github.com/Toy-Department/ccm-digitizing-arm/discussions)
- **Email**: toydepartment2025@gmail.com

---

## 🗺️ Roadmap

### v1.1.0 (Planned)
- [ ] Tool offset management system
- [ ] Multi-language support (Spanish, German, Chinese)
- [ ] Dark/Light theme toggle

### v1.2.0 (Planned)
- [ ] Cloud sync for measurement data
- [ ] Mobile companion app (iOS/Android)
- [ ] Advanced statistical analysis (GD&T)

---

**Made with ❤️ for the open-source community**
