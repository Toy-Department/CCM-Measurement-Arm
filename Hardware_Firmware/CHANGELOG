# Changelog

All notable changes to the CCM Digitizing Arm firmware will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.0.2] - 2025-11-20

### 🐛 Fixed
- **CRITICAL FIX**: X coordinate not zeroing properly when using ZERO command
  - Added `xOffset`, `yOffset`, `zOffset` variables in main sketch
  - Modified `kinematics.cpp` to subtract offsets from calculated position
  - Now `ZERO` command correctly sets current position as origin (0,0,0)
- Improved command parameter parsing with extra whitespace trimming
- Added debug output for parameter parsing diagnostics

### 📝 Changed
- Updated firmware version identifier to 1.0.2
- Updated firmware date to 2025-11-20
- Enhanced code comments in `kinematics.cpp` explaining offset system

### 📚 Documentation
- Created comprehensive GitHub documentation suite
- Added README.md with complete feature overview
- Added HARDWARE_SETUP.md with detailed BOM and wiring
- Added QUICK_START.md for 15-minute setup
- Added CHANGELOG.md (this file) for version tracking

---

## [1.0.1] - 2025-11-18

### ✨ Added
- Tool offset support via `SETTOOL` command
- Runtime dimension configuration via `SETDIM` command
- Runtime encoder resolution change via `SETPPR` command
- Enhanced error handling for invalid parameters
- Version command (`VERSION`) returns firmware version and date

### 🐛 Fixed
- Serial buffer overflow protection
- Command parsing improved to handle various input formats
- Float parsing for Arduino (replaced sscanf with atof/strtok)

### 📝 Changed
- Improved serial protocol documentation in header comments
- Enhanced error messages for better user feedback
- Optimized kinematics calculation performance

---

## [1.0.0] - 2025-11-17

### ✨ Initial Release

**Core Features:**
- Quadrature encoder reading with hardware interrupts
- Forward kinematics for 4-axis articulated arm
- Real-time XYZ coordinate calculation
- Text-based serial communication protocol
- User-configurable parameters via config.h

**Hardware Support:**
- Arduino Mega 2560 platform
- 4× rotary encoders (quadrature, A/B channels)
- 600 PPR default, configurable 100-10000 PPR
- Hardware interrupts for encoders 1-3
- Pin change interrupts for encoder 4

**Commands Implemented:**
- `START` - Begin position streaming
- `STOP` - Stop position streaming
- `PAUSE` - Pause streaming
- `RESUME` - Resume streaming
- `ZERO` - Zero encoders at current position
- `GETPOS` - Get current position
- `INFO` - Display system information

**Code Structure:**
- Modular architecture (encoder, kinematics, serial protocol)
- Extensively commented for educational purposes
- Professional coding standards
- No external library dependencies

**Configuration Options:**
- Encoder resolution (PPR)
- Arm link lengths
- Pin assignments
- Update rate
- Encoder directions
- Debug modes

---

## Version History Summary

| Version | Date | Key Changes |
|---------|------|-------------|
| **1.0.2** | 2025-11-20 | Fixed X coordinate zeroing bug, documentation |
| **1.0.1** | 2025-11-18 | Added runtime configuration commands |
| **1.0.0** | 2025-11-17 | Initial release |

---

## Upgrade Guide

### Upgrading from 1.0.1 to 1.0.2

**Required:**
1. Download firmware v1.0.2
2. Open in Arduino IDE
3. Upload to Arduino Mega 2560

**Configuration:**
- No `config.h` changes required
- All settings from v1.0.1 are compatible
- No breaking changes in command protocol

**Bug Fixes:**
- X coordinate now zeros correctly with `ZERO` command
- If you experienced "X not zeroing" issue, this version fixes it

### Upgrading from 1.0.0 to 1.0.1

**Required:**
1. Download firmware v1.0.1
2. Upload to Arduino Mega 2560

**New Features:**
- `SETPPR` command now available
- `SETDIM` command now available
- `SETTOOL` command now available
- `VERSION` command now available

**Configuration:**
- No `config.h` changes required
- Fully backward compatible

---

## Future Roadmap

### Planned Features (Unscheduled)

**Version 1.1.0 (Planned):**
- [ ] EEPROM storage for configuration persistence
- [ ] Configurable homing sequence
- [ ] Multi-point calibration system
- [ ] Angular velocity calculation
- [ ] Acceleration limits

**Version 1.2.0 (Planned):**
- [ ] Inverse kinematics support
- [ ] Position limits and safety zones
- [ ] Emergency stop functionality
- [ ] CRC error checking on serial
- [ ] JSON output format option

**Version 2.0.0 (Planned):**
- [ ] Support for additional encoder types (SSI, BiSS)
- [ ] 5+ axis support
- [ ] Advanced filtering algorithms
- [ ] Direct CAD integration protocols
- [ ] Web interface for configuration

---

## Contributing

We welcome contributions! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

**How to report issues:**
1. Check if issue exists in [GitHub Issues](https://github.com/Toy-Department/CCM-Digitizing-Arm/issues)
2. Include firmware version (use `VERSION` command)
3. Provide `config.h` settings
4. Include Serial Monitor output showing problem
5. Describe steps to reproduce

**How to suggest features:**
1. Check [GitHub Discussions](https://github.com/Toy-Department/CCM-Digitizing-Arm/discussions)
2. Explain use case and benefit
3. Provide example scenarios
4. Consider implementation complexity

---

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## Acknowledgments

**Version 1.0.2:**
- Bug fix for coordinate zeroing issue identified by community testing

**Version 1.0.1:**
- Community feedback on runtime configuration needs

**Version 1.0.0:**
- Initial development and release

---

**Maintained by:** [Your Name/Team]  
**Repository:** https://github.com/Toy-Department/CCM-Digitizing-Arm  
**Issues:** https://github.com/Toy-Department/CCM-Digitizing-Arm/issues
