# Hardware Setup Guide

> **Document Control:** v1.0.0 | Last Updated: 2025-01-20 | Compatible with Firmware v1.0.0

This guide covers the Arduino firmware and hardware setup for building your own 4-axis digitizing arm.

---

## 🔧 Hardware Requirements

| Component | Specification | Quantity |
|-----------|---------------|----------|
| **Microcontroller** | Arduino Mega 2560 | 1 |
| **Encoders** | Incremental Quadrature, 600 PPR recommended | 4 |
| **USB Cable** | Type-B (Arduino Mega) | 1 |
| **Power Supply** | 7-12V DC (if using external power) | 1 (optional) |
| **Capacitors** | 0.1µF ceramic (for noise filtering) | 8 |

### Why Arduino Mega 2560?
The Mega 2560 is required because it has **6 hardware interrupt pins**, which are essential for reading 4 quadrature encoders simultaneously without missing pulses.

---

## 📌 Pin Connections

### Encoder Wiring Table

| Encoder | Channel | Arduino Pin | Type | Notes |
|---------|---------|-------------|------|-------|
| **Axis 1 (Base)** | A | 2 | INT0 | Hardware interrupt |
| **Axis 1 (Base)** | B | 3 | INT1 | Hardware interrupt |
| **Axis 2 (Shoulder)** | A | 18 | INT5 | Hardware interrupt |
| **Axis 2 (Shoulder)** | B | 19 | INT4 | Hardware interrupt |
| **Axis 3 (Elbow)** | A | 20 | INT3 | Hardware interrupt |
| **Axis 3 (Elbow)** | B | 21 | INT2 | Hardware interrupt |
| **Axis 4 (Wrist)** | A | 22 | Digital | Polled in software |
| **Axis 4 (Wrist)** | B | 23 | Digital | Polled in software |

### Power and Ground
- Connect encoder **VCC** to Arduino **5V**
- Connect encoder **GND** to Arduino **GND**
- Add a **0.1µF capacitor** between VCC and GND for each encoder (near the encoder) to reduce noise

---

## 💻 Firmware Installation

