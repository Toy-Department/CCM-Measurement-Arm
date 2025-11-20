/*
 * ============================================================================
 * ENCODER MODULE - IMPLEMENTATION FILE
 * ============================================================================
 * 
 * This file implements quadrature encoder reading using interrupts.
 * Each encoder uses 2 pins (A and B channels) to determine direction.
 * 
 * QUADRATURE ENCODING:
 * - When rotating clockwise: A leads B by 90 degrees
 * - When rotating counter-clockwise: B leads A by 90 degrees
 * - We detect edges on both channels to get 4x resolution
 * 
 * ============================================================================
 */

#include "encoder.h"

// ============================================================================
// GLOBAL ENCODER DATA INSTANCES
// ============================================================================
EncoderData encoder1 = {0, 0, ENCODER_1_DIRECTION, 0.0, 0.0};
EncoderData encoder2 = {0, 0, ENCODER_2_DIRECTION, 0.0, 0.0};
EncoderData encoder3 = {0, 0, ENCODER_3_DIRECTION, 0.0, 0.0};
EncoderData encoder4 = {0, 0, ENCODER_4_DIRECTION, 0.0, 0.0};

// ============================================================================
// PRIVATE VARIABLES
// ============================================================================
static int currentEncoderPPR = ENCODER_PPR;
static float countsPerRadian = COUNTS_PER_REVOLUTION / (2.0 * PI);

// ============================================================================
// INITIALIZATION FUNCTION
// ============================================================================
void Encoder_Init() {
  // Configure encoder pins as inputs with pullups
  pinMode(ENCODER_1_PIN_A, INPUT_PULLUP);
  pinMode(ENCODER_1_PIN_B, INPUT_PULLUP);
  pinMode(ENCODER_2_PIN_A, INPUT_PULLUP);
  pinMode(ENCODER_2_PIN_B, INPUT_PULLUP);
  pinMode(ENCODER_3_PIN_A, INPUT_PULLUP);
  pinMode(ENCODER_3_PIN_B, INPUT_PULLUP);
  pinMode(ENCODER_4_PIN_A, INPUT_PULLUP);
  pinMode(ENCODER_4_PIN_B, INPUT_PULLUP);
  
  // Attach hardware interrupts for encoders 1-3
  // CHANGE mode triggers on any pin state change (rising or falling)
  attachInterrupt(digitalPinToInterrupt(ENCODER_1_PIN_A), ISR_Encoder1_A, CHANGE);
  attachInterrupt(digitalPinToInterrupt(ENCODER_1_PIN_B), ISR_Encoder1_B, CHANGE);
  attachInterrupt(digitalPinToInterrupt(ENCODER_2_PIN_A), ISR_Encoder2_A, CHANGE);
  attachInterrupt(digitalPinToInterrupt(ENCODER_2_PIN_B), ISR_Encoder2_B, CHANGE);
  attachInterrupt(digitalPinToInterrupt(ENCODER_3_PIN_A), ISR_Encoder3_A, CHANGE);
  attachInterrupt(digitalPinToInterrupt(ENCODER_3_PIN_B), ISR_Encoder3_B, CHANGE);
  
  // Attach pin change interrupts for encoder 4
  // Note: Pin 22-23 on Mega use PCINT (Pin Change Interrupt)
  // This is implemented differently than hardware interrupts
  attachInterrupt(digitalPinToInterrupt(ENCODER_4_PIN_A), ISR_Encoder4_A, CHANGE);
  attachInterrupt(digitalPinToInterrupt(ENCODER_4_PIN_B), ISR_Encoder4_B, CHANGE);
  
  // Set initial zero offsets from config
  encoder1.zeroOffset = ENCODER_1_ZERO_OFFSET;
  encoder2.zeroOffset = ENCODER_2_ZERO_OFFSET;
  encoder3.zeroOffset = ENCODER_3_ZERO_OFFSET;
  encoder4.zeroOffset = ENCODER_4_ZERO_OFFSET;
  
  #if DEBUG_ENCODERS
  Serial.println(F("Encoders initialized"));
  #endif
}

// ============================================================================
// UPDATE FUNCTION - Convert raw counts to angles
// ============================================================================
void Encoder_Update() {
  // Calculate angles for each encoder
  // Formula: angle (radians) = (count - zero) / countsPerRadian * direction
  
  long adjustedCount1 = (encoder1.count - encoder1.zeroOffset) * encoder1.direction;
  encoder1.angleRadians = (float)adjustedCount1 / countsPerRadian;
  encoder1.angleDegrees = encoder1.angleRadians * 180.0 / PI;
  
  long adjustedCount2 = (encoder2.count - encoder2.zeroOffset) * encoder2.direction;
  encoder2.angleRadians = (float)adjustedCount2 / countsPerRadian;
  encoder2.angleDegrees = encoder2.angleRadians * 180.0 / PI;
  
  long adjustedCount3 = (encoder3.count - encoder3.zeroOffset) * encoder3.direction;
  encoder3.angleRadians = (float)adjustedCount3 / countsPerRadian;
  encoder3.angleDegrees = encoder3.angleRadians * 180.0 / PI;
  
  long adjustedCount4 = (encoder4.count - encoder4.zeroOffset) * encoder4.direction;
  encoder4.angleRadians = (float)adjustedCount4 / countsPerRadian;
  encoder4.angleDegrees = encoder4.angleRadians * 180.0 / PI;
  
  #if DEBUG_ENCODERS
  Serial.print(F("Enc Counts: "));
  Serial.print(encoder1.count); Serial.print(F(" "));
  Serial.print(encoder2.count); Serial.print(F(" "));
  Serial.print(encoder3.count); Serial.print(F(" "));
  Serial.println(encoder4.count);
  #endif
}

