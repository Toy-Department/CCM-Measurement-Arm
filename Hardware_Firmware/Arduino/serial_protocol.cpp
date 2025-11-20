/*
 * ============================================================================
 * SERIAL PROTOCOL MODULE - IMPLEMENTATION FILE
 * ============================================================================
 * 
 * This file implements the communication protocol between Arduino and PC.
 * Handles command parsing, data formatting, and transmission.
 * 
 * FIXED: Added extra whitespace trimming in params and debug output
 * 
 * ============================================================================
 */

#include "serial_protocol.h"

// ============================================================================
// FUNCTION PROTOTYPES
// ============================================================================
void ProcessCommand(char* cmd);

// ============================================================================
// PRIVATE VARIABLES
// ============================================================================
static char commandBuffer[SERIAL_BUFFER_SIZE];
static int bufferIndex = 0;

// Firmware version
#define FIRMWARE_VERSION "1.0.2"
#define FIRMWARE_DATE "2025-11-20"

// ============================================================================
// INITIALIZATION FUNCTION
// ============================================================================
void Serial_Init() {
  bufferIndex = 0;
  memset(commandBuffer, 0, SERIAL_BUFFER_SIZE);
}

// ============================================================================
// SEND STARTUP MESSAGE
// ============================================================================
void Serial_SendStartupMessage() {
  Serial.println(F("====================================="));
  Serial.println(F("4-Axis CCM Digitizing Arm"));
  Serial.print(F("Firmware Version: "));
  Serial.println(F(FIRMWARE_VERSION));
  Serial.print(F("Date: "));
  Serial.println(F(FIRMWARE_DATE));
  Serial.println(F("====================================="));
  Serial.println(F("Ready for commands"));
  Serial.println();
}

// ============================================================================
// CHECK FOR INCOMING COMMANDS
// ============================================================================
void Serial_CheckForCommands() {
  // Read available bytes from serial
  while (Serial.available() > 0) {
    char incomingChar = Serial.read();
    
    // Check for newline (command terminator)
    if (incomingChar == '\n' || incomingChar == '\r') {
      if (bufferIndex > 0) {
        // Null-terminate the string
        commandBuffer[bufferIndex] = '\0';
        
        // Process the command
        ProcessCommand(commandBuffer);
        
        // Reset buffer
        bufferIndex = 0;
        memset(commandBuffer, 0, SERIAL_BUFFER_SIZE);
      }
    } 
    // Add character to buffer
    else if (bufferIndex < SERIAL_BUFFER_SIZE - 1) {
      commandBuffer[bufferIndex++] = incomingChar;
    }
    // Buffer overflow protection
    else {
      Serial_SendError("Command too long");
      bufferIndex = 0;
      memset(commandBuffer, 0, SERIAL_BUFFER_SIZE);
    }
  }
}

