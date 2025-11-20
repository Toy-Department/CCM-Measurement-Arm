/*
 * ============================================================================
 * 4-AXIS CCM DIGITIZING ARM - MAIN SKETCH
 * ============================================================================
 * 
 * Project: Open Source 4-Axis Articulated Digitizing Arm
 * Author: [Your Name/Organization]
 * Version: 2.1.2-Fix (Fixed single-press zero issue)
 * Date: November 2025
 * License: MIT (or your choice)
 * 
 * DESCRIPTION:
 * This sketch reads 4 rotary encoders to track the position of an articulated
 * arm and calculates X, Y, Z coordinates in real-time. Data is sent via serial
 * to a PC application for logging, visualization, and CSV export.
 * 
 * HARDWARE REQUIREMENTS:
 * - Arduino Mega 2560 (required for multiple interrupt pins)
 * - 4x Rotary Encoders (Incremental, A/B channels, 600 PPR default)
 * - Serial connection to PC (USB)
 * 
 * ARM CONFIGURATION (CONFIG B - Articulated Robot Arm):
 * - Axis 1: Base Rotation (vertical spin)
 * - Axis 2: Shoulder Pitch (up/down)
 * - Axis 3: Elbow Pitch (up/down)
 * - Axis 4: Wrist Pitch (up/down)
 * 
 * DEFAULT DIMENSIONS:
 * - Link 1 (Base to Shoulder): 254.0 mm
 * - Link 2 (Shoulder to Elbow): 254.0 mm
 * - Link 3 (Elbow to Wrist): 254.0 mm
 * - Link 4 (Wrist to Tip): 35.0 mm
 * 
 * CHANGELOG v2.1.2-Fix:
 * - Fixed single-press zero - now works correctly on first press
 * - Properly handles offset calculation without sign flip
 * 
 * ============================================================================
 */

// ============================================================================
// INCLUDE LIBRARIES
// ============================================================================
#include "config.h"
#include "encoder.h"
#include "kinematics.h"
#include "serial_protocol.h"

// ============================================================================
// GLOBAL VARIABLES
// ============================================================================
unsigned long lastUpdateTime = 0;
bool isRecording = false;
bool isPaused = false;

// XYZ Origin Offsets (NEW in v2.1.0-Fix)
// These store the XYZ position when "Zero Encoders" is called
// All future coordinates are relative to this origin point
float xOffset = 0.0;
float yOffset = 0.0;
float zOffset = 0.0;

// ============================================================================
// SETUP FUNCTION - Runs once at startup
// ============================================================================
void setup() {
  // Initialize serial communication
  Serial.begin(SERIAL_BAUD_RATE);
  while (!Serial) {
    ; // Wait for serial port to connect (needed for native USB)
  }
  
  // Initialize encoders
  Encoder_Init();
  
  // Initialize kinematics
  Kinematics_Init();
  
  // Send startup message
  Serial_SendStartupMessage();
  
  // Flash built-in LED to indicate ready
  pinMode(LED_BUILTIN, OUTPUT);
  for (int i = 0; i < 3; i++) {
    digitalWrite(LED_BUILTIN, HIGH);
    delay(200);
    digitalWrite(LED_BUILTIN, LOW);
    delay(200);
  }
}

// ============================================================================
// MAIN LOOP - Runs continuously
// ============================================================================
void loop() {
  // Check for incoming serial commands from PC
  Serial_CheckForCommands();
  
  // Update position at specified rate
  unsigned long currentTime = millis();
  if (currentTime - lastUpdateTime >= UPDATE_INTERVAL_MS) {
    lastUpdateTime = currentTime;
    
    // Read current encoder positions
    Encoder_Update();
    
    // Calculate forward kinematics (angles -> XYZ coordinates)
    Kinematics_Calculate();
    
    // Send position data to PC (if recording and not paused)
    if (isRecording && !isPaused) {
      Serial_SendPositionData();
    }
  }
  
  // Small delay to prevent overwhelming the serial buffer
  delay(1);
}

// ============================================================================
// COMMAND HANDLERS - Called by serial protocol
// ============================================================================

// Called when PC sends START command
void Command_StartRecording() {
  isRecording = true;
  isPaused = false;
  Serial_SendAcknowledge("RECORDING_STARTED");
}

// Called when PC sends STOP command
void Command_StopRecording() {
  isRecording = false;
  isPaused = false;
  Serial_SendAcknowledge("RECORDING_STOPPED");
}

// Called when PC sends PAUSE command
void Command_PauseRecording() {
  isPaused = true;
  Serial_SendAcknowledge("RECORDING_PAUSED");
}

// Called when PC sends RESUME command
void Command_ResumeRecording() {
  isPaused = false;
  Serial_SendAcknowledge("RECORDING_RESUMED");
}

// Called when PC sends ZERO command (calibrate origin)
// UPDATED in v2.1.2-Fix to work correctly on first press
void Command_ZeroEncoders() {
  // Zero the encoders first (sets all angles to 0°)
  Encoder_Zero();
  
  // Temporarily remove existing offset to get raw position
  float savedOffsetX = xOffset;
  float savedOffsetY = yOffset;
  float savedOffsetZ = zOffset;
  
  xOffset = 0.0;
  yOffset = 0.0;
  zOffset = 0.0;
  
  // Calculate raw position at zero angles (no offset applied)
  Encoder_Update();
  Kinematics_Calculate();
  
  // This raw position becomes the new offset
  xOffset = currentPosition.x;
  yOffset = currentPosition.y;
  zOffset = currentPosition.z;
  
  // Recalculate so display shows 0,0,0
  Kinematics_Calculate();
  
  Serial_SendAcknowledge("ENCODERS_ZEROED");
}

// Called when PC requests current position
void Command_GetPosition() {
  Kinematics_Calculate();
  Serial_SendPositionData();
}

// Called when PC sends new encoder resolution
void Command_SetEncoderResolution(int ppr) {
  Encoder_SetResolution(ppr);
  Serial_SendAcknowledge("ENCODER_RESOLUTION_SET");
}

// Called when PC sends new link dimensions
void Command_SetDimensions(float l1, float l2, float l3, float l4) {
  Kinematics_SetDimensions(l1, l2, l3, l4);
  Serial_SendAcknowledge("DIMENSIONS_SET");
}