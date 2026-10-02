/* =========================================================
   app-init.js — Point d'entrée (v1.2.0)
   Ajout : init de UICatalog.
   ========================================================= */

(function () {
  'use strict';

  function checkDependencies() {
    var missing = [];

    if (!window.jQuery)     missing.push('jQuery (CDN)');
    if (!window.Chessboard) missing.push('Chessboard.js (CDN)');
    if (!window.Chess)      missing.push('chess.js (CDN)');

    if (!window.APP)                                    missing.push('window.APP');
    if (!window.APP || !window.APP.CONFIG)              missing.push('config/app-config.js');
    if (!window.APP || !window.APP.CURRICULUM)          missing.push('data/curriculum.js');
    if (!window.APP || !window.APP.Board)               missing.push('core/board-core.js');
    if (!window.APP || !window.APP.LichessClient)       missing.push('lichess/lichess-client.js');
    if (!window.APP || !window.APP.LichessAdapter)      missing.push('lichess/lichess-adapter.js');
    if (!window.APP || !window.APP.LessonEngine)        missing.push('core/lesson-engine.js');
    if (!window.APP || !window.APP.Stockfish)           missing.push('engine/stockfish-loader.js');
    if (!window.APP || !window.APP.StockfishAnalysis)   missing.push('engine/stockfish-analysis.js');
    if (!window.APP || !window.APP.GameReview)          missing.push('engine/stockfish-game-review.js');
    if (!window.APP || !window.APP.UITabs)              missing.push('ui/ui-tabs.js');
    if (!window.APP || !window.APP.UINav)               missing.push('ui/ui-nav.js');
    if (!window.APP || !window.APP.UICatalog)           missing.push('ui/ui-catalog.js');
    if (!window.APP || !window.APP.UIFreeplay)          missing.push('ui/ui-freeplay.js');
    if (!window.APP || !window.APP.UIAnalysis)          missing.push('ui/ui-analysis.js');
    if (!window.APP || !window.APP.UIGameReview)        missing.push('ui/ui-game-review.js');

    return missing;
  }

  function showFatalError(missing) {
    document.body.innerHTML =
      '<div style="padding:40px;font-family:monospace;font-size:14px;' +
                  'line-height:1.6;background:#f5f4f1;color:#2a2a2a;min-height:100vh;">' +
        '<h2 style="color:#d9534f;margin-bottom:20px;">⚠️ Erreur de chargement</h2>' +
        '<ul style="margin-left:20px;color:#c46a1e;">' +
          missing.map(function (m) { return '<li>' + m + '</li>'; }).join('') +
        '</ul>' +
      '</div>';
  }

  function applyIdentity() {
    var CFG = window.APP.CONFIG;
    if (!CFG) return;
    document.title = CFG.FULLNAME;
    var badge = document.getElementById('app-badge');
    if (badge) badge.textContent = 'ÉTAPE ' + CFG.STEP;
    var title = document.getElementById('app-title');
    if (title) title.textContent = '♟ ' + CFG.NAME;
  }

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
    var lastTouchEnd = 0;
    document.addEventListener('touchend', function (e) {
      var now = Date.now();
      if (now - lastTouchEnd <= 300 && !e.defaultPrevented) e.preventDefault();
      lastTouchEnd = now;
    }, { passive: false });

    var boardWrap = document.getElementById('board-wrap');
    if (boardWrap) {
      boardWrap.addEventListener('touchmove', function (e) {
        e.preventDefault();
      }, { passive: false });
    }
  }

  function init() {
    var missing = checkDependencies();
    if (missing.length > 0) { showFatalError(missing); return; }

    try {
      applyIdentity();
      window.APP.Board.init();
      window.APP.LessonEngine.init();

      window.APP.UINav.init();
      window.APP.UIFreeplay.init();
      window.APP.UIAnalysis.init();
      window.APP.UIGameReview.init();
      window.APP.UITabs.init();

      bindResize();
      bindTouchHandlers();

      setTimeout(function () { window.APP.Board.resize(); }, 100);
    } catch (err) {
      if (window.console) console.error('[APP] Init error:', err);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
