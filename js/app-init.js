/* =========================================================
   app-init.js — Point d'entrée de l'application
   =========================================================
   S'exécute en dernier, une fois tous les autres modules
   chargés. Orchestre :
     - La mise à jour du badge d'en-tête (ÉTAPE N)
     - L'initialisation de l'échiquier (Board)
     - L'initialisation de la navigation (UINav)
     - Le branchement du resize / orientation
     - Le branchement des interactions tactiles
   ========================================================= */

(function () {
  'use strict';

  /* ---------- Mise à jour du titre + badge ---------- */
  function applyIdentity() {
    var CFG = window.APP.CONFIG;
    if (!CFG) return;
    document.title = CFG.FULLNAME;

    var badge = document.getElementById('app-badge');
    if (badge) badge.textContent = 'ÉTAPE ' + CFG.STEP;

    var title = document.getElementById('app-title');
    if (title) title.textContent = '♟ ' + CFG.NAME;
  }

  /* ---------- Branchement des événements Board ---------- */
  function bindBoardEvents() {
    /* Le onSnapEnd du Board doit remonter à UINav pour rafraîchir le panneau */
    window.APP.Board.setOnSnapEndHandler(function () {
      if (window.APP.Board.isLessonMode()) return;

      var game = window.APP.Board.getGame();
      window.APP.Board.position(game.fen(), false);
      window.APP.Board.applyLastMoveHighlight();

      var hist = game.history({ verbose: true });
      var lastMove = hist.length > 0 ? hist[hist.length - 1] : null;
      if (window.APP.UINav) {
        window.APP.UINav.onFreeplaySnapEnd(null, lastMove);
      }
    });
  }

  /* ---------- Redimensionnement ---------- */
  function bindResize() {
    var timer = null;
    window.addEventListener('resize', function () {
      clearTimeout(timer);
      timer = setTimeout(function () {
        if (window.APP.Board) window.APP.Board.resize();
        if (window.APP.Board) window.APP.Board.applyLastMoveHighlight();
      }, 120);
    });
    window.addEventListener('orientationchange', function () {
      setTimeout(function () {
        if (window.APP.Board) window.APP.Board.resize();
      }, 250);
    });
  }

  /* ---------- Interactions tactiles iOS ---------- */
  function bindTouchHandlers() {
    /* Anti double-tap zoom */
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

  /* ---------- Branchement clic sur les cases (identify-square) ---------- */
  function bindSquareClicks() {
    var wrap = document.getElementById('board-wrap');
    if (!wrap) return;

    wrap.addEventListener('click', function (e) {
      var engine = window.APP.LessonEngine;
      var board = window.APP.Board;
      if (!engine || !board || !board.isLessonMode()) return;

      var st = engine.getState();
      if (!st.play || st.play.kind !== 'identify-square') return;

      var sq = e.target.closest('[class*="square-"]');
      if (!sq) return;
      var match = sq.className.match(/square-([a-h][1-8])/);
      if (!match) return;

      engine.checkIdentifySquare(match[1]);
    }, false);
  }

  /* ---------- Init principal ---------- */
  function init() {
    try {
      /* 1. Identité visuelle */
      applyIdentity();

      /* 2. Échiquier */
      window.APP.Board.init();

      /* 3. Handlers Board vers UINav */
      bindBoardEvents();

      /* 4. Navigation + panneau */
      window.APP.UINav.init();

      /* 5. Redimensionnement */
      bindResize();

      /* 6. Tactile */
      bindTouchHandlers();

      /* 7. Clic cases (identify-square) */
      bindSquareClicks();

      /* 8. Petit délai puis resize final (au cas où le CSS n'est pas encore appliqué) */
      setTimeout(function () {
        window.APP.Board.resize();
      }, 100);

    } catch (err) {
      /* Diagnostic visible sur la page en cas de problème d'init */
      var panel = document.querySelector('.panel');
      if (panel) {
        var box = document.createElement('div');
        box.style.cssText = 'background:#3a1010;color:#ff5757;padding:14px;border-radius:8px;margin-bottom:12px;font-family:monospace;font-size:12px;line-height:1.4;';
        box.textContent = '⚠️ Erreur d\'initialisation : ' + err.message;
        panel.insertBefore(box, panel.firstChild);
      }
      /* Log console pour debug */
      if (window.console && console.error) console.error('[Projet_001] Init error:', err);
    }
  }

  /* ---------- Démarrage ---------- */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
