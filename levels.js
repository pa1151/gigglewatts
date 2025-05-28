// Level definitions
const levels = [
    {
        name: "Learn the Moods",
        source: { x: 3, y: 2 },
        goal: { x: 3, y: 5 },
        obstacles: [],
        hint: "Different components need different emotions!",
        requiredComponents: []
    },
    {
        name: "Emotional Maze",
        source: { x: 1, y: 1 },
        goal: { x: 6, y: 6 },
        obstacles: [[3, 3], [3, 4], [4, 3], [4, 4]],
        hint: "Use happy energy to spread joy through tight spaces!",
        forcedEnergyType: 'happy'
    },
{
    name: "Calm the Storm",
    source: { x: 3, y: 1 },
    goal: { x: 3, y: 5 },
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
    hint: "Only calm energy can bridge gaps!",
    forcedEnergyType: 'calm',
    gaps: [[3, 5], [3, 3]]
},
    {
        name: "Power Through",
        source: { x: 1, y: 1 },
        goal: { x: 6, y: 6 },
        obstacles: [[3, 1], [3, 2], [3, 3], [3, 4], [3, 5], [4, 5]],
        hint: "Excited energy might burn out components!",
        forcedEnergyType: 'excited'
    }
];