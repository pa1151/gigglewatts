// Sound effects system
let soundEffects = {
    place: new Audio('./assets/audio/sfx/place.mp3'),
    remove: new Audio('./assets/audio/sfx/remove.mp3'),
    rotate: new Audio('./assets/audio/sfx/rotate.mp3'),
    energyFlow: new Audio('./assets/audio/sfx/energy_flow.mp3'),
    success: new Audio('./assets/audio/sfx/success.mp3'),
    burnout: new Audio('./assets/audio/sfx/burnout.mp3'),
    // Component-specific sounds
    giggle: new Audio('./assets/audio/sfx/giggle1.mp3'),
    giggle2: new Audio('./assets/audio/sfx/giggle2.mp3'),
    giggle3: new Audio('./assets/audio/sfx/giggle3.mp3'),
    nervousWhimper: new Audio('./assets/audio/sfx/nervous_whimper.mp3'),
    sleepyYawn: new Audio('./assets/audio/sfx/sleepy_yawn.mp3'),
    grumpyGrumble: new Audio('./assets/audio/sfx/grumpy_grumble.mp3'),
    happyChime: new Audio('./assets/audio/sfx/happy_chime.mp3'),
    calmHum: new Audio('./assets/audio/sfx/calm_hum.mp3'),
    excitedZap: new Audio('./assets/audio/sfx/excited_zap.mp3'),
    powerUp: new Audio('./assets/audio/sfx/power_up.mp3'),
    denied: new Audio('./assets/audio/sfx/denied.mp3')
};

// Sound playing function with error handling
function playSound(soundName, volume = 0.5, playbackRate = 1.0) {
    const sound = soundEffects[soundName];
    if (sound) {
        try {
            sound.volume = volume;
            sound.playbackRate = playbackRate;
            sound.currentTime = 0;
            sound.play().catch(e => console.log('Sound play failed:', e));
        } catch (e) {
            console.log('Sound not loaded:', soundName);
        }
    }
}

// Initialize audio system
function initAudio() {
    // Initialize sound volumes
    Object.values(soundEffects).forEach(sound => {
        if (sound) {
            sound.volume = 0.5;
        }
    });

    // Set up music controls
    setupMusicControls();
}

// Music controls setup
function setupMusicControls() {
    const bgMusic = document.getElementById('bg-music');
    const musicToggle = document.getElementById('music-toggle');
    const volumeSlider = document.getElementById('volume-slider');

    // Set initial volume
    bgMusic.volume = volumeSlider.value / 100;

    // Play/pause toggle
    musicToggle.addEventListener('click', () => {
        if (bgMusic.paused) {
            bgMusic.play()
                .then(() => {
                    musicToggle.textContent = 'Pause Music';
                    musicToggle.classList.add('playing');
                })
                .catch(error => {
                    console.error('Error playing audio:', error);
                    alert('Could not play audio. Please check if your browser allows autoplay.');
                });
        } else {
            bgMusic.pause();
            musicToggle.textContent = 'Play Music';
            musicToggle.classList.remove('playing');
        }
    });

    // Volume control
    volumeSlider.addEventListener('input', () => {
        bgMusic.volume = volumeSlider.value / 100;
        // Also adjust sound effects volume
        Object.values(soundEffects).forEach(sound => {
            if (sound) {
                sound.volume = volumeSlider.value / 100 * 0.5; // Sound effects at half music volume
            }
        });
    });

    // Try to autoplay immediately, but have a fallback for browsers that block autoplay
    bgMusic.play().catch(error => {
        console.warn('Autoplay was prevented:', error);
        musicToggle.textContent = 'Play Music';
        musicToggle.classList.remove('playing');

        // Add a one-time click listener to the document to enable audio on first interaction
        document.addEventListener('click', function initAudioOnClick() {
            if (bgMusic.paused) {
                bgMusic.play().then(() => {
                    musicToggle.textContent = 'Pause Music';
                    musicToggle.classList.add('playing');
                }).catch(e => console.error('Audio still failed to play:', e));
            }
            document.removeEventListener('click', initAudioOnClick);
        }, { once: true });
    });
}