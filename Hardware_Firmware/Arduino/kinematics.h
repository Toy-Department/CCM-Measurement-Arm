/*
 * ============================================================================
 * KINEMATICS MODULE - HEADER FILE
 * ============================================================================
 * 
 * This module calculates forward kinematics for the 4-axis articulated arm.
 * Converts joint angles (from encoders) to X, Y, Z coordinates in 3D space.
 * 
 * COORDINATE SYSTEM:
 * - Origin (0,0,0) is at the base rotation axis
 * - X-axis: Forward from base (when base angle = 0)
 * - Y-axis: Left from base (when base angle = 0)
 * - Z-axis: Upward from base
 * 
 * ARM CONFIGURATION (CONFIG B):
 * - Axis 1: Base rotation around Z-axis
 * - Axis 2: Shoulder pitch around Y-axis
 * - Axis 3: Elbow pitch around Y-axis
 * - Axis 4: Wrist pitch around Y-axis
 * 
 * ============================================================================
 */

#ifndef KINEMATICS_H
#define KINEMATICS_H

#include <Arduino.h>
#include "config.h"
#include "encoder.h"

// ============================================================================
// POSITION DATA STRUCTURE
// ============================================================================
struct Position3D {
  float x;  // X coordinate in mm
  float y;  // Y coordinate in mm
  float z;  // Z coordinate in mm
};

// ============================================================================
// GLOBAL POSITION DATA
// ============================================================================
extern Position3D currentPosition;  // Current tip position in 3D space
extern Position3D toolOffset;       // Tool tip offset from wrist center

// ============================================================================
// LINK LENGTHS (can be changed at runtime)
// ============================================================================
extern float link1_length;  // Base to shoulder
extern float link2_length;  // Shoulder to elbow
extern float link3_length;  // Elbow to wrist
extern float link4_length;  // Wrist to tip

// ============================================================================
// FUNCTION DECLARATIONS
// ============================================================================

// Initialize kinematics module with default dimensions
void Kinematics_Init();

// Calculate forward kinematics (angles -> XYZ position)
void Kinematics_Calculate();

// Set custom link dimensions at runtime
void Kinematics_SetDimensions(float l1, float l2, float l3, float l4);

// Set tool offset (for different probe tips)
void Kinematics_SetToolOffset(float offsetX, float offsetY, float offsetZ);

// Get current X coordinate
float Kinematics_GetX();

// Get current Y coordinate
float Kinematics_GetY();

// Get current Z coordinate
float Kinematics_GetZ();

// Get position structure
Position3D Kinematics_GetPosition();

#endif // KINEMATICS_H
