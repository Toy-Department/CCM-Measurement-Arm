/*
 * ============================================================================
 * THREE.JS 3D VIEWER MODULE
 * ============================================================================
 * 
 * Features:
 * - Real-time 3D visualization of captured points
 * - Sequential line connections between points
 * - Color coding by point type
 * - Point number labels
 * - Interactive camera controls (zoom, pan, rotate)
 * - Screenshot capture
 * 
 * ============================================================================
 */

const THREE = require('three');

// Simple Orbit Controls implementation for Electron/CommonJS
class SimpleOrbitControls {
    constructor(camera, domElement) {
        this.camera = camera;
        this.domElement = domElement;
        this.target = new THREE.Vector3();

        this.enableDamping = true;
        this.dampingFactor = 0.05;
        this.screenSpacePanning = true;
        this.minDistance = 10;
        this.maxDistance = 1000;

        this.rotateSpeed = 0.075;  // Reduced for better control
        this.zoomSpeed = 1.0;
        this.panSpeed = 0.3;     // Reduced for better control

        this.isRotating = false;
        this.isPanning = false;
        this.rotateStart = new THREE.Vector2();
        this.rotateEnd = new THREE.Vector2();
        this.rotateDelta = new THREE.Vector2();
        this.panStart = new THREE.Vector2();
        this.panEnd = new THREE.Vector2();
        this.panDelta = new THREE.Vector2();

        this.spherical = new THREE.Spherical();
        this.sphericalDelta = new THREE.Spherical();
        this.scale = 1;
        this.panOffset = new THREE.Vector3();

        this.setupEventListeners();
    }

    setupEventListeners() {
        this.domElement.addEventListener('mousedown', (e) => this.onMouseDown(e));
        this.domElement.addEventListener('mousemove', (e) => this.onMouseMove(e));
        this.domElement.addEventListener('mouseup', (e) => this.onMouseUp(e));
        this.domElement.addEventListener('wheel', (e) => this.onMouseWheel(e));
        this.domElement.addEventListener('contextmenu', (e) => e.preventDefault());
    }

    onMouseDown(event) {
        if (event.button === 0) { // Left click - rotate
            this.isRotating = true;
            this.rotateStart.set(event.clientX, event.clientY);
        } else if (event.button === 2) { // Right click - pan
            this.isPanning = true;
            this.panStart.set(event.clientX, event.clientY);
        }
    }

    onMouseMove(event) {
        if (this.isRotating) {
            this.rotateEnd.set(event.clientX, event.clientY);
            this.rotateDelta.subVectors(this.rotateEnd, this.rotateStart).multiplyScalar(this.rotateSpeed);

            const element = this.domElement;
            this.sphericalDelta.theta -= 2 * Math.PI * this.rotateDelta.x / element.clientHeight;
            this.sphericalDelta.phi -= 2 * Math.PI * this.rotateDelta.y / element.clientHeight;

            this.rotateStart.copy(this.rotateEnd);
        } else if (this.isPanning) {
            this.panEnd.set(event.clientX, event.clientY);
            this.panDelta.subVectors(this.panEnd, this.panStart).multiplyScalar(this.panSpeed);
            this.pan(this.panDelta.x, this.panDelta.y);
            this.panStart.copy(this.panEnd);
        }
    }

    onMouseUp(event) {
        this.isRotating = false;
        this.isPanning = false;
    }

    onMouseWheel(event) {
        event.preventDefault();
        if (event.deltaY < 0) {
            this.scale *= 0.95;  // Inverted: scroll up = zoom out
        } else {
            this.scale /= 0.95;  // Inverted: scroll down = zoom in
        }
    }

    pan(deltaX, deltaY) {
        const offset = new THREE.Vector3();
        const element = this.domElement;

        const position = this.camera.position;
        offset.copy(position).sub(this.target);
        let targetDistance = offset.length();
        targetDistance *= Math.tan((this.camera.fov / 2) * Math.PI / 180.0);

        const panLeft = new THREE.Vector3();
        const panUp = new THREE.Vector3();

        const v = new THREE.Vector3();
        v.setFromMatrixColumn(this.camera.matrix, 0);
        panLeft.copy(v).multiplyScalar(-2 * deltaX * targetDistance / element.clientHeight);

        v.setFromMatrixColumn(this.camera.matrix, 1);
        panUp.copy(v).multiplyScalar(2 * deltaY * targetDistance / element.clientHeight);

        this.panOffset.add(panLeft).add(panUp);
    }

