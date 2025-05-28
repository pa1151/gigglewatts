// energy-particle.js
// Enhanced Energy particle class with improved performance and features
class EnergyParticle {
    constructor(x, y, direction, type) {
        this.gridX = x;
        this.gridY = y;
        this.direction = direction;
        this.type = type;
        this.life = 1.0;
        this.progress = 0;
        this.trail = [];
        this.id = Math.random().toString(36).substr(2, 9); // Unique ID for debugging

        // Create mesh with optimized geometry
        this.createMesh();
        this.updateWorldPosition();
        scene.add(this.mesh);

        // Add particle effects based on type
        this.createParticleEffects();

        // Improved logging with particle ID
        this.log(`Created at (${x}, ${y}) going ${direction}`);
    }

    createMesh() {
        // Use shared geometry for better performance
        const geometry = EnergyParticle.getSharedGeometry();
        const material = new THREE.MeshPhongMaterial({
            color: energyTypes[this.type].color,
            emissive: energyTypes[this.type].color,
            emissiveIntensity: 0.8,
            transparent: true,
            opacity: 1.0
        });

        this.mesh = new THREE.Mesh(geometry, material);
    }

    // Static method for shared geometry (performance optimization)
    static getSharedGeometry() {
        if (!EnergyParticle._sharedGeometry) {
            EnergyParticle._sharedGeometry = new THREE.SphereGeometry(0.12, 12, 12);
        }
        return EnergyParticle._sharedGeometry;
    }

    createParticleEffects() {
        switch (this.type) {
            case 'happy':
                this.bounceOffset = Math.random() * Math.PI * 2;
                this.bounceFrequency = 0.01 + Math.random() * 0.005; // Varied bounce speed
                break;
            case 'excited':
                this.jitterAmount = 0.05;
                this.jitterFrequency = 0.1 + Math.random() * 0.1; // Varied jitter
                break;
            case 'calm':
                this.pulseOffset = Math.random() * Math.PI * 2;
                this.pulseFrequency = 0.005; // Slow, calm pulsing
                break;
        }
    }

    updateWorldPosition() {
        const basePos = gridToWorldPosition(this.gridX, this.gridY);
        
        // Calculate movement offset based on progress
        const offset = this.calculateMovementOffset();
        
        // Calculate type-specific effects
        const effects = this.calculateTypeEffects();
        
        // Apply position
        this.mesh.position.set(
            basePos.x + offset.x + effects.x,
            basePos.y + offset.y + effects.y,
            0.2 + effects.z
        );

        // Handle type-specific visual effects
        this.handleVisualEffects();
    }

    calculateMovementOffset() {
        const distance = this.progress * cellSize;
        const offset = { x: 0, y: 0 };
        
        switch (this.direction) {
            case 'up': offset.y = distance; break;
            case 'down': offset.y = -distance; break;
            case 'left': offset.x = -distance; break;
            case 'right': offset.x = distance; break;
        }
        
        return offset;
    }

    calculateTypeEffects() {
        const effects = { x: 0, y: 0, z: 0 };
        const time = Date.now();
        
        switch (this.type) {
            case 'happy':
                effects.z = Math.sin(time * this.bounceFrequency + this.bounceOffset) * 0.1;
                break;
            case 'excited':
                if (Math.random() < this.jitterFrequency) {
                    effects.x = (Math.random() - 0.5) * this.jitterAmount;
                    effects.y = (Math.random() - 0.5) * this.jitterAmount;
                }
                break;
            case 'calm':
                const pulse = Math.sin(time * this.pulseFrequency + this.pulseOffset);
                effects.z = pulse * 0.02; // Gentle vertical movement
                this.mesh.scale.setScalar(1 + pulse * 0.1); // Gentle scaling
                break;
        }
        
        return effects;
    }

    handleVisualEffects() {
        // Create trails and sparkles based on type and probability
        switch (this.type) {
            case 'happy':
                if (Math.random() < 0.2) { // Reduced frequency for performance
                    createMiniSparkle(this.mesh.position.x, this.mesh.position.y, this.mesh.position.z);
                }
                break;
            case 'excited':
                if (Math.random() < 0.1) {
                    createEnergyBurst(this.mesh.position.x, this.mesh.position.y, this.mesh.position.z);
                }
                break;
        }
    }

