/*
 * ============================================================================
 * CCM DIGITIZING ARM - RENDERER PROCESS v1.0.0
 * ============================================================================
 * 
 * Major V3 Enhancements:
 * - New geometry types: CIRCLE, PLANE, LINE
 * - Best-fit calculations
 * - Distance measurement
 * - 3D visualization (Three.js)
 * - Undo/Redo system
 * - Resizable panels
 * 
 * ============================================================================
 */

console.log('Renderer process started');

let ipcRenderer, SerialHandler, CSVExporter, ToolLibrary, GeometryCalculator, UndoManager, ThreeViewer;

try {
    ({ ipcRenderer } = require('electron'));
    SerialHandler = require('./src/serial-handler');
    CSVExporter = require('./src/csv-exporter');
    ToolLibrary = require('./src/tool-library');
    GeometryCalculator = require('./src/geometry-calculator');
    UndoManager = require('./src/undo-manager');
    ThreeViewer = require('./src/three-viewer');
    console.log('All modules loaded successfully');
} catch (error) {
    console.error('Error loading modules:', error);
    alert(`Critical Error: Failed to load modules.\n${error.message}\n\nCheck console for details.`);
}

// ============================================================================
// GLOBAL STATE
// ============================================================================
const serialHandler = new SerialHandler();
const csvExporter = new CSVExporter();
const toolLibrary = new ToolLibrary();
const geometryCalc = new GeometryCalculator();
const undoManager = new UndoManager(50);
let threeViewer = null;

let isRecording = false;
let isPaused = false;
let isLiveRecording = false;
let liveRecordingInterval = null;
let recordingFrequency = 5;
let currentUnits = 'mm';
let currentPosition = { x: 0, y: 0, z: 0 };
let currentAngles = { theta1: 0, theta2: 0, theta3: 0, theta4: 0 };
let livePointCount = 0;
let isSimulatorMode = false; // Track if connected to simulator

// V3 New State
let currentGeometryMode = 'MANUAL';
let geometrySubMode = null;
let tempGeometryPoints = [];
let currentGeometryId = null;

// ============================================================================
// INITIALIZATION
// ============================================================================
document.addEventListener('DOMContentLoaded', () => {
    setupEventListeners();
    refreshPortList();
    loadSettings();
    updateToolDropdown();
    initThreeViewer();
    initResizablePanels();
    addLog('Application started - v1.0.0', 'info');
    updateUndoRedoButtons();
    updateInstructionBar();
});

// ============================================================================
// EVENT LISTENERS
// ============================================================================
function setupEventListeners() {
    // Connection
    document.getElementById('refresh-ports-btn').addEventListener('click', refreshPortList);
    document.getElementById('connect-btn').addEventListener('click', toggleConnection);

    // System controls
    document.getElementById('zero-btn').addEventListener('click', zeroEncoders);
    document.getElementById('settings-btn').addEventListener('click', openSettings);

    // Undo/Redo
    document.getElementById('undo-btn')?.addEventListener('click', performUndo);
    document.getElementById('redo-btn')?.addEventListener('click', performRedo);

    // Recording controls
    document.getElementById('start-recording-btn').addEventListener('click', startRecording);
    document.getElementById('pause-recording-btn').addEventListener('click', togglePause);
    document.getElementById('stop-recording-btn').addEventListener('click', stopRecording);

    // Geometry mode selection
    document.getElementById('geometry-mode-select')?.addEventListener('change', onGeometryModeChange);

    // Point marking
    document.getElementById('mark-boundary-btn').addEventListener('click', () => markPoint('BOUNDARY'));
    document.getElementById('mark-hole-btn').addEventListener('click', () => markPoint('HOLE_CENTER'));
    document.getElementById('mark-circle-btn')?.addEventListener('click', () => markPoint('CIRCLE'));
    document.getElementById('mark-plane-btn')?.addEventListener('click', () => markPoint('PLANE'));
    document.getElementById('mark-line-btn')?.addEventListener('click', () => markPoint('LINE'));

    // Geometry calculations
    document.getElementById('calc-circle-btn')?.addEventListener('click', calculateCircle);
    document.getElementById('calc-plane-btn')?.addEventListener('click', calculatePlane);
    document.getElementById('calc-line-btn')?.addEventListener('click', calculateLine);
    document.getElementById('clear-temp-points-btn')?.addEventListener('click', clearTempPoints);

    // Distance measurement
    document.getElementById('measure-distance-btn')?.addEventListener('click', startDistanceMeasurement);

    // Export
    document.getElementById('export-csv-btn').addEventListener('click', exportCSV);
    document.getElementById('clear-points-btn').addEventListener('click', clearAllPoints);

    // Tool management
    document.getElementById('manage-tools-btn').addEventListener('click', openToolManager);
    document.getElementById('tool-select').addEventListener('change', onToolChange);

    // Settings modal
    document.getElementById('close-settings-modal').addEventListener('click', closeSettings);
    document.getElementById('save-settings-btn').addEventListener('click', saveSettings);
    document.getElementById('send-ppr-btn').addEventListener('click', sendEncoderPPR);
    document.getElementById('send-dimensions-btn').addEventListener('click', sendDimensions);

    // Tool modal
    document.getElementById('close-tool-modal').addEventListener('click', closeToolManager);
    document.getElementById('add-tool-btn').addEventListener('click', addNewTool);

    // Units
    document.querySelectorAll('input[name="units"]').forEach(radio => {
        radio.addEventListener('change', (e) => {
            currentUnits = e.target.value;
            updatePositionDisplay();
            updatePointsList();
        });
    });

    // Frequency slider
    const freqSlider = document.getElementById('frequency-slider');
    if (freqSlider) {
        freqSlider.addEventListener('input', (e) => {
            recordingFrequency = parseInt(e.target.value);
            document.getElementById('frequency-value').textContent = `${recordingFrequency} Hz`;
        });
    }

    // Keyboard shortcuts
    document.addEventListener('keydown', handleKeyboard);

    // Menu events
    ipcRenderer.on('menu-export-csv', exportCSV);
    ipcRenderer.on('menu-start-recording', startRecording);
    ipcRenderer.on('menu-stop-recording', stopRecording);
    ipcRenderer.on('menu-zero-encoders', zeroEncoders);
    ipcRenderer.on('menu-mark-boundary', () => markPoint('BOUNDARY'));
    ipcRenderer.on('menu-mark-hole', () => markPoint('HOLE_CENTER'));

    // Simulator Settings
    document.getElementById('sim-shape-select').addEventListener('change', onSimulatorShapeChange);
}

