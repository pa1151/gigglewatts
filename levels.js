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
        goal: { x: 3, y: 6 },
        obstacles: [[2, 4], [4, 4], [1, 2], [5, 2]],
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