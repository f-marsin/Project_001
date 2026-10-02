/* =========================================================
   user-profile.js — Gestion du profil utilisateur (v1.3.0)
   =========================================================
   Rôle : stocker et lire le profil dans localStorage.
   Structure prête pour Firebase (migration future).

   API exposée : window.APP.UserProfile
     init()                            → charge ou crée le profil
     get()                             → retourne le profil complet
     reset()                           → remet à zéro
     recordAttempt(lessonId, theme, correct, timeSpent)
     getLessonStatus(lessonId)         → 'not_started' | 'in_progress' | 'mastered'
     getThemeStats()                   → stats par thème
     getGlobalStats()                  → stats globales
     getCompletionRate()               → % leçons maîtrisées
   ========================================================= */

window.APP = window.APP || {};

(function () {
  'use strict';

  var STORAGE_KEY = 'projet001_user_profile_v1';
  var MASTERY_THRESHOLD = 3;  /* 3 réussites consécutives = maîtrisée */

  var currentProfile = null;

  /* ================= INITIALISATION ================= */

  function createEmptyProfile() {
    var now = new Date().toISOString().slice(0, 10);
    return {
      userId: 'local-' + generateId(),
      createdAt: now,
      lastActive: now,

      stats: {
        totalAttempts: 0,
        totalCorrect: 0,
        totalTimeSpent: 0       /* en secondes */
      },

      themeStats: {
        'bases':      { attempts: 0, correct: 0 },
        'tactics':    { attempts: 0, correct: 0 },
        'endgames':   { attempts: 0, correct: 0 },
        'opening':    { attempts: 0, correct: 0 },
        'middlegame': { attempts: 0, correct: 0 }
      },

      lessonsProgress: {}
    };
  }

  function generateId() {
    return Math.random().toString(36).substring(2, 10) +
           Date.now().toString(36);
  }

  function load() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      var parsed = JSON.parse(raw);
      /* Sanity check minimal */
      if (!parsed.userId || !parsed.stats) return null;
      return parsed;
    } catch (err) {
      if (window.console) console.warn('[Profile] Lecture impossible :', err.message);
      return null;
    }
  }

  function save() {
    if (!currentProfile) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(currentProfile));
    } catch (err) {
      if (window.console) console.warn('[Profile] Sauvegarde impossible :', err.message);
    }
  }

  function init() {
    var existing = load();
    if (existing) {
      currentProfile = existing;
      /* Migration douce : ajouter champs manquants */
      if (!currentProfile.themeStats) currentProfile.themeStats = createEmptyProfile().themeStats;
      if (!currentProfile.lessonsProgress) currentProfile.lessonsProgress = {};
      if (!currentProfile.stats) currentProfile.stats = createEmptyProfile().stats;
    } else {
      currentProfile = createEmptyProfile();
      save();
    }
    /* Met à jour la date de dernière activité */
    currentProfile.lastActive = new Date().toISOString().slice(0, 10);
    save();
    return currentProfile;
  }

  /* ================= LECTURE ================= */

  function get() {
    if (!currentProfile) init();
    return currentProfile;
  }

  function getGlobalStats() {
    var p = get();
    var attempts = p.stats.totalAttempts || 0;
    var correct = p.stats.totalCorrect || 0;
    var successRate = attempts > 0 ? Math.round((correct / attempts) * 100) : 0;
    var totalTimeMin = Math.round((p.stats.totalTimeSpent || 0) / 60);
    return {
      attempts: attempts,
      correct: correct,
      successRate: successRate,
      timeSpentMin: totalTimeMin
    };
  }

  function getThemeStats() {
    var p = get();
    var result = [];
    var labels = {
      'bases': 'Bases',
      'tactics': 'Tactique',
      'endgames': 'Finales',
      'opening': 'Ouverture',
      'middlegame': 'Milieu de jeu'
    };
    for (var t in p.themeStats) {
      if (!p.themeStats.hasOwnProperty(t)) continue;
      var s = p.themeStats[t];
      var rate = s.attempts > 0 ? Math.round((s.correct / s.attempts) * 100) : 0;
      result.push({
        theme: t,
        label: labels[t] || t,
        attempts: s.attempts,
        correct: s.correct,
        rate: rate
      });
    }
    return result;
  }

  function getLessonStatus(lessonId) {
    var p = get();
    var lp = p.lessonsProgress[lessonId];
    if (!lp || !lp.attempts) return 'not_started';
    if (lp.consecutiveCorrect >= MASTERY_THRESHOLD) return 'mastered';
    return 'in_progress';
  }

  function getCompletionRate() {
    var all = window.APP.getAllLessons ? window.APP.getAllLessons() : [];
    var total = all.length;
    if (total === 0) return { mastered: 0, inProgress: 0, notStarted: 0, percent: 0 };

    var mastered = 0;
    var inProgress = 0;
    var notStarted = 0;
    for (var i = 0; i < total; i++) {
      var status = getLessonStatus(all[i].id);
      if (status === 'mastered') mastered++;
      else if (status === 'in_progress') inProgress++;
      else notStarted++;
    }

    return {
      mastered: mastered,
      inProgress: inProgress,
      notStarted: notStarted,
      total: total,
      percent: total > 0 ? Math.round((mastered / total) * 100) : 0
    };
  }

  /* ================= ÉCRITURE ================= */

  /**
   * Enregistre une tentative sur une leçon.
   * @param {string} lessonId  ex: 'M4-L1'
   * @param {string} theme     ex: 'tactics' (optionnel)
   * @param {boolean} correct  vrai si bonne réponse
   * @param {number} timeSpent secondes (optionnel)
   */
  function recordAttempt(lessonId, theme, correct, timeSpent) {
    if (!lessonId) return;
    var p = get();

    /* Créer l'entrée leçon si nécessaire */
    if (!p.lessonsProgress[lessonId]) {
      p.lessonsProgress[lessonId] = {
        attempts: 0,
        correct: 0,
        consecutiveCorrect: 0,
        lastAttempt: null
      };
    }
    var lp = p.lessonsProgress[lessonId];

    lp.attempts++;
    if (correct) {
      lp.correct++;
      lp.consecutiveCorrect = (lp.consecutiveCorrect || 0) + 1;
    } else {
      lp.consecutiveCorrect = 0;
    }
    lp.lastAttempt = new Date().toISOString().slice(0, 10);

    /* Stats globales */
    p.stats.totalAttempts++;
    if (correct) p.stats.totalCorrect++;
    if (timeSpent && timeSpent > 0) {
      p.stats.totalTimeSpent = (p.stats.totalTimeSpent || 0) + timeSpent;
    }

    /* Stats par thème */
    if (theme && p.themeStats[theme]) {
      p.themeStats[theme].attempts++;
      if (correct) p.themeStats[theme].correct++;
    }

    p.lastActive = new Date().toISOString().slice(0, 10);
    save();
  }

  function reset() {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (err) {}
    currentProfile = null;
    return init();
  }

  /* ================= API ================= */

  window.APP.UserProfile = {
    init: init,
    get: get,
    reset: reset,
    recordAttempt: recordAttempt,
    getLessonStatus: getLessonStatus,
    getThemeStats: getThemeStats,
    getGlobalStats: getGlobalStats,
    getCompletionRate: getCompletionRate
  };
})();
