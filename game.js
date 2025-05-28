// Global game state variables
let scene, camera, renderer;
let components = [];
let energyParticles = [];
let sparkles = [];
let bridges = [];
let gridSize = 8;
let cellSize = 1;
let isSimulating = false;
let currentEnergyType = 'happy';
let goalReached = false;
let selectedTool = 'pipe';
let grid = [];
let currentLevel = 0;
let raycaster, mouse;
let highlightMesh;
let componentHint = null;
let currentTimeout = 5000; // 5 seconds
let lastGoalEnergy = 0;
let energyProgressCount = 0;

// Game initialization
function initGame() {
    // Initialize grid
    for (let y = 0; y < gridSize; y++) {
        grid[y] = new Array(gridSize).fill(null);
    }

    // Initialize Three.js scene
    initScene();

    // Initialize User Interface
    initUI();

    // Create component hint element
    componentHint = document.createElement('div');
    componentHint.className = 'component-hint';
    componentHint.style.display = 'none';
    document.body.appendChild(componentHint);

    // Load first level
    loadLevel(2);

    // Initialize input handlers
    initInput();

    // Initialize audio
    initAudio();

    // Start animation loop
    animate();
}

// Main game functions
function startSimulation() {
    if (isSimulating) return;
    
    // Output grid info to console
    debugGridConfig(); 
    
    isSimulating = true;
    goalReached = false;
    energyParticles = [];
    
    // Reset component states
    components.forEach(c => {
        c.energy = 0;
        c.updateMood('neutral', null);
        c.isBlocking = false;
        c.moodStability = 0;
        c.burnedOut = false;
        if (c.originalColor) {
            c.material.color.copy(c.originalColor);
        }
        if (c.type === 'goal') {
            c.updatePowerMeter();
        }
    });
    
    // Find source
    const source = components.find(c => c.type === 'source');
    if (source) {
        source.updateMood(currentEnergyType, currentEnergyType);
        
        // Dynamic timeout variables
        let lastGoalEnergy = 0;
        let energyProgressCount = 0;
        
        // Emit particles
        const emitInterval = setInterval(() => {
            if (!isSimulating) {
                clearInterval(emitInterval);
                return;
            }
            
            // Emit in all connected directions
            if (source.connections.top) {
                energyParticles.push(new EnergyParticle(source.x, source.y, 'up', currentEnergyType));
            }
            if (source.connections.bottom) {
                energyParticles.push(new EnergyParticle(source.x, source.y, 'down', currentEnergyType));
            }
            if (source.connections.left) {
                energyParticles.push(new EnergyParticle(source.x, source.y, 'left', currentEnergyType));
            }
            if (source.connections.right) {
                energyParticles.push(new EnergyParticle(source.x, source.y, 'right', currentEnergyType));
            }
            
            source.giggle();
            playSound('energyFlow', 0.1, 0.8 + Math.random() * 0.4);
        }, 1000);
        
        // Initial failure timeout (5 seconds)
        let failureTimeout = setTimeout(() => {
            clearInterval(emitInterval);
            clearInterval(checkInterval);
            isSimulating = false;
            
            if (!goalReached) {
                playSound('denied', 0.5);
                
                const goal = components.find(c => c.type === 'goal');
                if (goal && goal.energy > 0) {
                    showHint(`Almost there! The goal was ${Math.floor(goal.energy / goal.maxEnergy * 100)}% powered.`);
                } else {
                    showHint("No energy reached the goal. Check your connections!");
                }
            }
        }, 5000);
        
        // Check interval with dynamic timeout extension
        let checkInterval = setInterval(() => {
            const goal = components.find(c => c.type === 'goal');
            
            // If goal is receiving energy, extend the timeout
            if (goal && goal.energy > lastGoalEnergy) {
                clearTimeout(failureTimeout);
                lastGoalEnergy = goal.energy;
                energyProgressCount++;
                
                // Give 2 more seconds when progress is detected
                failureTimeout = setTimeout(() => {
                    clearInterval(emitInterval);
                    clearInterval(checkInterval);
                    isSimulating = false;
                    
                    if (!goalReached) {
                        playSound('denied', 0.5);
                        showHint(`Almost there! The goal was ${Math.floor(goal.energy / goal.maxEnergy * 100)}% powered.`);
                    }
                }, 2000);
            }
            
            if (goalReached || !isSimulating) {
                clearInterval(emitInterval);
                clearInterval(checkInterval);
                clearTimeout(failureTimeout);
                isSimulating = false;
                
                if (goalReached) {
                    // Victory animation
                    if (goal) {
                        goal.giggle();
                        goal.material.emissive.setHex(0x00ff00);
                        goal.material.emissiveIntensity = 0.8;
                    }
                    setTimeout(() => {
                        document.getElementById('victory').style.display = 'block';
                    }, 500);
                }
            }
        }, 100);
    }
}

function resetLevel() {
    isSimulating = false;
    energyParticles.forEach(p => p.destroy());
    energyParticles = [];
    sparkles.forEach(s => scene.remove(s));
    sparkles = [];
    bridges.forEach(b => {
        scene.remove(b.mesh);
    });
    bridges = [];

    // Clear all player-placed components
    components.forEach(c => {
        if (c.type !== 'source' && c.type !== 'goal') {
            c.destroy();
        } else {
            c.energy = 0;
            c.updateMood('neutral', null);
            c.isBlocking = false;
            c.burnedOut = false;
            if (c.originalColor) {
                c.material.color.copy(c.originalColor);
            }
            if (c.type === 'goal') {
                c.updatePowerMeter();
            }
        }
    });

    // Keep only source and goal
    components = components.filter(c =>
        c.type === 'source' || c.type === 'goal'
    );

    // Reload obstacles
    loadLevel(currentLevel);

    goalReached = false;
    document.getElementById('victory').style.display = 'none';
}

