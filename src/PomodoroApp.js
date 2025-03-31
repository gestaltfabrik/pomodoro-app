// Pomodoro App

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Play, Pause, RotateCcw, SkipForward, Settings, Volume2, VolumeX, Globe, RefreshCw } from 'lucide-react';

const PomodoroApp = () => {
  // Création des références pour les sons
  const gongSoundRef = useRef(null);
  const pingSoundRef = useRef(null);

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
      language: "Langue"
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
      language: "Language"
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
      language: "Limbă"
    }
  };

  // Textes selon la langue sélectionnée
  const t = translations[language] || translations.fr;

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
    setIsActive(false);
    clearInterval(timerInterval.current);
    
    setMode(newMode);
    
    switch (newMode) {
      case 'pomodoro':
        setTimer(settings.pomodoro);
        setIsPomodoro(true);
        break;
      case 'shortBreak':
        setTimer(settings.shortBreak);
        setIsPomodoro(false);
        break;
      case 'longBreak':
        setTimer(settings.longBreak);
        setIsPomodoro(false);
        break;
      default:
        setTimer(settings.pomodoro);
        setIsPomodoro(true);
    }
  }, [settings.longBreak, settings.pomodoro, settings.shortBreak]);

  // Démarre le minuteur - Utilisation de useCallback pour éviter les dépendances circulaires
  const startTimerCountdown = useCallback(() => {
    clearInterval(timerInterval.current);
    timerInterval.current = setInterval(() => {
      setTimer(prevTime => {
        if (prevTime <= 1) {
          clearInterval(timerInterval.current);
          
          // Jouer le son de fin de session
          playSound(gongSoundRef);
          
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
                setRemainingCycles(settings.longBreakInterval);
              }
              setIsActive(true);
            } else {
              // Fin d'une pause
              switchMode('pomodoro');
              if (mode === 'shortBreak') {
                setRemainingCycles(prev => prev - 1);
              }
              setIsActive(true);
            }
            // Jouer le son de début de nouvelle session
            playSound(pingSoundRef);
            
            // Redémarrer le timer pour la prochaine session avec un délai court
            setTimeout(() => {
              clearInterval(timerInterval.current);
              timerInterval.current = setInterval(() => {
                setTimer(prevTime => prevTime > 0 ? prevTime - 1 : 0);
              }, 1000);
            }, 50);
          }
          
          return 0;
        } else {
          return prevTime - 1;
        }
      });
    }, 1000);
  }, [isCycleActive, isPomodoro, mode, remainingCycles, settings.longBreakInterval, playSound, switchMode]);

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
  };

  // Passer à la session suivante
  const skipToNext = () => {
    if (isCycleActive) {
      clearInterval(timerInterval.current);
      setIsActive(false);
      
      if (isPomodoro) {
        // Si on est en mode pomodoro, passer à la pause
        if (remainingCycles > 1) {
          switchMode('shortBreak');
        } else {
          switchMode('longBreak');
          setRemainingCycles(settings.longBreakInterval);
        }
      } else {
        // Si on est en pause, passer au prochain pomodoro
        switchMode('pomodoro');
        if (mode === 'shortBreak') {
          setRemainingCycles(prev => prev - 1);
        }
      }
      
      setIsActive(true);
    }
  };

  // Démarrer un cycle
  const startCycle = () => {
    setIsCycleActive(true);
    setRemainingCycles(settings.longBreakInterval);
    switchMode('pomodoro');
    setIsActive(true);
    playSound(pingSoundRef);
  };

  // Arrêter un cycle
  const stopCycle = () => {
    setIsCycleActive(false);
    setIsActive(false);
    clearInterval(timerInterval.current);
  };

  // Réinitialiser aux paramètres par défaut
  const resetToDefaults = () => {
    const updatedSettings = {
      ...defaultSettings,
      language: language // Conserver la langue actuelle
    };
    setSettings(updatedSettings);
    localStorage.setItem('pomodoroSettings', JSON.stringify(updatedSettings));
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
    
    setShowSettings(false);
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

  // Animation pour le timer
  const timerClass = `text-6xl font-bold mb-8 ${isActive ? 'text-red-500' : ''}`;

  return (
    <div className="flex flex-col items-center p-6 max-w-md mx-auto bg-gray-100 rounded-lg shadow-lg">
      <h1 className="text-3xl font-bold mb-6 text-center">{t.title}</h1>
      
      {/* Modes */}
      <div className="flex justify-center space-x-4 mb-6 w-full">
        <button 
          className={`py-2 px-4 rounded-lg font-medium ${mode === 'pomodoro' ? 'bg-red-500 text-white' : 'bg-gray-200'}`}
          onClick={() => switchMode('pomodoro')}
        >
          {t.pomodoro}
        </button>
        <button 
          className={`py-2 px-4 rounded-lg font-medium ${mode === 'shortBreak' ? 'bg-green-500 text-white' : 'bg-gray-200'}`}
          onClick={() => switchMode('shortBreak')}
        >
          {t.shortBreak}
        </button>
        <button 
          className={`py-2 px-4 rounded-lg font-medium ${mode === 'longBreak' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
          onClick={() => switchMode('longBreak')}
        >
          {t.longBreak}
        </button>
      </div>
      
      {/* Timer */}
      <div className={timerClass}>
        {formatTime(timer)}
      </div>
      
      {/* Contrôles */}
      <div className="flex justify-center space-x-4 mb-6">
        <button 
          className="p-3 rounded-full bg-gray-200 hover:bg-gray-300"
          onClick={toggleTimer}
        >
          {isActive ? <Pause size={24} /> : <Play size={24} />}
        </button>
        <button 
          className="p-3 rounded-full bg-gray-200 hover:bg-gray-300"
          onClick={resetTimer}
        >
          <RotateCcw size={24} />
        </button>
        <button 
          className={`p-3 rounded-full ${isCycleActive ? 'bg-gray-200 hover:bg-gray-300' : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}
          onClick={skipToNext}
          disabled={!isCycleActive}
        >
          <SkipForward size={24} />
        </button>
        <button 
          className="p-3 rounded-full bg-gray-200 hover:bg-gray-300"
          onClick={() => setIsSoundEnabled(!isSoundEnabled)}
        >
          {isSoundEnabled ? <Volume2 size={24} /> : <VolumeX size={24} />}
        </button>
        <button 
          className="p-3 rounded-full bg-gray-200 hover:bg-gray-300"
          onClick={() => setShowSettings(true)}
        >
          <Settings size={24} />
        </button>
      </div>
      
      {/* Cycle */}
      <div className="w-full bg-white p-4 rounded-lg mb-6">
        <h2 className="text-xl font-semibold mb-2">{t.cycle}</h2>
        <p className="mb-2">
          {settings.longBreakInterval} {t.sessions} ({formatTime(settings.pomodoro).slice(0, 2)}min) 
          {' '}{t.with} {settings.longBreakInterval - 1} {t.shortBreaks} ({formatTime(settings.shortBreak).slice(0, 2)}min) 
          {' '}{t.and} 1 {t.longBreakSingle} ({formatTime(settings.longBreak).slice(0, 2)}min).
        </p>
        <p className="mb-4">
          {t.totalDuration}: {formatTotalTime(calculateTotalCycleTime())}
        </p>
        
        {isCycleActive ? (
          <div>
            <p className="mb-2">{t.currentCycle} - {isPomodoro ? t.work : t.break}</p>
            <p className="mb-4">{t.remainingSessions}: {remainingCycles}</p>
            <button 
              className="py-2 px-4 bg-red-500 text-white rounded-lg hover:bg-red-600"
              onClick={stopCycle}
            >
              {t.stopCycle}
            </button>
          </div>
        ) : (
          <button 
            className="py-2 px-4 bg-green-500 text-white rounded-lg hover:bg-green-600"
            onClick={startCycle}
          >
            {t.startCycle}
          </button>
        )}
      </div>
      
      {/* Modal Paramètres */}
      {showSettings && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-md">
            <h2 className="text-2xl font-bold mb-4">{t.settings}</h2>
            
            <div className="mb-4">
              <label className="block mb-2">{t.pomodoroLength}</label>
              <input 
                type="number" 
                className="w-full p-2 border rounded"
                value={settings.pomodoro / 60}
                onChange={(e) => handleSettingChange('pomodoro', e.target.value * 60)}
                min="1"
              />
            </div>
            
            <div className="mb-4">
              <label className="block mb-2">{t.shortBreakLength}</label>
              <input 
                type="number" 
                className="w-full p-2 border rounded"
                value={settings.shortBreak / 60}
                onChange={(e) => handleSettingChange('shortBreak', e.target.value * 60)}
                min="1"
              />
            </div>
            
            <div className="mb-4">
              <label className="block mb-2">{t.longBreakLength}</label>
              <input 
                type="number" 
                className="w-full p-2 border rounded"
                value={settings.longBreak / 60}
                onChange={(e) => handleSettingChange('longBreak', e.target.value * 60)}
                min="1"
              />
            </div>
            
            <div className="mb-4">
              <label className="block mb-2">{t.sessionsBeforeLongBreak}</label>
              <input 
                type="number" 
                className="w-full p-2 border rounded"
                value={settings.longBreakInterval}
                onChange={(e) => handleSettingChange('longBreakInterval', e.target.value)}
                min="1"
              />
            </div>
            
            <div className="mb-4">
              <label className="block mb-2">{t.language}</label>
              <div className="flex space-x-2">
                <button 
                  className={`px-3 py-1 rounded ${language === 'fr' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
                  onClick={() => setLanguage('fr')}
                >
                  Français
                </button>
                <button 
                  className={`px-3 py-1 rounded ${language === 'en' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
                  onClick={() => setLanguage('en')}
                >
                  English
                </button>
                <button 
                  className={`px-3 py-1 rounded ${language === 'ro' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
                  onClick={() => setLanguage('ro')}
                >
                  Română
                </button>
              </div>
            </div>
            
            <div className="mb-6">
              <label className="flex items-center">
                <input 
                  type="checkbox" 
                  checked={isSoundEnabled}
                  onChange={() => setIsSoundEnabled(!isSoundEnabled)}
                  className="mr-2"
                />
                {t.enableSound}
              </label>
            </div>
            
            <div className="flex justify-between space-x-4">
              <button 
                className="py-2 px-4 bg-gray-500 text-white rounded-lg flex items-center"
                onClick={resetToDefaults}
              >
                <RefreshCw size={18} className="mr-1" /> {t.reset}
              </button>
              
              <div className="flex space-x-2">
                <button 
                  className="py-2 px-4 bg-gray-300 rounded-lg"
                  onClick={() => setShowSettings(false)}
                >
                  {t.cancel}
                </button>
                <button 
                  className="py-2 px-4 bg-blue-500 text-white rounded-lg"
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
        <div className="flex items-center space-x-2">
          <Globe size={18} />
          <button 
            className={`px-2 py-1 text-sm rounded ${language === 'fr' ? 'bg-blue-500 text-white' : 'hover:bg-gray-200'}`}
            onClick={() => changeLanguage('fr')}
          >
            FR
          </button>
          <button 
            className={`px-2 py-1 text-sm rounded ${language === 'en' ? 'bg-blue-500 text-white' : 'hover:bg-gray-200'}`}
            onClick={() => changeLanguage('en')}
          >
            EN
          </button>
          <button 
            className={`px-2 py-1 text-sm rounded ${language === 'ro' ? 'bg-blue-500 text-white' : 'hover:bg-gray-200'}`}
            onClick={() => changeLanguage('ro')}
          >
            RO
          </button>
        </div>
      </div>
    </div>
  );
};

export default PomodoroApp;
