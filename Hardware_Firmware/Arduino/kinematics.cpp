/*
 * ============================================================================
 * KINEMATICS MODULE - IMPLEMENTATION FILE
 * ============================================================================
 * 
 * This file implements forward kinematics calculations using the Denavit-
 * Hartenberg (DH) convention for articulated robot arms.
 * 
 * MATHEMATICAL APPROACH:
 * 1. Get current joint angles from encoders (θ1, θ2, θ3, θ4)
 * 2. Apply transformation matrices for each joint
 * 3. Calculate final tip position in base coordinate frame
 * 
 * REFERENCE FRAMES:
 * - Frame 0: Fixed base frame (world coordinates)
 * - Frame 1: After base rotation (θ1)
 * - Frame 2: After shoulder pitch (θ2)
 * - Frame 3: After elbow pitch (θ3)
 * - Frame 4: After wrist pitch (θ4) - tip location
 * 
 * VERSION 2.1.0-Fix CHANGES:
 * - Added extern declarations for XYZ origin offsets
 * - Modified Kinematics_Calculate() to subtract offsets from final position
 * - This fixes the "X coordinate not zeroing" bug
 * 
 * ============================================================================
 */

#include "kinematics.h"
#include <math.h>

// ============================================================================
// EXTERN DECLARATIONS (NEW in v2.1.0-Fix)
// ============================================================================
// These variables are defined in the main .ino file
// They store the origin point set by the "Zero Encoders" command
extern float xOffset;
extern float yOffset;
extern float zOffset;

// ============================================================================
// GLOBAL VARIABLES
// ============================================================================
Position3D currentPosition = {0.0, 0.0, 0.0};
Position3D toolOffset = {0.0, 0.0, 0.0};

// Link lengths (initialized from config, can be changed)
float link1_length = LINK_1_LENGTH;
float link2_length = LINK_2_LENGTH;
float link3_length = LINK_3_LENGTH;
float link4_length = LINK_4_LENGTH;

// ============================================================================
// INITIALIZATION FUNCTION
// ============================================================================
void Kinematics_Init() {
  // Set default dimensions from config
  link1_length = LINK_1_LENGTH;
  link2_length = LINK_2_LENGTH;
  link3_length = LINK_3_LENGTH;
  link4_length = LINK_4_LENGTH;
  
  // Initialize tool offset to zero (no offset)
  toolOffset.x = 0.0;
  toolOffset.y = 0.0;
  toolOffset.z = 0.0;
  
  #if DEBUG_KINEMATICS
  Serial.println(F("Kinematics initialized"));
  Serial.print(F("Link lengths: "));
  Serial.print(link1_length); Serial.print(F(", "));
  Serial.print(link2_length); Serial.print(F(", "));
  Serial.print(link3_length); Serial.print(F(", "));
  Serial.println(link4_length);
  #endif
}

