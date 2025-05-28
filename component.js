// Component class with personalities
class Component {
    constructor(x, y, type) {
        this.x = x;
        this.y = y;
        this.type = type;
        this.rotation = 0;
        this.energy = 0;
        this.mood = 'neutral';
        this.personality = componentPersonalities[type] || null;
        this.connections = this.getDefaultConnections();
        this.isBlocking = false;
        this.moodStability = 0;
        this.maxEnergy = this.type === 'goal' ? 2.0 : 1.0;
        this.burnedOut = false;
        
        // Create 3D representation
        this.createMesh();
        this.updatePosition();
        
        // Add to grid
        grid[this.y][this.x] = this;
    }
    
    getDefaultConnections() {
        switch(this.type) {
            case 'source':
                return { top: true, right: false, bottom: false, left: false };
            case 'pipe':
                return { top: true, right: false, bottom: true, left: false };
            case 'corner':
                return { top: true, right: true, bottom: false, left: false };
            case 'tjunction':
                return { top: false, right: true, bottom: true, left: true };
            case 'cross':
                return { top: true, right: true, bottom: true, left: true };
            case 'nervous':
                return { top: true, right: false, bottom: true, left: false };
            case 'sleepy':
                return { top: true, right: false, bottom: true, left: false };
            case 'grumpy':
                return { top: true, right: false, bottom: true, left: false };
            case 'goal':
                return { top: true, right: true, bottom: true, left: true };
            default:
                return { top: false, right: false, bottom: false, left: false };
        }
    }
    
    createMesh() {
        const group = new THREE.Group();
        
        // Base
        const geometry = new THREE.BoxGeometry(0.8, 0.8, 0.3);
        let material;
        
        switch(this.type) {
            case 'source':
                material = new THREE.MeshPhongMaterial({ color: 0xffa500 });
                break;
            case 'goal':
                material = new THREE.MeshPhongMaterial({ color: 0x1a4d1a });
                break;
            case 'nervous':
                material = new THREE.MeshPhongMaterial({ color: 0xa0a0ff });
                break;
            case 'sleepy':
                material = new THREE.MeshPhongMaterial({ color: 0x9090b0 });
                break;
            case 'grumpy':
                material = new THREE.MeshPhongMaterial({ color: 0xcc7777 });
                break;
            default:
                material = new THREE.MeshPhongMaterial({ color: 0x808080 });
        }
        
        const base = new THREE.Mesh(geometry, material);
        base.castShadow = true;
        base.receiveShadow = true;
        group.add(base);
        
        // Store material reference
        this.material = material;
        this.originalColor = material.color.clone();
        
        // Add face or emoji
        if (this.personality) {
            this.createEmoji(group);
        } else {
            this.createFace(group);
        }
        
        // Add connection visuals
        this.createConnectionVisuals(group);
        
        // Add power meter for goal
        if (this.type === 'goal') {
            this.createPowerMeter(group);
        }
        
        this.mesh = group;
        scene.add(this.mesh);
    }
    
    createPowerMeter(group) {
        // Create power meter background
        const meterBg = new THREE.BoxGeometry(0.1, 0.6, 0.05);
        const meterBgMaterial = new THREE.MeshPhongMaterial({ color: 0x333333 });
        const meterBgMesh = new THREE.Mesh(meterBg, meterBgMaterial);
        meterBgMesh.position.set(0.5, 0, 0.1);
        group.add(meterBgMesh);
        
        // Create power meter fill
        const meterFill = new THREE.BoxGeometry(0.08, 0.01, 0.06);
        const meterFillMaterial = new THREE.MeshPhongMaterial({ 
            color: 0x00ff00,
            emissive: 0x00ff00,
            emissiveIntensity: 0.3
        });
        this.powerMeterFill = new THREE.Mesh(meterFill, meterFillMaterial);
        this.powerMeterFill.position.set(0.5, -0.29, 0.11);
        group.add(this.powerMeterFill);
    }
    
    updatePowerMeter() {
        if (!this.powerMeterFill) return;
        
        const previousFill = this.powerMeterFill.scale.y * 0.01 / 0.58;
        const fillAmount = Math.min(this.energy / this.maxEnergy, 1.0);
        const newHeight = 0.58 * fillAmount;
        
        // Update geometry
        this.powerMeterFill.scale.y = newHeight / 0.01;
        this.powerMeterFill.position.y = -0.29 + (newHeight / 2);
        
        // Update color based on fill level
        const green = fillAmount;
        const red = 1 - fillAmount;
        this.powerMeterFill.material.color.setRGB(red * 0.5, green, 0);
        this.powerMeterFill.material.emissive.setRGB(red * 0.5, green, 0);
        
        // Also update base color for goal
        if (this.type === 'goal') {
            const baseGreen = 0.1 + (0.7 * fillAmount);
            this.material.color.setRGB(0.1, baseGreen, 0.1);
            
            // Play power up sound at milestones
            if (previousFill < 0.25 && fillAmount >= 0.25) {
                playSound('powerUp', 0.3, 0.8);
            } else if (previousFill < 0.5 && fillAmount >= 0.5) {
                playSound('powerUp', 0.4, 1.0);
                this.giggle();
            } else if (previousFill < 0.75 && fillAmount >= 0.75) {
                playSound('powerUp', 0.5, 1.2);
                this.giggle();
            } else if (previousFill < 0.95 && fillAmount >= 0.95) {
                playSound('success', 0.6, 1.0);
                this.giggle();
            }
        }
    }
    