    update(deltaTime = 0.016) { // Accept deltaTime for frame-rate independent animation
        // Update life and progress
        this.life *= Math.pow(energyTypes[this.type].decay, deltaTime * 60); // Frame-rate independent decay
        this.progress += energyTypes[this.type].speed * deltaTime * 60;

        // Update visual properties
        this.updateVisuals();
        this.updateWorldPosition();

        // Check if reached next cell
        if (this.progress >= 1) {
            this.moveToNextCell();
            this.progress = 0;
        }

        // Return whether particle should continue existing
        return this.life > 0.1;
    }

    updateVisuals() {
        // Update scale and opacity based on life
        const scale = this.life;
        this.mesh.scale.set(scale, scale, scale);
        this.mesh.material.opacity = this.life;

        // Rotate for visual interest (frame-rate independent)
        this.mesh.rotation.x += 0.05;
        this.mesh.rotation.y += 0.03;
    }

    moveToNextCell() {
        const nextPos = getNextGridPosition(this.gridX, this.gridY, this.direction);
        
        this.log(`Moving ${this.direction} from (${this.gridX}, ${this.gridY}) to (${nextPos.x}, ${nextPos.y})`);
        
        // Comprehensive bounds checking
        if (!this.isValidMove(nextPos)) {
            this.handleBoundaryHit();
            return;
        }

        // Handle cell content
        const cellContent = getGridCell(nextPos.x, nextPos.y);
        if (cellContent) {
            this.handleCellContent(cellContent, nextPos);
        } else {
            this.handleEmptySpace(nextPos);
        }
    }

    isValidMove(pos) {
        return isValidGridPosition(pos.x, pos.y);
    }

    handleBoundaryHit() {
        this.log(`Hit boundary, dying`);
        this.life = 0;
    }

    handleCellContent(cellContent, nextPos) {
        if (cellContent.type === 'obstacle') {
            this.handleObstacle(cellContent, nextPos);
        } else {
            this.handleComponent(cellContent, nextPos);
        }
    }

    handleObstacle(obstacle, nextPos) {
        // Check if calm energy can bridge over obstacle
        if (this.type === 'calm' && energyTypes.calm.canBridge) {
            this.createBridgeAndContinue(nextPos);
            return;
        }
        
        // Excited energy can power through obstacles
        if (this.canPowerThrough()) {
            this.powerThroughObstacle(nextPos);
        } else {
            this.log(`Blocked by obstacle at (${nextPos.x}, ${nextPos.y})`);
            this.life = 0;
        }
    }

    canPowerThrough() {
        return this.type === 'excited' && 
               energyTypes.excited.canPowerThrough && 
               Math.random() < 0.3;
    }

    powerThroughObstacle(nextPos) {
        this.life *= 0.5;
        this.gridX = nextPos.x;
        this.gridY = nextPos.y;
        
        const worldPos = gridToWorldPosition(nextPos.x, nextPos.y);
        createExplosion(worldPos.x, worldPos.y);
        this.log(`Powered through obstacle!`);
    }

    handleComponent(component, nextPos) {
        const enterDirection = getOppositeDirection(this.direction);
        
        if (component.canConnect(enterDirection, this.type)) {
            this.enterComponent(component, nextPos);
        } else {
            this.log(`Cannot enter ${component.type} from ${enterDirection}`);
            this.life = 0;
        }
    }

    enterComponent(component, nextPos) {
        // Calculate energy transfer based on particle type
        const energyTransfer = this.calculateEnergyTransfer();
        component.energy = Math.min(component.energy + energyTransfer, component.maxEnergy);
        
        this.log(`Entering ${component.type}, transferring ${energyTransfer.toFixed(2)} energy`);
        
        // Update component mood and handle special cases
        component.updateMood(this.type, this.type);
        this.handleSpecialComponentEffects(component, nextPos);
        
        // Goal components absorb particles - don't route through them
        if (component.type === 'goal') {
            this.log(`Absorbed by goal component`);
            this.life = 0; // Particle stops here
            return;
        }
        
        // Route through the component for non-goal components
        this.routeThrough(component, nextPos.x, nextPos.y);
    }

    calculateEnergyTransfer() {
        const baseTransfer = {
            'excited': 0.3,
            'happy': 0.25,
            'calm': 0.15
        };
        return baseTransfer[this.type] || 0.2;
    }

    handleSpecialComponentEffects(component, nextPos) {
        // Handle goal component
        if (component.type === 'goal') {
            this.handleGoalComponent(component);
        }
        
        // Handle burnout risk
        if (this.shouldCheckBurnout(component)) {
            this.checkComponentBurnout(component);
        }
    }

