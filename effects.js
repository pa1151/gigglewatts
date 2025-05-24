// Visual effects system

// Bridge class for calm energy
class Bridge {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.active = true;
        
        const geometry = new THREE.PlaneGeometry(0.6, 0.6);
        const material = new THREE.MeshBasicMaterial({
            color: 0x4169e1,
            transparent: true,
            opacity: 0.3,
            side: THREE.DoubleSide
        });
        
        this.mesh = new THREE.Mesh(geometry, material);
        const worldPos = gridToWorldPosition(x, y);
        this.mesh.position.set(worldPos.x, worldPos.y, -0.05);
        this.mesh.rotation.x = -Math.PI / 2;
        scene.add(this.mesh);
        
        // Fade out after duration
        setTimeout(() => {
            this.fadeOut();
        }, energyTypes.calm.bridgeDuration);
    }
    
    fadeOut() {
        const fadeInterval = setInterval(() => {
            this.mesh.material.opacity -= 0.02;
            if (this.mesh.material.opacity <= 0) {
                clearInterval(fadeInterval);
                this.active = false;
                scene.remove(this.mesh);
                removeFromArray(bridges, this);
            }
        }, 50);
    }
}

// Helper functions for creating effects
function createBridge(x, y) {
    // Check if bridge already exists
    const existingBridge = bridges.find(b => b.x === x && b.y === y && b.active);
    if (!existingBridge) {
        bridges.push(new Bridge(x, y));
        playSound('calmHum', 0.2, 0.6);
    }
}

function createSparkle(x1, y1, x2, y2) {
    const geometry = new THREE.SphereGeometry(0.05, 6, 6);
    const material = new THREE.MeshBasicMaterial({ 
        color: 0xffff00, 
        transparent: true,
        opacity: 0.8
    });
    const sparkle = new THREE.Mesh(geometry, material);
    sparkle.position.set(x1, y1, 0.3);
    scene.add(sparkle);
    
    const startTime = Date.now();
    const duration = 300;
    
    const animateSparkle = () => {
        const progress = (Date.now() - startTime) / duration;
        if (progress < 1) {
            sparkle.position.x = x1 + (x2 - x1) * progress;
            sparkle.position.y = y1 + (y2 - y1) * progress;
            sparkle.position.z = 0.3 + Math.sin(progress * Math.PI) * 0.2;
            sparkle.scale.setScalar(1 - progress * 0.5);
            sparkle.material.opacity = 0.8 * (1 - progress);
            requestAnimationFrame(animateSparkle);
        } else {
            scene.remove(sparkle);
        }
    };
    animateSparkle();
}

function createMiniSparkle(x, y, z) {
    const geometry = new THREE.SphereGeometry(0.03, 4, 4);
    const material = new THREE.MeshBasicMaterial({ 
        color: 0xffff88, 
        transparent: true,
        opacity: 0.6
    });
    const sparkle = new THREE.Mesh(geometry, material);
    sparkle.position.set(x, y, z);
    scene.add(sparkle);
    sparkles.push(sparkle);
    
    // Fade out
    const fadeOut = () => {
        sparkle.material.opacity -= 0.02;
        sparkle.scale.multiplyScalar(0.95);
        if (sparkle.material.opacity > 0) {
            requestAnimationFrame(fadeOut);
        } else {
            scene.remove(sparkle);
            removeFromArray(sparkles, sparkle);
        }
    };
    fadeOut();
}

function createExplosion(x, y) {
    for (let i = 0; i < 8; i++) {
        const geometry = new THREE.SphereGeometry(0.05, 4, 4);
        const material = new THREE.MeshBasicMaterial({ 
            color: 0xff6347,
            transparent: true,
            opacity: 0.8
        });
        const particle = new THREE.Mesh(geometry, material);
        particle.position.set(x, y, 0.3);
        scene.add(particle);
        
        const angle = (i / 8) * Math.PI * 2;
        const speed = 0.02 + Math.random() * 0.02;
        const vx = Math.cos(angle) * speed;
        const vy = Math.sin(angle) * speed;
        
        const animateParticle = () => {
            particle.position.x += vx;
            particle.position.y += vy;
            particle.material.opacity -= 0.02;
            particle.scale.multiplyScalar(0.98);
            
            if (particle.material.opacity > 0) {
                requestAnimationFrame(animateParticle);
            } else {
                scene.remove(particle);
            }
        };
        animateParticle();
    }
}

