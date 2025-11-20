/*
 * ============================================================================
 * ENCODER MODULE - HEADER FILE
 * ============================================================================
 * 
 * This module handles reading quadrature encoders to track joint angles.
 * Supports up to 4 encoders with hardware and pin-change interrupts.
 * 
 * ============================================================================
 */

#ifndef ENCODER_H
#define ENCODER_H

#include <Arduino.h>
#include "config.h"

// ============================================================================
// ENCODER DATA STRUCTURE
// ============================================================================
struct EncoderData {
  volatile long count;      // Raw encoder count (can be negative)
  long zeroOffset;          // Count value at zero position
  int direction;            // 1 = normal, -1 = reversed
  float angleRadians;       // Current angle in radians
  float angleDegrees;       // Current angle in degrees
};

// ============================================================================
// GLOBAL ENCODER DATA
// ============================================================================
extern EncoderData encoder1;  // Base rotation
extern EncoderData encoder2;  // Shoulder pitch
extern EncoderData encoder3;  // Elbow pitch
extern EncoderData encoder4;  // Wrist pitch

// ============================================================================
// FUNCTION DECLARATIONS
// ============================================================================

// Initialize encoder pins and interrupts
void Encoder_Init();

// Update encoder angles from raw counts
void Encoder_Update();

// Zero all encoders at current position
void Encoder_Zero();

// Set encoder resolution (PPR)
void Encoder_SetResolution(int ppr);

// Get angle in radians for specified encoder (1-4)
float Encoder_GetAngleRadians(int encoderNum);

// Get angle in degrees for specified encoder (1-4)
float Encoder_GetAngleDegrees(int encoderNum);

// Get raw count for specified encoder (1-4)
long Encoder_GetCount(int encoderNum);

// ============================================================================
// INTERRUPT SERVICE ROUTINES (ISRs)
// ============================================================================
// These are called automatically when encoder pins change state
void ISR_Encoder1_A();
void ISR_Encoder1_B();
void ISR_Encoder2_A();
void ISR_Encoder2_B();
void ISR_Encoder3_A();
void ISR_Encoder3_B();
void ISR_Encoder4_A();
void ISR_Encoder4_B();

#endif // ENCODER_H
