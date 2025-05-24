// User interface management

function initUI() {
    // Initialize energy type display
    updateEnergyUI();

    // Set up keyboard shortcut hints
    setupKeyboardHints();

    // Initialize responsive UI elements
    setupResponsiveUI();
}

function updateEnergyUI() {
    // Update button label
    const energyLabel = document.getElementById('energy-label');
    if (energyLabel) {
        energyLabel.textContent = currentEnergyType.charAt(0).toUpperCase() + currentEnergyType.slice(1);
    }

    // Update active energy info panel
    document.querySelectorAll('.energy-type').forEach(el => el.classList.remove('active'));
    const activeEnergyInfo = document.getElementById(`${currentEnergyType}-info`);
    if (activeEnergyInfo) {
        activeEnergyInfo.classList.add('active');
    }

    // Update source visual if it exists
    const source = components.find(c => c.type === 'source');
    if (source) {
        source.material.emissive = new THREE.Color(energyTypes[currentEnergyType].color);
        source.material.emissiveIntensity = 0.3;
        source.giggle();
    }
}

function updateLevelUI(levelIndex) {
    const levelInfo = document.getElementById('level-info');
    if (levelInfo && levels[levelIndex]) {
        levelInfo.textContent = `Level ${levelIndex + 1}: ${levels[levelIndex].name}`;
    }
}

function updateToolUI() {
    // Update selected tool visual
    document.querySelectorAll('.tool').forEach(t => t.classList.remove('selected'));
    const selectedToolElement = document.querySelector(`[data-type="${selectedTool}"]`);
    if (selectedToolElement) {
        selectedToolElement.classList.add('selected');
    }
}

function showVictoryScreen() {
    const victoryScreen = document.getElementById('victory');
    if (victoryScreen) {
        victoryScreen.style.display = 'block';
    }
}

function hideVictoryScreen() {
    const victoryScreen = document.getElementById('victory');
    if (victoryScreen) {
        victoryScreen.style.display = 'none';
    }
}

function showHint(text, duration = 5000) {
    const hint = document.createElement('div');
    hint.style.cssText = `
        position: absolute;
        top: 80px;
        left: 50%;
        transform: translateX(-50%);
        background: rgba(255, 255, 255, 0.9);
        color: black;
        padding: 15px 25px;
        border-radius: 20px;
        font-size: 16px;
        box-shadow: 0 4px 20px rgba(0,0,0,0.3);
        animation: slideDown 0.5s ease-out;
        z-index: 1000;
        max-width: 400px;
        text-align: center;
    `;
    hint.textContent = text;
    document.body.appendChild(hint);

    setTimeout(() => {
        hint.style.animation = 'slideUp 0.5s ease-out';
        setTimeout(() => {
            if (document.body.contains(hint)) {
                document.body.removeChild(hint);
            }
        }, 500);
    }, duration);
}

function setupKeyboardHints() {
    // Add keyboard shortcut tooltips
    const shortcuts = {
        'Space': 'Start Simulation',
        'R': 'Reset Level',
        'E': 'Change Energy Type',
        'N': 'Next Level',
        '1-7': 'Select Tools',
        'X/Del': 'Delete Tool',
        'Esc': 'Select Pipe'
    };

    // Create keyboard hints panel
    const hintsPanel = document.createElement('div');
    hintsPanel.id = 'keyboard-hints';
    hintsPanel.style.cssText = `
        position: absolute;
        bottom: 80px;
        right: 20px;
        background: rgba(0, 0, 0, 0.8);
        color: white;
        padding: 15px;
        border-radius: 10px;
        font-size: 12px;
        opacity: 0;
        transition: opacity 0.3s;
        pointer-events: none;
        z-index: 100;
    `;

    let hintsHTML = '<div style="margin-bottom: 8px;"><strong>Keyboard Shortcuts:</strong></div>';
    Object.entries(shortcuts).forEach(([key, action]) => {
        hintsHTML += `<div><kbd style="background: #333; padding: 2px 6px; border-radius: 3px; margin-right: 8px;">${key}</kbd>${action}</div>`;
    });
    hintsPanel.innerHTML = hintsHTML;

    document.body.appendChild(hintsPanel);

    // Show/hide on key press
    let showTimeout;
    document.addEventListener('keydown', () => {
        hintsPanel.style.opacity = '1';
        clearTimeout(showTimeout);
        showTimeout = setTimeout(() => {
            hintsPanel.style.opacity = '0';
        }, 3000);
    });
}

function setupResponsiveUI() {
    // Adjust UI for different screen sizes
    function adjustForScreenSize() {
        const width = window.innerWidth;
        const height = window.innerHeight;

        // Mobile adjustments
        if (width < 768) {
            // Make info panel smaller on mobile
            const infoPanel = document.getElementById('info');
            if (infoPanel) {
                infoPanel.style.fontSize = '14px';
                infoPanel.style.maxWidth = '280px';
            }

            // Adjust toolbar for mobile
            const toolbar = document.getElementById('toolbar');
            if (toolbar) {
                toolbar.style.flexWrap = 'wrap';
                toolbar.style.maxWidth = '300px';
            }

            // Adjust tool size
            document.querySelectorAll('.tool').forEach(tool => {
                tool.style.width = '40px';
                tool.style.height = '40px';
                tool.style.fontSize = '20px';
            });
        }

        // Tablet adjustments
        if (width >= 768 && width < 1024) {
            const infoPanel = document.getElementById('info');
            if (infoPanel) {
                infoPanel.style.fontSize = '15px';
                infoPanel.style.maxWidth = '320px';
            }
        }
    }

    // Initial adjustment
    adjustForScreenSize();

    // Adjust on resize
    window.addEventListener('resize', adjustForScreenSize);
}