// ============================================================================
// KEYBOARD SHORTCUTS
// ============================================================================
function handleKeyboard(e) {
    // Ctrl+Z - Undo
    if (e.ctrlKey && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        performUndo();
    }
    // Ctrl+Y or Ctrl+Shift+Z - Redo
    else if (e.ctrlKey && (e.key === 'y' || (e.shiftKey && e.key === 'z'))) {
        e.preventDefault();
        performRedo();
    }
}

// ============================================================================
// THREE.JS VIEWER
// ============================================================================
function initThreeViewer() {
    try {
        threeViewer = new ThreeViewer('three-viewer-container');
        addLog('3D viewer initialized', 'success');

        // Add screenshot button handler
        document.getElementById('screenshot-btn').addEventListener('click', () => {
            if (threeViewer && threeViewer.saveScreenshot()) {
                addLog('Screenshot saved', 'success');
            } else {
                addLog('Failed to save screenshot', 'error');
            }
        });

        // Add home view button handler
        document.getElementById('home-view-btn').addEventListener('click', () => {
            if (threeViewer) {
                threeViewer.resetView();
                addLog('Camera view reset', 'info');
            }
        });
    } catch (error) {
        console.error('Error initializing Three.js viewer:', error);
        addLog('3D viewer initialization failed: ' + error.message, 'error');
    }
}

// ============================================================================
// CONNECTION FUNCTIONS
// ============================================================================
async function refreshPortList() {
    const select = document.getElementById('port-select');
    const ports = await serialHandler.listPorts();

    select.innerHTML = '<option value="">Select Port...</option>';

    ports.forEach(port => {
        const option = document.createElement('option');
        option.value = port.path;
        option.textContent = `${port.path}${port.manufacturer ? ' - ' + port.manufacturer : ''}`;
        select.appendChild(option);
    });

    addLog(`Found ${ports.length} ports`, 'info');
}

async function toggleConnection() {
    const btn = document.getElementById('connect-btn');
    const portSelect = document.getElementById('port-select');

    if (!serialHandler.getConnectionStatus()) {
        const portPath = portSelect.value;
        if (!portPath) {
            alert('Please select a port');
            return;
        }

        btn.disabled = true;
        btn.textContent = 'Connecting...';

        const result = await serialHandler.connect(
            portPath,
            handleSerialData,
            handleSerialStatus
        );

        if (result.success) {
            btn.textContent = 'Disconnect';
            updateConnectionStatus(true);
            enableControlButtons(true);
        } else {
            alert(`Connection failed: ${result.error}`);
            btn.textContent = 'Connect';
        }
        btn.disabled = false;

        // Check if connected to simulator
        if (result.success && portPath === 'Simulator') {
            isSimulatorMode = true;
            document.getElementById('simulator-settings').style.display = 'block';
            // Trigger initial shape description update
            onSimulatorShapeChange({ target: document.getElementById('sim-shape-select') });
            updateInstructionBar(); // Update instruction bar for simulator mode
        } else if (result.success) {
            // Connected to regular hardware
            updateInstructionBar(); // Update instruction bar for hardware connection
        }
    } else {
        await serialHandler.disconnect();
        btn.textContent = 'Connect';
        updateConnectionStatus(false);
        enableControlButtons(false);
        isSimulatorMode = false;

        // Hide simulator settings
        document.getElementById('simulator-settings').style.display = 'none';
        updateInstructionBar(); // Update instruction bar when disconnecting
    }
}

function updateConnectionStatus(connected) {
    const statusDot = document.getElementById('status-dot');
    const statusText = document.getElementById('status-text');

    if (connected) {
        statusDot.classList.add('connected');
        statusText.textContent = 'Connected';
    } else {
        statusDot.classList.remove('connected');
        statusText.textContent = 'Disconnected';
    }
}

function enableControlButtons(enabled) {
    document.getElementById('zero-btn').disabled = !enabled || !isRecording;
    document.getElementById('start-recording-btn').disabled = !enabled;
    document.getElementById('mark-boundary-btn').disabled = !enabled || !isRecording;
    document.getElementById('mark-hole-btn').disabled = !enabled || !isRecording;

    // V3 buttons
    const markCircleBtn = document.getElementById('mark-circle-btn');
    const markPlaneBtn = document.getElementById('mark-plane-btn');
    const markLineBtn = document.getElementById('mark-line-btn');
    if (markCircleBtn) markCircleBtn.disabled = !enabled || !isRecording;
    if (markPlaneBtn) markPlaneBtn.disabled = !enabled || !isRecording;
    if (markLineBtn) markLineBtn.disabled = !enabled || !isRecording;
}

