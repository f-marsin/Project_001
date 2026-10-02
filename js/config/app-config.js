/* =========================================================
   app-config.js — Constantes globales
   ========================================================= */

window.APP = window.APP || {};

window.APP.CONFIG = {
  NAME: 'Projet_001',
  STEP: 4,
  VERSION: '1.0.8',

  LICHESS_API_BASE: 'https://lichess.org/api',
  LICHESS_PUZZLE_NEXT: '/puzzle/next',

  TASKS_PER_LESSON: 5,
  PUZZLE_DIFFICULTY: 'normal',

  DEV_MODE: true,
  DEBUG: false,   /* ← Debug désactivé (nettoyage Étape 4) */

  get FULLNAME() {
    return this.NAME + ' — Étape ' + this.STEP;
  }
};

if (typeof document !== 'undefined') {
  document.title = window.APP.CONFIG.FULLNAME;
}

window.APP.log = function () {
  if (!window.APP.CONFIG.DEBUG || !window.console) return;
  var args = Array.prototype.slice.call(arguments);
  args.unshift('[APP]');
  console.log.apply(console, args);
};
