// Input handling system

function initInput() {
    // Mouse interaction
    renderer.domElement.addEventListener('click', onMouseClick);
    //renderer.domElement.addEventListener('mousemove', onMouseMove);
    renderer.domElement.addEventListener('contextmenu', onRightClick);
    
    // Keyboard shortcuts
    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('keyup', onKeyUp);
    
    // Touch support for mobile
    renderer.domElement.addEventListener('touchstart', onTouchStart);
    renderer.domElement.addEventListener('touchmove', onTouchMove);
    renderer.domElement.addEventListener('touchend', onTouchEnd);
    
    // Prevent context menu on right click
    renderer.domElement.addEventListener('contextmenu', (e) => e.preventDefault());
}

function onMouseClick(event) {
    if (isSimulating) return;
    
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    
    raycaster.setFromCamera(mouse, camera);
    
    // Check for component clicks first
    const meshes = components.map(c => c.mesh.children[0]);
    const intersects = raycaster.intersectObjects(meshes);
    
    if (intersects.length > 0) {
        const component = components.find(c => c.mesh.children[0] === intersects[0].object);
        if (component) {
            // Don't allow interaction with pre-placed components
            if (component.isPrePlaced) {
                showHint("This component is fixed in place!");
                return;
            }
            
            // Handle regular components
            if (selectedTool === 'delete') {
                deleteComponent(component);
            } else {
                rotateComponent(component);
            }
        }
        return;
    }
    
    // Otherwise, place new component
    placeComponent(event);
}

function handleComponentHover(event) {
    raycaster.setFromCamera(mouse, camera);
    
    // Check for component hover
    const meshes = components.map(c => c.mesh.children[0]);
    const intersects = raycaster.intersectObjects(meshes);
    
    if (intersects.length > 0) {
        const component = components.find(c => c.mesh.children[0] === intersects[0].object);
        if (component && component.personality) {
            componentHint.textContent = component.personality.description;
            componentHint.style.display = 'block';
            componentHint.style.left = event.clientX + 15 + 'px';
            componentHint.style.top = event.clientY - 40 + 'px';
        } else {
            componentHint.style.display = 'none';
        }
    } else {
        componentHint.style.display = 'none';
    }
}

function handleGridHighlight() {
    // Grid highlight for placement preview
    const plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
    const intersectPoint = new THREE.Vector3();
    raycaster.ray.intersectPlane(plane, intersectPoint);
    
    const gridPos = worldToGridPosition(intersectPoint.x, intersectPoint.y);
    
    // Only show highlight when placing components
    if (selectedTool === 'delete') {
        highlightMesh.visible = false;
        return;
    }
    
    if (isValidGridPosition(gridPos.x, gridPos.y)) {
        highlightMesh.visible = true;
        const worldPos = gridToWorldPosition(gridPos.x, gridPos.y);
        highlightMesh.position.set(worldPos.x, worldPos.y, 0.1);
        
        // Change highlight color based on cell state
        if (isGridCellEmpty(gridPos.x, gridPos.y)) {
            highlightMesh.material.color.setHex(0x00ff00); // Green for empty
        } else {
            highlightMesh.material.color.setHex(0xff0000); // Red for occupied
        }
    } else {
        highlightMesh.visible = false;
    }
}

function onMouseClick(event) {
    if (isSimulating) return;
    
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    
    raycaster.setFromCamera(mouse, camera);
    
    // Check for component clicks first
    const meshes = components.map(c => c.mesh.children[0]);
    const intersects = raycaster.intersectObjects(meshes);
    
    if (intersects.length > 0) {
        const component = components.find(c => c.mesh.children[0] === intersects[0].object);
        if (component && component.type !== 'source' && component.type !== 'goal') {
            if (selectedTool === 'delete') {
                deleteComponent(component);
            } else {
                rotateComponent(component);
            }
        }
        return;
    }
    
    // Otherwise, place new component
    placeComponent(event);
}

function onRightClick(event) {
    if (isSimulating) return;
    
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    
    raycaster.setFromCamera(mouse, camera);
    
    // Right click to delete components
    const meshes = components.map(c => c.mesh.children[0]);
    const intersects = raycaster.intersectObjects(meshes);
    
    if (intersects.length > 0) {
        const component = components.find(c => c.mesh.children[0] === intersects[0].object);
        if (component) {
            // Don't allow deletion of pre-placed components
            if (component.isPrePlaced) {
                showHint("This component cannot be removed!");
                return;
            }
            
            deleteComponent(component);
        }
    }
    
    event.preventDefault();
}