// ============================================================================
// FORWARD KINEMATICS CALCULATION
// ============================================================================
void Kinematics_Calculate() {
  // Get current joint angles in radians
  float theta1 = Encoder_GetAngleRadians(1);  // Base rotation
  float theta2 = Encoder_GetAngleRadians(2);  // Shoulder pitch
  float theta3 = Encoder_GetAngleRadians(3);  // Elbow pitch
  float theta4 = Encoder_GetAngleRadians(4);  // Wrist pitch
  
  /*
   * FORWARD KINEMATICS FOR 4-AXIS ARTICULATED ARM (CONFIG B)
   * 
   * This is a 4-DOF manipulator with:
   * - 1 rotational joint (base - around Z)
   * - 3 pitch joints (shoulder, elbow, wrist - around Y)
   * 
   * Mathematical breakdown:
   * 1. Base rotation (theta1) rotates everything in XY plane
   * 2. Shoulder pitch (theta2) lifts/lowers upper arm
   * 3. Elbow pitch (theta3) lifts/lowers forearm
   * 4. Wrist pitch (theta4) adjusts final tip angle
   * 
   * For articulated arms, we work in the vertical plane first,
   * then rotate the result around the base.
   */
  
  // Step 1: Calculate position in the vertical plane (assuming base at 0°)
  // This is a 2D problem in the X-Z plane
  
  // Accumulated angles for each segment
  // Each joint adds to the previous angle
  float angle2 = theta2;                    // Shoulder absolute angle
  float angle3 = theta2 + theta3;           // Elbow absolute angle
  float angle4 = theta2 + theta3 + theta4;  // Wrist absolute angle
  
  // Calculate X (horizontal) and Z (vertical) components in 2D plane
  float x_2d = link1_length * cos(angle2);
  float z_2d = link1_length * sin(angle2);
  
  x_2d += link2_length * cos(angle3);
  z_2d += link2_length * sin(angle3);
  
  x_2d += link3_length * cos(angle4);
  z_2d += link3_length * sin(angle4);
  
  x_2d += link4_length * cos(angle4);
  z_2d += link4_length * sin(angle4);
  
  // Step 2: Rotate the 2D result around the base (theta1)
  // This projects the 2D arm into 3D space
  float cos_theta1 = cos(theta1);
  float sin_theta1 = sin(theta1);
  
  // Calculate 3D coordinates BEFORE applying origin offset
  float x_raw = x_2d * cos_theta1;
  float y_raw = x_2d * sin_theta1;
  float z_raw = z_2d;
  
  // Step 3: Apply tool offset if any (for different probe tips)
  // Rotate tool offset by base angle and add to position
  float tool_x_rotated = toolOffset.x * cos_theta1 - toolOffset.y * sin_theta1;
  float tool_y_rotated = toolOffset.x * sin_theta1 + toolOffset.y * cos_theta1;
  
  x_raw += tool_x_rotated;
  y_raw += tool_y_rotated;
  z_raw += toolOffset.z;
  
  // Step 4: Apply origin offset (NEW in v2.1.0-Fix)
  // Subtract the stored origin point to make coordinates relative to zero point
  // This is THE FIX for the "X coordinate not zeroing" issue
  currentPosition.x = x_raw - xOffset;
  currentPosition.y = y_raw - yOffset;
  currentPosition.z = z_raw - zOffset;
  
  #if DEBUG_KINEMATICS
  Serial.print(F("Angles (deg): "));
  Serial.print(theta1 * 180.0 / PI); Serial.print(F(", "));
  Serial.print(theta2 * 180.0 / PI); Serial.print(F(", "));
  Serial.print(theta3 * 180.0 / PI); Serial.print(F(", "));
  Serial.println(theta4 * 180.0 / PI);
  Serial.print(F("Position (mm): X="));
  Serial.print(currentPosition.x);
  Serial.print(F(", Y="));
  Serial.print(currentPosition.y);
  Serial.print(F(", Z="));
  Serial.println(currentPosition.z);
  #endif
}

// ============================================================================
// SET DIMENSIONS FUNCTION
// ============================================================================
void Kinematics_SetDimensions(float l1, float l2, float l3, float l4) {
  link1_length = l1;
  link2_length = l2;
  link3_length = l3;
  link4_length = l4;
  
  #if DEBUG_KINEMATICS
  Serial.println(F("Dimensions updated"));
  #endif
}

// ============================================================================
// SET TOOL OFFSET FUNCTION
// ============================================================================
void Kinematics_SetToolOffset(float offsetX, float offsetY, float offsetZ) {
  toolOffset.x = offsetX;
  toolOffset.y = offsetY;
  toolOffset.z = offsetZ;
  
  #if DEBUG_KINEMATICS
  Serial.print(F("Tool offset set: X="));
  Serial.print(offsetX);
  Serial.print(F(", Y="));
  Serial.print(offsetY);
  Serial.print(F(", Z="));
  Serial.println(offsetZ);
  #endif
}

// ============================================================================
// GETTER FUNCTIONS
// ============================================================================
float Kinematics_GetX() {
  return currentPosition.x;
}

float Kinematics_GetY() {
  return currentPosition.y;
}

float Kinematics_GetZ() {
  return currentPosition.z;
}

Position3D Kinematics_GetPosition() {
  return currentPosition;
}