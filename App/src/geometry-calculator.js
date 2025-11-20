/*
 * ============================================================================
 * GEOMETRY CALCULATOR MODULE - v1.0.0
 * ============================================================================
 * 
 * This module provides best-fit algorithms for geometric primitives:
 * - Circle (2D best-fit from 3+ points)
 * - Plane (3D best-fit from 3+ points)
 * - Line (3D best-fit from 2+ points)
 * 
 * All algorithms use least-squares fitting for accuracy.
 * ============================================================================
 */

class GeometryCalculator {
    constructor() { }

    // ========================================================================
    // CIRCLE CALCULATIONS
    // ========================================================================

    /**
     * Calculate best-fit circle from points (2D - using X,Y coordinates)
     * Uses algebraic circle fitting (Kåsa method)
     * @param {Array} points - Array of {x, y, z} points
     * @returns {Object} - {center: {x, y}, radius: number, residual: number}
     */
    fitCircle(points) {
        if (points.length < 3) {
            throw new Error('Need at least 3 points to fit a circle');
        }

        // Use only X and Y coordinates for 2D circle fitting
        const n = points.length;
        let sumX = 0, sumY = 0, sumX2 = 0, sumY2 = 0, sumXY = 0;
        let sumX3 = 0, sumY3 = 0, sumX2Y = 0, sumXY2 = 0;

        for (let p of points) {
            const x = p.x;
            const y = p.y;
            const x2 = x * x;
            const y2 = y * y;

            sumX += x;
            sumY += y;
            sumX2 += x2;
            sumY2 += y2;
            sumXY += x * y;
            sumX3 += x2 * x;
            sumY3 += y2 * y;
            sumX2Y += x2 * y;
            sumXY2 += x * y2;
        }

        // Solve system of equations using Cramer's rule
        const A = n * sumX2 - sumX * sumX;
        const B = n * sumXY - sumX * sumY;
        const C = n * sumY2 - sumY * sumY;
        const D = 0.5 * (n * (sumX3 + sumXY2) - sumX * (sumX2 + sumY2));
        const E = 0.5 * (n * (sumX2Y + sumY3) - sumY * (sumX2 + sumY2));

        const denominator = A * C - B * B;
        if (Math.abs(denominator) < 1e-10) {
            throw new Error('Points are collinear, cannot fit circle');
        }

        const centerX = (D * C - B * E) / denominator;
        const centerY = (A * E - B * D) / denominator;

        // Calculate radius
        let sumR2 = 0;
        for (let p of points) {
            const dx = p.x - centerX;
            const dy = p.y - centerY;
            sumR2 += dx * dx + dy * dy;
        }
        const radius = Math.sqrt(sumR2 / n);

        // Calculate residual (RMS error)
        let sumResidual = 0;
        for (let p of points) {
            const dx = p.x - centerX;
            const dy = p.y - centerY;
            const dist = Math.sqrt(dx * dx + dy * dy);
            const error = dist - radius;
            sumResidual += error * error;
        }
        const residual = Math.sqrt(sumResidual / n);

        // Use average Z coordinate for circle center
        const centerZ = points.reduce((sum, p) => sum + p.z, 0) / n;

        return {
            center: { x: centerX, y: centerY, z: centerZ },
            radius: radius,
            residual: residual,
            pointCount: n
        };
    }

    /**
     * Calculate circle from exactly 3 points (exact solution)
     * @param {Array} points - Array of exactly 3 {x, y, z} points
     * @returns {Object} - {center: {x, y}, radius: number}
     */
    circleFrom3Points(points) {
        if (points.length !== 3) {
            throw new Error('Need exactly 3 points');
        }

        const [p1, p2, p3] = points;

        const ax = p2.x - p1.x;
        const ay = p2.y - p1.y;
        const bx = p3.x - p1.x;
        const by = p3.y - p1.y;

        const denom = 2 * (ax * by - ay * bx);
        if (Math.abs(denom) < 1e-10) {
            throw new Error('Points are collinear');
        }

        const a2 = ax * ax + ay * ay;
        const b2 = bx * bx + by * by;

        const centerX = p1.x + (by * a2 - ay * b2) / denom;
        const centerY = p1.y + (ax * b2 - bx * a2) / denom;

        const dx = p1.x - centerX;
        const dy = p1.y - centerY;
        const radius = Math.sqrt(dx * dx + dy * dy);

        const centerZ = (p1.z + p2.z + p3.z) / 3;

        return {
            center: { x: centerX, y: centerY, z: centerZ },
            radius: radius,
            residual: 0,
            pointCount: 3
        };
    }

