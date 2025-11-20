/*
 * ============================================================================
 * CSV EXPORTER MODULE - v1.0.0
 * ============================================================================
 * 
 * Enhanced to support new geometry types:
 * - BOUNDARY, HOLE_CENTER, LIVE (from V2)
 * - CIRCLE, PLANE, LINE (new in V3)
 * 
 * Also exports geometry calculation results
 * ============================================================================
 */

class CSVExporter {
    constructor() {
        this.points = [];
        this.geometryResults = {}; // Store calculation results
    }

    // ========================================================================
    // POINT MANAGEMENT
    // ========================================================================

    addPoint(x, y, z, type, geometryId = null, timestamp = null) {
        this.points.push({
            number: this.points.length + 1,
            type: type,
            x: x,
            y: y,
            z: z,
            geometryId: geometryId, // Links point to geometry calculation
            timestamp: timestamp || Date.now()
        });
    }

    clearPoints() {
        this.points = [];
        this.geometryResults = {};
    }

    getPoints() {
        return this.points;
    }

    getPointCount() {
        return this.points.length;
    }

    getPoint(index) {
        if (index >= 0 && index < this.points.length) {
            return this.points[index];
        }
        return null;
    }

    deletePoint(index) {
        if (index >= 0 && index < this.points.length) {
            const deletedPoint = this.points[index];
            this.points.splice(index, 1);

            // Renumber points
            this.points.forEach((point, i) => {
                point.number = i + 1;
            });

            return deletedPoint;
        }
        return null;
    }

    insertPoint(point, index) {
        this.points.splice(index, 0, point);

        // Renumber points
        this.points.forEach((p, i) => {
            p.number = i + 1;
        });
    }

    // ========================================================================
    // GEOMETRY RESULTS MANAGEMENT
    // ========================================================================

    /**
     * Store geometry calculation results
     * @param {string} geometryId - Unique ID for this geometry
     * @param {string} type - CIRCLE, PLANE, or LINE
     * @param {Object} result - Calculation result from GeometryCalculator
     * @param {Array} pointIndices - Indices of points used in calculation
     */
    setGeometryResult(geometryId, type, result, pointIndices) {
        this.geometryResults[geometryId] = {
            type: type,
            result: result,
            pointIndices: pointIndices,
            timestamp: Date.now()
        };
    }

    getGeometryResult(geometryId) {
        return this.geometryResults[geometryId] || null;
    }

    getAllGeometryResults() {
        return this.geometryResults;
    }

    deleteGeometryResult(geometryId) {
        delete this.geometryResults[geometryId];
    }

    // ========================================================================
    // CSV GENERATION
    // ========================================================================

    generateCSV(units = 'mm', includeGeometry = true) {
        if (this.points.length === 0) {
            return null;
        }

        let csv = '';

        // Header
        csv += 'Point,Type,X,Y,Z,GeometryID,Timestamp\n';

        // Add each point
        this.points.forEach(point => {
            const x = units === 'inches' ? this.mmToInches(point.x) : point.x;
            const y = units === 'inches' ? this.mmToInches(point.y) : point.y;
            const z = units === 'inches' ? this.mmToInches(point.z) : point.z;

            csv += `${point.number},${point.type},${x.toFixed(3)},${y.toFixed(3)},${z.toFixed(3)},`;
            csv += `${point.geometryId || ''},${point.timestamp}\n`;
        });

        // Add geometry calculation results if requested
        if (includeGeometry && Object.keys(this.geometryResults).length > 0) {
            csv += '\n';
            csv += 'Geometry Calculations\n';
            csv += 'ID,Type,Details\n';

            for (let [id, geom] of Object.entries(this.geometryResults)) {
                const details = this.formatGeometryDetails(geom, units);
                csv += `${id},${geom.type},"${details}"\n`;
            }
        }

        return csv;
    }

