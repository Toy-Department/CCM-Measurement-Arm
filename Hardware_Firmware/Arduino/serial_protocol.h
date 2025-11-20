/*
 * ============================================================================
 * SERIAL PROTOCOL MODULE - HEADER FILE
 * ============================================================================
 * 
 * This module handles all serial communication between Arduino and PC.
 * Defines the protocol for commands and data transmission.
 * 
 * PROTOCOL DESIGN:
 * - Commands from PC are text-based, terminated by newline (\n)
 * - Data from Arduino is formatted as comma-separated values
 * - All commands return acknowledgments or data
 * 
 * COMMAND FORMAT (PC -> Arduino):
 * - Commands are case-insensitive
 * - Format: COMMAND_NAME [parameters]\n
 * 
 * DATA FORMAT (Arduino -> PC):
 * - Position data: POS,timestamp,x,y,z,theta1,theta2,theta3,theta4\n
 * - Acknowledgment: ACK,message\n
 * - Error: ERROR,message\n
 * 
 * ============================================================================
 */

#ifndef SERIAL_PROTOCOL_H
#define SERIAL_PROTOCOL_H

#include <Arduino.h>
#include "config.h"
#include "encoder.h"
#include "kinematics.h"

// ============================================================================
// PROTOCOL CONSTANTS
// ============================================================================
#define SERIAL_BUFFER_SIZE 128
#define MAX_COMMAND_LENGTH 64

// ============================================================================
// COMMAND DEFINITIONS
// ============================================================================
// These are the text commands the PC can send to Arduino
// Format: COMMAND [parameters]

// Recording control commands
#define CMD_START       "START"       // Begin recording positions
#define CMD_STOP        "STOP"        // Stop recording
#define CMD_PAUSE       "PAUSE"       // Pause recording
#define CMD_RESUME      "RESUME"      // Resume recording

// Calibration commands
#define CMD_ZERO        "ZERO"        // Zero encoders at current position
#define CMD_GET_POS     "GETPOS"      // Request current position

// Configuration commands
#define CMD_SET_PPR     "SETPPR"      // Set encoder PPR: SETPPR 600
#define CMD_SET_DIM     "SETDIM"      // Set dimensions: SETDIM 254,254,254,35
#define CMD_SET_TOOL    "SETTOOL"     // Set tool offset: SETTOOL 0,0,10

// Information commands
#define CMD_INFO        "INFO"        // Get system information
#define CMD_VERSION     "VERSION"     // Get firmware version

// ============================================================================
// RESPONSE PREFIXES
// ============================================================================
#define RESP_POS        "POS"         // Position data
#define RESP_ACK        "ACK"         // Acknowledgment
#define RESP_ERROR      "ERROR"       // Error message
#define RESP_INFO       "INFO"        // Information response

// ============================================================================
// FUNCTION DECLARATIONS
// ============================================================================

// Initialize serial protocol
void Serial_Init();

// Send startup/ready message
void Serial_SendStartupMessage();

// Check for incoming commands and process them
void Serial_CheckForCommands();

// Send current position data
void Serial_SendPositionData();

// Send acknowledgment message
void Serial_SendAcknowledge(const char* message);

// Send error message
void Serial_SendError(const char* message);

// Send system information
void Serial_SendInfo();

// ============================================================================
// COMMAND HANDLER DECLARATIONS (implemented in main sketch)
// ============================================================================
// These functions are called when commands are received
extern void Command_StartRecording();
extern void Command_StopRecording();
extern void Command_PauseRecording();
extern void Command_ResumeRecording();
extern void Command_ZeroEncoders();
extern void Command_GetPosition();
extern void Command_SetEncoderResolution(int ppr);
extern void Command_SetDimensions(float l1, float l2, float l3, float l4);

#endif // SERIAL_PROTOCOL_H