    update() {
        const offset = new THREE.Vector3();
        const quat = new THREE.Quaternion().setFromUnitVectors(
            this.camera.up,
            new THREE.Vector3(0, 1, 0)
        );
        const quatInverse = quat.clone().invert();

        const position = this.camera.position;
        offset.copy(position).sub(this.target);
        offset.applyQuaternion(quat);

        this.spherical.setFromVector3(offset);
        this.spherical.theta += this.sphericalDelta.theta;
        this.spherical.phi += this.sphericalDelta.phi;
        this.spherical.phi = Math.max(0.01, Math.min(Math.PI - 0.01, this.spherical.phi));
        this.spherical.radius *= this.scale;
        this.spherical.radius = Math.max(this.minDistance, Math.min(this.maxDistance, this.spherical.radius));

        this.target.add(this.panOffset);
        offset.setFromSpherical(this.spherical);
        offset.applyQuaternion(quatInverse);
        position.copy(this.target).add(offset);

        this.camera.lookAt(this.target);

        if (this.enableDamping) {
            this.sphericalDelta.theta *= (1 - this.dampingFactor);
            this.sphericalDelta.phi *= (1 - this.dampingFactor);
            this.panOffset.multiplyScalar(1 - this.dampingFactor);
        } else {
            this.sphericalDelta.set(0, 0, 0);
            this.panOffset.set(0, 0, 0);
        }

        this.scale = 1;
    }

    dispose() {
        this.domElement.removeEventListener('mousedown', (e) => this.onMouseDown(e));
        this.domElement.removeEventListener('mousemove', (e) => this.onMouseMove(e));
        this.domElement.removeEventListener('mouseup', (e) => this.onMouseUp(e));
        this.domElement.removeEventListener('wheel', (e) => this.onMouseWheel(e));
    }
}


class ThreeViewer {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        if (!this.container) {
            throw new Error(`Container element '${containerId}' not found`);
        }

        // Scene components
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.controls = null;

        // Point visualization
        this.pointsGroup = new THREE.Group();
        this.linesGroup = new THREE.Group();
        this.labelsGroup = new THREE.Group();
        this.points = [];

        // Color scheme for point types
        this.colors = {
            'BOUNDARY': 0x2196F3,      // Blue
            'HOLE_CENTER': 0xF44336,   // Red
            'LIVE': 0x4CAF50,          // Green
            'CIRCLE': 0xFF9800,        // Orange
            'PLANE': 0x9C27B0,         // Purple
            'LINE': 0x00BCD4,          // Cyan
            'DEFAULT': 0xFFFFFF        // White
        };

