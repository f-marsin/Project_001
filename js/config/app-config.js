/* =========================================================
   app-config.js — Constantes globales de l'application
   =========================================================
   Rôle : identité du projet, versions, paramètres modifiables.
   Le <title> du document est mis à jour automatiquement ici.
   ========================================================= */

window.APP = window.APP || {};

window.APP.CONFIG = {
  /* Identité */
  NAME: 'Projet_001',
  STEP: 1,
  VERSION: '1.0.0',

  /* Source pédagogique principale (Lichess) */
  LICHESS_API_BASE: 'https://lichess.org/api',
  LICHESS_PUZZLE_NEXT: '/puzzle/next',

  /* Réglages pédagogiques */
  TASKS_PER_LESSON: 5,          /* nombre de tâches tirées par session */
  PUZZLE_DIFFICULTY: 'normal',  /* easiest | easier | normal | harder | hardest */

  /* Mode développement */
  DEV_MODE: true,               /* true = tous les modules déverrouillés */
  DEBUG: true,                  /* true = logs console activés */

  /* Getter : nom complet avec étape */
  get FULLNAME() {
    return this.NAME + ' — Étape ' + this.STEP;
  }
};

/* ---------- Application immédiate du titre ---------- */
if (typeof document !== 'undefined') {
  document.title = window.APP.CONFIG.FULLNAME;
}

/* ---------- Helper de log global ---------- */
window.APP.log = function () {
  if (!window.APP.CONFIG.DEBUG || !window.console) return;
  var args = Array.prototype.slice.call(arguments);
  args.unshift('[APP]');
  console.log.apply(console, args);
};
