// Energy type properties
const energyTypes = {
    happy: { 
        color: 0xffd700, 
        speed: 0.04, 
        decay: 0.995,
        canSpreadJoy: true,
        particleCount: 3,
        description: "Spreads joy to neighbors"
    },
    calm: { 
        color: 0x4169e1, 
        speed: 0.025, 
        decay: 0.998,
        canStabilize: true,
        canBridge: true,
        bridgeDuration: 3000,
        description: "Stabilizes and creates bridges"
    },
    excited: { 
        color: 0xff6347, 
        speed: 0.06, 
        decay: 0.985,
        canOverwhelm: true,
        canPowerThrough: true,
        burnoutChance: 0.3,
        description: "High energy but volatile"
    }
};

// Component personalities
const componentPersonalities = {
    nervous: {
        emoji: '😰',
        requiredMood: 'calm',
        wrongMoodEffect: 'blocks',
        description: 'Too anxious! Needs calm energy'
    },
    sleepy: {
        emoji: '😴',
        requiredMood: 'excited',
        wrongMoodEffect: 'blocks',
        description: 'Too tired! Needs excitement'
    },
    grumpy: {
        emoji: '😠',
        requiredMood: 'happy',
        wrongMoodEffect: 'blocks',
        description: 'Too grumpy! Needs happiness'
    }
};