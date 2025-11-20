# Quick Start Guide

> **Document Control:** v1.0.0 | Last Updated: 2025-01-20 | Compatible with Firmware v1.0.0

Get up and running with the CCM Digitizing Arm in **5 minutes**.

---

## ⚡ Prerequisites

Before you begin, ensure you have:
- ✅ **Node.js** v18.0.0 or higher ([Download](https://nodejs.org/))
- ✅ **npm** v9.0.0 or higher (comes with Node.js)
- ✅ **Git** (optional, for cloning)

---

## 📥 Step 1: Install

### Option A: Clone from GitHub
```bash
git clone https://github.com/Toy-Department/ccm-digitizing-arm.git
cd ccm-digitizing-arm
npm install
```

### Option B: Download ZIP
1. Download the [latest release](https://github.com/Toy-Department/ccm-digitizing-arm/releases)
2. Extract the ZIP file
3. Open a terminal in the extracted folder
4. Run `npm install`

---

## 🚀 Step 2: Launch

```bash
npm start
```

The application window will open automatically.

---

## 🎮 Step 3: Connect

### Using the Simulator (No Hardware Required)
1. In the top bar, click the **Hardware** dropdown
2. Select **"Simulator (Virtual Arm)"**
3. Click **Connect**
4. ✅ Status should show **"Connected"** in green

### Using Real Hardware
1. Connect your Arduino digitizing arm via USB
2. Click **🔄 Refresh** to scan for ports
3. Select your device (e.g., `COM3` on Windows, `/dev/ttyUSB0` on Linux)
4. Click **Connect**
5. ✅ Status should show **"Connected to Hardware"**

---

## 📍 Step 4: Capture Your First Point

### Manual Point Capture
1. Click **🔷 Mark as Boundary** to capture the current position
2. The point appears in the **Captured Points** table
3. The **3D Visualizer** updates in real-time

### Live Recording (Continuous Stream)
1. Check the **☑ Enable Live Recording** box
2. Adjust the **Frequency** slider (5 Hz is a good start)
3. Click **▶️ Live Data**
4. Move the arm (or let the simulator run)
5. Watch points stream into the table and 3D viewer
6. Click **⏹️ Stop Recording** when done

---

## 💾 Step 5: Export Data

1. Go to **File → Export CSV** (or press `Ctrl+E` / `Cmd+E`)
2. Choose a save location
3. Open the CSV in Excel, MATLAB, or any spreadsheet tool

**CSV Format:**
```csv
#,Type,X,Y,Z,Action
1,BOUNDARY,123.456,78.901,45.678,
2,HOLE_CENTER,100.000,50.000,25.000,
```

---

## 🎯 Step 6: Try Geometry Analysis

### Calculate a Circle
1. Set **Geometry Mode** to **Circle**
2. Click **📍 Mark Point** at least 3 times on a circular feature
3. Click **🔢 Calculate Circle**
4. Results appear in the **Geometry Results** panel:
   - Diameter
   - Center Point (X, Y, Z)
   - Circularity (deviation)

### Calculate a Plane
1. Set **Geometry Mode** to **Plane**
2. Click **📍 Mark Point** at least 3 times on a flat surface
3. Click **🔢 Calculate Plane**
4. Results show:
   - Normal Vector
   - Flatness (deviation)

---

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `B` | Mark as Boundary |
| `H` | Mark as Hole Center |
| `Space` | Quick Mark (current type) |
| `Ctrl+Z` | Undo |
| `Ctrl+Y` | Redo |
| `Ctrl+E` | Export CSV |
| `Ctrl+S` | Start Recording |
| `Ctrl+Shift+S` | Stop Recording |

---

## 🐛 Troubleshooting

### "No ports found"
- **Windows**: Install [CH340 drivers](https://sparks.gogo.co.nz/ch340.html)
- **Linux**: Add your user to the `dialout` group: `sudo usermod -a -G dialout $USER` (then log out/in)
- **macOS**: No drivers needed for most Arduino boards

### "Connection failed"
- Check that no other program is using the serial port (Arduino IDE, PuTTY, etc.)
- Try a different USB cable (some are power-only)
- Restart the application

### "Application won't start"
- Verify Node.js version: `node --version` (should be v18+)
- Delete `node_modules` and run `npm install` again
- Check the console for error messages

---

## 📚 Next Steps

- **[Hardware Setup Guide](HARDWARE.md)** - Build your own Arduino-based digitizing arm
- **[Full README](README.md)** - Detailed feature documentation
- **[Contributing Guide](CONTRIBUTING.md)** - Help improve the project

---

**Need Help?** Open an issue on [GitHub](https://github.com/Toy-Department/ccm-digitizing-arm/issues)
