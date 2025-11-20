# Changelog

All notable changes to the CCM Digitizing Arm project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.0.0] - 2025-01-20

### 🎉 Initial Release
First stable release of the CCM Digitizing Arm application.

### Added
- **Core Functionality**
  - Real-time 4-axis encoder tracking with forward kinematics
  - Live recording mode with adjustable frequency (1-20 Hz)
  - Manual point capture (Boundary and Hole Center types)
  - Undo/Redo support for all point operations
  - Unit toggle between Millimeters and Inches

- **Geometry Analysis**
  - Circle fit algorithm (diameter, center, circularity)
  - Plane fit algorithm (flatness, normal vector)
  - Line fit algorithm (length, direction)
  - Temporary point marking system for geometry modes

- **3D Visualization**
  - Interactive Three.js viewer with orbit controls
  - Color-coded axes (X=Red, Y=Green, Z=Blue)
  - Real-time point plotting
  - Screenshot export functionality
  - White background with subtle light gray grid

- **Connectivity**
  - Serial port auto-detection and connection
  - Built-in simulator with 4 shape modes (Rectangle, Cylinder, Cone, Calibration Master)
  - Robust serial protocol with `\r\n` line endings
  - Hardware/Simulator status indicators

- **Data Management**
  - CSV export with geometry results
  - Status log with timestamps and auto-scrolling
  - Point count tracking (total and live)

- **User Interface**
  - Clean, professional left panel layout
  - Uppercase, gray section headers for visual hierarchy
  - Desaturated button colors for refined aesthetics
  - Recording controls grouped in a unified card
  - Neutralized "Zero Encoders" button style
  - 6px vertical spacing between buttons

- **Settings**
  - Link dimension configuration (L1, L2, L3, L4)
  - Encoder PPR configuration
  - Tool offset management (foundation)
  - Simulator shape selection with live preview

- **Documentation**
  - Comprehensive README.md
  - Quick Start Guide (QUICKSTART.md)
  - Hardware Setup Guide (HARDWARE.md)
  - Contributing Guidelines (CONTRIBUTING.md)
  - MIT License

### Fixed
- Serial command line endings now use `\r\n` for Arduino compatibility
- Input values are trimmed to prevent whitespace errors in SETDIM/SETPPR commands
- Temporary geometry points now visualized in 3D viewer
- Instruction bar updates correctly when connecting to hardware
- Button spacing restored with proper vertical gaps

### Technical Details
- **Electron**: v33.0.0
- **Node.js**: v20.18.0
- **Three.js**: v0.160.0
- **SerialPort**: v12.0.0
- **Compatible Firmware**: v1.0.0

---

## [Unreleased]

### Planned for v1.1.0
- Tool offset management system
- Multi-language support (Spanish, German, Chinese)
- Dark/Light theme toggle
- Automated test suite

### Planned for v1.2.0
- Cloud sync for measurement data
- Mobile companion app (iOS/Android)
- Advanced statistical analysis (GD&T)
- Export to CAD formats (STEP, IGES)

---

**Legend:**
- `Added` - New features
- `Changed` - Changes to existing functionality
- `Deprecated` - Soon-to-be removed features
- `Removed` - Removed features
- `Fixed` - Bug fixes
- `Security` - Security vulnerability fixes