// ============================================================================
// SERIAL DATA HANDLERS
// ============================================================================
function handleSerialData(data) {
    switch (data.type) {
        case 'position':
            currentPosition = { x: data.x, y: data.y, z: data.z };
            currentAngles = {
                theta1: data.theta1,
                theta2: data.theta2,
                theta3: data.theta3,
                theta4: data.theta4
            };
            updatePositionDisplay();
            updateAnglesDisplay();
            break;

        case 'simulation_finished':
            // Auto-stop recording when simulation finishes
            if (isRecording) {
                stopRecording();
                addLog('Simulation completed - recording stopped automatically', 'success');
            }
            break;

        case 'info':
        case 'raw':
            if (data.message && data.message.includes('Firmware')) {
                document.getElementById('firmware-info').textContent = data.message;
            }
            addLog(data.message, 'info');
            break;
    }
}

function handleSerialStatus(status) {
    addLog(status.message, status.type);
}

// ============================================================================
// GEOMETRY MODE
// ============================================================================
function onGeometryModeChange(e) {
    const oldMode = currentGeometryMode;
    currentGeometryMode = e.target.value;

    // Add to undo stack
    const action = UndoManager.createChangeGeometryModeAction(oldMode, currentGeometryMode);
    undoManager.addAction(action);
    updateUndoRedoButtons();

    updateGeometryUI();
    updateInstructionBar();
    addLog(`Geometry mode: ${currentGeometryMode}`, 'info');
}

function updateInstructionBar() {
    const instructionText = document.getElementById('instruction-text');
    if (!instructionText) return;

    // Check if not connected to any hardware or simulator
    if (!serialHandler.isConnected) {
        instructionText.textContent = 'To get started, connect to hardware or simulator';
        return;
    }

    // Show simulator mode message if connected to simulator
    if (isSimulatorMode) {
        instructionText.textContent = '*** Simulation Mode ***';
        return;
    }

    // If connected to hardware, show general usage instructions
    instructionText.textContent = 'Select a geometry mode or Live Recording or Live Data. Note: selecting Live Recording and then Live Data will start the recording of coordinates';
}

function updateGeometryUI() {
    // Show/hide geometry-specific controls based on mode
    const circlePanel = document.getElementById('circle-controls');
    const planePanel = document.getElementById('plane-controls');
    const linePanel = document.getElementById('line-controls');

    if (circlePanel) circlePanel.style.display = currentGeometryMode === 'CIRCLE' ? 'block' : 'none';
    if (planePanel) planePanel.style.display = currentGeometryMode === 'PLANE' ? 'block' : 'none';
    if (linePanel) linePanel.style.display = currentGeometryMode === 'LINE' ? 'block' : 'none';
}

// ============================================================================
// APP STATUS DISPLAY
// ============================================================================
function updateAppStatus(status) {
    const display = document.getElementById('app-status-display');
    if (!display) return;

    display.textContent = status;
    display.className = 'app-status-text'; // Reset classes

    if (status === 'RECORDING' || status === 'LIVE RECORDING') {
        display.classList.add('recording');
    } else if (status === 'PAUSED') {
        display.classList.add('paused');
    } else if (status === 'STOPPED') {
        display.classList.add('stopped');
    }
}

// ============================================================================
// RECORDING FUNCTIONS
// ============================================================================
function startRecording() {
    if (!serialHandler.getConnectionStatus()) return;

    // Safety Check: Prevent mixing recordings
    if (csvExporter.getPointCount() > 0) {
        if (confirm('Existing points detected. Clear points and start new recording?')) {
            clearAllPoints(true); // Skip internal confirmation

            // Double check if points were actually cleared (in case of error)
            if (csvExporter.getPointCount() > 0) {
                return;
            }
        } else {
            return;
        }
    }

    const liveRecordingCheckbox = document.getElementById('live-recording-checkbox');
    isLiveRecording = liveRecordingCheckbox && liveRecordingCheckbox.checked;

    serialHandler.sendCommand('START');
    isRecording = true;
    isPaused = false;
    livePointCount = 0;

    document.getElementById('start-recording-btn').disabled = true;
    document.getElementById('pause-recording-btn').disabled = false;
    document.getElementById('stop-recording-btn').disabled = false;
    document.getElementById('pause-recording-btn').innerHTML = '⏸️ Pause';

    if (isLiveRecording) {
        // Start timer for live recording
        if (liveRecordingInterval) clearInterval(liveRecordingInterval);
        const intervalMs = 1000 / recordingFrequency;

        liveRecordingInterval = setInterval(() => {
            if (!isPaused) {
                markPoint('LIVE');
                // threeViewer?.updatePoints(points); // Removed
                livePointCount++;
                updateLiveCounter();
            }
        }, intervalMs);

        document.getElementById('mark-boundary-btn').disabled = true;
        document.getElementById('mark-hole-btn').disabled = true;
        document.getElementById('frequency-slider').disabled = true;
        document.getElementById('frequency-slider').disabled = true;
        updateAppStatus('LIVE RECORDING');
        addLog(`Live recording started at ${recordingFrequency} Hz`, 'success');
    } else {
        document.getElementById('mark-boundary-btn').disabled = false;
        document.getElementById('mark-hole-btn').disabled = false;
        document.getElementById('mark-hole-btn').disabled = false;
        updateAppStatus('RECORDING');
        addLog('Manual recording started', 'success');
    }

    enableControlButtons(true);
}

function togglePause() {
    if (!isRecording) return;

    isPaused = !isPaused;
    const pauseBtn = document.getElementById('pause-recording-btn');

    if (isPaused) {
        serialHandler.sendCommand('PAUSE');
        pauseBtn.innerHTML = '▶️ Resume';
        updateAppStatus('PAUSED');
        addLog('Recording paused', 'info');
    } else {
        serialHandler.sendCommand('RESUME');
        pauseBtn.innerHTML = '⏸️ Pause';
        updateAppStatus(isLiveRecording ? 'LIVE RECORDING' : 'RECORDING');
        addLog('Recording resumed', 'info');
    }
}

