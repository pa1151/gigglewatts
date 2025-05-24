// Three.js scene management
let debug = false;

function initScene() {
    // Scene setup
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0a2e);
    scene.fog = new THREE.Fog(0x0a0a2e, 10, 20);
    
    // Camera setup
    camera = new THREE.PerspectiveCamera(
        75,
        window.innerWidth / window.innerHeight,
        0.1,
        1000
    );
    camera.position.set(0, -3, 8);
    camera.lookAt(0, 0, 0);
    
    // Renderer setup
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    document.body.appendChild(renderer.domElement);
    
    // Initialize lighting
    setupLighting();
    
    // Initialize raycaster for mouse interaction
    raycaster = new THREE.Raycaster();
    mouse = new THREE.Vector2();
    
    // Create highlight mesh for grid interaction
    createHighlightMesh();
    
    // Create grid visual
    createGridVisual();

    if (debug) {
        // Add coordinate labels
        createGridLabels();    
    }

    // Handle window resize
    window.addEventListener('resize', onWindowResize);
}

function setupLighting() {
    // Ambient light for overall illumination
    const ambientLight = new THREE.AmbientLight(0x404040, 0.5);
    scene.add(ambientLight);
    
    // Main directional light with shadows
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(5, 5, 5);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    directionalLight.shadow.camera.near = 0.5;
    directionalLight.shadow.camera.far = 50;
    scene.add(directionalLight);
    
    // Mood lighting - point lights for atmosphere
    const happyLight = new THREE.PointLight(0xffd700, 0.5, 10);
    happyLight.position.set(-5, 0, 2);
    scene.add(happyLight);
    
    const calmLight = new THREE.PointLight(0x4169e1, 0.5, 10);
    calmLight.position.set(5, 0, 2);
    scene.add(calmLight);
    
    // Excited light with flickering effect
    const excitedLight = new THREE.PointLight(0xff6347, 0.3, 8);
    excitedLight.position.set(0, 5, 3);
    scene.add(excitedLight);
    
    // Animate the excited light for flickering effect
    setInterval(() => {
        excitedLight.intensity = 0.3 + Math.random() * 0.4;
    }, 200);
}

function createHighlightMesh() {
    // Create highlight mesh for grid cell selection
    const highlightGeometry = new THREE.BoxGeometry(0.9, 0.9, 0.05);
    const highlightMaterial = new THREE.MeshBasicMaterial({ 
        color: 0xffffff, 
        opacity: 0.3, 
        transparent: true 
    });
    highlightMesh = new THREE.Mesh(highlightGeometry, highlightMaterial);
    highlightMesh.visible = false;
    scene.add(highlightMesh);
}

function createGridVisual() {
    // Grid lines for visual reference
    const material = new THREE.LineBasicMaterial({ 
        color: 0x444444,
        transparent: true,
        opacity: 0.3
    });
    
    const gridGroup = new THREE.Group();
    
    for (let i = 0; i <= gridSize; i++) {
        // Horizontal lines
        const hGeometry = new THREE.BufferGeometry().setFromPoints([
            new THREE.Vector3(-gridSize * cellSize / 2, i * cellSize - gridSize * cellSize / 2, -0.1),
            new THREE.Vector3(gridSize * cellSize / 2, i * cellSize - gridSize * cellSize / 2, -0.1)
        ]);
        const hLine = new THREE.Line(hGeometry, material);
        gridGroup.add(hLine);
        
        // Vertical lines
        const vGeometry = new THREE.BufferGeometry().setFromPoints([
            new THREE.Vector3(i * cellSize - gridSize * cellSize / 2, -gridSize * cellSize / 2, -0.1),
            new THREE.Vector3(i * cellSize - gridSize * cellSize / 2, gridSize * cellSize / 2, -0.1)
        ]);
        const vLine = new THREE.Line(vGeometry, material);
        gridGroup.add(vLine);
    }
    
    scene.add(gridGroup);
}

function onWindowResize() {
    // Update camera aspect ratio
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    
    // Update renderer size
    renderer.setSize(window.innerWidth, window.innerHeight);
    
    // Trigger a render
    renderer.render(scene, camera);
}

// Utility functions for scene management
function addToScene(object) {
    scene.add(object);
}

function removeFromScene(object) {
    scene.remove(object);
}

function renderScene() {
    renderer.render(scene, camera);
}

// Camera animation utilities
function animateCamera(targetPosition, targetLookAt, duration = 1000) {
    const startPosition = camera.position.clone();
    const startLookAt = new THREE.Vector3(0, 0, 0); // Current look at
    const startTime = Date.now();
    
    const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Smooth easing
        const easeProgress = progress * progress * (3 - 2 * progress);
        
        // Interpolate position
        camera.position.lerpVectors(startPosition, targetPosition, easeProgress);
        
        // Interpolate look at
        const currentLookAt = new THREE.Vector3().lerpVectors(startLookAt, targetLookAt, easeProgress);
        camera.lookAt(currentLookAt);
        
        if (progress < 1) {
            requestAnimationFrame(animate);
        }
    };
    
    animate();
}

// Scene effects
function flashScene(color = 0xffffff, intensity = 0.5, duration = 200) {
    const originalColor = scene.background.clone();
    scene.background.setHex(color);
    
    setTimeout(() => {
        scene.background.copy(originalColor);
    }, duration);
}

function shakeCamera(intensity = 0.1, duration = 500) {
    const originalPosition = camera.position.clone();
    const startTime = Date.now();
    
    const shake = () => {
        const elapsed = Date.now() - startTime;
        if (elapsed < duration) {
            const progress = elapsed / duration;
            const currentIntensity = intensity * (1 - progress);
            
            camera.position.x = originalPosition.x + (Math.random() - 0.5) * currentIntensity;
            camera.position.y = originalPosition.y + (Math.random() - 0.5) * currentIntensity;
            camera.position.z = originalPosition.z + (Math.random() - 0.5) * currentIntensity;
            
            requestAnimationFrame(shake);
        } else {
            camera.position.copy(originalPosition);
        }
    };
    
    shake();
}

function createGridLabels() {
    const labelGroup = new THREE.Group();
    
    for (let x = 0; x < gridSize; x++) {
        for (let y = 0; y < gridSize; y++) {
            // Create canvas for coordinate text
            const canvas = document.createElement('canvas');
            canvas.width = 128;
            canvas.height = 64;
            const ctx = canvas.getContext('2d');
            
            ctx.font = 'bold 24px Arial';
            ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
            ctx.strokeStyle = 'rgba(0, 0, 0, 0.8)';
            ctx.lineWidth = 2;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            
            // Draw text with outline for better visibility
            ctx.strokeText(`${x},${y}`, 64, 32);
            ctx.fillText(`${x},${y}`, 64, 32);
            
            const texture = new THREE.CanvasTexture(canvas);
            const spriteMaterial = new THREE.SpriteMaterial({ 
                map: texture,
                transparent: true,
                depthTest: false  // This makes it always render on top
            });
            const sprite = new THREE.Sprite(spriteMaterial);
            
            // Position the label above components
            const worldPos = gridToWorldPosition(x, y);
            sprite.position.set(worldPos.x, worldPos.y, 0.5); // Well above components
            sprite.scale.set(0.8, 0.4, 1); // Larger scale
            
            labelGroup.add(sprite);
        }
    }
    
    scene.add(labelGroup);
    return labelGroup;
}