function changeEnergyType() {
    const level = levels[currentLevel];
    if (level.forcedEnergyType) {
        showHint(`This level requires ${level.forcedEnergyType} energy!`);
        return;
    }

    const types = ['happy', 'calm', 'excited'];
    const currentIndex = types.indexOf(currentEnergyType);
    currentEnergyType = types[(currentIndex + 1) % types.length];
    updateEnergyUI();
}

function nextLevel() {
    currentLevel = (currentLevel + 1) % levels.length;
    resetLevel();
    document.getElementById('victory').style.display = 'none';
}

function selectTool(tool) {
    selectedTool = tool;
    document.querySelectorAll('.tool').forEach(t => t.classList.remove('selected'));
    document.querySelector(`[data-type="${tool}"]`).classList.add('selected');
}

function loadLevel(levelIndex) {

    // Reset Goal State
    goalReached = false;
    console.log('Resetting goalReached');

    // Clear existing components
    components.forEach(c => c.destroy());
    components = [];

    // Clear obstacles
    for (let y = 0; y < gridSize; y++) {
        for (let x = 0; x < gridSize; x++) {
            if (grid[y][x] && grid[y][x].type === 'obstacle') {
                scene.remove(grid[y][x].mesh);
                grid[y][x] = null;
            }
        }
    }

    const level = levels[levelIndex];

    // Update level info
    document.getElementById('level-info').textContent = `Level ${levelIndex + 1}: ${level.name}`;

    // Set forced energy type if specified
    if (level.forcedEnergyType) {
        currentEnergyType = level.forcedEnergyType;
        updateEnergyUI();
    }

    // Create source
    const source = new Component(level.source.x, level.source.y, 'source');
    components.push(source);

    // Create goal
    const goal = new Component(level.goal.x, level.goal.y, 'goal');
    components.push(goal);

    // Create obstacles
    level.obstacles.forEach(([x, y]) => {
        const geometry = new THREE.BoxGeometry(0.8, 0.8, 0.3);
        const material = new THREE.MeshPhongMaterial({
            color: 0x222222
        });
        const obstacle = new THREE.Mesh(geometry, material);
        obstacle.position.set(
            x * cellSize - gridSize * cellSize / 2 + cellSize / 2,
            y * cellSize - gridSize * cellSize / 2 + cellSize / 2,
            0
        );
        scene.add(obstacle);

        // Mark grid cell as occupied
        grid[y][x] = {
            type: 'obstacle',
            mesh: obstacle
        };
    });

    // Show hint
    if (level.hint) {
        showHint(level.hint);
    }
}

// Animation loop
function animate() {
    requestAnimationFrame(animate);

    // if (energyParticles.length > 0) {
    //     console.log(`Active particles: ${energyParticles.length}`);
    // }

    // Update all particles first
    energyParticles.forEach(particle => particle.update());

    // Then filter out dead ones
    energyParticles = energyParticles.filter(particle => {
        if (particle.life <= 0.1) {
            particle.destroy();
            return false;
        }
        return true;
    });

    // Component animations
    components.forEach((comp, index) => {
        // Floating animation when energized
        if (comp.energy > 0) {
            comp.mesh.position.z = Math.sin(Date.now() * 0.002 + index) * 0.05;
        }

        // Update mood stability
        if (comp.moodStability > 0 && !isSimulating) {
            comp.moodStability -= 0.005;
            if (comp.moodStability <= 0) {
                comp.updateMood('neutral', null);
                comp.isBlocking = false;
            }
        }

        // Personality-specific animations
        if (comp.personality && comp.isBlocking) {
            // Subtle shake for blocked components
            comp.mesh.position.x += Math.sin(Date.now() * 0.01) * 0.005;
        }

        // Energy decay
        if (!isSimulating && comp.energy > 0) {
            comp.energy *= 0.98;
            if (comp.energy < 0.1) {
                comp.energy = 0;
                comp.material.emissiveIntensity = 0;
            }
        }
    });

    renderer.render(scene, camera);
}

function debugGridConfig() {
    console.log('=== GRID CONFIGURATION DEBUG ===');
    console.log(`Grid size: ${gridSize}x${gridSize}`);
    console.log(`Current level: ${currentLevel} - ${levels[currentLevel]?.name}`);
    console.log(`Current energy type: ${currentEnergyType}`);
    
    // Show all components
    console.log('\nComponents:');
    components.forEach(comp => {
        console.log(`  ${comp.type} at (${comp.x}, ${comp.y}) - connections:`, comp.connections);
    });
    
    // Show grid state
    console.log('\nGrid layout:');
    for (let y = gridSize - 1; y >= 0; y--) { // Start from top row
        let row = `Row ${y}: `;
        for (let x = 0; x < gridSize; x++) {
            const cell = grid[y][x];
            if (cell) {
                if (cell.type === 'source') row += 'S ';
                else if (cell.type === 'goal') row += 'G ';
                else if (cell.type === 'obstacle') row += 'X ';
                else if (cell.type === 'pipe') row += '| ';
                else if (cell.type === 'corner') row += 'L ';
                else if (cell.type === 'tjunction') row += 'T ';
                else if (cell.type === 'cross') row += '+ ';
                else row += `${cell.type[0].toUpperCase()} `;
            } else {
                row += '. ';
            }
        }
        console.log(row);
    }
    
    console.log('=== END GRID DEBUG ===\n');
}

// Initialize game when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    initGame();
});