function stopRecording() {
    if (!isRecording) return;

    if (liveRecordingInterval) {
        clearInterval(liveRecordingInterval);
        liveRecordingInterval = null;
    }

    serialHandler.sendCommand('STOP');
    isRecording = false;
    isPaused = false;
    isLiveRecording = false;

    document.getElementById('start-recording-btn').disabled = false;
    document.getElementById('pause-recording-btn').disabled = true;
    document.getElementById('stop-recording-btn').disabled = true;
    document.getElementById('mark-boundary-btn').disabled = true;
    document.getElementById('mark-hole-btn').disabled = true;
    document.getElementById('pause-recording-btn').innerHTML = '⏸️ Pause';
    document.getElementById('frequency-slider').disabled = false;

    document.getElementById('frequency-slider').disabled = false;

    updateAppStatus('STOPPED');
    addLog('Recording stopped', 'warning');
    enableControlButtons(true); // Keep controls enabled (connected), mark buttons will disable via isRecording check

    if (livePointCount > 0) {
        addLog(`Live recording stopped. Captured ${livePointCount} points`, 'info');
    } else {
        addLog('Recording stopped', 'info');
    }

    if (csvExporter.getPointCount() > 0) {
        document.getElementById('export-csv-btn').disabled = false;
    }
}



// ============================================================================
// POINT MARKING
// ============================================================================
function markPoint(type) {
    if (!isRecording || isPaused) return;

    const tool = toolLibrary.getActiveTool();
    let x = currentPosition.x;
    let y = currentPosition.y;
    let z = currentPosition.z;

    if (tool) {
        x += tool.offsetX;
        y += tool.offsetY;
        z += tool.offsetZ;
    }

    // Add to temp points if in geometry mode
    if (type === 'CIRCLE' || type === 'PLANE' || type === 'LINE') {
        tempGeometryPoints.push({ x, y, z, type });
        updateTempPointsList();
        addLog(`Temp point ${tempGeometryPoints.length} for ${type}`, 'info');

        // Add to 3D viewer
        if (threeViewer) {
            threeViewer.addPoint(x, y, z, type, `T${tempGeometryPoints.length}`);
        }
        return;
    }

    csvExporter.addPoint(x, y, z, type);

    // Add to undo stack
    const point = csvExporter.getPoint(csvExporter.getPointCount() - 1);
    const action = UndoManager.createAddPointAction(point);
    undoManager.addAction(action);
    updateUndoRedoButtons();

    // Update 3D viewer
    if (threeViewer) {
        threeViewer.addPoint(x, y, z, type, point.number);
    }

    updatePointsList();
    updatePointCount();

    addLog(`Point marked as ${type}`, 'success');
}

// ============================================================================
// GEOMETRY CALCULATIONS
// ============================================================================
function calculateCircle() {
    if (tempGeometryPoints.length < 3) {
        alert('Need at least 3 points to calculate circle');
        return;
    }

    try {
        const result = geometryCalc.fitCircle(tempGeometryPoints);
        currentGeometryId = `CIRCLE_${Date.now()}`;

        // Add points to main list
        tempGeometryPoints.forEach(p => {
            csvExporter.addPoint(p.x, p.y, p.z, 'CIRCLE', currentGeometryId);
        });

        // Store geometry result
        const pointIndices = [];
        for (let i = csvExporter.getPointCount() - tempGeometryPoints.length; i < csvExporter.getPointCount(); i++) {
            pointIndices.push(i);
        }
        csvExporter.setGeometryResult(currentGeometryId, 'CIRCLE', result, pointIndices);

        // Display result
        displayGeometryResult('CIRCLE', result);

        clearTempPoints();
        updatePointsList();

        addLog(`Circle calculated: R=${result.radius.toFixed(3)}mm, residual=${result.residual.toFixed(4)}mm`, 'success');
    } catch (error) {
        alert(`Circle calculation failed: ${error.message}`);
    }
}

function calculatePlane() {
    if (tempGeometryPoints.length < 3) {
        alert('Need at least 3 points to calculate plane');
        return;
    }

    try {
        const result = geometryCalc.fitPlane(tempGeometryPoints);
        currentGeometryId = `PLANE_${Date.now()}`;

        tempGeometryPoints.forEach(p => {
            csvExporter.addPoint(p.x, p.y, p.z, 'PLANE', currentGeometryId);
        });

        const pointIndices = [];
        for (let i = csvExporter.getPointCount() - tempGeometryPoints.length; i < csvExporter.getPointCount(); i++) {
            pointIndices.push(i);
        }
        csvExporter.setGeometryResult(currentGeometryId, 'PLANE', result, pointIndices);

        displayGeometryResult('PLANE', result);

        clearTempPoints();
        updatePointsList();

        addLog(`Plane calculated: normal=(${result.normal.x.toFixed(3)}, ${result.normal.y.toFixed(3)}, ${result.normal.z.toFixed(3)})`, 'success');
    } catch (error) {
        alert(`Plane calculation failed: ${error.message}`);
    }
}

