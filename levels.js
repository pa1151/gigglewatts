// Level definitions
const levels = [
    {
        name: "First Smile",
        source: { 
            x: 1, 
            y: 3,
            connections: { top: false, right: true, bottom: false, left: false }
        },
        goal: { 
            x: 5, 
            y: 3,
            connections: { top: false, right: false, bottom: false, left: true }
        },
        obstacles: [],
        prePlaced: [
            { type: 'grumpy', x: 3, y: 3, connections: { top: false, right: true, bottom: false, left: true } }
        ],
        hint: "The grumpy gate needs happiness to open!",
        forcedEnergyType: 'happy'
    },
    {
        name: "Calming the Excited",
        source: { x: 0, y: 1, connections: { right: true } },
        goal: { x: 6, y: 1, connections: { left: true } },
        prePlaced: [
            { type: 'nervous', x: 4, y: 1, connections: { top: false, right: true, bottom: false, left: true }  }
        ],
        obstacles: [],
        hint: "Use the stabilizer to calm down excited energy before it reaches nervous components!",
        forcedEnergyType: 'excited'
    },
    {
        name: "Calm in the Storm",
        source: { 
            x: 0, 
            y: 1,
            connections: { top: false, right: true, bottom: false, left: false }
        },
        goal: { 
            x: 4, 
            y: 1,
            connections: { top: false, right: false, bottom: false, left: true }
        },
        obstacles: [],
        prePlaced: [
            { type: 'nervous', x: 2, y: 1 }
        ],
        hint: "Calm energy soothes nervous components.",
        forcedEnergyType: 'calm'
    },
    {
        name: "Bridge Over Troubled Blocks",
        source: { 
            x: 0, 
            y: 1,
            connections: { top: false, right: true, bottom: false, left: false }
        },
        goal: { 
            x: 4, 
            y: 1,
            connections: { top: false, right: false, bottom: false, left: true }
        },
        obstacles: [[2, 0], [2, 1], [2, 2]],
        hint: "Calm energy can create bridges over obstacles!",
        forcedEnergyType: 'calm'
    },
    {
        name: "Power Through",
        source: { 
            x: 0, 
            y: 1,
            connections: { top: false, right: true, bottom: false, left: false }
        },
        goal: { 
            x: 4, 
            y: 1,
            connections: { top: false, right: false, bottom: false, left: true }
        },
        obstacles: [[2, 0], [2, 1], [2, 2]],
        hint: "Excited energy might break through with enough force!",
        forcedEnergyType: 'excited'
    },
    {
        name: "Burnout Prevention",
        source: { 
            x: 0, 
            y: 0,
            connections: { top: false, right: true, bottom: true, left: false }
        },
        goal: { 
            x: 3, 
            y: 0,
            connections: { top: false, right: false, bottom: false, left: true }
        },
        obstacles: [],
        prePlaced: [
            { type: 'pipe', x: 1, y: 1 },
            { type: 'pipe', x: 2, y: 1 },
            { type: 'corner', x: 1, y: 2 },
            { type: 'corner', x: 2, y: 2 }
        ],
        hint: "Too much excitement can overwhelm components! Plan your route carefully.",
        forcedEnergyType: 'excited'
    },
    {
        name: "Upward Journey",
        source: { 
            x: 3, 
            y: 2,
            connections: { top: true, right: false, bottom: false, left: false }
        },
        goal: { 
            x: 3, 
            y: 5,
            connections: { top: false, right: false, bottom: true, left: false }
        },
        obstacles: [],
        hint: "Connect the emotions from bottom to top!",
        requiredComponents: []
    },
    {
        name: "Corner Challenge",
        source: { 
            x: 1, 
            y: 1,
            connections: { top: true, right: true, bottom: false, left: false }
        },
        goal: { 
            x: 6, 
            y: 6,
            connections: { top: false, right: false, bottom: true, left: true }
        },
        obstacles: [[3, 3], [3, 4], [4, 3], [4, 4]],
        hint: "Navigate around the obstacles to reach the goal!",
        forcedEnergyType: 'happy'
    },
    {
        name: "Bridge Builder",
        source: { 
            x: 3, 
            y: 1,
            connections: { top: true, right: false, bottom: false, left: false }
        },
        goal: { 
            x: 3, 
            y: 5,
            connections: { top: false, right: false, bottom: true, left: false }
        },
        obstacles: [
            // Original internal obstacles
            [1,4], [2,4], [3,4], [4,4], [5,4], [6,4], [7,4],
            
            // Top edge
            [0,0], [1,0], [2,0], [3,0], [4,0], [5,0], [6,0], [7,0],

            // Bottom edge
            [0,7], [1,7], [2,7], [3,7], [4,7], [5,7], [6,7], [7,7],

            // Left edge (excluding corners)
            [0,1], [0,2], [0,3], [0,4], [0,5], [0,6], [0,7],

            // Right edge (excluding corners)
            [7,1], [7,2], [7,3], [7,5], [7,6]
        ],
        hint: "Only calm energy can bridge the gap!",
        forcedEnergyType: 'calm',
        gaps: [[3, 5], [3, 3]]
    },
    {
        name: "Multi-Path Master",
        source: { 
            x: 1, 
            y: 1,
            connections: { top: true, right: true, bottom: true, left: false }
        },
        goal: { 
            x: 6, 
            y: 6,
            connections: { top: true, right: false, bottom: true, left: true }
        },
        obstacles: [[3, 1], [3, 2], [3, 3], [3, 4], [3, 5], [4, 5]],
        hint: "Use multiple paths to reach your destination!",
        forcedEnergyType: 'excited'
    }
];