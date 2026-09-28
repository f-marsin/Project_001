/* =========================================================
   app-init.js — Point d'entrée + vérification des dépendances
   =========================================================
   v0.6.3 — Ajout vérification automatique des FEN au chargement.
   ========================================================= */

(function () {
  'use strict';

  /* ---------- Vérification des dépendances ---------- */
  function checkDependencies() {
    var missing = [];
    if (!window.jQuery) missing.push('jQuery');
    if (!window.Chessboard) missing.push('Chessboard.js');
    if (!window.Chess) missing.push('chess.js');
    if (!window.APP) missing.push('window.APP (config.js)');
    if (!window.APP || !window.APP.CONFIG) missing.push('config.js');
    if (!window.APP || !window.APP.CURRICULUM) missing.push('data-curriculum.js');
    if (!window.APP || !window.APP.LESSON_TASKS) missing.push('data-lessons.js');
    if (!window.APP || !window.APP.PUZZLE_TASKS) missing.push('data-puzzles.js');
    if (!window.APP || !window.APP.Board) missing.push('board-core.js');
    if (!window.APP || !window.APP.PreQuestion) missing.push('pre-question.js');
    if (!window.APP || !window.APP.LessonEngine) missing.push('lesson-engine.js');
    if (!window.APP || !window.APP.UINav) missing.push('ui-nav.js');
    return missing;
  }

  function showFatalError(missing) {
    document.body.innerHTML =
      '<div style="padding:40px;color:#ff5757;font-family:monospace;font-size:14px;line-height:1.6;background:#121212;min-height:100vh;">' +
      '<h2 style="color:#fff;margin-bottom:20px;">⚠️ Erreur de chargement</h2>' +
      '<p style="color:#e8e8e8;margin-bottom:20px;">Certains modules n\'ont pas pu être chargés :</p>' +
      '<ul style="margin-left:20px;color:#fbbf24;">' +
      missing.map(function (m) { return '<li>' + m + '</li>'; }).join('') +
      '</ul>' +
      '<p style="color:#9a9a9a;margin-top:30px;font-size:12px;">Astuce : ouvre la console (F12) pour plus de détails.</p>' +
      '</div>';
  }

  /* ---------- Vérification de toutes les FEN ---------- */
  function validateAllFens() {
    var problems = [];
    var totalChecked = 0;

    function checkPuzzle(lessonId, puzzle, index) {
      totalChecked++;
      if (!puzzle.fen) {
        problems.push(lessonId + ' #' + (index + 1) + ' : pas de FEN');
        return;
      }
      try {
        var g = new Chess(puzzle.fen);
        if (!g) {
          problems.push(lessonId + ' #' + (index + 1) + ' : FEN rejetée');
          return;
        }
        if (g.in_check()) {
          var turn = g.turn() === 'w' ? 'Blancs' : 'Noirs';
          problems.push(lessonId + ' #' + (index + 1) + ' : roi ' + turn + ' en échec au démarrage (FEN illégale) — FEN: ' + puzzle.fen);
        }
      } catch (err) {
        problems.push(lessonId + ' #' + (index + 1) + ' : ' + err.message + ' — FEN: ' + puzzle.fen);
      }
    }

    /* Vérifier toutes les banques de puzzles */
    if (window.APP.PUZZLE_TASKS) {
      for (var lid in window.APP.PUZZLE_TASKS) {
        if (!window.APP.PUZZLE_TASKS.hasOwnProperty(lid)) continue;
        var def = window.APP.PUZZLE_TASKS[lid];
        for (var i = 0; i < def.tasks.length; i++) {
          checkPuzzle(lid, def.tasks[i], i);
        }
      }
    }

    /* Vérifier toutes les leçons move-piece */
    if (window.APP.LESSON_TASKS) {
      for (var lid2 in window.APP.LESSON_TASKS) {
        if (!window.APP.LESSON_TASKS.hasOwnProperty(lid2)) continue;
        var def2 = window.APP.LESSON_TASKS[lid2];
        if (def2.kind === 'move-piece') {
          for (var j = 0; j < def2.tasks.length; j++) {
            checkPuzzle(lid2, def2.tasks[j], j);
          }
        }
      }
    }

    if (window.console) {
      if (problems.length === 0) {
        console.log('[FEN Check] ✅ ' + totalChecked + ' positions vérifiées, aucune erreur.');
      } else {
        console.warn('[FEN Check] ⚠️ ' + problems.length + ' problème(s) sur ' + totalChecked + ' positions :');
        problems.forEach(function (p) { console.warn('  - ' + p); });
      }
    }

    return { total: totalChecked, problems: problems };
  }

  /* ---------- Identité visuelle ---------- */
  function applyIdentity() {
    var CFG = window.APP.CONFIG;
    if (!CFG) return;
    document.title = CFG.FULLNAME;
    var badge = document.getElementById('app-badge');
    if (badge) badge.textContent = 'ÉTAPE ' + CFG.STEP;
    var title = document.getElementById('app-title');
    if (title) title.textContent = '♟ ' + CFG.NAME;
  }

  /* ---------- Board events ---------- */
  function bindBoardEvents() {
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

  /* ---------- Resize ---------- */
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

  /* ---------- Tactile iOS ---------- */
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

  /* ---------- Clic cases (identify-square) ---------- */
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

  /* ---------- Init ---------- */
  function init() {
    var missing = checkDependencies();
    if (missing.length > 0) {
      showFatalError(missing);
      return;
    }

    try {
      applyIdentity();

      /* Vérification des FEN */
      validateAllFens();

      /* Init échiquier + UI */
      window.APP.Board.init();
      bindBoardEvents();
      window.APP.UINav.init();
      bindResize();
      bindTouchHandlers();
      bindSquareClicks();
      setTimeout(function () {
        window.APP.Board.resize();
      }, 100);
    } catch (err) {
      var panel = document.querySelector('.panel');
      if (panel) {
        var box = document.createElement('div');
        box.style.cssText = 'background:#3a1010;color:#ff5757;padding:14px;border-radius:8px;margin-bottom:12px;font-family:monospace;font-size:12px;line-height:1.4;';
        box.textContent = '⚠️ Erreur d\'initialisation : ' + err.message;
        panel.insertBefore(box, panel.firstChild);
      }
      if (window.console && console.error) console.error('[Projet_001] Init error:', err);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