    handleGoalComponent(component) {
        this.log(`Goal energy: ${component.energy.toFixed(2)}/${component.maxEnergy}`);
        component.updatePowerMeter();
        
        if (component.energy >= component.maxEnergy * 0.95) {
            this.log("GOAL REACHED!");
            goalReached = true;
        }
    }

    shouldCheckBurnout(component) {
        return component.type !== 'goal' && 
               component.type !== 'source' &&
               this.type === 'excited' && 
               component.energy > 0.9;
    }

    checkComponentBurnout(component) {
        if (Math.random() < 0.3) {
            component.burnedOut = true;
            component.material.color.setHex(0x222222);
            component.material.emissive.setHex(0x440000);
            component.material.emissiveIntensity = 0.5;
            
            const worldPos = gridToWorldPosition(component.x, component.y);
            createExplosion(worldPos.x, worldPos.y);
            playSound('burnout', 0.5);
            
            this.log(`Component burned out!`);
        }
    }

    handleEmptySpace(nextPos) {
        if (this.canCreateBridge()) {
            this.createBridgeAndContinue(nextPos);
        } else if (this.canUseBridge(nextPos)) {
            this.useBridge(nextPos);
        } else {
            this.log(`No path available at (${nextPos.x}, ${nextPos.y})`);
            this.life = 0;
        }
    }

    canCreateBridge() {
        return this.type === 'calm' && energyTypes.calm.canBridge;
    }

    createBridgeAndContinue(nextPos) {
        createBridge(nextPos.x, nextPos.y);
        this.gridX = nextPos.x;
        this.gridY = nextPos.y;
        this.log(`Created bridge at (${nextPos.x}, ${nextPos.y})`);
    }

    canUseBridge(nextPos) {
        return bridges.find(b => b.x === nextPos.x && b.y === nextPos.y && b.active);
    }

    useBridge(nextPos) {
        this.gridX = nextPos.x;
        this.gridY = nextPos.y;
        this.log(`Using bridge at (${nextPos.x}, ${nextPos.y})`);
    }

    routeThrough(component, x, y) {
        const availableExits = this.findAvailableExits(component);
        
        if (availableExits.length === 0) {
            this.log(`No exits available from ${component.type}`);
            this.life = 0;
            return;
        }

        this.handleRouting(component, availableExits, x, y);
    }

    findAvailableExits(component) {
        const exits = [];
        const entryDir = getOppositeDirection(this.direction);
        
        const connectionMap = {
            'up': 'top',
            'down': 'bottom',
            'left': 'left',
            'right': 'right'
        };

        Object.entries(connectionMap).forEach(([direction, connection]) => {
            if (component.connections[connection] && entryDir !== connection) {
                exits.push(direction);
            }
        });

        this.log(`Available exits from ${component.type}: [${exits.join(', ')}]`);
        return exits;
    }

    handleRouting(component, exits, x, y) {
        const shouldSplit = this.shouldSplitPath(component, exits);
        
        if (shouldSplit) {
            this.splitIntoMultiplePaths(exits, x, y);
        } else {
            this.continueInSingleDirection(exits[0], x, y);
        }
    }

    shouldSplitPath(component, exits) {
        return (component.type === 'cross') || 
               (this.type === 'happy' && energyTypes.happy.canSpreadJoy && exits.length > 1);
    }

    splitIntoMultiplePaths(exits, x, y) {
        this.log(`Splitting into ${exits.length} paths`);
        
        exits.forEach((dir, index) => {
            if (index === 0) {
                // Current particle continues in first direction
                this.direction = dir;
                this.gridX = x;
                this.gridY = y;
            } else {
                // Create new particles for other directions
                const newParticle = new EnergyParticle(x, y, dir, this.type);
                newParticle.life = this.life;
                newParticle.progress = 0;
                energyParticles.push(newParticle);
                newParticle.log(`Split particle created going ${dir}`);
            }
        });
    }

    continueInSingleDirection(direction, x, y) {
        this.direction = direction;
        this.gridX = x;
        this.gridY = y;
        this.log(`Continuing ${direction}`);
    }

    // Improved logging with particle ID and timestamp
    log(message) {
        if (window.DEBUG_PARTICLES) {
            console.log(`[${this.type.toUpperCase()}-${this.id}] ${message}`);
        }
    }

    destroy() {
        if (this.mesh) {
            scene.remove(this.mesh);
            
            // Dispose of material to prevent memory leaks
            if (this.mesh.material) {
                this.mesh.material.dispose();
            }
            
            this.mesh = null;
        }
        
        this.log(`Destroyed`);
    }
}

// Enable debug logging by setting this to true
window.DEBUG_PARTICLES = false;