/* =========================================================
   app-config.js — Constantes globales (v1.5.0)
   ========================================================= */

window.APP = window.APP || {};

window.APP.CONFIG = {
  NAME: 'Projet_001',
  STEP: 7,
  VERSION: '1.5.0',

  LICHESS_API_BASE: 'https://lichess.org/api',
  LICHESS_PUZZLE_NEXT: '/puzzle/next',

  TASKS_PER_LESSON: 5,
  PUZZLE_DIFFICULTY: 'normal',

  STOCKFISH_DEFAULT_DEPTH: 15,
  STOCKFISH_REVIEW_DEPTH: 12,
  STOCKFISH_MAX_DEPTH: 22,
  STOCKFISH_TIMEOUT_MS: 30000,

  THEMES: ['bases', 'tactics', 'endgames', 'opening', 'middlegame', 'psychology'],

  PROFILE_STORAGE_KEY: 'projet001_user_profile_v1',
  MASTERY_THRESHOLD: 3,

  DEV_MODE: true,
  DEBUG: false,

  get FULLNAME() { return this.NAME + ' — Étape ' + this.STEP; }
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