    createEmoji(group) {
        // Create canvas for emoji
        const canvas = document.createElement('canvas');
        canvas.width = 128;
        canvas.height = 128;
        const ctx = canvas.getContext('2d');
        
        ctx.font = '80px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(this.personality.emoji, 64, 64);
        
        const texture = new THREE.CanvasTexture(canvas);
        const spriteMaterial = new THREE.SpriteMaterial({ map: texture });
        const sprite = new THREE.Sprite(spriteMaterial);
        sprite.scale.set(0.75, 0.75, 1);
        sprite.position.z = 0.2;
        group.add(sprite);
        
        this.emojiSprite = sprite;
    }
    
    createFace(group) {
        // Eyes
        const eyeGeometry = new THREE.SphereGeometry(0.05, 8, 8);
        const eyeMaterial = new THREE.MeshPhongMaterial({ color: 0x000000 });
        
        this.leftEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
        this.leftEye.position.set(-0.15, 0.1, 0.16);
        group.add(this.leftEye);
        
        this.rightEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
        this.rightEye.position.set(0.15, 0.1, 0.16);
        group.add(this.rightEye);
        
        // Mouth (changes with mood)
        const mouthCurve = new THREE.CatmullRomCurve3([
            new THREE.Vector3(-0.15, -0.1, 0.16),
            new THREE.Vector3(0, -0.15, 0.16),
            new THREE.Vector3(0.15, -0.1, 0.16)
        ]);
        
        const mouthGeometry = new THREE.TubeGeometry(mouthCurve, 20, 0.02, 8, false);
        this.mouth = new THREE.Mesh(mouthGeometry, eyeMaterial);
        group.add(this.mouth);
    }
    
    createConnectionVisuals(group) {
        const pipeGeometry = new THREE.BoxGeometry(0.2, 0.5, 0.15);
        const pipeMaterial = new THREE.MeshPhongMaterial({ color: 0xcccccc });
        
        this.connectionMeshes = {};
        
        if (this.connections.top) {
            const pipe = new THREE.Mesh(pipeGeometry, pipeMaterial.clone());
            pipe.position.set(0, 0.4, 0);
            group.add(pipe);
            this.connectionMeshes.top = pipe;
        }
        if (this.connections.bottom) {
            const pipe = new THREE.Mesh(pipeGeometry, pipeMaterial.clone());
            pipe.position.set(0, -0.4, 0);
            group.add(pipe);
            this.connectionMeshes.bottom = pipe;
        }
        if (this.connections.left) {
            const pipe = new THREE.Mesh(pipeGeometry, pipeMaterial.clone());
            pipe.rotation.z = Math.PI / 2;
            pipe.position.set(-0.4, 0, 0);
            group.add(pipe);
            this.connectionMeshes.left = pipe;
        }
        if (this.connections.right) {
            const pipe = new THREE.Mesh(pipeGeometry, pipeMaterial.clone());
            pipe.rotation.z = Math.PI / 2;
            pipe.position.set(0.4, 0, 0);
            group.add(pipe);
            this.connectionMeshes.right = pipe;
        }
    }
    
    updatePosition() {
        const worldPos = gridToWorldPosition(this.x, this.y);
        this.mesh.position.set(worldPos.x, worldPos.y, worldPos.z);
    }
    
    rotate() {
        if (this.type === 'source' || this.type === 'goal') return;
        console.log(`Component:  ${this.type} \n Angle: ${this.rotation}`)
        
        this.rotation = (this.rotation + 90) % 360;
        this.mesh.rotation.z = this.rotation * Math.PI / 180;
        
        // Rotate connections
        const temp = this.connections.top;
        this.connections.top = this.connections.right;
        this.connections.right = this.connections.bottom;
        this.connections.bottom = this.connections.left;
        this.connections.left = temp;
        
        // Update connection mesh references
        const tempMesh = this.connections.top;
        this.connections.top = this.connections.right;
        this.connections.right = this.connections.bottom;
        this.connections.bottom = this.connections.left;
        this.connections.left = tempMesh;
        
        // Giggle animation
        this.giggle();
        playSound('rotate');
    }
    
