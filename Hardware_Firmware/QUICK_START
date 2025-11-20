# Quick Start Guide

**Get your CCM Digitizing Arm running in 15 minutes!**

This guide assumes you have basic Arduino experience. For detailed explanations, see [README.md](README.md) and [HARDWARE_SETUP.md](HARDWARE_SETUP.md).

---

## ⚡ Prerequisites

- ✅ Arduino Mega 2560
- ✅ 4× Quadrature encoders (600 PPR recommended)
- ✅ USB cable
- ✅ Arduino IDE installed
- ✅ Basic wiring tools

---

## 🚀 Step 1: Download Firmware (2 minutes)

**Option A - Git:**
```bash
git clone https://github.com/Toy-Department/CCM-Digitizing-Arm.git
cd CCM-Digitizing-Arm/Arduino
```

**Option B - ZIP Download:**
1. Download from [GitHub Releases](https://github.com/Toy-Department/CCM-Digitizing-Arm/releases)
2. Extract ZIP file
3. Navigate to `Arduino/` folder

---

## ⚙️ Step 2: Configure Hardware (3 minutes)

Open `config.h` and modify if needed:

### Encoder Resolution
```cpp
#define ENCODER_PPR 600  // Change to match YOUR encoder
```

### Arm Dimensions
```cpp
// Measure center-to-center between rotation axes
#define LINK_1_LENGTH 254.0  // Base to shoulder (mm)
#define LINK_2_LENGTH 254.0  // Shoulder to elbow (mm)
#define LINK_3_LENGTH 254.0  // Elbow to wrist (mm)
#define LINK_4_LENGTH 35.0   // Wrist to probe tip (mm)
```

**💡 Tip:** You can change these later using `SETDIM` command if measurements are incorrect.

### Pin Assignments (Usually Don't Change)

Default pins work for most setups:
```cpp
// Encoder 1: Pins 2, 3
// Encoder 2: Pins 18, 19
// Encoder 3: Pins 20, 21
// Encoder 4: Pins 22, 23
```

---

## 📤 Step 3: Upload Firmware (2 minutes)

1. **Connect Arduino** via USB
2. **Open** `CCM_Digitizing_Arm_Arduino.ino` in Arduino IDE
3. **Select Board**: Tools → Board → Arduino Mega 2560
4. **Select Port**: Tools → Port → [Your COM port]
5. **Upload**: Click → button (or Ctrl+U)
6. **Wait** for "Done uploading"

---

## 🔌 Step 4: Wire Encoders (5 minutes)

### Quick Reference

| Encoder | Ch A Pin | Ch B Pin | Vcc | GND |
|---------|----------|----------|-----|-----|
| 1 (Base) | 2 | 3 | 5V | GND |
| 2 (Shoulder) | 18 | 19 | 5V | GND |
| 3 (Elbow) | 20 | 21 | 5V | GND |
| 4 (Wrist) | 22 | 23 | 5V | GND |

### Wiring Checklist

For EACH encoder:
- ✅ Vcc → Arduino 5V
- ✅ GND → Arduino GND (all encoders share common GND)
- ✅ Channel A → Assigned pin (see table)
- ✅ Channel B → Assigned pin (see table)

**⚠️ Critical:** Ensure common ground connection between Arduino and all encoders!

---

## ✅ Step 5: Test (3 minutes)

### 5.1 Communication Test

1. **Open Serial Monitor**: Tools → Serial Monitor (Ctrl+Shift+M)
2. **Set baud**: 115200 (bottom-right dropdown)
3. **Set line ending**: Newline (bottom-right dropdown)
4. **Look for startup message:**
   ```
   =====================================
   4-Axis CCM Digitizing Arm
   Firmware Version: 1.0.2
   Date: 2025-11-20
   =====================================
   Ready for commands
   ```

✅ **Success!** Communication working.

### 5.2 Test Commands

**Get system info:**
```
> INFO
< INFO,System Information:
< INFO,Firmware: 1.0.2
< INFO,Encoder PPR: 600
< INFO,Update Rate: 20 Hz
< INFO,Link Lengths: 254.0,254.0,254.0,35.0
```

**Get current position:**
```
> GETPOS
< POS,12345,0.000,0.000,0.000,0.00,0.00,0.00,0.00
```

✅ **Success!** Firmware responding to commands.

### 5.3 Test Encoders

**Enable debug mode** (temporary):

1. Edit `config.h`:
   ```cpp
   #define DEBUG_ENCODERS true
   ```

2. Re-upload firmware

3. Open Serial Monitor

4. **Manually rotate each encoder** one at a time
   - You should see count values changing
   - Counts should increase/decrease smoothly
   - No jumps or erratic behavior

5. **Disable debug mode** when done:
   ```cpp
   #define DEBUG_ENCODERS false
   ```

6. Re-upload firmware

✅ **Success!** All encoders responding.

---

## 🎯 Step 6: First Measurement

### Zero the System

1. **Position arm** at a known reference point
2. **Send command**: `ZERO`
3. **Response**: `ACK,ENCODERS_ZEROED`

This position is now your coordinate origin (0, 0, 0).

### Take a Reading

1. **Move arm** to a different position
2. **Send command**: `GETPOS`
3. **Response**: 
   ```
   POS,45678,123.456,78.901,-45.123,45.12,30.45,-15.67,5.89
             └─ X    └─ Y    └─ Z    └──────── Joint Angles ────┘
   ```

### Verify Coordinates

1. **Return arm** to zero position
2. **Send command**: `GETPOS`
3. Coordinates should read close to `0.000,0.000,0.000`

✅ **Success!** System is calibrated and working!

---

## 🎓 Next Steps

### Connect to PC Application

The Arduino is ready to interface with your PC application:

**Serial Protocol:**
- Baud rate: 115200
- Data format: `POS,timestamp,x,y,z,theta1,theta2,theta3,theta4`
- Commands: Text-based, newline-terminated

**Example Python Connection:**
```python
import serial

ser = serial.Serial('COM3', 115200, timeout=1)
ser.write(b'GETPOS\n')
response = ser.readline().decode().strip()
print(response)  # POS,12345,x,y,z,θ1,θ2,θ3,θ4
```

### Useful Commands

| Command | Purpose |
|---------|---------|
| `START` | Begin continuous coordinate streaming |
| `STOP` | Stop streaming |
| `GETPOS` | Get single position reading |
| `ZERO` | Zero encoders at current position |
| `INFO` | Display system information |
| `SETPPR 1000` | Change encoder resolution |
| `SETDIM l1,l2,l3,l4` | Update arm dimensions |

See [README.md](README.md) for complete command reference.

### Improve Accuracy

1. **Measure link lengths precisely** (use calipers)
2. **Update config.h** with exact measurements
3. **Verify encoder directions** (all should increase when rotating positive)
4. **Test repeatability** (return to same position multiple times)

---

## 🐛 Troubleshooting Quick Fixes

### No Serial Response

- Check baud rate: Must be **115200**
- Check line ending: Must be **Newline**
- Press **Reset** button on Arduino
- Try different USB cable

### Encoder Not Counting

- Check wiring connections (use multimeter)
- Verify 5V power at encoder
- Enable `DEBUG_ENCODERS` mode
- Swap with known-good encoder

### Wrong Coordinates

- Verify link lengths in `config.h`
- Check encoder directions (should increase when rotating positive)
- Use `ZERO` command at known reference point
- Verify encoder PPR matches specification

### Upload Fails

- Ensure correct board selected: **Arduino Mega 2560**
- Close Serial Monitor before uploading
- Try different USB port
- Install CH340 drivers (for clone boards)

For detailed troubleshooting, see [TROUBLESHOOTING.md](TROUBLESHOOTING.md).

---

## 📚 Documentation

Complete documentation:

- **[README.md](README.md)** - Complete overview and reference
- **[HARDWARE_SETUP.md](HARDWARE_SETUP.md)** - Detailed wiring and BOM
- **[FIRMWARE_GUIDE.md](FIRMWARE_GUIDE.md)** - Advanced configuration
- **[TROUBLESHOOTING.md](TROUBLESHOOTING.md)** - Problem diagnosis
- **[CHANGELOG.md](CHANGELOG.md)** - Version history

---

## 💡 Pro Tips

1. **Always zero before recording** - Send `ZERO` command at reference point
2. **Use external power** - More stable than USB power alone
3. **Test encoders individually** - Use `DEBUG_ENCODERS` mode
4. **Label your wires** - Saves hours during troubleshooting
5. **Keep config.h backup** - Save working configuration

---

## ✅ You're Ready!

Your CCM Digitizing Arm is now operational. You can:
- ✅ Read real-time XYZ coordinates
- ✅ Stream position data to PC application
- ✅ Configure parameters on-the-fly
- ✅ Integrate with CAD software

**Happy measuring!** 📐

---

**Document Version:** 1.0.2  
**Estimated Setup Time:** 15 minutes  
**Firmware Version:** 1.0.2