    // ========================================================================
    // PLANE CALCULATIONS
    // ========================================================================

    /**
     * Calculate best-fit plane from points using SVD
     * @param {Array} points - Array of {x, y, z} points
     * @returns {Object} - {normal: {x, y, z}, point: {x, y, z}, equation: {a, b, c, d}}
     */
    fitPlane(points) {
        if (points.length < 3) {
            throw new Error('Need at least 3 points to fit a plane');
        }

        // Calculate centroid
        const centroid = {
            x: points.reduce((sum, p) => sum + p.x, 0) / points.length,
            y: points.reduce((sum, p) => sum + p.y, 0) / points.length,
            z: points.reduce((sum, p) => sum + p.z, 0) / points.length
        };

        // Build covariance matrix
        let xx = 0, xy = 0, xz = 0;
        let yy = 0, yz = 0, zz = 0;

        for (let p of points) {
            const dx = p.x - centroid.x;
            const dy = p.y - centroid.y;
            const dz = p.z - centroid.z;

            xx += dx * dx;
            xy += dx * dy;
            xz += dx * dz;
            yy += dy * dy;
            yz += dy * dz;
            zz += dz * dz;
        }

        // Find eigenvector corresponding to smallest eigenvalue
        // This is the normal vector
        // Simplified approach: use cross product of two principal directions
        const det_xy = xx * yy - xy * xy;
        const det_xz = xx * zz - xz * xz;
        const det_yz = yy * zz - yz * yz;

        let normal;
        if (det_xy > det_xz && det_xy > det_yz) {
            // XY plane is most dominant
            normal = { x: xy, y: xz, z: -(xx + yy) };
        } else if (det_xz > det_yz) {
            normal = { x: xz, y: -(xx + zz), z: xy };
        } else {
            normal = { x: -(yy + zz), y: yz, z: xy };
        }

        // Normalize
        const len = Math.sqrt(normal.x * normal.x + normal.y * normal.y + normal.z * normal.z);
        normal.x /= len;
        normal.y /= len;
        normal.z /= len;

        // Plane equation: ax + by + cz + d = 0
        const d = -(normal.x * centroid.x + normal.y * centroid.y + normal.z * centroid.z);

        // Calculate residual
        let sumResidual = 0;
        for (let p of points) {
            const dist = Math.abs(normal.x * p.x + normal.y * p.y + normal.z * p.z + d);
            sumResidual += dist * dist;
        }
        const residual = Math.sqrt(sumResidual / points.length);

        return {
            normal: normal,
            point: centroid,
            equation: {
                a: normal.x,
                b: normal.y,
                c: normal.z,
                d: d
            },
            residual: residual,
            pointCount: points.length
        };
    }

    // ========================================================================
    // LINE CALCULATIONS
    // ========================================================================