    giggle() {
        const timeline = [];
        for (let i = 0; i < 10; i++) {
            timeline.push({
                scale: 1 + Math.sin(i * 0.5) * 0.1,
                rotation: Math.sin(i * 0.3) * 0.1
            });
        }
        
        // Play giggle sound for happy components
        if (this.mood === 'happy' || this.type === 'source') {
            console.log('playing random happy giggle');
            
            const giggleVariant = 'giggle' + (1 + Math.floor(Math.random() * 3)); // "giggle1", "giggle2", or "giggle3"
            playSound(giggleVariant, 0.3, 0.9 + Math.random() * 0.4);
        }
        
        let frame = 0;
        const animate = () => {
            if (frame < timeline.length) {
                this.mesh.scale.set(timeline[frame].scale, timeline[frame].scale, 1);
                this.mesh.rotation.y = timeline[frame].rotation;
                frame++;
                setTimeout(animate, 50);
            } else {
                this.mesh.scale.set(1, 1, 1);
                this.mesh.rotation.y = 0;
            }
        };
        animate();
    }
    
    updateMood(mood, particleType = null) {
        this.mood = mood;
        this.moodStability = 1.0;
        
        // Handle neutral mood
        if (mood === 'neutral' || !particleType) {
            this.isBlocking = false;
            this.material.emissive = new THREE.Color(0x000000);
            this.material.emissiveIntensity = 0;
            return;
        }
        
        // Check personality requirements
        if (this.personality) {
            if (particleType === this.personality.requiredMood) {
                this.isBlocking = false;
                this.material.emissive = new THREE.Color(energyTypes[particleType].color);
                this.material.emissiveIntensity = 0.5;
                
                // Happy wiggle with sound
                this.giggle();
                
                // Play personality success sound
                if (this.type === 'nervous') {
                    playSound('calmHum', 0.4);
                } else if (this.type === 'sleepy') {
                    playSound('excitedZap', 0.3);
                } else if (this.type === 'grumpy') {
                    playSound('happyChime', 0.4);
                }
            } else {
                this.isBlocking = true;
                this.material.emissive = new THREE.Color(0xff0000);
                this.material.emissiveIntensity = 0.3;
                
                // Shake head "no" with sound
                this.shakeNo();
                playSound('denied', 0.3);
                
                // Play personality complaint sound
                if (this.type === 'nervous') {
                    playSound('nervousWhimper', 0.4);
                } else if (this.type === 'sleepy') {
                    playSound('sleepyYawn', 0.4);
                } else if (this.type === 'grumpy') {
                    playSound('grumpyGrumble', 0.4);
                }
            }
        } else {
            // Regular components
            this.material.emissive = new THREE.Color(energyTypes[particleType].color);
            this.material.emissiveIntensity = 0.3;
            
            // Play energy type sound
            if (particleType === 'happy') {
                playSound('happyChime', 0.1, 1.0);
            } else if (particleType === 'calm') {
                playSound('calmHum', 0.2, 0.8);
            } else if (particleType === 'excited') {
                playSound('excitedZap', 0.2, 1.5);
            }
        }
        
        // Special effects for energy types
        if (particleType === 'happy' && energyTypes.happy.canSpreadJoy) {
            this.spreadJoyToNeighbors();
        }
    }
    
    shakeNo() {
        let shakes = 0;
        const shakeInterval = setInterval(() => {
            this.mesh.rotation.y = Math.sin(shakes * 0.5) * 0.2;
            shakes++;
            if (shakes > 10) {
                clearInterval(shakeInterval);
                this.mesh.rotation.y = 0;
            }
        }, 50);
    }
    
    spreadJoyToNeighbors() {
        // Check all adjacent cells
        const neighbors = [
            { x: this.x + 1, y: this.y },
            { x: this.x - 1, y: this.y },
            { x: this.x, y: this.y + 1 },
            { x: this.x, y: this.y - 1 }
        ];
        
        neighbors.forEach(n => {
            if (isValidGridPosition(n.x, n.y)) {
                const neighbor = getGridCell(n.x, n.y);
                if (neighbor && neighbor.type !== 'obstacle' && neighbor.mood !== 'happy') {
                    // Create sparkle effect
                    const thisWorldPos = gridToWorldPosition(this.x, this.y);
                    const neighborWorldPos = gridToWorldPosition(n.x, n.y);
                    createSparkle(
                        thisWorldPos.x,
                        thisWorldPos.y,
                        neighborWorldPos.x,
                        neighborWorldPos.y
                    );
                    
                    setTimeout(() => {
                        if (neighbor.mood !== 'happy') {
                            neighbor.updateMood('happy', 'happy');
                        }
                    }, 300);
                }
            }
        });
    }
    
    canConnect(direction, energyType = null) {
        // Special case: nervous components allow calm energy even when blocking
        if (this.type === 'nervous' && energyType === 'calm') {
            return this.connections[direction];
        }
        
        if (this.isBlocking || this.burnedOut) return false;
        return this.connections[direction];
    }
    
    destroy() {
        scene.remove(this.mesh);
        if (grid[this.y] && grid[this.y][this.x] === this) {
            grid[this.y][this.x] = null;
        }
    }
}