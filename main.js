/*
 * ============================================================================
 * CCM DIGITIZING ARM - MAIN PROCESS
 * ============================================================================
 * 
 * This is the main Electron process that manages the application window
 * and handles system-level operations.
 * 
 * Electron Architecture:
 * - Main Process (this file): Manages windows, system APIs, native features
 * - Renderer Process (renderer.js): Handles UI, user interactions
 * 
 * ============================================================================
 */

const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs');

// ============================================================================
// GLOBAL VARIABLES
// ============================================================================
let mainWindow = null;

// Application version
const APP_VERSION = '1.0.0';
const APP_NAME = 'CCM Digitizing Arm';

// ============================================================================
// CREATE MAIN WINDOW
// ============================================================================
function createWindow() {
  // Create the browser window
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1000,
    minHeight: 700,
    icon: path.join(__dirname, 'assets', 'icon.png'),
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: false
    },
    backgroundColor: '#f5f5f5',
    title: `${APP_NAME} v${APP_VERSION}`,
    show: false  // Don't show until ready
  });

  // Load the index.html file
  mainWindow.loadFile('index.html');

  // Show window when ready
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  // Open DevTools in development mode (comment out for production)
  // mainWindow.webContents.openDevTools();

  // Handle window close
  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // Set up window menu
  setupMenu();
}

