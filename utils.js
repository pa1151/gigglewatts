// Utility functions for the game

// Coordinate conversion utilities
function gridToWorldPosition(gridX, gridY) {
    return {
        x: gridX * cellSize - gridSize * cellSize / 2 + cellSize / 2,
        y: gridY * cellSize - gridSize * cellSize / 2 + cellSize / 2,
        z: 0
    };
}

function worldToGridPosition(worldX, worldY) {
    return {
        x: Math.floor((worldX + gridSize * cellSize / 2) / cellSize),
        y: Math.floor((worldY + gridSize * cellSize / 2) / cellSize)
    };
}

// Grid validation utilities
function isValidGridPosition(x, y) {
    return x >= 0 && x < gridSize && y >= 0 && y < gridSize;
}

function isGridCellEmpty(x, y) {
    if (!isValidGridPosition(x, y)) return false;
    return grid[y][x] === null;
}

function getGridCell(x, y) {
    if (!isValidGridPosition(x, y)) return null;
    return grid[y][x];
}

// Direction utilities
function getOppositeDirection(direction) {
    switch(direction) {
        case 'up': return 'bottom';
        case 'down': return 'top';
        case 'left': return 'right';
        case 'right': return 'left';
        default: return null;
    }
}

function getDirectionOffset(direction) {
    switch(direction) {
        case 'up': return { x: 0, y: 1 };
        case 'down': return { x: 0, y: -1 };
        case 'left': return { x: -1, y: 0 };
        case 'right': return { x: 1, y: 0 };
        default: return { x: 0, y: 0 };
    }
}

function getNextGridPosition(x, y, direction) {
    switch(direction) {
        case 'up': return { x: x, y: y + 1 };     // Keep X, increase Y
        case 'down': return { x: x, y: y - 1 };   // Keep X, decrease Y  
        case 'left': return { x: x - 1, y: y };   // Decrease X, keep Y
        case 'right': return { x: x + 1, y: y };  // Increase X, keep Y
        default: return { x: x, y: y };
    }
}

// Math utilities
function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
}

function lerp(start, end, factor) {
    return start + (end - start) * factor;
}

function randomFloat(min, max) {
    return min + Math.random() * (max - min);
}

function randomInt(min, max) {
    return Math.floor(randomFloat(min, max + 1));
}

// Array utilities
function removeFromArray(array, item) {
    const index = array.indexOf(item);
    if (index > -1) {
        array.splice(index, 1);
        return true;
    }
    return false;
}

function getRandomElement(array) {
    return array[Math.floor(Math.random() * array.length)];
}

// Color utilities
function hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
}

function rgbToHex(r, g, b) {
    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}

// Timing utilities
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

function throttle(func, limit) {
    let inThrottle;
    return function(...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// Debug utilities
function logDebug(message, ...args) {
    if (window.DEBUG_MODE) {
        console.log(`[DEBUG] ${message}`, ...args);
    }
}

function logError(message, error) {
    console.error(`[ERROR] ${message}`, error);
}

// Performance utilities
function measureTime(name, func) {
    const start = performance.now();
    const result = func();
    const end = performance.now();
    console.log(`${name} took ${end - start} milliseconds`);
    return result;
}