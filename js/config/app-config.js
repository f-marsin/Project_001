/* =========================================================
   app-config.js — Constantes globales
   ========================================================= */

window.APP = window.APP || {};

window.APP.CONFIG = {
  NAME: 'Projet_001',
  STEP: 6,
  VERSION: '1.1.0',

  LICHESS_API_BASE: 'https://lichess.org/api',
  LICHESS_PUZZLE_NEXT: '/puzzle/next',

  TASKS_PER_LESSON: 5,
  PUZZLE_DIFFICULTY: 'normal',

  STOCKFISH_DEFAULT_DEPTH: 15,
  STOCKFISH_REVIEW_DEPTH: 12,
  STOCKFISH_MAX_DEPTH: 22,
  STOCKFISH_TIMEOUT_MS: 30000,

  DEV_MODE: true,
  DEBUG: false,

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