// ============================================================================
// ZERO FUNCTION - Set current position as origin
// ============================================================================
void Encoder_Zero() {
  // Store current counts as zero offsets
  encoder1.zeroOffset = encoder1.count;
  encoder2.zeroOffset = encoder2.count;
  encoder3.zeroOffset = encoder3.count;
  encoder4.zeroOffset = encoder4.count;
  
  #if DEBUG_ENCODERS
  Serial.println(F("Encoders zeroed at current position"));
  #endif
}

// ============================================================================
// SET RESOLUTION FUNCTION - Change encoder PPR
// ============================================================================
void Encoder_SetResolution(int ppr) {
  currentEncoderPPR = ppr;
  int newCountsPerRev = ppr * ENCODER_MULTIPLIER;
  countsPerRadian = (float)newCountsPerRev / (2.0 * PI);
  
  #if DEBUG_ENCODERS
  Serial.print(F("Encoder resolution set to: "));
  Serial.print(ppr);
  Serial.println(F(" PPR"));
  #endif
}

// ============================================================================
// GETTER FUNCTIONS
// ============================================================================
float Encoder_GetAngleRadians(int encoderNum) {
  switch(encoderNum) {
    case 1: return encoder1.angleRadians;
    case 2: return encoder2.angleRadians;
    case 3: return encoder3.angleRadians;
    case 4: return encoder4.angleRadians;
    default: return 0.0;
  }
}

float Encoder_GetAngleDegrees(int encoderNum) {
  switch(encoderNum) {
    case 1: return encoder1.angleDegrees;
    case 2: return encoder2.angleDegrees;
    case 3: return encoder3.angleDegrees;
    case 4: return encoder4.angleDegrees;
    default: return 0.0;
  }
}

long Encoder_GetCount(int encoderNum) {
  switch(encoderNum) {
    case 1: return encoder1.count;
    case 2: return encoder2.count;
    case 3: return encoder3.count;
    case 4: return encoder4.count;
    default: return 0;
  }
}

// ============================================================================
// INTERRUPT SERVICE ROUTINES (ISRs)
// ============================================================================
// These functions are called automatically when encoder pins change
// They must be FAST - no Serial.print() or delays!
// 
// QUADRATURE DECODING LOGIC:
// Read both A and B pins, determine direction based on their relationship
// Increment or decrement count accordingly

void ISR_Encoder1_A() {
  bool A = digitalRead(ENCODER_1_PIN_A);
  bool B = digitalRead(ENCODER_1_PIN_B);
  if (A == B) {
    encoder1.count++;
  } else {
    encoder1.count--;
  }
}

void ISR_Encoder1_B() {
  bool A = digitalRead(ENCODER_1_PIN_A);
  bool B = digitalRead(ENCODER_1_PIN_B);
  if (A != B) {
    encoder1.count++;
  } else {
    encoder1.count--;
  }
}

void ISR_Encoder2_A() {
  bool A = digitalRead(ENCODER_2_PIN_A);
  bool B = digitalRead(ENCODER_2_PIN_B);
  if (A == B) {
    encoder2.count++;
  } else {
    encoder2.count--;
  }
}

void ISR_Encoder2_B() {
  bool A = digitalRead(ENCODER_2_PIN_A);
  bool B = digitalRead(ENCODER_2_PIN_B);
  if (A != B) {
    encoder2.count++;
  } else {
    encoder2.count--;
  }
}

void ISR_Encoder3_A() {
  bool A = digitalRead(ENCODER_3_PIN_A);
  bool B = digitalRead(ENCODER_3_PIN_B);
  if (A == B) {
    encoder3.count++;
  } else {
    encoder3.count--;
  }
}

void ISR_Encoder3_B() {
  bool A = digitalRead(ENCODER_3_PIN_A);
  bool B = digitalRead(ENCODER_3_PIN_B);
  if (A != B) {
    encoder3.count++;
  } else {
    encoder3.count--;
  }
}

void ISR_Encoder4_A() {
  bool A = digitalRead(ENCODER_4_PIN_A);
  bool B = digitalRead(ENCODER_4_PIN_B);
  if (A == B) {
    encoder4.count++;
  } else {
    encoder4.count--;
  }
}

void ISR_Encoder4_B() {
  bool A = digitalRead(ENCODER_4_PIN_A);
  bool B = digitalRead(ENCODER_4_PIN_B);
  if (A != B) {
    encoder4.count++;
  } else {
    encoder4.count--;
  }
}
