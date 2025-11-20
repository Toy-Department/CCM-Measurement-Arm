/*
 * ============================================================================
 * CONFIGURATION HEADER FILE
 * ============================================================================
 * 
 * This file contains ALL user-configurable settings for the digitizing arm.
 * Modify values here to customize for your specific hardware setup.
 * 
 * ============================================================================
 */

#ifndef CONFIG_H
#define CONFIG_H

// ============================================================================
// SERIAL COMMUNICATION SETTINGS
// ============================================================================
// Baud rate for USB serial connection to PC
// Common values: 9600, 19200, 38400, 57600, 115200
// Higher = faster, but may cause errors on poor connections
#define SERIAL_BAUD_RATE 115200

// How often to send position updates (milliseconds)
// Lower = more frequent updates but more CPU load
// Recommended: 50ms (20 updates per second)
#define UPDATE_INTERVAL_MS 50

// ============================================================================
// ENCODER SETTINGS
// ============================================================================
// Pulses Per Revolution (PPR) for your encoders
// Change this value if you upgrade to different encoders
// Common values: 600, 1000, 2400, 4096
#define ENCODER_PPR 600

// Quadrature mode multiplier
// x4 = count every edge (A and B, rising and falling) = 4x resolution
// x2 = count rising edges only = 2x resolution
// x1 = count single channel = 1x resolution
// Recommended: 4 for maximum accuracy
#define ENCODER_MULTIPLIER 4

// Total counts per full revolution
#define COUNTS_PER_REVOLUTION (ENCODER_PPR * ENCODER_MULTIPLIER)

// ============================================================================
// ENCODER PIN ASSIGNMENTS
// ============================================================================
// Arduino Mega 2560 Interrupt Pins: 2, 3, 18, 19, 20, 21
// We need 8 pins total (4 encoders x 2 channels each)
// Using hardware interrupts for first 3 encoders (6 pins)
// Using pin change interrupts for 4th encoder (2 pins)

// ENCODER 1 - Base Rotation (Axis 1)
#define ENCODER_1_PIN_A 2   // Hardware interrupt pin
#define ENCODER_1_PIN_B 3   // Hardware interrupt pin

// ENCODER 2 - Shoulder Pitch (Axis 2)
#define ENCODER_2_PIN_A 18  // Hardware interrupt pin
#define ENCODER_2_PIN_B 19  // Hardware interrupt pin

// ENCODER 3 - Elbow Pitch (Axis 3)
#define ENCODER_3_PIN_A 20  // Hardware interrupt pin
#define ENCODER_3_PIN_B 21  // Hardware interrupt pin

// ENCODER 4 - Wrist Pitch (Axis 4)
#define ENCODER_4_PIN_A 22  // Digital pin (using pin change interrupt)
#define ENCODER_4_PIN_B 23  // Digital pin (using pin change interrupt)

// ============================================================================
// ARM DIMENSIONS (millimeters)
// ============================================================================
// Measure these distances CENTER-TO-CENTER between rotation axes
// These are CRITICAL for accurate coordinate calculation

// Distance from base center to shoulder axis
#define LINK_1_LENGTH 254.0  // mm

// Distance from shoulder axis to elbow axis
#define LINK_2_LENGTH 254.0  // mm

// Distance from elbow axis to wrist axis
#define LINK_3_LENGTH 254.0  // mm

// Distance from wrist axis to probe tip
#define LINK_4_LENGTH 35.0   // mm

// ============================================================================
// ENCODER DIRECTION SETTINGS
// ============================================================================
// Set to 1 for normal direction, -1 to reverse
// Change these if your encoders count backwards
#define ENCODER_1_DIRECTION 1
#define ENCODER_2_DIRECTION 1
#define ENCODER_3_DIRECTION 1
#define ENCODER_4_DIRECTION 1

// ============================================================================
// ZERO OFFSET SETTINGS
// ============================================================================
// Encoder counts when arm is in "home" position
// Set these after calibration using the PC software
#define ENCODER_1_ZERO_OFFSET 0
#define ENCODER_2_ZERO_OFFSET 0
#define ENCODER_3_ZERO_OFFSET 0
#define ENCODER_4_ZERO_OFFSET 0

// ============================================================================
// DEBUGGING OPTIONS
// ============================================================================
// Enable verbose serial output for debugging
// WARNING: This will interfere with normal PC communication!
// Only enable for troubleshooting, then disable for normal use
#define DEBUG_MODE false

// Enable encoder count debugging
#define DEBUG_ENCODERS false

// Enable kinematics calculation debugging
#define DEBUG_KINEMATICS false

#endif // CONFIG_H