function calculateLine() {
    if (tempGeometryPoints.length < 2) {
        alert('Need at least 2 points to calculate line');
        return;
    }

    try {
        const result = tempGeometryPoints.length === 2 ?
            geometryCalc.lineFrom2Points(tempGeometryPoints) :
            geometryCalc.fitLine(tempGeometryPoints);

        currentGeometryId = `LINE_${Date.now()}`;

        tempGeometryPoints.forEach(p => {
            csvExporter.addPoint(p.x, p.y, p.z, 'LINE', currentGeometryId);
        });

        const pointIndices = [];
        for (let i = csvExporter.getPointCount() - tempGeometryPoints.length; i < csvExporter.getPointCount(); i++) {
            pointIndices.push(i);
        }
        csvExporter.setGeometryResult(currentGeometryId, 'LINE', result, pointIndices);

        displayGeometryResult('LINE', result);

        clearTempPoints();
        updatePointsList();

        addLog(`Line calculated: direction=(${result.direction.x.toFixed(3)}, ${result.direction.y.toFixed(3)}, ${result.direction.z.toFixed(3)})`, 'success');
    } catch (error) {
        alert(`Line calculation failed: ${error.message}`);
    }
}

function clearTempPoints() {
    tempGeometryPoints = [];
    updateTempPointsList();

    // Sync 3D viewer (removes temp points, ensures permanent points are shown)
    if (threeViewer) {
        threeViewer.updatePoints(csvExporter.getPoints());
    }
}

function updateTempPointsList() {
    const list = document.getElementById('temp-points-list');
    if (!list) return;

    if (tempGeometryPoints.length === 0) {
        list.innerHTML = '<div class="empty-state">No temp points</div>';
        return;
    }

    list.innerHTML = '';
    tempGeometryPoints.forEach((p, i) => {
        const div = document.createElement('div');
        div.className = 'temp-point-item';
        div.textContent = `${i + 1}. (${p.x.toFixed(2)}, ${p.y.toFixed(2)}, ${p.z.toFixed(2)})`;
        list.appendChild(div);
    });
}

function displayGeometryResult(type, result) {
    const panel = document.getElementById('geometry-results');
    if (!panel) return;

    const div = document.createElement('div');
    div.className = 'geometry-result';

    let html = `<h4>${type} Result:</h4>`;

    if (type === 'CIRCLE') {
        html += `<p>Center: (${result.center.x.toFixed(3)}, ${result.center.y.toFixed(3)}) mm</p>`;
        html += `<p>Radius: ${result.radius.toFixed(3)} mm</p>`;
        html += `<p>Residual: ${result.residual.toFixed(4)} mm</p>`;
    } else if (type === 'PLANE') {
        html += `<p>Normal: (${result.normal.x.toFixed(4)}, ${result.normal.y.toFixed(4)}, ${result.normal.z.toFixed(4)})</p>`;
        html += `<p>Equation: ${result.equation.a.toFixed(4)}x + ${result.equation.b.toFixed(4)}y + ${result.equation.c.toFixed(4)}z + ${result.equation.d.toFixed(4)} = 0</p>`;
        html += `<p>Residual: ${result.residual.toFixed(4)} mm</p>`;
    } else if (type === 'LINE') {
        html += `<p>Point: (${result.point.x.toFixed(3)}, ${result.point.y.toFixed(3)}, ${result.point.z.toFixed(3)}) mm</p>`;
        html += `<p>Direction: (${result.direction.x.toFixed(4)}, ${result.direction.y.toFixed(4)}, ${result.direction.z.toFixed(4)})</p>`;
        html += `<p>Residual: ${result.residual.toFixed(4)} mm</p>`;
    }

    div.innerHTML = html;
    panel.appendChild(div);
}



// ============================================================================
// UNDO/REDO
// ============================================================================
function performUndo() {
    if (!undoManager.canUndo()) return;

    const action = undoManager.undo();

    switch (action.type) {
        case 'ADD_POINT':
            // Remove last point
            csvExporter.deletePoint(csvExporter.getPointCount() - 1);
            break;

        case 'DELETE_POINT':
            // Re-add point
            csvExporter.insertPoint(action.data.point, action.data.index);
            break;

        case 'CLEAR_POINTS':
            // Restore all points
            action.data.points.forEach(p => {
                csvExporter.addPoint(p.x, p.y, p.z, p.type, p.geometryId, p.timestamp);
            });
            break;
    }

    updatePointsList();
    updatePointCount();

    updateUndoRedoButtons();
    undoManager.enableUndo();

    addLog(`Undo: ${UndoManager.describeAction(action)}`, 'info');
}

function performRedo() {
    if (!undoManager.canRedo()) return;

    const action = undoManager.redo();

    switch (action.type) {
        case 'ADD_POINT':
            // Re-add point
            const p = action.data.point;
            csvExporter.addPoint(p.x, p.y, p.z, p.type, p.geometryId, p.timestamp);
            break;

        case 'DELETE_POINT':
            // Remove point again
            csvExporter.deletePoint(action.data.index);
            break;

        case 'CLEAR_POINTS':
            // Clear again
            csvExporter.clearPoints();
            break;
    }

    updatePointsList();
    updatePointCount();

    updateUndoRedoButtons();
    undoManager.enableUndo();

    addLog(`Redo: ${UndoManager.describeAction(action)}`, 'info');
}

function updateUndoRedoButtons() {
    const undoBtn = document.getElementById('undo-btn');
    const redoBtn = document.getElementById('redo-btn');

    if (undoBtn) {
        undoBtn.disabled = !undoManager.canUndo();
        undoBtn.title = undoManager.canUndo() ?
            `Undo: ${UndoManager.describeAction(undoManager.peekUndo())}` :
            'Nothing to undo';
    }

    if (redoBtn) {
        redoBtn.disabled = !undoManager.canRedo();
        redoBtn.title = undoManager.canRedo() ?
            `Redo: ${UndoManager.describeAction(undoManager.peekRedo())}` :
            'Nothing to redo';
    }
}