    /**
     * Format geometry calculation details for CSV
     */
    formatGeometryDetails(geometry, units) {
        const u = units === 'inches' ? 'in' : 'mm';
        const convert = units === 'inches' ? this.mmToInches.bind(this) : (v) => v;

        switch (geometry.type) {
            case 'CIRCLE':
                const circle = geometry.result;
                return `Center: (${convert(circle.center.x).toFixed(3)}, ${convert(circle.center.y).toFixed(3)}) ${u}, ` +
                    `Radius: ${convert(circle.radius).toFixed(3)} ${u}, ` +
                    `Residual: ${convert(circle.residual).toFixed(4)} ${u}`;

            case 'PLANE':
                const plane = geometry.result;
                return `Normal: (${plane.normal.x.toFixed(4)}, ${plane.normal.y.toFixed(4)}, ${plane.normal.z.toFixed(4)}), ` +
                    `Equation: ${plane.equation.a.toFixed(4)}x + ${plane.equation.b.toFixed(4)}y + ${plane.equation.c.toFixed(4)}z + ${plane.equation.d.toFixed(4)} = 0, ` +
                    `Residual: ${convert(plane.residual).toFixed(4)} ${u}`;

            case 'LINE':
                const line = geometry.result;
                return `Point: (${convert(line.point.x).toFixed(3)}, ${convert(line.point.y).toFixed(3)}, ${convert(line.point.z).toFixed(3)}) ${u}, ` +
                    `Direction: (${line.direction.x.toFixed(4)}, ${line.direction.y.toFixed(4)}, ${line.direction.z.toFixed(4)}), ` +
                    `Residual: ${convert(line.residual).toFixed(4)} ${u}`;

            default:
                return 'Unknown geometry type';
        }
    }

    // ========================================================================
    // UNIT CONVERSION
    // ========================================================================

    mmToInches(mm) {
        return mm / 25.4;
    }

    inchesToMm(inches) {
        return inches * 25.4;
    }

    // ========================================================================
    // FILE OPERATIONS
    // ========================================================================

    exportToFile(filePath, units = 'mm', includeGeometry = true) {
        const csv = this.generateCSV(units, includeGeometry);
        if (!csv) {
            return { success: false, error: 'No points to export' };
        }

        try {
            const fs = require('fs');
            fs.writeFileSync(filePath, csv, 'utf-8');
            return { success: true };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    importFromFile(filePath) {
        try {
            const fs = require('fs');
            const content = fs.readFileSync(filePath, 'utf-8');
            const lines = content.split('\n').filter(line => line.trim().length > 0);

            // Skip header
            if (lines.length < 2) {
                return { success: false, error: 'Invalid CSV file' };
            }

            this.clearPoints();

            // Find where geometry section starts
            let geometryStartIndex = -1;
            for (let i = 0; i < lines.length; i++) {
                if (lines[i].includes('Geometry Calculations')) {
                    geometryStartIndex = i;
                    break;
                }
            }

            const pointsEndIndex = geometryStartIndex > 0 ? geometryStartIndex : lines.length;

            // Import points
            for (let i = 1; i < pointsEndIndex; i++) {
                if (lines[i].trim() === '') continue;

                const parts = lines[i].split(',');
                if (parts.length >= 5) {
                    this.addPoint(
                        parseFloat(parts[2]),
                        parseFloat(parts[3]),
                        parseFloat(parts[4]),
                        parts[1],
                        parts[5] || null,
                        parts[6] ? parseInt(parts[6]) : null
                    );
                }
            }

            return { success: true, count: this.points.length };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    // ========================================================================
    // STATISTICS
    // ========================================================================

    getStatistics() {
        const stats = {
            total: this.points.length,
            byType: {},
            geometryCount: Object.keys(this.geometryResults).length
        };

        // Count by type
        this.points.forEach(point => {
            stats.byType[point.type] = (stats.byType[point.type] || 0) + 1;
        });

        return stats;
    }

    // ========================================================================
    // POINT FILTERING
    // ========================================================================

    getPointsByType(type) {
        return this.points.filter(p => p.type === type);
    }

    getPointsByGeometry(geometryId) {
        return this.points.filter(p => p.geometryId === geometryId);
    }
}

module.exports = CSVExporter;