        this.init();
    }

    init() {
        // Create scene
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0xffffff);

        // Create camera
        const width = this.container.clientWidth;
        const height = this.container.clientHeight;
        this.camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 2000);
        this.camera.position.set(150, 150, 150);
        this.camera.lookAt(0, 0, 0);

        // Create renderer
        this.renderer = new THREE.WebGLRenderer({
            antialias: true,
            preserveDrawingBuffer: true // Required for screenshots
        });
        this.renderer.setSize(width, height);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.container.appendChild(this.renderer.domElement);

        // Add orbit controls
        this.controls = new SimpleOrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;
        this.controls.screenSpacePanning = true;
        this.controls.minDistance = 10;
        this.controls.maxDistance = 1000;

        // Add lights
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        this.scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(100, 100, 100);
        this.scene.add(directionalLight);

        // Add XYZ axes with thicker lines (Red=X, Green=Y, Blue=Z)
        const axisLength = 100;
        const axisRadius = 0.5; // 2x thicker than default

        // X-axis (Red)
        const xGeometry = new THREE.CylinderGeometry(axisRadius, axisRadius, axisLength, 8);
        const xMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
        const xAxis = new THREE.Mesh(xGeometry, xMaterial);
        xAxis.rotation.z = -Math.PI / 2;
        xAxis.position.x = axisLength / 2;
        this.scene.add(xAxis);

        // Y-axis (Green)
        const yGeometry = new THREE.CylinderGeometry(axisRadius, axisRadius, axisLength, 8);
        const yMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
        const yAxis = new THREE.Mesh(yGeometry, yMaterial);
        yAxis.position.y = axisLength / 2;
        this.scene.add(yAxis);

        // Z-axis (Blue)
        const zGeometry = new THREE.CylinderGeometry(axisRadius, axisRadius, axisLength, 8);
        const zMaterial = new THREE.MeshBasicMaterial({ color: 0x0000ff });
        const zAxis = new THREE.Mesh(zGeometry, zMaterial);
        zAxis.rotation.x = Math.PI / 2;
        zAxis.position.z = axisLength / 2;
        this.scene.add(zAxis);

        // Add grid on XY plane
        const gridHelper = new THREE.GridHelper(200, 20, 0xdddddd, 0xeeeeee);
        gridHelper.rotation.x = Math.PI / 2; // Rotate to XY plane
        this.scene.add(gridHelper);

        // Add groups to scene
        this.scene.add(this.pointsGroup);
        this.scene.add(this.linesGroup);
        this.scene.add(this.labelsGroup);

        // Handle window resize
        window.addEventListener('resize', () => this.onWindowResize());

        // Watch for container size changes (for resizable panels)
        this.resizeObserver = new ResizeObserver(() => {
            this.onWindowResize();
        });
        this.resizeObserver.observe(this.container);

        // Start animation loop
        this.animate();

        console.log('ThreeViewer initialized successfully');
    }

    onWindowResize() {
        const width = this.container.clientWidth;
        const height = this.container.clientHeight;

        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(width, height);
    }

    animate() {
        requestAnimationFrame(() => this.animate());
        this.controls.update();
        this.renderer.render(this.scene, this.camera);
    }

    getColor(pointType) {
        return this.colors[pointType] || this.colors['DEFAULT'];
    }

    addPoint(x, y, z, type = 'DEFAULT', pointNumber) {
        const point = { x, y, z, type, number: pointNumber };
        this.points.push(point);

        // Create sphere for point
        const geometry = new THREE.SphereGeometry(1.5, 16, 16);
        const material = new THREE.MeshPhongMaterial({
            color: this.getColor(type),
            emissive: this.getColor(type),
            emissiveIntensity: 0.2
        });
        const sphere = new THREE.Mesh(geometry, material);
        sphere.position.set(x, y, z);
        this.pointsGroup.add(sphere);

        // Create label for point number
        this.createLabel(x, y, z, pointNumber.toString());

        // Connect to previous point with line
        if (this.points.length > 1) {
            const prevPoint = this.points[this.points.length - 2];
            this.createLine(prevPoint, point);
        }

        console.log(`Added point ${pointNumber}: (${x.toFixed(2)}, ${y.toFixed(2)}, ${z.toFixed(2)}) - ${type}`);
    }

    createLine(point1, point2) {
        const geometry = new THREE.BufferGeometry().setFromPoints([
            new THREE.Vector3(point1.x, point1.y, point1.z),
            new THREE.Vector3(point2.x, point2.y, point2.z)
        ]);

        const material = new THREE.LineBasicMaterial({
            color: 0x888888,
            linewidth: 1
        });

        const line = new THREE.Line(geometry, material);
        this.linesGroup.add(line);
    }

    createLabel(x, y, z, text) {
        // Create canvas for text
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.width = 64;
        canvas.height = 64;

        // Draw text
        context.fillStyle = '#ffffff';
        context.font = 'Bold 32px Arial';
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        context.fillText(text, 32, 32);

        // Create texture from canvas
        const texture = new THREE.CanvasTexture(canvas);
        texture.needsUpdate = true;

        // Create sprite
        const spriteMaterial = new THREE.SpriteMaterial({
            map: texture,
            transparent: true,
            opacity: 0.8
        });
        const sprite = new THREE.Sprite(spriteMaterial);
        sprite.position.set(x, y, z + 5); // Offset above point
        sprite.scale.set(8, 8, 1);

        this.labelsGroup.add(sprite);
    }

    updatePoints(points) {
        // Clear existing visualization
        this.clear();

        // Add all points
        points.forEach((point, index) => {
            this.addPoint(point.x, point.y, point.z, point.type, point.number || index + 1);
        });

        // Auto-frame camera to show all points
        if (points.length > 0) {
            this.framePoints();
        }
    }

    framePoints() {
        if (this.points.length === 0) return;

        // Calculate bounding box
        const box = new THREE.Box3();
        this.pointsGroup.children.forEach(mesh => {
            box.expandByObject(mesh);
        });

        // Get center and size
        const center = box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3());
        const maxDim = Math.max(size.x, size.y, size.z);

        // Position camera
        const distance = maxDim * 2;
        this.camera.position.set(
            center.x + distance,
            center.y + distance,
            center.z + distance
        );
        this.controls.target.copy(center);
        this.controls.update();
    }

    resetView() {
        if (this.points.length > 0) {
            // Frame all points if they exist
            this.framePoints();
        } else {
            // Reset to default view if no points
            this.camera.position.set(150, 150, 150);
            this.controls.target.set(0, 0, 0);
            this.controls.update();
        }
    }

    clear() {
        // Remove all points, lines, and labels
        while (this.pointsGroup.children.length > 0) {
            const mesh = this.pointsGroup.children[0];
            mesh.geometry.dispose();
            mesh.material.dispose();
            this.pointsGroup.remove(mesh);
        }

        while (this.linesGroup.children.length > 0) {
            const line = this.linesGroup.children[0];
            line.geometry.dispose();
            line.material.dispose();
            this.linesGroup.remove(line);
        }

        while (this.labelsGroup.children.length > 0) {
            const sprite = this.labelsGroup.children[0];
            sprite.material.map.dispose();
            sprite.material.dispose();
            this.labelsGroup.remove(sprite);
        }

        this.points = [];
        console.log('3D viewer cleared');
    }

    saveScreenshot() {
        try {
            // Render current frame
            this.renderer.render(this.scene, this.camera);

            // Get image data
            const dataURL = this.renderer.domElement.toDataURL('image/png');

            // Create download link
            const link = document.createElement('a');
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            link.download = `3d-view-${timestamp}.png`;
            link.href = dataURL;
            link.click();

            console.log('Screenshot saved');
            return true;
        } catch (error) {
            console.error('Error saving screenshot:', error);
            return false;
        }
    }

    dispose() {
        // Clean up resources
        this.clear();
        this.controls.dispose();
        this.renderer.dispose();
        if (this.resizeObserver) {
            this.resizeObserver.disconnect();
        }
        window.removeEventListener('resize', () => this.onWindowResize());
        console.log('ThreeViewer disposed');
    }
}

module.exports = ThreeViewer;
