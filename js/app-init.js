/* =========================================================
   app-init.js — Point d'entrée de l'application
   =========================================================
   Rôle : orchestrer le démarrage.
   S'exécute en DERNIER, une fois tous les autres modules chargés.
   - Vérification des dépendances (CDN + modules internes)
   - Mise à jour du titre et du badge
   - Init de l'échiquier
   - Branchement des événements globaux (resize, tactile)
   - Logs de debug (selon APP.CONFIG.DEBUG)
   ========================================================= */

(function () {
  'use strict';

  /* =========================================================
     1. VÉRIFICATION DES DÉPENDANCES
     ========================================================= */

  function checkDependencies() {
    var missing = [];

    /* CDN externes */
    if (!window.jQuery)       missing.push('jQuery (CDN)');
    if (!window.Chessboard)   missing.push('Chessboard.js (CDN)');
    if (!window.Chess)        missing.push('chess.js (CDN)');

    /* Modules internes */
    if (!window.APP)                  missing.push('window.APP (config)');
    if (!window.APP || !window.APP.CONFIG)      missing.push('config/app-config.js');
    if (!window.APP || !window.APP.CURRICULUM)  missing.push('data/curriculum.js');
    if (!window.APP || !window.APP.Board)       missing.push('core/board-core.js');

    return missing;
  }

  function showFatalError(missing) {
    document.body.innerHTML =
      '<div style="padding:40px;font-family:monospace;font-size:14px;line-height:1.6;background:#121212;color:#e8e8e8;min-height:100vh;">' +
        '<h2 style="color:#ff5757;margin-bottom:20px;">⚠️ Erreur de chargement</h2>' +
        '<p style="margin-bottom:20px;">Certains modules n\'ont pas pu être chargés :</p>' +
        '<ul style="margin-left:20px;color:#fbbf24;">' +
          missing.map(function (m) { return '<li>' + m + '</li>'; }).join('') +
        '</ul>' +
        '<p style="color:#9a9a9a;margin-top:30px;font-size:12px;">' +
          'Ouvre la console (F12) pour plus de détails.' +
        '</p>' +
      '</div>';
  }

  /* =========================================================
     2. IDENTITÉ VISUELLE
     ========================================================= */

  function applyIdentity() {
    var CFG = window.APP.CONFIG;
    if (!CFG) return;

    /* Titre de l'onglet */
    document.title = CFG.FULLNAME;

    /* Badge dans l'en-tête */
    var badge = document.getElementById('app-badge');
    if (badge) badge.textContent = 'ÉTAPE ' + CFG.STEP;

    /* Titre affiché */
    var title = document.getElementById('app-title');
    if (title) title.textContent = '♟ ' + CFG.NAME;
  }

  /* =========================================================
     3. ÉVÉNEMENTS GLOBAUX
     ========================================================= */

  function bindResize() {
    var timer = null;
    window.addEventListener('resize', function () {
      clearTimeout(timer);
      timer = setTimeout(function () {
        if (window.APP.Board) {
          window.APP.Board.resize();
          window.APP.Board.applyLastMoveHighlight();
        }
      }, 120);
    });
    window.addEventListener('orientationchange', function () {
      setTimeout(function () {
        if (window.APP.Board) window.APP.Board.resize();
      }, 250);
    });
  }

  function bindTouchHandlers() {
    /* Anti-double-tap zoom */
    var lastTouchEnd = 0;
    document.addEventListener('touchend', function (e) {
      var now = Date.now();
      if (now - lastTouchEnd <= 300 && !e.defaultPrevented) e.preventDefault();
      lastTouchEnd = now;
    }, { passive: false });

    /* Anti pull-to-refresh dans la zone échiquier */
    var boardWrap = document.getElementById('board-wrap');
    if (boardWrap) {
      boardWrap.addEventListener('touchmove', function (e) {
        e.preventDefault();
      }, { passive: false });
    }
  }

  /* =========================================================
     4. VÉRIFICATION DES FEN AU CHARGEMENT (bonus debug)
     ========================================================= */

  function validateAllFens() {
    if (!window.APP.CONFIG.DEBUG) return;
    var problems = [];
    var totalChecked = 0;

    /* (Vide pour l'instant — sera rempli à l'Étape 3 quand on aura
       la banque de puzzles. On garde la structure prête.) */

    if (window.console) {
      if (problems.length === 0) {
        window.APP.log('FEN Check : ' + totalChecked + ' positions vérifiées.');
      } else {
        console.warn('[FEN Check] ⚠️ ' + problems.length + ' problème(s) :');
        problems.forEach(function (p) { console.warn('  - ' + p); });
      }
    }
  }

  /* =========================================================
     5. INIT PRINCIPAL
     ========================================================= */

  function init() {
    var missing = checkDependencies();
    if (missing.length > 0) {
      showFatalError(missing);
      return;
    }

    try {
      window.APP.log('Init démarré.');

      /* Identité visuelle */
      applyIdentity();

      /* Échiquier */
      window.APP.Board.init();

      /* Événements globaux */
      bindResize();
      bindTouchHandlers();

      /* Vérifications de debug */
      validateAllFens();

      /* Resize final après application du CSS */
      setTimeout(function () {
        window.APP.Board.resize();
      }, 100);

      window.APP.log('Init terminé.');
    } catch (err) {
      var panel = document.querySelector('.panel');
      if (panel) {
        var box = document.createElement('div');
        box.style.cssText =
          'background:#3a1010;color:#ff5757;padding:14px;' +
          'border-radius:8px;margin-bottom:12px;' +
          'font-family:monospace;font-size:12px;line-height:1.4;';
        box.textContent = '⚠️ Erreur d\'initialisation : ' + err.message;
        panel.insertBefore(box, panel.firstChild);
      }
      if (window.console) console.error('[APP] Init error:', err);
    }
  }

  /* =========================================================
     6. DÉMARRAGE
     ========================================================= */

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