// ============================================================================
// PROCESS COMMAND - Parse and execute commands
// ============================================================================
void ProcessCommand(char* cmd) {
  // Convert to uppercase for case-insensitive matching
  for (int i = 0; cmd[i] != '\0'; i++) {
    cmd[i] = toupper(cmd[i]);
  }
  
  // Trim leading whitespace
  while (*cmd == ' ') cmd++;
  
  // Parse command and parameters
  char* space = strchr(cmd, ' ');
  char* params = NULL;
  if (space != NULL) {
    *space = '\0';  // Terminate command at space
    params = space + 1;  // Parameters start after space
    
    // Trim leading whitespace from params
    while (*params == ' ') params++;
  }
  
  // ============================================================================
  // COMMAND: START - Begin recording
  // ============================================================================
  if (strcmp(cmd, CMD_START) == 0) {
    Command_StartRecording();
  }
  
  // ============================================================================
  // COMMAND: STOP - Stop recording
  // ============================================================================
  else if (strcmp(cmd, CMD_STOP) == 0) {
    Command_StopRecording();
  }
  
  // ============================================================================
  // COMMAND: PAUSE - Pause recording
  // ============================================================================
  else if (strcmp(cmd, CMD_PAUSE) == 0) {
    Command_PauseRecording();
  }
  
  // ============================================================================
  // COMMAND: RESUME - Resume recording
  // ============================================================================
  else if (strcmp(cmd, CMD_RESUME) == 0) {
    Command_ResumeRecording();
  }
  
  // ============================================================================
  // COMMAND: ZERO - Zero encoders
  // ============================================================================
  else if (strcmp(cmd, CMD_ZERO) == 0) {
    Command_ZeroEncoders();
  }
  
  // ============================================================================
  // COMMAND: GETPOS - Get current position
  // ============================================================================
  else if (strcmp(cmd, CMD_GET_POS) == 0) {
    Command_GetPosition();
  }
  
  // ============================================================================
  // COMMAND: SETPPR - Set encoder resolution
  // Format: SETPPR 600
  // ============================================================================
  else if (strcmp(cmd, CMD_SET_PPR) == 0) {
    if (params != NULL) {
      int ppr = atoi(params);
      if (ppr > 0 && ppr <= 10000) {
        Command_SetEncoderResolution(ppr);
      } else {
        Serial_SendError("Invalid PPR value (1-10000)");
      }
    } else {
      Serial_SendError("SETPPR requires parameter: SETPPR <value>");
    }
  }
  
  // ============================================================================
  // COMMAND: SETDIM - Set link dimensions
  // Format: SETDIM 254,254,254,35
  // ============================================================================
  else if (strcmp(cmd, CMD_SET_DIM) == 0) {
    if (params != NULL) {
      // Manual parsing since Arduino sscanf doesn't support %f
      char* token;
      float values[4];
      int count = 0;
      
      // Make a copy of params since strtok modifies the string
      char paramsCopy[64];
      strncpy(paramsCopy, params, 63);
      paramsCopy[63] = '\0';
      
      // Parse comma-separated values
      token = strtok(paramsCopy, ",");
      while (token != NULL && count < 4) {
        values[count] = atof(token);
        count++;
        token = strtok(NULL, ",");
      }
      
      if (count == 4) {
        Command_SetDimensions(values[0], values[1], values[2], values[3]);
      } else {
        Serial_SendError("Invalid format. Use: SETDIM l1,l2,l3,l4");
      }
    } else {
      Serial_SendError("SETDIM requires parameters: SETDIM l1,l2,l3,l4");
    }
  }
  
  // ============================================================================
  // COMMAND: SETTOOL - Set tool offset
  // Format: SETTOOL 0,0,10
  // ============================================================================
  else if (strcmp(cmd, CMD_SET_TOOL) == 0) {
    if (params != NULL) {
      // Manual parsing since Arduino sscanf doesn't support %f
      char* token;
      float values[3];
      int count = 0;
      
      // Make a copy of params since strtok modifies the string
      char paramsCopy[64];
      strncpy(paramsCopy, params, 63);
      paramsCopy[63] = '\0';
      
      // Parse comma-separated values
      token = strtok(paramsCopy, ",");
      while (token != NULL && count < 3) {
        values[count] = atof(token);
        count++;
        token = strtok(NULL, ",");
      }
      
      if (count == 3) {
        Kinematics_SetToolOffset(values[0], values[1], values[2]);
        Serial_SendAcknowledge("TOOL_OFFSET_SET");
      } else {
        Serial_SendError("Invalid format. Use: SETTOOL x,y,z");
      }
    } else {
      Serial_SendError("SETTOOL requires parameters: SETTOOL x,y,z");
    }
  }
  
  // ============================================================================
  // COMMAND: INFO - Send system information
  // ============================================================================
  else if (strcmp(cmd, CMD_INFO) == 0) {
    Serial_SendInfo();
  }
  
  // ============================================================================
  // COMMAND: VERSION - Send firmware version
  // ============================================================================
  else if (strcmp(cmd, CMD_VERSION) == 0) {
    Serial.print(F("VERSION,"));
    Serial.print(F(FIRMWARE_VERSION));
    Serial.print(F(","));
    Serial.println(F(FIRMWARE_DATE));
  }
  
  // ============================================================================
  // UNKNOWN COMMAND
  // ============================================================================
  else {
    Serial.print(F("ERROR,Unknown command: "));
    Serial.println(cmd);
  }
}

// ============================================================================
// SEND POSITION DATA
// ============================================================================
void Serial_SendPositionData() {
  // Format: POS,timestamp,x,y,z,theta1,theta2,theta3,theta4
  Serial.print(F("POS,"));
  Serial.print(millis());
  Serial.print(F(","));
  Serial.print(Kinematics_GetX(), 3);  // 3 decimal places
  Serial.print(F(","));
  Serial.print(Kinematics_GetY(), 3);
  Serial.print(F(","));
  Serial.print(Kinematics_GetZ(), 3);
  Serial.print(F(","));
  Serial.print(Encoder_GetAngleDegrees(1), 2);  // 2 decimal places for angles
  Serial.print(F(","));
  Serial.print(Encoder_GetAngleDegrees(2), 2);
  Serial.print(F(","));
  Serial.print(Encoder_GetAngleDegrees(3), 2);
  Serial.print(F(","));
  Serial.println(Encoder_GetAngleDegrees(4), 2);
}

// ============================================================================
// SEND ACKNOWLEDGMENT
// ============================================================================
void Serial_SendAcknowledge(const char* message) {
  Serial.print(F("ACK,"));
  Serial.println(message);
}

// ============================================================================
// SEND ERROR
// ============================================================================
void Serial_SendError(const char* message) {
  Serial.print(F("ERROR,"));
  Serial.println(message);
}

// ============================================================================
// SEND SYSTEM INFORMATION
// ============================================================================
void Serial_SendInfo() {
  Serial.println(F("INFO,System Information:"));
  Serial.print(F("INFO,Firmware: "));
  Serial.println(F(FIRMWARE_VERSION));
  Serial.print(F("INFO,Encoder PPR: "));
  Serial.println(ENCODER_PPR);
  Serial.print(F("INFO,Update Rate: "));
  Serial.print(1000 / UPDATE_INTERVAL_MS);
  Serial.println(F(" Hz"));
  Serial.print(F("INFO,Link Lengths: "));
  Serial.print(link1_length); Serial.print(F(","));
  Serial.print(link2_length); Serial.print(F(","));
  Serial.print(link3_length); Serial.print(F(","));
  Serial.println(link4_length);
}