function createFloatingText(x, y, text, color = 0xffffff, duration = 2000) {
    // Create canvas for text
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');
    
    ctx.font = '32px Arial';
    ctx.fillStyle = `#${color.toString(16).padStart(6, '0')}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, 128, 32);
    
    const texture = new THREE.CanvasTexture(canvas);
    const spriteMaterial = new THREE.SpriteMaterial({ 
        map: texture,
        transparent: true
    });
    const sprite = new THREE.Sprite(spriteMaterial);
    sprite.scale.set(1, 0.25, 1);
    sprite.position.set(x, y, 0.5);
    scene.add(sprite);
    
    const startTime = Date.now();
    const animateText = () => {
        const progress = (Date.now() - startTime) / duration;
        if (progress < 1) {
            sprite.position.y = y + progress * 0.5;
            sprite.material.opacity = 1 - progress;
            requestAnimationFrame(animateText);
        } else {
            scene.remove(sprite);
        }
    };
    animateText();
}

function createRippleEffect(x, y, color = 0x4169e1, maxRadius = 1.0) {
    const geometry = new THREE.RingGeometry(0, 0.1, 16);
    const material = new THREE.MeshBasicMaterial({
        color: color,
        transparent: true,
        opacity: 0.8,
        side: THREE.DoubleSide
    });
    const ripple = new THREE.Mesh(geometry, material);
    ripple.position.set(x, y, 0.1);
    ripple.rotation.x = -Math.PI / 2;
    scene.add(ripple);
    
    const startTime = Date.now();
    const duration = 1000;
    
    const animateRipple = () => {
        const progress = (Date.now() - startTime) / duration;
        if (progress < 1) {
            const currentRadius = progress * maxRadius;
            ripple.geometry.dispose();
            ripple.geometry = new THREE.RingGeometry(currentRadius * 0.8, currentRadius, 16);
            ripple.material.opacity = 0.8 * (1 - progress);
            requestAnimationFrame(animateRipple);
        } else {
            scene.remove(ripple);
        }
    };
    animateRipple();
}

function createGlowEffect(mesh, color = 0xffffff, intensity = 0.5, duration = 1000) {
    const originalEmissive = mesh.material.emissive.clone();
    const originalIntensity = mesh.material.emissiveIntensity;
    
    mesh.material.emissive.setHex(color);
    mesh.material.emissiveIntensity = intensity;
    
    setTimeout(() => {
        const fadeInterval = setInterval(() => {
            mesh.material.emissiveIntensity -= intensity * 0.05;
            if (mesh.material.emissiveIntensity <= originalIntensity) {
                mesh.material.emissive.copy(originalEmissive);
                mesh.material.emissiveIntensity = originalIntensity;
                clearInterval(fadeInterval);
            }
        }, 50);
    }, duration);
}

function createPulseEffect(mesh, scale = 1.2, duration = 500) {
    const originalScale = mesh.scale.clone();
    const pulseUp = () => {
        const startTime = Date.now();
        const animate = () => {
            const progress = (Date.now() - startTime) / (duration / 2);
            if (progress < 1) {
                const currentScale = lerp(1, scale, progress);
                mesh.scale.setScalar(currentScale);
                requestAnimationFrame(animate);
            } else {
                pulseDown();
            }
        };
        animate();
    };
    
    const pulseDown = () => {
        const startTime = Date.now();
        const animate = () => {
            const progress = (Date.now() - startTime) / (duration / 2);
            if (progress < 1) {
                const currentScale = lerp(scale, 1, progress);
                mesh.scale.setScalar(currentScale);
                requestAnimationFrame(animate);
            } else {
                mesh.scale.copy(originalScale);
            }
        };
        animate();
    };
    
    pulseUp();
}