function createProgressBar(current, max, color = '#4a90e2') {
    const progressContainer = document.createElement('div');
    progressContainer.style.cssText = `
        width: 200px;
        height: 20px;
        background: rgba(255, 255, 255, 0.2);
        border-radius: 10px;
        overflow: hidden;
        margin: 10px 0;
    `;

    const progressBar = document.createElement('div');
    progressBar.style.cssText = `
        width: ${(current / max) * 100}%;
        height: 100%;
        background: ${color};
        border-radius: 10px;
        transition: width 0.3s ease;
    `;

    progressContainer.appendChild(progressBar);
    return { container: progressContainer, bar: progressBar };
}

function updateProgressBar(progressBar, current, max) {
    progressBar.bar.style.width = `${(current / max) * 100}%`;
}

function createFloatingMessage(message, x, y, color = '#ffffff', duration = 2000) {
    const messageElement = document.createElement('div');
    messageElement.style.cssText = `
        position: absolute;
        left: ${x}px;
        top: ${y}px;
        color: ${color};
        font-size: 18px;
        font-weight: bold;
        pointer-events: none;
        z-index: 1000;
        text-shadow: 2px 2px 4px rgba(0,0,0,0.8);
        animation: floatUp ${duration}ms ease-out forwards;
    `;
    messageElement.textContent = message;
    document.body.appendChild(messageElement);

    // Add animation keyframe if not exists
    if (!document.getElementById('float-up-animation')) {
        const style = document.createElement('style');
        style.id = 'float-up-animation';
        style.textContent = `
            @keyframes floatUp {
                0% { transform: translateY(0); opacity: 1; }
                100% { transform: translateY(-50px); opacity: 0; }
            }
        `;
        document.head.appendChild(style);
    }

    setTimeout(() => {
        if (document.body.contains(messageElement)) {
            document.body.removeChild(messageElement);
        }
    }, duration);
}

function toggleFullscreen() {
    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(err => {
            console.log('Fullscreen failed:', err);
        });
    } else {
        document.exitFullscreen();
    }
}

function createTooltip(element, text, position = 'top') {
    const tooltip = document.createElement('div');
    tooltip.className = 'custom-tooltip';
    tooltip.style.cssText = `
        position: absolute;
        background: rgba(0, 0, 0, 0.9);
        color: white;
        padding: 8px 12px;
        border-radius: 6px;
        font-size: 12px;
        white-space: nowrap;
        z-index: 1000;
        opacity: 0;
        transition: opacity 0.3s;
        pointer-events: none;
    `;
    tooltip.textContent = text;
    document.body.appendChild(tooltip);

    element.addEventListener('mouseenter', () => {
        const rect = element.getBoundingClientRect();
        switch (position) {
            case 'top':
                tooltip.style.left = rect.left + rect.width / 2 - tooltip.offsetWidth / 2 + 'px';
                tooltip.style.top = rect.top - tooltip.offsetHeight - 8 + 'px';
                break;
            case 'bottom':
                tooltip.style.left = rect.left + rect.width / 2 - tooltip.offsetWidth / 2 + 'px';
                tooltip.style.top = rect.bottom + 8 + 'px';
                break;
            case 'left':
                tooltip.style.left = rect.left - tooltip.offsetWidth - 8 + 'px';
                tooltip.style.top = rect.top + rect.height / 2 - tooltip.offsetHeight / 2 + 'px';
                break;
            case 'right':
                tooltip.style.left = rect.right + 8 + 'px';
                tooltip.style.top = rect.top + rect.height / 2 - tooltip.offsetHeight / 2 + 'px';
                break;
        }
        tooltip.style.opacity = '1';
    });

    element.addEventListener('mouseleave', () => {
        tooltip.style.opacity = '0';
    });

    return tooltip;
}

// UI State management
const uiState = {
    hintsEnabled: true,
    soundEnabled: true,
    musicEnabled: true,
    fullscreen: false
};

function toggleUI(element) {
    element.style.display = element.style.display === 'none' ? 'block' : 'none';
}

function fadeInUI(element, duration = 300) {
    element.style.opacity = '0';
    element.style.display = 'block';

    let start = performance.now();

    function animate(time) {
        let progress = (time - start) / duration;
        if (progress > 1) progress = 1;

        element.style.opacity = progress;

        if (progress < 1) {
            requestAnimationFrame(animate);
        }
    }

    requestAnimationFrame(animate);
}

function fadeOutUI(element, duration = 300) {
    let start = performance.now();
    const startOpacity = parseFloat(element.style.opacity) || 1;

    function animate(time) {
        let progress = (time - start) / duration;
        if (progress > 1) progress = 1;

        element.style.opacity = startOpacity * (1 - progress);

        if (progress < 1) {
            requestAnimationFrame(animate);
        } else {
            element.style.display = 'none';
        }
    }

    requestAnimationFrame(animate);
}