// Pomodoro App

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Play, Pause, RotateCcw, SkipForward, Settings, Volume2, VolumeX, Globe, RefreshCw } from 'lucide-react';

const PomodoroApp = () => {
  // Création des références pour les sons
  const gongSoundRef = useRef(null);
  const pingSoundRef = useRef(null);
  const announceRef = useRef(null); // Référence pour les annonces d'accessibilité

  useEffect(() => {
    // Initialisation des sons avec des versions plus douces
    gongSoundRef.current = new Audio("https://assets.mixkit.co/active_storage/sfx/208/208-preview.mp3");
    pingSoundRef.current = new Audio("https://assets.mixkit.co/active_storage/sfx/1531/1531-preview.mp3");
    
    // Ajustement du volume pour des sons plus doux
    gongSoundRef.current.volume = 0.5;
    pingSoundRef.current.volume = 0.5;
  }, []);

  // Paramètres par défaut
  const defaultSettings = {
    pomodoro: 25 * 60,
    shortBreak: 5 * 60,
    longBreak: 20 * 60, // 20 minutes par défaut pour la pause longue
    longBreakInterval: 4,
    sound: true,
    language: 'fr' // Langue par défaut: français
  };

  // Récupération des paramètres enregistrés dans le localStorage
  const getSavedSettings = () => {
    if (typeof window !== 'undefined') {
      const savedSettings = localStorage.getItem('pomodoroSettings');
      return savedSettings ? JSON.parse(savedSettings) : defaultSettings;
    }
    return defaultSettings;
  };

  // États
  const [settings, setSettings] = useState(getSavedSettings());
  const [timer, setTimer] = useState(settings.pomodoro);
  const [isActive, setIsActive] = useState(false);
  const [mode, setMode] = useState('pomodoro');
  const [showSettings, setShowSettings] = useState(false);
  const [isCycleActive, setIsCycleActive] = useState(false);
  const [isSoundEnabled, setIsSoundEnabled] = useState(settings.sound);
  const [remainingCycles, setRemainingCycles] = useState(settings.longBreakInterval);
  const [isPomodoro, setIsPomodoro] = useState(true);
  const [language, setLanguage] = useState(settings.language || 'fr');
  const [completedPomodoros, setCompletedPomodoros] = useState(0); // Nombre de pomodoros terminés dans le cycle
  const [announcement, setAnnouncement] = useState(''); // Pour les annonces d'accessibilité
  
  // Références pour les intervalles
  const timerInterval = useRef(null);

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
      reset: "Réinitialiser",
      language: "Langue",
      cycleCompleted: "Cycle terminé !",
      timeUp: "Temps écoulé !",
      startingCycle: "Démarrage du cycle",
      startingSession: "Démarrage d'une session",
      startingBreak: "Démarrage d'une pause"
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
      reset: "Reset",
      language: "Language",
      cycleCompleted: "Cycle completed!",
      timeUp: "Time's up!",
      startingCycle: "Starting cycle",
      startingSession: "Starting a session",
      startingBreak: "Starting a break"
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
      reset: "Resetează",
      language: "Limbă",
      cycleCompleted: "Ciclu finalizat!",
      timeUp: "Timpul a expirat!",
      startingCycle: "Începerea ciclului",
      startingSession: "Începerea unei sesiuni",
      startingBreak: "Începerea unei pauze"
    }
  };

  // Textes selon la langue sélectionnée
  const t = translations[language] || translations.fr;
  
  // Announce pour l'accessibilité
  const announce = useCallback((message) => {
    setAnnouncement(message);
    // Créer un élément ARIA-live temporaire pour les annonces
    if (!announceRef.current) {
      announceRef.current = document.createElement('div');
      announceRef.current.setAttribute('aria-live', 'assertive');
      announceRef.current.className = 'sr-only';
      document.body.appendChild(announceRef.current);
    }
    announceRef.current.textContent = message;
    
    // Nettoyer après 3 secondes
    setTimeout(() => {
      if (announceRef.current) {
        announceRef.current.textContent = '';
      }
    }, 3000);
  }, []);

  // Calcul du temps total du cycle
  const calculateTotalCycleTime = () => {
    const pomodoroTime = settings.pomodoro * settings.longBreakInterval;
    const shortBreakTime = settings.shortBreak * (settings.longBreakInterval - 1);
    const longBreakTime = settings.longBreak;
    return pomodoroTime + shortBreakTime + longBreakTime;
  };

  // Format du temps
  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  // Format du temps total (heures et minutes)
  const formatTotalTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (hours > 0) {
      return `${hours}h${minutes > 0 ? ` ${minutes}min` : ''}`;
    }
    return `${minutes}min`;
  };

  // Jouer un son
  const playSound = useCallback((sound) => {
    if (isSoundEnabled && sound.current) {
      sound.current.currentTime = 0;
      sound.current.play().catch(err => console.log('Erreur audio:', err));
    }
  }, [isSoundEnabled]);

  // Gérer le changement de mode
  const switchMode = useCallback((newMode) => {
    clearInterval(timerInterval.current);
    
    setMode(newMode);
    
    switch (newMode) {
      case 'pomodoro':
        setTimer(settings.pomodoro);
        setIsPomodoro(true);
        announce(t.startingSession);
        break;
      case 'shortBreak':
        setTimer(settings.shortBreak);
        setIsPomodoro(false);
        announce(t.startingBreak);
        break;
      case 'longBreak':
        setTimer(settings.longBreak);
        setIsPomodoro(false);
        announce(t.startingBreak);
        break;
      default:
        setTimer(settings.pomodoro);
        setIsPomodoro(true);
        break;
    }
  }, [settings.longBreak, settings.pomodoro, settings.shortBreak, announce, t]);

  // Passer à la session suivante dans la séquence du cycle
  const moveToNextSession = useCallback(() => {
    // Logique pour déterminer la prochaine étape du cycle
    if (isPomodoro) {
      // On vient de terminer un pomodoro, on incrémente le compteur
      const newCompletedPomodoros = completedPomodoros + 1;
      setCompletedPomodoros(newCompletedPomodoros);
      
      // On calcule combien de pomodoros il reste avant la pause longue
      const sessionsRemaining = settings.longBreakInterval - newCompletedPomodoros;
      setRemainingCycles(sessionsRemaining);
      
      if (sessionsRemaining <= 0) {
        // C'est l'heure de la pause longue
        switchMode('longBreak');
      } else {
        // Pause courte
        switchMode('shortBreak');
      }
    } else {
      // On vient de terminer une pause
      if (mode === 'longBreak') {
        // Si c'était la pause longue, on a terminé le cycle complet
        setIsCycleActive(false);
        setIsActive(false);
        setCompletedPomodoros(0);
        setRemainingCycles(settings.longBreakInterval);
        switchMode('pomodoro');
        announce(t.cycleCompleted);
        return; // On s'arrête ici
      } else {
        // C'était une pause courte, on continue avec le prochain pomodoro
        switchMode('pomodoro');
      }
    }
    
    // Redémarrer automatiquement le timer
    setIsActive(true);
  }, [completedPomodoros, isPomodoro, mode, settings.longBreakInterval, switchMode, announce, t]);

  // Démarre le minuteur
  const startTimerCountdown = useCallback(() => {
    clearInterval(timerInterval.current);
    timerInterval.current = setInterval(() => {
      setTimer(prevTime => {
        if (prevTime <= 1) {
          clearInterval(timerInterval.current);
          
          // Jouer le son de fin de session
          playSound(gongSoundRef);
          announce(t.timeUp);
          
          // Si un cycle est actif, passer à la session suivante
          if (isCycleActive) {
            playSound(pingSoundRef);
            moveToNextSession();
          } else {
            setIsActive(false);
          }
          
          return 0;
        } else {
          return prevTime - 1;
        }
      });
    }, 1000);
  }, [isCycleActive, moveToNextSession, playSound, announce, t]);

  // Réinitialiser le minuteur
  const resetTimer = useCallback(() => {
    setIsActive(false);
    clearInterval(timerInterval.current);
    
    switch (mode) {
      case 'pomodoro':
        setTimer(settings.pomodoro);
        break;
      case 'shortBreak':
        setTimer(settings.shortBreak);
        break;
      case 'longBreak':
        setTimer(settings.longBreak);
        break;
      default:
        setTimer(settings.pomodoro);
    }
  }, [mode, settings.longBreak, settings.pomodoro, settings.shortBreak]);

  // Démarrer/Pause le minuteur
  const toggleTimer = () => {
    setIsActive(!isActive);
    announce(isActive ? 'Pause' : 'Reprise');
  };

  // Passer à la session suivante
  const skipToNext = () => {
    if (isCycleActive) {
      clearInterval(timerInterval.current);
      setIsActive(false);
      moveToNextSession();
      announce(`Passage à la ${isPomodoro ? 'pause' : 'session de travail'} suivante`);
    }
  };

  // Démarrer un cycle
  const startCycle = () => {
    setIsCycleActive(true);
    setCompletedPomodoros(0);
    setRemainingCycles(settings.longBreakInterval);
    switchMode('pomodoro');
    setIsActive(true);
    playSound(pingSoundRef);
    announce(t.startingCycle);
  };

  // Arrêter un cycle
  const stopCycle = () => {
    setIsCycleActive(false);
    setIsActive(false);
    setCompletedPomodoros(0);
    setRemainingCycles(settings.longBreakInterval);
    clearInterval(timerInterval.current);
    announce('Cycle arrêté');
  };

  // Réinitialiser aux paramètres par défaut
  const resetToDefaults = () => {
    const updatedSettings = {
      ...defaultSettings,
      language: language // Conserver la langue actuelle
    };
    setSettings(updatedSettings);
    localStorage.setItem('pomodoroSettings', JSON.stringify(updatedSettings));
    announce('Paramètres réinitialisés');
  };

  // Gérer le changement des paramètres
  const handleSettingChange = (key, value) => {
    // Validation des entrées numériques
    if (typeof value === 'string' && !isNaN(value)) {
      value = parseInt(value, 10);
    }
    
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  // Sauvegarder les paramètres
  const saveSettings = () => {
    const updatedSettings = {
      ...settings,
      pomodoro: Math.max(1 * 60, settings.pomodoro),
      shortBreak: Math.max(1 * 60, settings.shortBreak),
      longBreak: Math.max(1 * 60, settings.longBreak),
      longBreakInterval: Math.max(1, settings.longBreakInterval),
      sound: isSoundEnabled,
      language: language
    };
    
    setSettings(updatedSettings);
    localStorage.setItem('pomodoroSettings', JSON.stringify(updatedSettings));
    
    // Mettre à jour le timer actuel si nécessaire
    switch (mode) {
      case 'pomodoro':
        setTimer(updatedSettings.pomodoro);
        break;
      case 'shortBreak':
        setTimer(updatedSettings.shortBreak);
        break;
      case 'longBreak':
        setTimer(updatedSettings.longBreak);
        break;
      default:
        break;
    }
    
    // Reset cycle state if settings change
    if (isCycleActive) {
      setRemainingCycles(updatedSettings.longBreakInterval);
    }
    
    setShowSettings(false);
    announce('Paramètres sauvegardés');
  };

  // Changer la langue
  const changeLanguage = (lang) => {
    setLanguage(lang);
    setSettings(prev => ({
      ...prev,
      language: lang
    }));
    localStorage.setItem('pomodoroSettings', JSON.stringify({
      ...settings,
      language: lang
    }));
    
    // Annoncer le changement de langue
    const langNames = {
      fr: 'Français',
      en: 'English',
      ro: 'Română'
    };
    announce(`Langue changée pour ${langNames[lang]}`);
  };

  // Effet pour le timer
  useEffect(() => {
    if (isActive) {
      startTimerCountdown();
    } else {
      clearInterval(timerInterval.current);
    }

    return () => clearInterval(timerInterval.current);
  }, [isActive, startTimerCountdown]);

  // Effet pour les paramètres
  useEffect(() => {
    // Si on n'est pas en cycle actif et qu'on change les paramètres
    if (!isActive && !isCycleActive) {
      resetTimer();
    }
    
    // Mettre à jour le localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('pomodoroSettings', JSON.stringify(settings));
    }
  }, [settings, isActive, isCycleActive, resetTimer]);

  // Nettoyage lors du démontage
  useEffect(() => {
    return () => {
      if (announceRef.current) {
        document.body.removeChild(announceRef.current);
      }
    };
  }, []);

  // Animation pour le timer
  const timerClass = `text-6xl font-bold mb-8 ${isActive ? 'text-red-500' : ''}`;

  return (
    <div className="flex flex-col items-center justify-center p-6 max-w-md mx-auto bg-gray-100 rounded-lg shadow-lg min-h-screen">
      {/* Région d'annonce pour l'accessibilité */}
      <div className="sr-only" aria-live="polite">{announcement}</div>
      
      <h1 className="text-3xl font-bold mb-6 text-center" id="page-title">{t.title}</h1>
      
      {/* Modes */}
      <div 
        className="flex justify-center space-x-4 mb-6 w-full" 
        role="tablist" 
        aria-label="Modes de minuterie"
      >
        <button 
          className={`py-2 px-4 rounded-lg font-medium ${mode === 'pomodoro' ? 'bg-red-600 text-white' : 'bg-gray-200'}`}
          onClick={() => switchMode('pomodoro')}
          role="tab"
          aria-selected={mode === 'pomodoro'}
          aria-controls="timer-display"
          id="tab-pomodoro"
        >
          {t.pomodoro}
        </button>
        <button 
          className={`py-2 px-4 rounded-lg font-medium ${mode === 'shortBreak' ? 'bg-green-600 text-white' : 'bg-gray-200'}`}
          onClick={() => switchMode('shortBreak')}
          role="tab"
          aria-selected={mode === 'shortBreak'}
          aria-controls="timer-display"
          id="tab-short-break"
        >
          {t.shortBreak}
        </button>
        <button 
          className={`py-2 px-4 rounded-lg font-medium ${mode === 'longBreak' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
          onClick={() => switchMode('longBreak')}
          role="tab"
          aria-selected={mode === 'longBreak'}
          aria-controls="timer-display"
          id="tab-long-break"
        >
          {t.longBreak}
        </button>
      </div>
      
      {/* Timer */}
      <div 
        className={timerClass} 
        id="timer-display" 
        role="timer" 
        aria-live="polite"
        aria-atomic="true"
        aria-label={`${isPomodoro ? t.work : t.break} timer`}
      >
        {formatTime(timer)}
      </div>
      
      {/* Contrôles */}
      <div className="flex justify-center space-x-4 mb-6" role="group" aria-label="Contrôles du minuteur">
        <button 
          className="p-3 rounded-full bg-gray-200 hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
          onClick={toggleTimer}
          aria-label={isActive ? 'Pause' : 'Play'}
        >
          {isActive ? <Pause size={24} aria-hidden="true" /> : <Play size={24} aria-hidden="true" />}
        </button>
        <button 
          className="p-3 rounded-full bg-gray-200 hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
          onClick={resetTimer}
          aria-label="Réinitialiser le minuteur"
        >
          <RotateCcw size={24} aria-hidden="true" />
        </button>
        <button 
          className={`p-3 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            isCycleActive ? 'bg-gray-200 hover:bg-gray-300' : 'bg-gray-100 text-gray-400 cursor-not-allowed'
          }`}
          onClick={skipToNext}
          disabled={!isCycleActive}
          aria-label="Passer à la session suivante"
          aria-disabled={!isCycleActive}
        >
          <SkipForward size={24} aria-hidden="true" />
        </button>
        <button 
          className="p-3 rounded-full bg-gray-200 hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
          onClick={() => setIsSoundEnabled(!isSoundEnabled)}
          aria-label={isSoundEnabled ? "Désactiver le son" : "Activer le son"}
          aria-pressed={isSoundEnabled}
        >
          {isSoundEnabled ? 
            <Volume2 size={24} aria-hidden="true" /> : 
            <VolumeX size={24} aria-hidden="true" />}
        </button>
        <button 
          className="p-3 rounded-full bg-gray-200 hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
          onClick={() => setShowSettings(true)}
          aria-label="Ouvrir les paramètres"
          aria-haspopup="dialog"
        >
          <Settings size={24} aria-hidden="true" />
        </button>
      </div>
      
      {/* Cycle */}
      <div 
        className="w-full bg-white p-4 rounded-lg mb-6 shadow" 
        role="region" 
        aria-labelledby="cycle-title"
      >
        <h2 className="text-xl font-semibold mb-2" id="cycle-title">{t.cycle}</h2>
        <p className="mb-2">
          {settings.longBreakInterval} {t.sessions} ({formatTime(settings.pomodoro).slice(0, 2)}min) 
          {' '}{t.with} {settings.longBreakInterval - 1} {t.shortBreaks} ({formatTime(settings.shortBreak).slice(0, 2)}min) 
          {' '}{t.and} 1 {t.longBreakSingle} ({formatTime(settings.longBreak).slice(0, 2)}min).
        </p>
        <p className="mb-4">
          {t.totalDuration}: {formatTotalTime(calculateTotalCycleTime())}
        </p>
        
        {isCycleActive ? (
          <div role="status" aria-live="polite">
            <p className="mb-2">{t.currentCycle} - {isPomodoro ? t.work : t.break}</p>
            <p className="mb-4">{t.remainingSessions}: {remainingCycles}</p>
            <button 
              className="py-2 px-4 bg-red-600 text-white rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
              onClick={stopCycle}
              aria-label="Arrêter le cycle"
            >
              {t.stopCycle}
            </button>
          </div>
        ) : (
          <button 
            className="py-2 px-4 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
            onClick={startCycle}
            aria-label="Démarrer un cycle"
          >
            {t.startCycle}
          </button>
        )}
      </div>
      
      {/* Modal Paramètres */}
      {showSettings && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          role="dialog" 
          aria-modal="true" 
          aria-labelledby="settings-title"
        >
          <div 
            className="bg-white p-6 rounded-lg w-full max-w-md shadow-lg"
            tabIndex="-1"
          >
            <h2 className="text-2xl font-bold mb-4" id="settings-title">{t.settings}</h2>
            
            <div className="mb-4">
              <label className="block mb-2" htmlFor="pomodoro-input">{t.pomodoroLength}</label>
              <input 
                type="number" 
                className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={settings.pomodoro / 60}
                onChange={(e) => handleSettingChange('pomodoro', e.target.value * 60)}
                min="1"
                id="pomodoro-input"
                aria-describedby="pomodoro-description"
              />
              <span id="pomodoro-description" className="sr-only">En minutes</span>
            </div>
            
            <div className="mb-4">
              <label className="block mb-2" htmlFor="short-break-input">{t.shortBreakLength}</label>
              <input 
                type="number" 
                className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={settings.shortBreak / 60}
                onChange={(e) => handleSettingChange('shortBreak', e.target.value * 60)}
                min="1"
                id="short-break-input"
                aria-describedby="short-break-description"
              />
              <span id="short-break-description" className="sr-only">En minutes</span>
            </div>
            
            <div className="mb-4">
              <label className="block mb-2" htmlFor="long-break-input">{t.longBreakLength}</label>
              <input 
                type="number" 
                className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={settings.longBreak / 60}
                onChange={(e) => handleSettingChange('longBreak', e.target.value * 60)}
                min="1"
                id="long-break-input"
                aria-describedby="long-break-description"
              />
              <span id="long-break-description" className="sr-only">En minutes</span>
            </div>
            
            <div className="mb-4">
              <label className="block mb-2" htmlFor="interval-input">{t.sessionsBeforeLongBreak}</label>
              <input 
                type="number" 
                className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={settings.longBreakInterval}
                onChange={(e) => handleSettingChange('longBreakInterval', e.target.value)}
                min="1"
                id="interval-input"
              />
            </div>
            
            <div className="mb-4">
              <fieldset>
                <legend className="block mb-2">{t.language}</legend>
                <div className="flex space-x-2" role="radiogroup">
                  <button 
                    className={`px-3 py-1 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 ${language === 'fr' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
                    onClick={() => setLanguage('fr')}
                    role="radio"
                    aria-checked={language === 'fr'}
                  >
                    Français
                  </button>
                  <button 
                    className={`px-3 py-1 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 ${language === 'en' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
                    onClick={() => setLanguage('en')}
                    role="radio"
                    aria-checked={language === 'en'}
                  >
                    English
                  </button>
                  <button 
                    className={`px-3 py-1 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 ${language === 'ro' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
                    onClick={() => setLanguage('ro')}
                    role="radio"
                    aria-checked={language === 'ro'}
                  >
                    Română
                  </button>
                </div>
              </fieldset>
            </div>
            
            <div className="mb-6">
              <div className="flex items-center">
                <input 
                  type="checkbox" 
                  checked={isSoundEnabled}
                  onChange={() => setIsSoundEnabled(!isSoundEnabled)}
                  className="mr-2 h-4 w-4"
                  id="sound-checkbox"
                />
                <label htmlFor="sound-checkbox">{t.enableSound}</label>
              </div>
            </div>
            
            <div className="flex justify-between space-x-4">
              <button 
                className="py-2 px-4 bg-gray-500 text-white rounded-lg flex items-center hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500"
                onClick={resetToDefaults}
                aria-label="Réinitialiser aux valeurs par défaut"
              >
                <RefreshCw size={18} className="mr-1" aria-hidden="true" /> {t.reset}
              </button>
              
              <div className="flex space-x-2">
                <button 
                  className="py-2 px-4 bg-gray-300 rounded-lg hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-400"
                  onClick={() => setShowSettings(false)}
                >
                  {t.cancel}
                </button>
                <button 
                  className="py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  onClick={saveSettings}
                >
                  {t.save}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Footer avec sélecteur de langue */}
      <div className="w-full pt-4 mt-4 border-t border-gray-300 flex justify-center items-center">
        <div 
          className="flex items-center space-x-2" 
          role="radiogroup" 
          aria-label="Sélection de langue"
        >
          <Globe size={18} aria-hidden="true" />
          <button 
            className={`px-2 py-1 text-sm rounded focus:outline-none focus:ring-2 focus:ring-blue-500 ${language === 'fr' ? 'bg-blue-600 text-white' : 'hover:bg-gray-200'}`}
            onClick={() => changeLanguage('fr')}
            role="radio"
            aria-checked={language === 'fr'}
            aria-label="Français"
          >
            FR
          </button>
          <button 
            className={`px-2 py-1 text-sm rounded focus:outline-none focus:ring-2 focus:ring-blue-500 ${language === 'en' ? 'bg-blue-600 text-white' : 'hover:bg-gray-200'}`}
            onClick={() => changeLanguage('en')}
            role="radio"
            aria-checked={language === 'en'}
            aria-label="English"
          >
            EN
          </button>
          <button 
            className={`px-2 py-1 text-sm rounded focus:outline-none focus:ring-2 focus:ring-blue-500 ${language === 'ro' ? 'bg-blue-600 text-white' : 'hover:bg-gray-200'}`}
            onClick={() => changeLanguage('ro')}
            role="radio"
            aria-checked={language === 'ro'}
            aria-label="Română"
          >
            RO
          </button>
        </div>
      </div>
    </div>
  );
};

export default PomodoroApp;
