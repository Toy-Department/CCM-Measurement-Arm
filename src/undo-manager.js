/*
 * ============================================================================
 * UNDO MANAGER MODULE - v1.0.0
 * ============================================================================
 * 
 * Manages undo/redo functionality for all user actions.
 * Stores last 50 actions with ability to undo and redo.
 * 
 * Supported Actions:
 * - ADD_POINT: Point marked
 * - DELETE_POINT: Point deleted
 * - CLEAR_POINTS: All points cleared
 * - CHANGE_GEOMETRY_MODE: Geometry mode changed
 * 
 * ============================================================================
 */

class UndoManager {
    constructor(maxHistorySize = 50) {
        this.maxHistorySize = maxHistorySize;
        this.undoStack = [];
        this.redoStack = [];
        this.enabled = true;
    }

    // ========================================================================
    // CORE UNDO/REDO OPERATIONS
    // ========================================================================

    /**
     * Add an action to the undo stack
     * @param {Object} action - Action object with type and data
     */
    addAction(action) {
        if (!this.enabled) return;

        // Add timestamp
        action.timestamp = Date.now();

        // Add to undo stack
        this.undoStack.push(action);

        // Limit stack size
        if (this.undoStack.length > this.maxHistorySize) {
            this.undoStack.shift();
        }

        // Clear redo stack when new action is added
        this.redoStack = [];
    }

    /**
     * Check if undo is available
     * @returns {boolean}
     */
    canUndo() {
        return this.undoStack.length > 0;
    }

    /**
     * Check if redo is available
     * @returns {boolean}
     */
    canRedo() {
        return this.redoStack.length > 0;
    }

    /**
     * Get the last action without removing it
     * @returns {Object|null}
     */
    peekUndo() {
        if (this.undoStack.length === 0) return null;
        return this.undoStack[this.undoStack.length - 1];
    }

    /**
     * Get the last redo action without removing it
     * @returns {Object|null}
     */
    peekRedo() {
        if (this.redoStack.length === 0) return null;
        return this.redoStack[this.redoStack.length - 1];
    }

    /**
     * Undo the last action
     * @returns {Object|null} - The action that was undone
     */
    undo() {
        if (!this.canUndo()) return null;

        const action = this.undoStack.pop();
        this.redoStack.push(action);

        return action;
    }

    /**
     * Redo the last undone action
     * @returns {Object|null} - The action that was redone
     */
    redo() {
        if (!this.canRedo()) return null;

        const action = this.redoStack.pop();

        // Don't add back to undo stack - let the re-execution do that
        this.enabled = false;

        return action;
    }

    /**
     * Re-enable adding to undo stack (call after redo execution)
     */
    enableUndo() {
        this.enabled = true;
    }

    /**
     * Temporarily disable adding to undo stack
     */
    disableUndo() {
        this.enabled = false;
    }

    // ========================================================================
    // STACK MANAGEMENT
    // ========================================================================

    /**
     * Clear all history
     */
    clear() {
        this.undoStack = [];
        this.redoStack = [];
    }

    /**
     * Get undo stack size
     * @returns {number}
     */
    getUndoSize() {
        return this.undoStack.length;
    }

    /**
     * Get redo stack size
     * @returns {number}
     */
    getRedoSize() {
        return this.redoStack.length;
    }

    /**
     * Get full undo history (for debugging)
     * @returns {Array}
     */
    getUndoHistory() {
        return [...this.undoStack];
    }

    /**
     * Get full redo history (for debugging)
     * @returns {Array}
     */
    getRedoHistory() {
        return [...this.redoStack];
    }

    // ========================================================================
    // ACTION FACTORY METHODS
    // ========================================================================

    /**
     * Create ADD_POINT action
     * @param {Object} point - Point data
     * @returns {Object} - Action object
     */
    static createAddPointAction(point) {
        return {
            type: 'ADD_POINT',
            data: {
                point: { ...point }
            }
        };
    }

    /**
     * Create DELETE_POINT action
     * @param {Object} point - Point data that was deleted
     * @param {number} index - Index where point was deleted
     * @returns {Object} - Action object
     */
    static createDeletePointAction(point, index) {
        return {
            type: 'DELETE_POINT',
            data: {
                point: { ...point },
                index: index
            }
        };
    }

    /**
     * Create CLEAR_POINTS action
     * @param {Array} points - All points that were cleared
     * @returns {Object} - Action object
     */
    static createClearPointsAction(points) {
        return {
            type: 'CLEAR_POINTS',
            data: {
                points: points.map(p => ({ ...p }))
            }
        };
    }

    /**
     * Create CHANGE_GEOMETRY_MODE action
     * @param {string} oldMode - Previous geometry mode
     * @param {string} newMode - New geometry mode
     * @returns {Object} - Action object
     */
    static createChangeGeometryModeAction(oldMode, newMode) {
        return {
            type: 'CHANGE_GEOMETRY_MODE',
            data: {
                oldMode: oldMode,
                newMode: newMode
            }
        };
    }

    /**
     * Create UPDATE_GEOMETRY action
     * @param {Object} oldGeometry - Previous geometry data
     * @param {Object} newGeometry - New geometry data
     * @returns {Object} - Action object
     */
    static createUpdateGeometryAction(oldGeometry, newGeometry) {
        return {
            type: 'UPDATE_GEOMETRY',
            data: {
                oldGeometry: oldGeometry ? { ...oldGeometry } : null,
                newGeometry: newGeometry ? { ...newGeometry } : null
            }
        };
    }

    // ========================================================================
    // STATUS AND INFORMATION
    // ========================================================================

    /**
     * Get a human-readable description of an action
     * @param {Object} action - Action object
     * @returns {string} - Description
     */
    static describeAction(action) {
        if (!action) return 'No action';

        switch (action.type) {
            case 'ADD_POINT':
                return `Added ${action.data.point.type} point`;

            case 'DELETE_POINT':
                return `Deleted ${action.data.point.type} point`;

            case 'CLEAR_POINTS':
                return `Cleared ${action.data.points.length} points`;

            case 'CHANGE_GEOMETRY_MODE':
                return `Changed mode: ${action.data.oldMode} → ${action.data.newMode}`;

            case 'UPDATE_GEOMETRY':
                return `Updated geometry`;

            default:
                return `Unknown action: ${action.type}`;
        }
    }

    /**
     * Get summary of current state
     * @returns {Object}
     */
    getSummary() {
        return {
            undoAvailable: this.canUndo(),
            redoAvailable: this.canRedo(),
            undoSize: this.getUndoSize(),
            redoSize: this.getRedoSize(),
            nextUndoAction: this.peekUndo() ? UndoManager.describeAction(this.peekUndo()) : null,
            nextRedoAction: this.peekRedo() ? UndoManager.describeAction(this.peekRedo()) : null
        };
    }
}

module.exports = UndoManager;