// ============================================================================
// DISPLAY UPDATES
// ============================================================================
function updatePositionDisplay() {
    let x = currentPosition.x;
    let y = currentPosition.y;
    let z = currentPosition.z;

    if (currentUnits === 'inches') {
        x = csvExporter.mmToInches(x);
        y = csvExporter.mmToInches(y);
        z = csvExporter.mmToInches(z);
    }

    document.getElementById('pos-x').textContent = x.toFixed(3);
    document.getElementById('pos-y').textContent = y.toFixed(3);
    document.getElementById('pos-z').textContent = z.toFixed(3);

    document.getElementById('unit-x').textContent = currentUnits;
    document.getElementById('unit-y').textContent = currentUnits;
    document.getElementById('unit-z').textContent = currentUnits;
}

// ============================================================================
// SIMULATOR CONTROL
// ============================================================================
function onSimulatorShapeChange(e) {
    const shape = e.target.value;
    const desc = document.getElementById('sim-shape-desc');

    let description = '';
    switch (shape) {
        case 'RECTANGLE':
            description = '100x50mm Rectangle path';
            break;
        case 'CYLINDER':
            description = 'R=30mm, H=80mm Cylinder spiral';
            break;
        case 'CONE':
            description = 'R=40mm, H=60mm Cone spiral';
            break;
        case 'COMPLEX':
            description = 'Twisted 5-Point Star Spiral Cone (H=100mm)';
            break;
    }
    desc.textContent = description;

    // Send command to simulator
    if (serialHandler.getConnectionStatus()) {
        serialHandler.sendCommand(`SIM_SHAPE:${shape}`);
    }
}

function updateAnglesDisplay() {
    document.getElementById('angle-1').textContent = currentAngles.theta1.toFixed(2) + '°';
    document.getElementById('angle-2').textContent = currentAngles.theta2.toFixed(2) + '°';
    document.getElementById('angle-3').textContent = currentAngles.theta3.toFixed(2) + '°';
    document.getElementById('angle-4').textContent = currentAngles.theta4.toFixed(2) + '°';
}

function updatePointsList() {
    const pointsList = document.getElementById('points-list');
    const points = csvExporter.getPoints();

    // Clear existing rows but keep the header and empty state if needed
    // Actually, easiest is to rebuild the list content based on state

    // If no points, show empty state (but keep header if we want it visible, or hide it?)
    // Usually empty state replaces the list. But if we want header visible, we should keep it.
    // Let's assume we want header always visible.

    // Clear all content except the header
    const header = pointsList.querySelector('.points-list-header');
    pointsList.innerHTML = '';
    if (header) {
        pointsList.appendChild(header);
    }

    if (points.length === 0) {
        const emptyState = document.createElement('div');
        emptyState.className = 'empty-state';
        emptyState.textContent = 'No points captured yet. Start recording to begin.';
        pointsList.appendChild(emptyState);
        return;
    }
    let lastRow = null;

    points.forEach((point, index) => {
        const row = document.createElement('div');
        row.className = 'point-row';

        const x = currentUnits === 'inches' ? csvExporter.mmToInches(point.x) : point.x;
        const y = currentUnits === 'inches' ? csvExporter.mmToInches(point.y) : point.y;
        const z = currentUnits === 'inches' ? csvExporter.mmToInches(point.z) : point.z;

        row.innerHTML = `
            <span class="point-num">${point.number}</span>
            <span class="point-type ${point.type.toLowerCase()}">${point.type}</span>
            <span class="point-coord value-x">${x.toFixed(3)}</span>
            <span class="point-coord value-y">${y.toFixed(3)}</span>
            <span class="point-coord value-z">${z.toFixed(3)}</span>
            <span class="point-delete" data-index="${index}">🗑️</span>
        `;

        pointsList.appendChild(row);
        lastRow = row;
    });

    // Auto-scroll to the last point
    if (lastRow) {
        lastRow.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }

    document.querySelectorAll('.point-delete').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const index = parseInt(e.target.dataset.index);
            const point = csvExporter.getPoint(index);
            const deletedPoint = csvExporter.deletePoint(index);

            if (deletedPoint) {
                // Add to undo stack
                const action = UndoManager.createDeletePointAction(deletedPoint, index);
                undoManager.addAction(action);
                updateUndoRedoButtons();
            }

            updatePointsList();
            updatePointCount();

        });
    });
}

function updatePointCount() {
    document.getElementById('point-count').textContent = csvExporter.getPointCount();
}

function clearAllPoints(skipConfirmation = false) {
    if (csvExporter.getPointCount() === 0) return;

    if (skipConfirmation || confirm('Delete all captured points?')) {
        const points = csvExporter.getPoints();

        // Add to undo stack
        const action = UndoManager.createClearPointsAction(points);
        undoManager.addAction(action);
        updateUndoRedoButtons();

        csvExporter.clearPoints();

        // Clear 3D viewer
        if (threeViewer) {
            threeViewer.clear();
        }

        updatePointsList();
        updatePointCount();

        document.getElementById('export-csv-btn').disabled = true;
        addLog('All points cleared', 'warning');
    }
}

// ============================================================================
// CSV EXPORT
// ============================================================================
async function exportCSV() {
    if (csvExporter.getPointCount() === 0) {
        alert('No points to export');
        return;
    }

    const result = await ipcRenderer.invoke('save-csv-dialog');

    if (!result.canceled && result.filePath) {
        const exportResult = csvExporter.exportToFile(result.filePath, currentUnits, true);

        if (exportResult.success) {
            addLog(`CSV exported: ${result.filePath}`, 'success');
            alert('CSV exported successfully!');
        } else {
            addLog(`Export failed: ${exportResult.error}`, 'error');
            alert(`Export failed: ${exportResult.error}`);
        }
    }
}

