# CCM Digitizing Arm - Arduino Firmware

![Version](https://img.shields.io/badge/version-1.0.2-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![Arduino](https://img.shields.io/badge/platform-Arduino%20Mega%202560-blue.svg)

**Professional-grade firmware for 4-axis coordinate measuring machine (CCM) digitizing arms.**

This open-source firmware transforms an Arduino Mega 2560 into a precision measurement controller for articulated digitizing arms. Perfect for reverse engineering, quality inspection, and 3D coordinate capture applications.

---

## 🎯 Key Features

- **High-Precision Tracking**: Quadrature encoder support with x4 resolution (2400 counts per revolution at 600 PPR)
- **Real-Time Kinematics**: Forward kinematics calculations for instant XYZ coordinate output
- **Flexible Configuration**: All parameters configurable via `config.h` without code changes
- **Professional Protocol**: Text-based serial communication protocol for easy PC integration
- **Tool Offset Support**: Configure multiple probe tips with different dimensions
- **Live Recording**: Continuous coordinate streaming for automated scanning applications
- **Zero/Origin Control**: Dual zeroing system for encoder calibration and coordinate system setup
- **Runtime Configuration**: Change encoder resolution and arm dimensions on-the-fly

---

## 📋 Table of Contents

- [Hardware Requirements](#hardware-requirements)
- [Quick Start](#quick-start)
- [Installation](#installation)
- [Configuration](#configuration)
- [Command Reference](#command-reference)
- [Wiring Diagram](#wiring-diagram)
- [Troubleshooting](#troubleshooting)
- [Documentation](#documentation)
- [Contributing](#contributing)
- [License](#license)

---

## 🔧 Hardware Requirements

### Required Components

| Component | Specification | Notes |
|-----------|--------------|-------|
| **Microcontroller** | Arduino Mega 2560 | Required - Arduino Uno lacks sufficient interrupt pins |
| **Encoders** | 4× Quadrature rotary encoders | Default: 600 PPR, configurable up to 10,000 PPR |
| **Encoder Voltage** | 5V compatible | Use level shifters for 3.3V encoders |
| **USB Cable** | USB Type-B | For programming and serial communication |
| **Power Supply** | Via USB or external 7-12V | External recommended for encoder power |

### Why Arduino Mega 2560?

The Mega 2560 provides:
- **6 hardware interrupt pins** (vs. 2 on Uno) for responsive encoder reading
- **More SRAM** for kinematics calculations and buffering
- **54 digital I/O pins** for future expansion
- **Hardware serial ports** for additional communication options

---

## 🚀 Quick Start

### 1. Download Firmware

```bash
git clone https://github.com/Toy-Department/CCM-Digitizing-Arm.git
cd CCM-Digitizing-Arm/Arduino
```

Or download the [latest release](https://github.com/Toy-Department/CCM-Digitizing-Arm/releases) ZIP file.

### 2. Open in Arduino IDE

1. Launch Arduino IDE (version 1.8.0 or later recommended)
2. Open `CCM_Digitizing_Arm_Arduino.ino`
3. The IDE will automatically open all related files

### 3. Configure (Optional)

If your hardware differs from defaults, edit `config.h`:

```cpp
#define ENCODER_PPR 600        // Change to match your encoders
#define LINK_1_LENGTH 254.0    // Arm segment lengths in mm
// ... see Configuration section below
```

### 4. Upload

1. Connect Arduino Mega 2560 via USB
2. Select: **Tools → Board → Arduino Mega 2560**
3. Select: **Tools → Port → [Your COM port]**
4. Click **Upload** (→)

### 5. Verify

Open **Tools → Serial Monitor**, set to **115200 baud**, and you should see:

```
=====================================
4-Axis CCM Digitizing Arm
Firmware Version: 1.0.2
Date: 2025-11-20
=====================================
Ready for commands
```

**Success!** You're ready to wire your encoders. See [HARDWARE_SETUP.md](HARDWARE_SETUP.md) for wiring instructions.

---

## 🔌 Installation

### Prerequisites

- **Arduino IDE** 1.8.0 or later ([download here](https://www.arduino.cc/en/software))
- **Arduino Mega 2560** board
- **CH340/CH341 drivers** (if using clone boards - [download here](http://www.wch-ic.com/downloads/CH341SER_ZIP.html))

### Step-by-Step Installation

#### 1. Install Arduino IDE

Download and install from [arduino.cc](https://www.arduino.cc/en/software). No additional libraries are required - this firmware uses only Arduino core functions.

#### 2. Download Firmware

**Option A: Git Clone**
```bash
git clone https://github.com/Toy-Department/CCM-Digitizing-Arm.git
```

**Option B: Download ZIP**
1. Click "Code" → "Download ZIP" on GitHub
2. Extract to your Arduino projects folder

#### 3. Configure Your Hardware

Open `config.h` and verify/modify these critical settings:

```cpp
// ENCODER SETTINGS
#define ENCODER_PPR 600              // Pulses per revolution of your encoders

// ARM DIMENSIONS (millimeters)
// ⚠️ CRITICAL: Measure center-to-center between rotation axes!
#define LINK_1_LENGTH 254.0          // Base to shoulder
#define LINK_2_LENGTH 254.0          // Shoulder to elbow
#define LINK_3_LENGTH 254.0          // Elbow to wrist
#define LINK_4_LENGTH 35.0           // Wrist to probe tip
```

#### 4. Verify Pin Assignments

Default pin assignments in `config.h`:

| Encoder | Channel A | Channel B | Type |
|---------|-----------|-----------|------|
| 1 (Base) | Pin 2 | Pin 3 | Hardware Interrupt |
| 2 (Shoulder) | Pin 18 | Pin 19 | Hardware Interrupt |
| 3 (Elbow) | Pin 20 | Pin 21 | Hardware Interrupt |
| 4 (Wrist) | Pin 22 | Pin 23 | Pin Change Interrupt |

Only change these if you have a specific reason (e.g., pin conflicts with other hardware).

#### 5. Upload to Arduino

1. Connect Arduino Mega 2560 via USB
2. **Tools → Board → Arduino AVR Boards → Arduino Mega 2560**
3. **Tools → Port → [Select your COM/USB port]**
4. **Sketch → Upload** (or click the → button)
5. Wait for "Done uploading" message

#### 6. Test Communication

1. **Tools → Serial Monitor** (or Ctrl+Shift+M)
2. Set baud rate to **115200** (bottom-right dropdown)
3. Set line ending to **Newline** (bottom-right dropdown)
4. Type `INFO` and press Enter

You should see:
```
INFO,System Information:
INFO,Firmware: 1.0.2
INFO,Encoder PPR: 600
INFO,Update Rate: 20 Hz
INFO,Link Lengths: 254.0,254.0,254.0,35.0
```

**Success!** Your firmware is installed and communicating properly.

---

## ⚙️ Configuration

All user-configurable settings are in `config.h`. This design philosophy keeps configuration separate from code logic.

### Serial Communication

```cpp
#define SERIAL_BAUD_RATE 115200      // Baud rate (must match PC application)
#define UPDATE_INTERVAL_MS 50        // Position update frequency (50ms = 20 Hz)
```

**Recommendations:**
- Keep 115200 baud for best performance
- Decrease `UPDATE_INTERVAL_MS` for faster updates (min: 10ms / 100 Hz)
- Increase `UPDATE_INTERVAL_MS` if experiencing serial errors (max: 1000ms / 1 Hz)

### Encoder Settings

```cpp
#define ENCODER_PPR 600              // Pulses Per Revolution (PPR)
#define ENCODER_MULTIPLIER 4         // Quadrature mode (x1, x2, or x4)
```

**How to determine your encoder PPR:**
1. Check encoder datasheet or manufacturer specs
2. Common values: 100, 200, 360, 600, 1000, 2000, 2400, 4096
3. Higher PPR = better resolution but more CPU load

**Quadrature Multipliers:**
- **x4** (recommended): Count all edges (rising and falling on both channels) = highest resolution
- **x2**: Count rising edges only = medium resolution
- **x1**: Count single channel only = lowest resolution

**Total Resolution = PPR × Multiplier**
- Example: 600 PPR × 4 = 2400 counts per revolution
- Resolution: 360° ÷ 2400 = 0.15° per count

### Arm Dimensions

```cpp
#define LINK_1_LENGTH 254.0          // Base to shoulder (mm)
#define LINK_2_LENGTH 254.0          // Shoulder to elbow (mm)
#define LINK_3_LENGTH 254.0          // Elbow to wrist (mm)
#define LINK_4_LENGTH 35.0           // Wrist to probe tip (mm)
```

⚠️ **CRITICAL FOR ACCURACY:**
- Measure **center-to-center** between rotation axes, not edge-to-edge
- Use calipers or precision measuring tools
- Measurements in **millimeters**
- Include probe tip length in `LINK_4_LENGTH`

**How to measure:**
1. **Link 1**: Base rotation center to shoulder pivot center
2. **Link 2**: Shoulder pivot center to elbow pivot center
3. **Link 3**: Elbow pivot center to wrist pivot center
4. **Link 4**: Wrist pivot center to probe tip

### Encoder Direction

If an encoder counts backwards (decreases when it should increase):

```cpp
#define ENCODER_1_DIRECTION 1        // 1 = normal, -1 = reversed
#define ENCODER_2_DIRECTION -1       // This one is reversed
```

**How to test:**
1. Upload firmware with default directions (all = 1)
2. Open Serial Monitor, type `GETPOS`
3. Manually rotate each encoder in the positive direction
4. If angle decreases instead of increases, change that encoder's direction to -1
5. Re-upload firmware

### Debugging Options

```cpp
#define DEBUG_MODE false             // Enable verbose serial output
#define DEBUG_ENCODERS false         // Show encoder count updates
#define DEBUG_KINEMATICS false       // Show calculation details
```

⚠️ **WARNING:** Debug modes interfere with normal PC communication. Only enable for troubleshooting, then disable for production use.

**Debug Encoder Counts:**
```cpp
#define DEBUG_ENCODERS true
```
Shows real-time encoder counts in Serial Monitor - useful for verifying wiring and direction.

---

## 📡 Command Reference

The firmware uses a text-based command protocol for PC communication. All commands are case-insensitive and terminated by newline (`\n`).

### Command Format

```
COMMAND [parameters]\n
```

### Recording Control Commands

| Command | Parameters | Description | Response |
|---------|-----------|-------------|----------|
| `START` | None | Begin continuous position streaming | `ACK,RECORDING_STARTED` |
| `STOP` | None | Stop position streaming | `ACK,RECORDING_STOPPED` |
| `PAUSE` | None | Pause streaming (keeps state) | `ACK,RECORDING_PAUSED` |
| `RESUME` | None | Resume streaming | `ACK,RECORDING_RESUMED` |

**Example:**
```
> START
< ACK,RECORDING_STARTED
< POS,12345,123.456,78.901,-45.123,45.12,30.45,-15.67,5.89
< POS,12395,123.512,78.923,-45.098,45.18,30.51,-15.62,5.91
... (continues every UPDATE_INTERVAL_MS)
```

### Calibration Commands

| Command | Parameters | Description | Response |
|---------|-----------|-------------|----------|
| `ZERO` | None | Zero all encoders at current position | `ACK,ENCODERS_ZEROED` |
| `GETPOS` | None | Request single position reading | `POS,timestamp,x,y,z,θ1,θ2,θ3,θ4` |

**Example:**
```
> GETPOS
< POS,45678,156.234,89.567,-23.456,52.34,28.90,-12.45,6.78
```

**Position Data Format:**
```
POS,timestamp,x,y,z,theta1,theta2,theta3,theta4
```
- `timestamp`: Milliseconds since Arduino startup
- `x,y,z`: Cartesian coordinates in millimeters (3 decimal places)
- `theta1-4`: Joint angles in degrees (2 decimal places)

### Configuration Commands

| Command | Parameters | Description | Response |
|---------|-----------|-------------|----------|
| `SETPPR` | `<value>` | Set encoder resolution | `ACK,PPR_SET` |
| `SETDIM` | `l1,l2,l3,l4` | Set link lengths (mm) | `ACK,DIMENSIONS_SET` |
| `SETTOOL` | `x,y,z` | Set tool offset (mm) | `ACK,TOOL_OFFSET_SET` |

**Examples:**
```
> SETPPR 1000
< ACK,PPR_SET

> SETDIM 254.5,253.8,254.2,38.0
< ACK,DIMENSIONS_SET

> SETTOOL 0,0,15.5
< ACK,TOOL_OFFSET_SET
```

**Parameter Ranges:**
- `SETPPR`: 1 to 10000 (practical range: 100-4096)
- `SETDIM`: Any positive float values in millimeters
- `SETTOOL`: Any float values (positive or negative) in millimeters

### Information Commands

| Command | Parameters | Description | Response |
|---------|-----------|-------------|----------|
| `INFO` | None | Get system information | Multi-line system details |
| `VERSION` | None | Get firmware version | `VERSION,1.0.2,2025-11-20` |

**Example:**
```
> INFO
< INFO,System Information:
< INFO,Firmware: 1.0.2
< INFO,Encoder PPR: 600
< INFO,Update Rate: 20 Hz
< INFO,Link Lengths: 254.0,254.0,254.0,35.0
```

### Response Types

All responses from Arduino follow these formats:

**Acknowledgment:**
```
ACK,<message>
```

**Error:**
```
ERROR,<error_message>
```

**Position Data:**
```
POS,<timestamp>,<x>,<y>,<z>,<theta1>,<theta2>,<theta3>,<theta4>
```

**Information:**
```
INFO,<information_text>
```

**Version:**
```
VERSION,<version>,<date>
```

---

## 🔌 Wiring Diagram

### Pin Assignment Summary

```
Arduino Mega 2560 Pin Assignments
═══════════════════════════════════

ENCODER 1 (Base Rotation)
├─ Channel A  →  Pin 2  (INT0)
└─ Channel B  →  Pin 3  (INT1)

ENCODER 2 (Shoulder Pitch)
├─ Channel A  →  Pin 18 (INT5)
└─ Channel B  →  Pin 19 (INT4)

ENCODER 3 (Elbow Pitch)
├─ Channel A  →  Pin 20 (INT3)
└─ Channel B  →  Pin 21 (INT2)

ENCODER 4 (Wrist Pitch)
├─ Channel A  →  Pin 22 (PCINT)
└─ Channel B  →  Pin 23 (PCINT)

ALL ENCODERS
├─ Vcc  →  5V
└─ GND  →  GND
```

### Single Encoder Wiring

```
Rotary Encoder              Arduino Mega 2560
┌─────────────┐            ┌──────────────────┐
│             │            │                  │
│  Vcc     ●──┼────────────┤ 5V               │
│             │            │                  │
│  GND     ●──┼────────────┤ GND              │
│             │            │                  │
│  Ch A    ●──┼────────────┤ Pin 2 (INT0)     │
│             │            │                  │
│  Ch B    ●──┼────────────┤ Pin 3 (INT1)     │
│             │            │                  │
└─────────────┘            └──────────────────┘
```

**Notes:**
- Repeat this wiring for all 4 encoders using respective pin assignments
- Ensure common ground connection between Arduino and all encoders
- Use shielded cable for long encoder runs (>1 meter) to reduce noise
- Internal pull-up resistors are enabled in firmware (no external resistors needed)

### Power Considerations

**USB Power:**
- Suitable for testing with 1-2 low-current encoders
- Max current from USB: ~500mA total

**External Power (Recommended for Production):**
- Use 7-12V DC power supply through barrel jack
- Provides more current capacity for all 4 encoders
- Keeps USB available for serial communication

### Troubleshooting Wiring

If encoders don't count or count erratically:

1. **Verify Connections:**
   - Check continuity with multimeter
   - Ensure solid connections (no loose wires)

2. **Check Power:**
   - Measure voltage at encoder Vcc (should be 5V ± 0.25V)
   - Verify ground connections

3. **Test Encoder Signals:**
   - Use oscilloscope to view A and B channels
   - Should see square waves 90° out of phase when rotating

4. **Enable Debug Mode:**
   ```cpp
   #define DEBUG_ENCODERS true
   ```
   - Re-upload firmware
   - Rotate each encoder and watch Serial Monitor for count changes

For complete wiring instructions and photos, see [HARDWARE_SETUP.md](HARDWARE_SETUP.md).

---

## 🐛 Troubleshooting

### Connection Issues

**Problem: Arduino not detected / "Port not found"**

Solutions:
1. Install CH340/CH341 USB drivers (for clone boards)
2. Try different USB cable (must be data cable, not charge-only)
3. Try different USB port
4. Check Device Manager (Windows) or `ls /dev/tty*` (Linux/Mac)

**Problem: "Upload failed" or "Timeout"**

Solutions:
1. Ensure correct board selected: **Arduino Mega 2560**
2. Ensure correct port selected
3. Close Serial Monitor before uploading
4. Press Reset button on Arduino just before upload

### Encoder Issues

**Problem: Encoders not counting**

Check:
1. Wiring connections (especially ground)
2. Encoder power (measure 5V at encoder Vcc pin)
3. Enable `DEBUG_ENCODERS` mode and verify signals
4. Swap encoder with known-working encoder to isolate hardware fault

**Problem: Encoder counts backwards**

Solution:
```cpp
// In config.h, change direction for that encoder:
#define ENCODER_X_DIRECTION -1  // Reverses direction
```

**Problem: Erratic counting / missed counts**

Causes:
1. **Electrical noise**: Use shielded cables, add 0.1µF capacitors across encoder power
2. **Loose connections**: Check all connections with multimeter
3. **Speed too fast**: Encoders have maximum rotation speed (check datasheet)
4. **Insufficient power**: Use external power supply

### Coordinate Issues

**Problem: Wrong XYZ coordinates**

Check:
1. **Link lengths**: Verify measurements in `config.h` are accurate (center-to-center)
2. **Units**: Ensure measurements are in millimeters
3. **Encoder directions**: All encoders counting in correct direction
4. **Zero position**: Use `ZERO` command at known reference point

**Problem: Coordinates don't zero**

This issue was fixed in v1.0.2. If still occurring:
1. Verify you're running firmware v1.0.2 (type `VERSION` command)
2. Update to latest firmware
3. Use `ZERO` command after positioning arm

### Serial Communication Issues

**Problem: Garbled text in Serial Monitor**

Solution:
- Set baud rate to **115200** in Serial Monitor (bottom-right)
- Check `SERIAL_BAUD_RATE` in `config.h` matches

**Problem: No response to commands**

Check:
1. Line ending set to **Newline** in Serial Monitor (bottom-right)
2. Commands are case-insensitive but must be spelled correctly
3. Commands must be terminated with newline (`\n`)

**Problem: "Command too long" error**

Solution:
- Commands limited to 128 characters
- Use shorter parameter values or split into multiple commands

### Performance Issues

**Problem: Slow update rate / lag**

Solutions:
1. Decrease `UPDATE_INTERVAL_MS` in `config.h` (min: 10ms)
2. Disable debug modes (all should be `false` in production)
3. Increase baud rate to 115200 if using slower rate

**Problem: High CPU usage on PC**

Solutions:
1. Increase `UPDATE_INTERVAL_MS` to reduce data rate
2. Process data in batches instead of real-time

### Getting Help

If you're still experiencing issues:

1. **Enable debug modes** in `config.h` and check Serial Monitor output
2. **Check GitHub Issues**: [github.com/Toy-Department/CCM-Digitizing-Arm/issues](https://github.com/Toy-Department/CCM-Digitizing-Arm/issues)
3. **Post detailed issue** including:
   - Firmware version (`VERSION` command output)
   - Hardware specifications (encoder model, Arduino board)
   - Complete `config.h` settings
   - Serial Monitor output showing problem
   - Steps to reproduce

---

## 📚 Documentation

Complete documentation set:

| Document | Description |
|----------|-------------|
| **[README.md](README.md)** | This file - overview and quick start |
| **[HARDWARE_SETUP.md](HARDWARE_SETUP.md)** | Detailed wiring, BOM, assembly instructions |
| **[FIRMWARE_GUIDE.md](FIRMWARE_GUIDE.md)** | Complete firmware reference and configuration |
| **[QUICK_START.md](QUICK_START.md)** | 15-minute setup guide for first-time users |
| **[TROUBLESHOOTING.md](TROUBLESHOOTING.md)** | Expanded troubleshooting and diagnostics |
| **[CHANGELOG.md](CHANGELOG.md)** | Version history and release notes |

---

## 🤝 Contributing

We welcome contributions! This is an open-source project designed to help the maker and metrology communities.

### How to Contribute

1. **Fork the repository**
2. **Create a feature branch** (`git checkout -b feature/amazing-feature`)
3. **Commit your changes** (`git commit -m 'Add amazing feature'`)
4. **Push to branch** (`git push origin feature/amazing-feature`)
5. **Open a Pull Request**

### Contribution Guidelines

- **Code Style**: Follow existing Arduino coding conventions
- **Comments**: Document all changes with clear comments
- **Testing**: Test with physical hardware before submitting
- **Documentation**: Update relevant .md files with changes

### Areas for Contribution

- 🐛 Bug fixes and issue resolution
- 📖 Documentation improvements and translations
- ✨ New features (inverse kinematics, additional geometry types)
- 🧪 Testing on different hardware configurations
- 💻 PC application development (Python, Electron, etc.)

---

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

### MIT License Summary

**You are free to:**
- ✅ Use commercially
- ✅ Modify
- ✅ Distribute
- ✅ Private use

**Conditions:**
- 📋 Include license and copyright notice
- 🚫 No liability or warranty

---

## 🙏 Acknowledgments

- Arduino community for development platform
- Open-source metrology community
- Contributors and issue reporters

---

## 📧 Contact

- **Issues**: [GitHub Issues](https://github.com/Toy-Department/CCM-Digitizing-Arm/issues)
- **Discussions**: [GitHub Discussions](https://github.com/Toy-Department/CCM-Digitizing-Arm/discussions)
- **Email**: toydepartment2025@gmail.com

---

## 🔖 Version Information

**Current Version:** 1.0.2  
**Release Date:** November 20, 2025  
**Document Version:** 1.0.2  

See [CHANGELOG.md](CHANGELOG.md) for complete version history.

---

Made with ❤️ for the maker and metrology communities