### 1. Download Arduino IDE
- Install the [Arduino IDE](https://www.arduino.cc/en/software) (v2.0 or higher recommended)

### 2. Get the Firmware
The firmware is **not included** in this repository. You will need to create it based on the protocol specification below, or obtain it separately.

### 3. Configure Firmware (`config.h`)
Edit the firmware's `config.h` file to match your arm's physical dimensions:

```cpp
#define SERIAL_BAUD_RATE 115200
#define ENCODER_PPR 600          // Pulses per revolution of your encoders

// Link lengths in millimeters (measure your arm)
#define LINK_1_LENGTH 254.0      // Base to shoulder
#define LINK_2_LENGTH 254.0      // Shoulder to elbow
#define LINK_3_LENGTH 254.0      // Elbow to wrist
#define LINK_4_LENGTH 35.0       // Wrist to probe tip
```

### 4. Upload to Arduino
1. Connect the Arduino Mega via USB
2. Open the firmware `.ino` file in Arduino IDE
3. Select **Tools → Board → Arduino Mega 2560**
4. Select **Tools → Port → [Your COM Port]**
5. Click **Upload** (➡️ button)

---

## 📡 Serial Protocol Specification

### Baud Rate
**115200 bps**, 8 data bits, no parity, 1 stop bit

### Data Format (Arduino → PC)
The Arduino sends position data in this format:
```
POS,<timestamp>,<x>,<y>,<z>,<theta1>,<theta2>,<theta3>,<theta4>\r\n
```

**Example:**
```
POS,1234567890,123.456,78.901,45.678,90.00,45.00,30.00,15.00\r\n
```

| Field | Description | Unit |
|-------|-------------|------|
| `POS` | Message type identifier | - |
| `timestamp` | Milliseconds since Arduino boot | ms |
| `x` | X coordinate | mm |
| `y` | Y coordinate | mm |
| `z` | Z coordinate | mm |
| `theta1` | Base joint angle | degrees |
| `theta2` | Shoulder joint angle | degrees |
| `theta3` | Elbow joint angle | degrees |
| `theta4` | Wrist joint angle | degrees |

### Commands (PC → Arduino)

| Command | Description | Response |
|---------|-------------|----------|
| `START\r\n` | Begin streaming position data | `ACK,Recording Started\r\n` |
| `STOP\r\n` | Stop streaming position data | `ACK,Recording Stopped\r\n` |
| `PAUSE\r\n` | Pause streaming | `ACK,Recording Paused\r\n` |
| `RESUME\r\n` | Resume streaming | `ACK,Recording Resumed\r\n` |
| `ZERO\r\n` | Zero all encoder counts | `ACK,Encoders Zeroed\r\n` |
| `INFO\r\n` | Get firmware version | `INFO,Firmware: v1.0.0\r\n` |
| `SETDIM l1,l2,l3,l4\r\n` | Update link dimensions (mm) | `ACK,Dimensions updated: l1,l2,l3,l4\r\n` |
| `SETPPR ppr\r\n` | Update encoder PPR | `ACK,PPR updated: ppr\r\n` |

**Example Command Sequence:**
```
PC → Arduino: INFO\r\n
Arduino → PC: INFO,Firmware: v1.0.0\r\n

PC → Arduino: START\r\n
Arduino → PC: ACK,Recording Started\r\n
Arduino → PC: POS,1000,100.0,50.0,25.0,90.0,45.0,30.0,15.0\r\n
Arduino → PC: POS,1100,101.2,50.5,25.3,90.5,45.2,30.1,15.0\r\n
...

PC → Arduino: STOP\r\n
Arduino → PC: ACK,Recording Stopped\r\n
```

---

## 🔍 Troubleshooting

### Encoder Jitter / Noise
**Symptoms:** Erratic position readings, jumping coordinates

**Solutions:**
1. Add **0.1µF capacitors** between VCC and GND on each encoder
2. Use **shielded cables** for encoder wiring
3. Keep encoder wires away from power cables
4. Ensure solid ground connection between Arduino and encoders

### Inaccurate Measurements
**Symptoms:** Measured dimensions don't match physical reality

**Solutions:**
1. Verify `LINK_LENGTH` values in `config.h` match your arm's actual dimensions
2. Calibrate encoder PPR setting
3. Check for mechanical play in joints
4. Ensure encoders are securely mounted (no slipping)

### Connection Drops
**Symptoms:** Serial connection lost during operation

**Solutions:**
1. Use a high-quality USB cable (avoid cheap cables)
2. Install proper USB drivers ([CH340](https://sparks.gogo.co.nz/ch340.html) for clone boards)
3. Avoid USB hubs; connect directly to PC
4. Check for loose connections

### No Data Received
**Symptoms:** Application connects but shows no position updates

**Solutions:**
1. Verify baud rate is **115200** in both firmware and application
2. Check that firmware is sending `\r\n` line endings (not just `\n`)
3. Confirm encoders are wired correctly and powered
4. Test with Arduino IDE Serial Monitor first

---

## 🧪 Testing Your Setup

### 1. Serial Monitor Test
1. Open Arduino IDE
2. Go to **Tools → Serial Monitor**
3. Set baud rate to **115200**
4. Type `INFO` and press Enter
5. You should see: `INFO,Firmware: v1.0.0`

### 2. Position Data Test
1. In Serial Monitor, type `START`
2. You should see continuous `POS,...` messages
3. Move the arm and verify coordinates change
4. Type `STOP` to halt streaming

### 3. Application Test
1. Launch the CCM Digitizing Arm application
2. Connect to your Arduino
3. Enable Live Recording and start recording
4. Move the arm and watch the 3D viewer update

---

## 📐 Calibration Tips

### Measuring Link Lengths
- Measure from the **center of rotation** of one joint to the center of rotation of the next
- Use calipers for accuracy
- Measure in millimeters

### Encoder PPR Verification
- Most encoders are labeled with their PPR (e.g., "600P/R")
- If unlabeled, consult the datasheet
- Quadrature encoders provide **4x resolution** (600 PPR = 2400 counts per revolution)

---

## 🛡️ Safety Notes

- **Electrical**: Ensure proper grounding to avoid static damage to encoders
- **Mechanical**: Secure all encoder mounts to prevent slipping during operation
- **Thermal**: Avoid running encoders near heat sources (motors, etc.)

---

**Need Help?** Open an issue on [GitHub](https://github.com/Toy-Department/ccm-digitizing-arm/issues) with the `hardware` label.
