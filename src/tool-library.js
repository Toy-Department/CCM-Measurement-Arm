/*
 * ============================================================================
 * TOOL LIBRARY MODULE
 * ============================================================================
 */

class ToolLibrary {
    constructor() {
        this.tools = [];
        this.activeTool = null;
        this.loadFromStorage();
    }

    addTool(name, offsetX, offsetY, offsetZ) {
        const tool = {
            id: Date.now(),
            name: name,
            offsetX: offsetX,
            offsetY: offsetY,
            offsetZ: offsetZ,
            created: new Date().toISOString()
        };

        this.tools.push(tool);
        this.saveToStorage();
        return tool;
    }

    deleteTool(toolId) {
        const index = this.tools.findIndex(t => t.id === toolId);
        if (index !== -1) {
            if (this.activeTool && this.activeTool.id === toolId) {
                this.activeTool = null;
            }
            this.tools.splice(index, 1);
            this.saveToStorage();
            return true;
        }
        return false;
    }

    getTool(toolId) {
        return this.tools.find(t => t.id === toolId);
    }

    getAllTools() {
        return this.tools;
    }

    setActiveTool(toolId) {
        const tool = this.getTool(toolId);
        if (tool) {
            this.activeTool = tool;
            this.saveToStorage();
            return tool;
        }
        return null;
    }

    getActiveTool() {
        return this.activeTool;
    }

    clearActiveTool() {
        this.activeTool = null;
        this.saveToStorage();
    }

    saveToStorage() {
        try {
            const data = {
                tools: this.tools,
                activeToolId: this.activeTool ? this.activeTool.id : null
            };
            localStorage.setItem('toolLibrary', JSON.stringify(data));
        } catch (error) {
            console.error('Error saving tool library:', error);
        }
    }

    loadFromStorage() {
        try {
            const data = localStorage.getItem('toolLibrary');
            if (data) {
                const parsed = JSON.parse(data);
                this.tools = parsed.tools || [];
                if (parsed.activeToolId) {
                    this.activeTool = this.getTool(parsed.activeToolId);
                }
            } else {
                // Add default tool
                this.addTool('Default Tool (No Offset)', 0, 0, 0);
            }
        } catch (error) {
            console.error('Error loading tool library:', error);
            this.tools = [];
            this.addTool('Default Tool (No Offset)', 0, 0, 0);
        }
    }

    exportToJSON() {
        return JSON.stringify({
            tools: this.tools,
            exportedAt: new Date().toISOString()
        }, null, 2);
    }

    importFromJSON(jsonString) {
        try {
            const data = JSON.parse(jsonString);
            if (data.tools && Array.isArray(data.tools)) {
                this.tools = data.tools;
                this.activeTool = null;
                this.saveToStorage();
                return { success: true, count: this.tools.length };
            }
            return { success: false, error: 'Invalid JSON format' };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }
}

module.exports = ToolLibrary;