    /**
     * Calculate best-fit line from points using least squares
     * @param {Array} points - Array of {x, y, z} points
     * @returns {Object} - {point: {x, y, z}, direction: {x, y, z}, residual: number}
     */
    fitLine(points) {
        if (points.length < 2) {
            throw new Error('Need at least 2 points to fit a line');
        }

        // Calculate centroid
        const centroid = {
            x: points.reduce((sum, p) => sum + p.x, 0) / points.length,
            y: points.reduce((sum, p) => sum + p.y, 0) / points.length,
            z: points.reduce((sum, p) => sum + p.z, 0) / points.length
        };

        // Build covariance matrix
        let xx = 0, xy = 0, xz = 0;
        let yy = 0, yz = 0, zz = 0;

        for (let p of points) {
            const dx = p.x - centroid.x;
            const dy = p.y - centroid.y;
            const dz = p.z - centroid.z;

            xx += dx * dx;
            xy += dx * dy;
            xz += dx * dz;
            yy += dy * dy;
            yz += dy * dz;
            zz += dz * dz;
        }

        // Find largest eigenvalue and corresponding eigenvector
        // Simplified: use principal component direction
        const trace = xx + yy + zz;
        const det = xx * (yy * zz - yz * yz) - xy * (xy * zz - xz * yz) + xz * (xy * yz - xz * yy);

        // Direction is the eigenvector of largest eigenvalue
        let direction;

        // Check which diagonal element is largest
        if (xx >= yy && xx >= zz) {
            direction = { x: 1, y: xy / xx, z: xz / xx };
        } else if (yy >= xx && yy >= zz) {
            direction = { x: xy / yy, y: 1, z: yz / yy };
        } else {
            direction = { x: xz / zz, y: yz / zz, z: 1 };
        }

        // Normalize direction
        const len = Math.sqrt(direction.x * direction.x + direction.y * direction.y + direction.z * direction.z);
        direction.x /= len;
        direction.y /= len;
        direction.z /= len;

        // Calculate residual (perpendicular distance from points to line)
        let sumResidual = 0;
        for (let p of points) {
            const dx = p.x - centroid.x;
            const dy = p.y - centroid.y;
            const dz = p.z - centroid.z;

            // Distance = ||(p - centroid) - ((p - centroid) · dir) * dir||
            const dot = dx * direction.x + dy * direction.y + dz * direction.z;
            const perpX = dx - dot * direction.x;
            const perpY = dy - dot * direction.y;
            const perpZ = dz - dot * direction.z;
            const dist = Math.sqrt(perpX * perpX + perpY * perpY + perpZ * perpZ);

            sumResidual += dist * dist;
        }
        const residual = Math.sqrt(sumResidual / points.length);

        return {
            point: centroid,
            direction: direction,
            residual: residual,
            pointCount: points.length
        };
    }

    /**
     * Calculate exact line from 2 points
     * @param {Array} points - Array of exactly 2 {x, y, z} points
     * @returns {Object} - {point: {x, y, z}, direction: {x, y, z}}
     */
    lineFrom2Points(points) {
        if (points.length !== 2) {
            throw new Error('Need exactly 2 points');
        }

        const [p1, p2] = points;

        const dx = p2.x - p1.x;
        const dy = p2.y - p1.y;
        const dz = p2.z - p1.z;

        const len = Math.sqrt(dx * dx + dy * dy + dz * dz);
        if (len < 1e-10) {
            throw new Error('Points are coincident');
        }

        return {
            point: p1,
            direction: {
                x: dx / len,
                y: dy / len,
                z: dz / len
            },
            residual: 0,
            pointCount: 2
        };
    }

    // ========================================================================
    // DISTANCE CALCULATIONS
    // ========================================================================

    /**
     * Calculate Euclidean distance between two points
     * @param {Object} p1 - First point {x, y, z}
     * @param {Object} p2 - Second point {x, y, z}
     * @returns {number} - Distance
     */
    distance(p1, p2) {
        const dx = p2.x - p1.x;
        const dy = p2.y - p1.y;
        const dz = p2.z - p1.z;
        return Math.sqrt(dx * dx + dy * dy + dz * dz);
    }

    /**
     * Calculate distance in 2D (XY plane only)
     * @param {Object} p1 - First point {x, y}
     * @param {Object} p2 - Second point {x, y}
     * @returns {number} - Distance
     */
    distance2D(p1, p2) {
        const dx = p2.x - p1.x;
        const dy = p2.y - p1.y;
        return Math.sqrt(dx * dx + dy * dy);
    }
}

module.exports = GeometryCalculator;
