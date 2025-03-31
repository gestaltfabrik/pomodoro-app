document.addEventListener('DOMContentLoaded', () => {
    // Initialiser les icônes
    feather.replace();
    
    // Éléments du DOM
    const timerElement = document.getElementById('timer');
    const pomodoroBtn = document.getElementById('pomodoro-btn');
    const shortBreakBtn = document.getElementById('short-break-btn');
    const longBreakBtn = document.getElementById('long-break-btn');
    const playPauseBtn = document.getElementById('play-pause-btn');
    const resetBtn = document.getElementById('reset-btn');
    const skipBtn = document.getElementById('skip-btn');
    const soundBtn = document.getElementById('sound-btn');
    const settingsBtn = document.getElementById('settings-btn');
    const startCycleBtn = document.getElementById('start-cycle-btn');
    const stopCycleBtn = document.getElementById('stop-cycle-btn');
    const cycleStatus = document.getElementById('cycle-status');
    const cycleCurrent = document.getElementById('cycle-current');
    const cycleRemaining = document.getElementById('cycle-remaining');
    const settingsModal = document.getElementById('settings-modal');
    const cancelBtn = document.getElementById('cancel-btn');
    const saveBtn = document.getElementById('save-btn');
    const pomodoroInput = document.getElementById('pomodoro-input');
    const shortBreakInput = document.getElementById('short-break-input');
    const longBreakInput = document.getElementById('long-break-input');
    const intervalInput = document.getElementById('interval-input');
    const soundCheckbox = document.getElementById('sound-checkbox');
    const cycleDetails = document.getElementById('cycle-details');
    const cycleDuration = document.getElementById('cycle-duration');
    const titleElement = document.getElementById('title');
    const cycleTitle = document.getElementById('cycle-title');
    const settingsTitle = document.getElementById('settings-title');
    const soundLabel = document.getElementById('sound-label');
    const pomodoroLabel = document.getElementById('pomodoro-label');
    const shortBreakLabel = document.getElementById('short-break-label');
    const longBreakLabel = document.getElementById('long-break-label');
    const intervalLabel = document.getElementById('interval-label');
    const languageLabel = document.getElementById('language-label');
    
    // Sons audio
    const gongSound = document.getElementById('gong-sound');
    const pingSound = document.getElementById('ping-sound');
    
    // Modifier les sons pour qu'ils soient plus doux
    gongSound.src = "https://assets.mixkit.co/active_storage/sfx/208/208-preview.mp3"; // Son de ding doux
    pingSound.src = "https://assets.mixkit.co/active_storage/sfx/1531/1531-preview.mp3"; // Son de notification subtil
    
    // Langues
    const langButtons = document.querySelectorAll('.lang-btn');
    const langFooterButtons = document.querySelectorAll('.lang-footer-btn');
    
    // Paramètres par défaut
    const defaultSettings = {
        pomodoro: 25 * 60,
        shortBreak: 5 * 60,
        longBreak: 20 * 60, // 20 minutes par défaut
        longBreakInterval: 4,
        sound: true,
        language: 'fr'
    };
    
    // État actuel
    let settings = loadSettings();
    let timer = settings.pomodoro;
    let mode = 'pomodoro';
    let isActive = false;
    let timerInterval = null;
    let isCycleActive = false;
    let remainingCycles = settings.longBreakInterval;
    let isPomodoro = true;
    
    // Traductions
    const translations = {
        fr: {
            title: "Minuteur Pomodoro",
            pomodoro: "Pomodoro",
            shortBreak: "Pause Courte",
            longBreak: "Pause Longue",
            cycle: "Cycle Pomodoro",
            sessions: "sessions de travail",
            with: "avec",
            shortBreaks: "pauses courtes",
            and: "et",
            longBreakSingle: "pause longue",
            totalDuration: "Durée totale du cycle",
            currentCycle: "Cycle en cours",
            work: "Travail",
            break: "Pause",
            remainingSessions: "Sessions restantes avant pause longue",
            stopCycle: "Arrêter le cycle",
            startCycle: "Démarrer un cycle",
            settings: "Paramètres",
            pomodoroLength: "Durée Pomodoro (minutes)",
            shortBreakLength: "Durée Pause Courte (minutes)",
            longBreakLength: "Durée Pause Longue (minutes)",
            sessionsBeforeLongBreak: "Nombre de sessions avant pause longue",
            enableSound: "Activer les sons",
            cancel: "Annuler",
            save: "Enregistrer",
            language: "Langue",
            resetDefaults: "Réinitialiser"
        },
        en: {
            title: "Pomodoro Timer",
            pomodoro: "Pomodoro",
            shortBreak: "Short Break",
            longBreak: "Long Break",
            cycle: "Pomodoro Cycle",
            sessions: "work sessions",
            with: "with",
            shortBreaks: "short breaks",
            and: "and",
            longBreakSingle: "long break",
            totalDuration: "Total cycle duration",
            currentCycle: "Current cycle",
            work: "Work",
            break: "Break",
            remainingSessions: "Remaining sessions before long break",
            stopCycle: "Stop cycle",
            startCycle: "Start cycle",
            settings: "Settings",
            pomodoroLength: "Pomodoro duration (minutes)",
            shortBreakLength: "Short break duration (minutes)",
            longBreakLength: "Long break duration (minutes)",
            sessionsBeforeLongBreak: "Number of sessions before long break",
            enableSound: "Enable sounds",
            cancel: "Cancel",
            save: "Save",
            language: "Language",
            resetDefaults: "Reset"
        },
        ro: {
            title: "Cronometru Pomodoro",
            pomodoro: "Pomodoro",
            shortBreak: "Pauză Scurtă",
            longBreak: "Pauză Lungă",
            cycle: "Ciclu Pomodoro",
            sessions: "sesiuni de lucru",
            with: "cu",
            shortBreaks: "pauze scurte",
            and: "și",
            longBreakSingle: "pauză lungă",
            totalDuration: "Durata totală a ciclului",
            currentCycle: "Ciclu în curs",
            work: "Lucru",
            break: "Pauză",
            remainingSessions: "Sesiuni rămase înainte de pauza lungă",
            stopCycle: "Oprește ciclul",
            startCycle: "Începe un ciclu",
            settings: "Setări",
            pomodoroLength: "Durata Pomodoro (minute)",
            shortBreakLength: "Durata Pauză Scurtă (minute)",
            longBreakLength: "Durata Pauză Lungă (minute)",
            sessionsBeforeLongBreak: "Număr de sesiuni înainte de pauza lungă",
            enableSound: "Activează sunetele",
            cancel: "Anulează",
            save: "Salvează",
            language: "Limbă",
            resetDefaults: "Resetează"
        }
    };
    
    // Charge les paramètres depuis le localStorage
    function loadSettings() {
        const savedSettings = localStorage.getItem('pomodoroSettings');
        return savedSettings ? JSON.parse(savedSettings) : defaultSettings;
    }
    
    // Sauvegarde les paramètres dans localStorage
    function saveSettings(newSettings) {
        localStorage.setItem('pomodoroSettings', JSON.stringify(newSettings));
    }
    
    // Réinitialise les paramètres par défaut
    function resetToDefaultSettings() {
        settings = {...defaultSettings, language: settings.language}; // Garder la langue actuelle
        saveSettings(settings);
        
        // Mettre à jour les champs d'entrée
        pomodoroInput.value = Math.floor(settings.pomodoro / 60);
        shortBreakInput.value = Math.floor(settings.shortBreak / 60);
        longBreakInput.value = Math.floor(settings.longBreak / 60);
        intervalInput.value = settings.longBreakInterval;
        soundCheckbox.checked = settings.sound;
    }
    
    // Formate le temps en MM:SS
    function formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    
    // Formate le temps total (heures et minutes)
    function formatTotalTime(seconds) {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        
        if (hours > 0) {
            return `${hours}h${minutes > 0 ? ` ${minutes}min` : ''}`;
        }
        return `${minutes}min`;
    }
    
    // Calcule le temps total du cycle
    function calculateTotalCycleTime() {
        const pomodoroTime = settings.pomodoro * settings.longBreakInterval;
        const shortBreakTime = settings.shortBreak * (settings.longBreakInterval - 1);
        const longBreakTime = settings.longBreak;
        return pomodoroTime + shortBreakTime + longBreakTime;
    }
    
    // Met à jour les détails du cycle
    function updateCycleInfo() {
        const t = translations[settings.language];
        
        // Mettre à jour les détails du cycle
        cycleDetails.textContent = `${settings.longBreakInterval} ${t.sessions} (${Math.floor(settings.pomodoro / 60)}min) ${t.with} ${settings.longBreakInterval - 1} ${t.shortBreaks} (${Math.floor(settings.shortBreak / 60)}min) ${t.and} 1 ${t.longBreakSingle} (${Math.floor(settings.longBreak / 60)}min).`;
        
        // Mettre à jour la durée totale
        cycleDuration.textContent = `${t.totalDuration}: ${formatTotalTime(calculateTotalCycleTime())}`;
    }
    
    // Met à jour la langue de l'interface
    function updateLanguage() {
        const t = translations[settings.language];
        
        // Mettre à jour les textes
        titleElement.textContent = t.title;
        pomodoroBtn.textContent = t.pomodoro;
        shortBreakBtn.textContent = t.shortBreak;
        longBreakBtn.textContent = t.longBreak;
        cycleTitle.textContent = t.cycle;
        startCycleBtn.textContent = t.startCycle;
        stopCycleBtn.textContent = t.stopCycle;
        settingsTitle.textContent = t.settings;
        pomodoroLabel.textContent = t.pomodoroLength;
        shortBreakLabel.textContent = t.shortBreakLength;
        longBreakLabel.textContent = t.longBreakLength;
        intervalLabel.textContent = t.sessionsBeforeLongBreak;
        languageLabel.textContent = t.language;
        soundLabel.textContent = t.enableSound;
        document.getElementById('cancel-btn').textContent = t.cancel;
        document.getElementById('save-btn').textContent = t.save;
        document.getElementById('reset-defaults-btn').textContent = t.resetDefaults;
        
        // Mettre à jour les détails du cycle
        updateCycleInfo();
        
        // Mettre à jour le statut du cycle si actif
        if (isCycleActive) {
            updateCycleStatus();
            updateCycleRemaining();
        }
    }
    
    // Joue un son
    function playSound(sound) {
        if (settings.sound) {
            sound.currentTime = 0;
            sound.volume = 0.5; // Réduire le volume pour un son plus doux
            sound.play().catch(err => console.log('Erreur lors de la lecture audio:', err));
        }
    }
    
    // Change le mode (pomodoro, shortBreak, longBreak)
    function switchMode(newMode) {
        clearInterval(timerInterval);
        
        // Mettre à jour les boutons
        pomodoroBtn.classList.remove('active');
        shortBreakBtn.classList.remove('active');
        longBreakBtn.classList.remove('active');
        
        mode = newMode;
        
        switch (newMode) {
            case 'pomodoro':
                timer = settings.pomodoro;
                pomodoroBtn.classList.add('active');
                isPomodoro = true;
                break;
            case 'shortBreak':
                timer = settings.shortBreak;
                shortBreakBtn.classList.add('active');
                isPomodoro = false;
                break;
            case 'longBreak':
                timer = settings.longBreak;
                longBreakBtn.classList.add('active');
                isPomodoro = false;
                break;
        }
        
        updateDisplay();
        updatePlayPauseButton();
        
        if (isCycleActive) {
            updateCycleStatus();
        }
    }
    
    // Met à jour l'affichage du minuteur
    function updateDisplay() {
        timerElement.textContent = formatTime(timer);
    }
    
    // Met à jour le bouton play/pause
    function updatePlayPauseButton() {
        playPauseBtn.innerHTML = isActive ? 
            '<i data-feather="pause"></i>' : 
            '<i data-feather="play"></i>';
        feather.replace();
    }
    
    // Met à jour le bouton son
    function updateSoundButton() {
        soundBtn.innerHTML = settings.sound ? 
            '<i data-feather="volume-2"></i>' : 
            '<i data-feather="volume-x"></i>';
        feather.replace();
    }
    
    // Démarre/Pause le minuteur
    function toggleTimer() {
        isActive = !isActive;
        
        if (isActive) {
            startTimerCountdown();
        } else {
            clearInterval(timerInterval);
        }
        
        updatePlayPauseButton();
    }
    
    // Démarrer le compte à rebours du minuteur
    function startTimerCountdown() {
        clearInterval(timerInterval);
        timerInterval = setInterval(() => {
            if (timer > 0) {
                timer--;
                updateDisplay();
            } else {
                clearInterval(timerInterval);
                playSound(gongSound);
                
                // Si un cycle est actif, passer à la session suivante
                if (isCycleActive) {
                    if (isPomodoro) {
                        // Fin d'une session pomodoro
                        if (remainingCycles > 1) {
                            // Passer à une pause courte
                            switchMode('shortBreak');
                        } else {
                            // Passer à une pause longue
                            switchMode('longBreak');
                            remainingCycles = settings.longBreakInterval;
                            updateCycleRemaining();
                        }
                    } else {
                        // Fin d'une pause
                        switchMode('pomodoro');
                        if (mode === 'shortBreak') {
                            remainingCycles--;
                            updateCycleRemaining();
                        }
                    }
                    isActive = true;
                    updatePlayPauseButton();
                    startTimerCountdown(); // Redémarrer immédiatement le timer
                    playSound(pingSound);
                }
            }
        }, 1000);
    }
    
    // Réinitialise le minuteur
    function resetTimer() {
        clearInterval(timerInterval);
        isActive = false;
        
        switch (mode) {
            case 'pomodoro':
                timer = settings.pomodoro;
                break;
            case 'shortBreak':
                timer = settings.shortBreak;
                break;
            case 'longBreak':
                timer = settings.longBreak;
                break;
        }
        
        updateDisplay();
        updatePlayPauseButton();
    }
    
    // Passe à la session suivante dans le cycle
    function skipToNext() {
        if (isCycleActive) {
            clearInterval(timerInterval);
            isActive = false;
            
            if (isPomodoro) {
                // Si on est en mode pomodoro, passer à la pause
                if (remainingCycles > 1) {
                    switchMode('shortBreak');
                } else {
                    switchMode('longBreak');
                    remainingCycles = settings.longBreakInterval;
                    updateCycleRemaining();
                }
            } else {
                // Si on est en pause, passer au prochain pomodoro
                switchMode('pomodoro');
                if (mode === 'shortBreak') {
                    remainingCycles--;
                    updateCycleRemaining();
                }
            }
            
            isActive = true;
            startTimerCountdown();
            updatePlayPauseButton();
        }
    }
    
    // Active/Désactive le son
    function toggleSound() {
        settings.sound = !settings.sound;
        saveSettings(settings);
        updateSoundButton();
    }
    
    // Démarre un cycle
    function startCycle() {
        isCycleActive = true;
        remainingCycles = settings.longBreakInterval;
        switchMode('pomodoro');
        isActive = true;
        updatePlayPauseButton();
        startTimerCountdown();
        playSound(pingSound);
        
        // Mettre à jour l'interface
        startCycleBtn.classList.add('hidden');
        cycleStatus.classList.remove('hidden');
        updateCycleStatus();
        updateCycleRemaining();
    }
    
    // Arrête un cycle
    function stopCycle() {
        isCycleActive = false;
        clearInterval(timerInterval);
        isActive = false;
        
        // Mettre à jour l'interface
        cycleStatus.classList.add('hidden');
        startCycleBtn.classList.remove('hidden');
        updatePlayPauseButton();
    }
    
    // Met à jour l'affichage du statut du cycle
    function updateCycleStatus() {
        const t = translations[settings.language];
        cycleCurrent.textContent = `${t.currentCycle} - ${isPomodoro ? t.work : t.break}`;
    }
    
    // Met à jour l'affichage des cycles restants
    function updateCycleRemaining() {
        const t = translations[settings.language];
        cycleRemaining.textContent = `${t.remainingSessions}: ${remainingCycles}`;
    }
    
    // Ouvre les paramètres
    function openSettings() {
        pomodoroInput.value = Math.floor(settings.pomodoro / 60);
        shortBreakInput.value = Math.floor(settings.shortBreak / 60);
        longBreakInput.value = Math.floor(settings.longBreak / 60);
        intervalInput.value = settings.longBreakInterval;
        soundCheckbox.checked = settings.sound;
        
        // Mettre à jour les boutons de langue
        document.querySelectorAll('.lang-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.lang === settings.language);
        });
        
        settingsModal.classList.remove('hidden');
    }
    
    // Ferme les paramètres sans sauvegarder
    function closeSettings() {
        settingsModal.classList.add('hidden');
    }
    
    // Sauvegarde les paramètres
    function applySettings() {
        const newSettings = {
            pomodoro: Math.max(1, parseInt(pomodoroInput.value)) * 60,
            shortBreak: Math.max(1, parseInt(shortBreakInput.value)) * 60,
            longBreak: Math.max(1, parseInt(longBreakInput.value)) * 60,
            longBreakInterval: Math.max(1, parseInt(intervalInput.value)),
            sound: soundCheckbox.checked,
            language: settings.language
        };
        
        settings = newSettings;
        saveSettings(settings);
        closeSettings();
        
        // Mettre à jour le minuteur actuel si nécessaire
        if (!isActive) {
            resetTimer();
        }
        
        // Mettre à jour les informations du cycle
        updateCycleInfo();
        updateSoundButton();
    }
    
    // Change la langue
    function changeLanguage(lang) {
        settings.language = lang;
        saveSettings(settings);
        
        // Mettre à jour les boutons de langue
        langButtons.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.lang === lang);
        });
        
        langFooterButtons.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.lang === lang);
        });
        
        updateLanguage();
    }
    
    // Initialiser l'application
    function init() {
        // Régler le minuteur initial
        timer = settings.pomodoro;
        updateDisplay();
        updatePlayPauseButton();
        updateSoundButton();
        updateCycleInfo();
        updateLanguage();
        
        // Définir le mode initial
        switchMode('pomodoro');
        
        // Configurer les event listeners
        pomodoroBtn.addEventListener('click', () => switchMode('pomodoro'));
        shortBreakBtn.addEventListener('click', () => switchMode('shortBreak'));
        longBreakBtn.addEventListener('click', () => switchMode('longBreak'));
        playPauseBtn.addEventListener('click', toggleTimer);
        resetBtn.addEventListener('click', resetTimer);
        skipBtn.addEventListener('click', skipToNext);
        soundBtn.addEventListener('click', toggleSound);
        settingsBtn.addEventListener('click', openSettings);
        startCycleBtn.addEventListener('click', startCycle);
        stopCycleBtn.addEventListener('click', stopCycle);
        cancelBtn.addEventListener('click', closeSettings);
        saveBtn.addEventListener('click', applySettings);
        document.getElementById('reset-defaults-btn').addEventListener('click', resetToDefaultSettings);
        
        // Event listeners pour les boutons de langue
        langButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const lang = btn.dataset.lang;
                changeLanguage(lang);
            });
        });
        
        langFooterButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const lang = btn.dataset.lang;
                changeLanguage(lang);
            });
        });
    }
    
    // Démarrer l'application
    init();
});