function placeComponent(event) {
    const plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
    const intersectPoint = new THREE.Vector3();
    raycaster.ray.intersectPlane(plane, intersectPoint);
    
    const gridPos = worldToGridPosition(intersectPoint.x, intersectPoint.y);
    
    if (isValidGridPosition(gridPos.x, gridPos.y) && isGridCellEmpty(gridPos.x, gridPos.y) && selectedTool !== 'delete') {
        const component = new Component(gridPos.x, gridPos.y, selectedTool);
        components.push(component);
        playSound('place', 0.4, 1.0);
        
        // Play component-specific placement sound
        if (component.personality) {
            setTimeout(() => {
                if (component.type === 'nervous') {
                    playSound('nervousWhimper', 0.3);
                } else if (component.type === 'sleepy') {
                    playSound('sleepyYawn', 0.3);
                } else if (component.type === 'grumpy') {
                    playSound('grumpyGrumble', 0.3);
                }
            }, 200);
        }
    }
}

function rotateComponent(component) {
    // Additional check in rotate function
    if (component.isPrePlaced) {
        showHint("This component cannot be rotated!");
        return;
    }
    
    component.rotate();
}

function deleteComponent(component) {
    // Additional check in delete function
    if (component.isPrePlaced) {
        showHint("This component cannot be deleted!");
        return;
    }
    
    component.destroy();
    removeFromArray(components, component);
    console.log('playing remove audio');
    playSound('remove', 0.2, 1); 
}

function onKeyDown(event) {
    if (isSimulating) return;
    
    switch(event.code) {
        case 'Space':
            event.preventDefault();
            startSimulation();
            break;
        case 'KeyR':
            event.preventDefault();
            resetLevel();
            break;
        case 'KeyE':
            event.preventDefault();
            changeEnergyType();
            break;
        case 'KeyN':
            event.preventDefault();
            nextLevel();
            break;
        case 'Digit1':
            selectTool('pipe');
            break;
        case 'Digit2':
            selectTool('corner');
            break;
        case 'Digit3':
            selectTool('tjunction');
            break;
        case 'Digit4':
            selectTool('cross');
            break;
        case 'Digit5':
            selectTool('nervous');
            break;
        case 'Digit6':
            selectTool('sleepy');
            break;
        case 'Digit7':
            selectTool('grumpy');
            break;
        case 'KeyX':
        case 'Delete':
            selectTool('delete');
            break;
        case 'Escape':
            selectTool('pipe'); // Default tool
            break;
    }
}

function onKeyUp(event) {
    // Handle key release events if needed
}

// Touch support for mobile devices
let touchStartPos = { x: 0, y: 0 };
let touchEndPos = { x: 0, y: 0 };

function onTouchStart(event) {
    event.preventDefault();
    const touch = event.touches[0];
    touchStartPos.x = touch.clientX;
    touchStartPos.y = touch.clientY;
    
    // Convert to mouse coordinates for consistency
    mouse.x = (touch.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(touch.clientY / window.innerHeight) * 2 + 1;
    
    handleGridHighlight();
}

function onTouchMove(event) {
    event.preventDefault();
    const touch = event.touches[0];
    
    mouse.x = (touch.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(touch.clientY / window.innerHeight) * 2 + 1;
    
    handleGridHighlight();
}

function onTouchEnd(event) {
    event.preventDefault();
    const touch = event.changedTouches[0];
    touchEndPos.x = touch.clientX;
    touchEndPos.y = touch.clientY;
    
    // Check if it's a tap (not a drag)
    const deltaX = Math.abs(touchEndPos.x - touchStartPos.x);
    const deltaY = Math.abs(touchEndPos.y - touchStartPos.y);
    
    if (deltaX < 10 && deltaY < 10) {
        // Simulate click
        const mockEvent = {
            clientX: touch.clientX,
            clientY: touch.clientY
        };
        onMouseClick(mockEvent);
    }
}

// Utility functions for input handling
function getMouseGridPosition() {
    const plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
    const intersectPoint = new THREE.Vector3();
    raycaster.ray.intersectPlane(plane, intersectPoint);
    
    return worldToGridPosition(intersectPoint.x, intersectPoint.y);
}

function isMouseOverComponent() {
    raycaster.setFromCamera(mouse, camera);
    const meshes = components.map(c => c.mesh.children[0]);
    const intersects = raycaster.intersectObjects(meshes);
    return intersects.length > 0;
}