// ============================================================================
// APPLICATION MENU
// ============================================================================
function setupMenu() {
  const { Menu } = require('electron');

  const template = [
    {
      label: 'File',
      submenu: [
        {
          label: 'Export CSV',
          accelerator: 'CmdOrCtrl+E',
          click: () => {
            mainWindow.webContents.send('menu-export-csv');
          }
        },
        {
          label: 'New Session',
          accelerator: 'CmdOrCtrl+N',
          click: () => {
            mainWindow.webContents.send('menu-new-session');
          }
        },
        { type: 'separator' },
        {
          label: 'Exit',
          accelerator: 'CmdOrCtrl+Q',
          click: () => {
            app.quit();
          }
        }
      ]
    },
    {
      label: 'Recording',
      submenu: [
        {
          label: 'Start Recording',
          accelerator: 'CmdOrCtrl+S',
          click: () => {
            mainWindow.webContents.send('menu-start-recording');
          }
        },
        {
          label: 'Stop Recording',
          accelerator: 'CmdOrCtrl+Shift+S',
          click: () => {
            mainWindow.webContents.send('menu-stop-recording');
          }
        },
        {
          label: 'Pause/Resume',
          accelerator: 'CmdOrCtrl+P',
          click: () => {
            mainWindow.webContents.send('menu-pause-resume');
          }
        },
        { type: 'separator' },
        {
          label: 'Zero Encoders',
          accelerator: 'CmdOrCtrl+Z',
          click: () => {
            mainWindow.webContents.send('menu-zero-encoders');
          }
        }
      ]
    },
    {
      label: 'Mark Point',
      submenu: [
        {
          label: 'Mark as Boundary',
          accelerator: 'B',
          click: () => {
            mainWindow.webContents.send('menu-mark-boundary');
          }
        },
        {
          label: 'Mark as Hole Center',
          accelerator: 'H',
          click: () => {
            mainWindow.webContents.send('menu-mark-hole');
          }
        },
        {
          label: 'Quick Mark (Current Type)',
          accelerator: 'Space',
          click: () => {
            mainWindow.webContents.send('menu-quick-mark');
          }
        }
      ]
    },
    {
      label: 'View',
      submenu: [
        {
          label: 'Reload',
          accelerator: 'CmdOrCtrl+R',
          click: () => {
            mainWindow.reload();
          }
        },
        {
          label: 'Toggle DevTools',
          accelerator: 'CmdOrCtrl+Shift+I',
          click: () => {
            mainWindow.webContents.toggleDevTools();
          }
        },
        { type: 'separator' },
        {
          label: 'Zoom In',
          accelerator: 'CmdOrCtrl+Plus',
          click: () => {
            mainWindow.webContents.setZoomLevel(
              mainWindow.webContents.getZoomLevel() + 1
            );
          }
        },
        {
          label: 'Zoom Out',
          accelerator: 'CmdOrCtrl+-',
          click: () => {
            mainWindow.webContents.setZoomLevel(
              mainWindow.webContents.getZoomLevel() - 1
            );
          }
        },
        {
          label: 'Reset Zoom',
          accelerator: 'CmdOrCtrl+0',
          click: () => {
            mainWindow.webContents.setZoomLevel(0);
          }
        }
      ]
    },
    {
      label: 'Help',
      submenu: [
        {
          label: 'Documentation',
          click: () => {
            // Open README in default browser
            const { shell } = require('electron');
            shell.openExternal('https://github.com/Toy-Department/ccm-digitizing-arm');
          }
        },
        {
          label: 'Keyboard Shortcuts',
          click: () => {
            mainWindow.webContents.send('menu-show-shortcuts');
          }
        },
        { type: 'separator' },
        {
          label: 'About',
          click: () => {
            dialog.showMessageBox(mainWindow, {
              type: 'info',
              title: 'About',
              message: `${APP_NAME}`,
              detail: `Version: ${APP_VERSION}\n\nOpen-source digitizing arm software for reverse engineering and 3D modeling.\n\n© 2025`
            });
          }
        }
      ]
    }
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

// ============================================================================
// IPC HANDLERS - Communication with renderer process
// ============================================================================

// Handle file save dialog
ipcMain.handle('save-csv-dialog', async (event) => {
  const result = await dialog.showSaveDialog(mainWindow, {
    title: 'Export CSV File',
    defaultPath: `digitizing_arm_${Date.now()}.csv`,
    filters: [
      { name: 'CSV Files', extensions: ['csv'] },
      { name: 'All Files', extensions: ['*'] }
    ]
  });

  return result;
});

// Handle file write
ipcMain.handle('write-file', async (event, filePath, content) => {
  try {
    fs.writeFileSync(filePath, content, 'utf-8');
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// Handle file read
ipcMain.handle('read-file', async (event, filePath) => {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    return { success: true, content };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// Handle open file dialog
ipcMain.handle('open-file-dialog', async (event, options) => {
  const result = await dialog.showOpenDialog(mainWindow, options);
  return result;
});

// Handle error dialog
ipcMain.handle('show-error', async (event, title, message) => {
  await dialog.showErrorBox(title, message);
});

// Handle info dialog
ipcMain.handle('show-info', async (event, title, message) => {
  await dialog.showMessageBox(mainWindow, {
    type: 'info',
    title: title,
    message: message
  });
});

// Handle confirmation dialog
ipcMain.handle('show-confirm', async (event, title, message) => {
  const result = await dialog.showMessageBox(mainWindow, {
    type: 'question',
    buttons: ['Yes', 'No'],
    defaultId: 0,
    title: title,
    message: message
  });

  return result.response === 0;  // Return true if Yes clicked
});

// ============================================================================
// APP EVENT HANDLERS
// ============================================================================

// Called when Electron has finished initialization
app.whenReady().then(() => {
  createWindow();

  // On macOS, re-create window when dock icon is clicked
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

// Quit when all windows are closed (except on macOS)
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// Handle before quit
app.on('before-quit', (event) => {
  // Add any cleanup code here
  console.log('Application closing...');
});

// ============================================================================
// ERROR HANDLING
// ============================================================================

process.on('uncaughtException', (error) => {
  console.error('Uncaught exception:', error);
  dialog.showErrorBox('Application Error',
    `An unexpected error occurred:\n\n${error.message}\n\nThe application will now close.`
  );
  app.quit();
});

// ============================================================================
// LOGGING
// ============================================================================

// Log application start
console.log(`${APP_NAME} v${APP_VERSION} starting...`);
console.log(`Platform: ${process.platform}`);
console.log(`Node version: ${process.versions.node}`);
console.log(`Electron version: ${process.versions.electron}`);