// ============================================================================
// ARDUINO COMMANDS
// ============================================================================
function zeroEncoders() {
    if (!serialHandler.getConnectionStatus()) return;
    serialHandler.sendCommand('ZERO');
    addLog('Encoders zeroed', 'success');
}

function sendEncoderPPR() {
    const ppr = document.getElementById('encoder-ppr-input').value.trim();

    // Validate input is a number
    if (!ppr || isNaN(ppr) || parseInt(ppr) <= 0) {
        addLog('Invalid PPR value - must be a positive number', 'error');
        return;
    }

    const command = `SETPPR ${ppr}`;
    console.log('Sending command:', command); // Debug log

    if (serialHandler.sendCommand(command)) {
        addLog(`Sent command: ${command}`, 'info');
    } else {
        addLog('Failed to send PPR - not connected', 'error');
    }
}

function sendDimensions() {
    const l1 = document.getElementById('link1-input').value.trim();
    const l2 = document.getElementById('link2-input').value.trim();
    const l3 = document.getElementById('link3-input').value.trim();
    const l4 = document.getElementById('link4-input').value.trim();

    // Validate inputs are numbers
    if (!l1 || !l2 || !l3 || !l4 || isNaN(l1) || isNaN(l2) || isNaN(l3) || isNaN(l4)) {
        addLog('Invalid dimensions - all values must be numbers', 'error');
        return;
    }

    const command = `SETDIM ${l1},${l2},${l3},${l4}`;
    console.log('Sending command:', command); // Debug log

    if (serialHandler.sendCommand(command)) {
        addLog(`Sent command: ${command}`, 'info');
    } else {
        addLog('Failed to send dimensions - not connected', 'error');
    }
}

// ============================================================================
// SETTINGS
// ============================================================================
function openSettings() {
    document.getElementById('settings-modal').classList.add('show');
}

function closeSettings() {
    document.getElementById('settings-modal').classList.remove('show');
}

function saveSettings() {
    localStorage.setItem('settings', JSON.stringify({
        units: currentUnits,
        encoderPPR: document.getElementById('encoder-ppr-input').value,
        dimensions: {
            link1: document.getElementById('link1-input').value,
            link2: document.getElementById('link2-input').value,
            link3: document.getElementById('link3-input').value,
            link4: document.getElementById('link4-input').value
        }
    }));

    closeSettings();
    addLog('Settings saved', 'success');
}

function loadSettings() {
    try {
        const settings = JSON.parse(localStorage.getItem('settings'));
        if (settings) {
            currentUnits = settings.units || 'mm';
            if (settings.encoderPPR) {
                document.getElementById('encoder-ppr-input').value = settings.encoderPPR;
            }
            if (settings.dimensions) {
                document.getElementById('link1-input').value = settings.dimensions.link1;
                document.getElementById('link2-input').value = settings.dimensions.link2;
                document.getElementById('link3-input').value = settings.dimensions.link3;
                document.getElementById('link4-input').value = settings.dimensions.link4;
            }
        }
    } catch (error) {
        console.error('Error loading settings:', error);
    }
}

// ============================================================================
// TOOL MANAGEMENT
// ============================================================================
function openToolManager() {
    updateToolList();
    document.getElementById('tool-modal').classList.add('show');
}

function closeToolManager() {
    document.getElementById('tool-modal').classList.remove('show');
}

function updateToolDropdown() {
    const select = document.getElementById('tool-select');
    const tools = toolLibrary.getAllTools();

    select.innerHTML = '';

    tools.forEach(tool => {
        const option = document.createElement('option');
        option.value = tool.id;
        option.textContent = tool.name;
        select.appendChild(option);
    });

    const activeTool = toolLibrary.getActiveTool();
    if (activeTool) {
        select.value = activeTool.id;
    }
}

function updateToolList() {
    const toolList = document.getElementById('tool-list');
    const tools = toolLibrary.getAllTools();

    toolList.innerHTML = '';

    tools.forEach(tool => {
        const div = document.createElement('div');
        div.className = 'tool-item';
        div.innerHTML = `
            <div class="tool-info">
                <h4>${tool.name}</h4>
                <div class="tool-offsets">X: ${tool.offsetX}, Y: ${tool.offsetY}, Z: ${tool.offsetZ}</div>
            </div>
            <div class="tool-actions">
                <button class="btn btn-danger" data-id="${tool.id}">Delete</button>
            </div>
        `;
        toolList.appendChild(div);
    });

    document.querySelectorAll('.tool-item .btn-danger').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = parseInt(e.target.dataset.id);
            if (confirm('Delete this tool?')) {
                toolLibrary.deleteTool(id);
                updateToolList();
                updateToolDropdown();
            }
        });
    });
}

function addNewTool() {
    const name = document.getElementById('new-tool-name').value.trim();
    const x = parseFloat(document.getElementById('new-tool-x').value);
    const y = parseFloat(document.getElementById('new-tool-y').value);
    const z = parseFloat(document.getElementById('new-tool-z').value);

    if (!name) {
        alert('Please enter a tool name');
        return;
    }

    toolLibrary.addTool(name, x, y, z);
    updateToolList();
    updateToolDropdown();

    document.getElementById('new-tool-name').value = '';
    document.getElementById('new-tool-x').value = '0';
    document.getElementById('new-tool-y').value = '0';
    document.getElementById('new-tool-z').value = '0';

    addLog(`Tool added: ${name}`, 'success');
}

function onToolChange() {
    const select = document.getElementById('tool-select');
    const toolId = parseInt(select.value);
    const tool = toolLibrary.setActiveTool(toolId);

    if (tool && serialHandler.getConnectionStatus()) {
        serialHandler.sendCommand(`SETTOOL ${tool.offsetX},${tool.offsetY},${tool.offsetZ}`);
        addLog(`Active tool: ${tool.name}`, 'info');
    }
}

// ============================================================================
// LOGGING
// ============================================================================
function addLog(message, type = 'info') {
    const logDisplay = document.getElementById('status-log');
    const entry = document.createElement('div');
    entry.className = `log-entry ${type}`;

    const timestamp = new Date().toLocaleTimeString();
    entry.textContent = `[${timestamp}] ${message}`;

    logDisplay.appendChild(entry);

    // Auto-scroll to the new entry
    entry.scrollIntoView({ behavior: 'smooth', block: 'end' });
}

// ============================================================================
// LIVE RECORDING COUNTER
// ============================================================================
function updateLiveCounter() {
    const liveCounter = document.getElementById('live-point-count');
    if (liveCounter) {
        liveCounter.textContent = livePointCount;
    }
}

// ============================================================================
// RESIZABLE PANELS
// ============================================================================
function initResizablePanels() {
    const leftPanel = document.querySelector('.left-panel');
    const centerPanel = document.querySelector('.center-panel');
    const rightPanel = document.querySelector('.right-panel');

    if (!leftPanel || !centerPanel || !rightPanel) {
        console.log('Panels not found for resizing');
        return;
    }

    console.log('Initializing resizable panels...');

    // Create resize handles
    const leftHandle = document.createElement('div');
    leftHandle.className = 'resize-handle resize-handle-left';
    leftPanel.appendChild(leftHandle);

    const rightHandle = document.createElement('div');
    rightHandle.className = 'resize-handle resize-handle-right';
    rightPanel.appendChild(rightHandle);

    // Left panel resize
    let isResizingLeft = false;
    let startXLeft = 0;
    let startWidthLeft = 0;

    leftHandle.addEventListener('mousedown', (e) => {
        isResizingLeft = true;
        startXLeft = e.clientX;
        startWidthLeft = leftPanel.offsetWidth;
        leftHandle.classList.add('resizing');
        document.body.style.cursor = 'col-resize';
        e.preventDefault();
        console.log('Started resizing left panel');
    });

    // Right panel resize
    let isResizingRight = false;
    let startXRight = 0;
    let startWidthRight = 0;

    rightHandle.addEventListener('mousedown', (e) => {
        isResizingRight = true;
        startXRight = e.clientX;
        startWidthRight = rightPanel.offsetWidth;
        rightHandle.classList.add('resizing');
        document.body.style.cursor = 'col-resize';
        e.preventDefault();
        console.log('Started resizing right panel');
    });

    // Mouse move handler
    document.addEventListener('mousemove', (e) => {
        if (isResizingLeft) {
            const deltaX = e.clientX - startXLeft;
            const newWidth = startWidthLeft + deltaX;

            // Enforce min/max constraints
            if (newWidth >= 200 && newWidth <= 400) {
                leftPanel.style.width = newWidth + 'px';
            }
        }

        if (isResizingRight) {
            const deltaX = startXRight - e.clientX;
            const newWidth = startWidthRight + deltaX;

            // Enforce min/max constraints
            if (newWidth >= 250 && newWidth <= 500) {
                rightPanel.style.width = newWidth + 'px';
            }
        }

        // Update 3D viewer if it exists during resize
        if ((isResizingLeft || isResizingRight) && threeViewer && threeViewer.onWindowResize) {
            threeViewer.onWindowResize();
        }
    });

    // Vertical resizer for right panel
    const verticalResizer = document.querySelector('.vertical-resizer');
    const rightPanelTop = document.querySelector('.right-panel-top');
    const rightPanelBottom = document.querySelector('.right-panel-bottom');

    if (verticalResizer && rightPanelTop && rightPanelBottom) {
        let isResizingVertical = false;
        let startYVertical = 0;
        let startHeightTop = 0;
        let startHeightBottom = 0;

        verticalResizer.addEventListener('mousedown', (e) => {
            isResizingVertical = true;
            startYVertical = e.clientY;
            startHeightTop = rightPanelTop.offsetHeight;
            startHeightBottom = rightPanelBottom.offsetHeight;
            document.body.style.cursor = 'ns-resize';
            e.preventDefault();
        });

        document.addEventListener('mousemove', (e) => {
            if (isResizingVertical) {
                const deltaY = e.clientY - startYVertical;
                const newTopHeight = startHeightTop + deltaY;
                const newBottomHeight = startHeightBottom - deltaY;

                // Enforce minimum heights
                if (newTopHeight >= 200 && newBottomHeight >= 150) {
                    rightPanelTop.style.flex = 'none';
                    rightPanelTop.style.height = newTopHeight + 'px';
                    rightPanelBottom.style.flex = 'none';
                    rightPanelBottom.style.height = newBottomHeight + 'px';

                    // Trigger 3D viewer resize
                    if (threeViewer) {
                        threeViewer.onWindowResize();
                    }
                }
            }
        });

        document.addEventListener('mouseup', () => {
            if (isResizingVertical) {
                isResizingVertical = false;
                document.body.style.cursor = '';
            }
        });
    }

    // Mouse up handler
    document.addEventListener('mouseup', () => {
        if (isResizingLeft) {
            isResizingLeft = false;
            leftHandle.classList.remove('resizing');
            document.body.style.cursor = '';
            console.log('Stopped resizing left panel');
        }
        if (isResizingRight) {
            isResizingRight = false;
            rightHandle.classList.remove('resizing');
            document.body.style.cursor = '';
            console.log('Stopped resizing right panel');
        }
    });

    console.log('Resizable panels initialized successfully');
}