/* =========================================================
   board-core.js — Échiquier + règles légales + validation FEN
   =========================================================
   v1.0.3 — Correctif : en mode leçon, le handler custom prend
   TOUT le contrôle du onDrop. board-core.js ne fait AUCUNE
   validation interne quand un handler custom est présent.
   ========================================================= */

window.APP = window.APP || {};

(function () {
  'use strict';

  /* ---------- État interne ---------- */
  var board = null;
  var game = new Chess();
  var lastMove = null;
  var lessonMode = false;
  var onDropHandler = null;
  var onSnapEndHandler = null;

  /* =========================================================
     HELPERS VISUELS
     ========================================================= */

  function clearHighlights() {
    if (!window.jQuery) return;
    window.jQuery('#board .square-55d63')
      .removeClass('hl-from hl-to hl-target hl-good hl-bad clickable');
  }

  function applyLastMoveHighlight() {
    if (lessonMode) return;
    clearHighlights();
    if (!lastMove) return;
    window.jQuery('#board .square-' + lastMove.from).addClass('hl-from');
    window.jQuery('#board .square-' + lastMove.to).addClass('hl-to');
  }

  function flashIllegal(square) {
    if (!window.jQuery) return;
    var $sq = window.jQuery('#board .square-' + square);
    if (!$sq.length) return;
    $sq.addClass('illegal-flash');
    setTimeout(function () {
      $sq.removeClass('illegal-flash');
    }, 500);
  }

  /* =========================================================
     VALIDATION FEN
     ========================================================= */

  function validateFen(fen) {
    if (!fen || typeof fen !== 'string') {
      return { valid: false, error: 'FEN vide ou non-chaîne' };
    }
    try {
      var testGame = new Chess(fen);
      if (!testGame) {
        return { valid: false, error: 'Échec de création de la partie' };
      }
      var turn = testGame.turn();
      if (testGame.in_check()) {
        return {
          valid: true,
          inCheck: true,
          turn: turn,
          warning: 'Le camp au trait (' + (turn === 'w' ? 'Blancs' : 'Noirs') + ') est en échec.'
        };
      }
      return { valid: true, inCheck: false, turn: turn };
    } catch (err) {
      return { valid: false, error: err.message || 'Erreur inconnue' };
    }
  }

  /* =========================================================
     CALLBACKS
     ========================================================= */

  function onDragStart(source, piece) {
    /* En mode leçon, on laisse TOUJOURS passer le drag.
       C'est le handler custom (LessonEngine) qui décidera. */
    if (lessonMode) return true;

    if (game.game_over()) return false;
    var turn = game.turn();
    if (turn === 'w' && piece.search(/^b/) !== -1) return false;
    if (turn === 'b' && piece.search(/^w/) !== -1) return false;
    return true;
  }

  function onDrop(source, target) {
    /* ⚠️ CORRECTIF v1.0.3 :
       Si un handler custom est présent (mode leçon), il prend
       TOUT le contrôle. board-core.js ne touche pas au game. */
    if (onDropHandler) {
      return onDropHandler(source, target);
    }

    /* Mode libre par défaut */
    var legalMoves = game.moves({ verbose: true });
    var found = null;
    for (var i = 0; i < legalMoves.length; i++) {
      if (legalMoves[i].from === source && legalMoves[i].to === target) {
        found = legalMoves[i];
        break;
      }
    }
    if (!found) {
      flashIllegal(target);
      return 'snapback';
    }
    var move = game.move({ from: source, to: target, promotion: 'q' });
    if (!move) {
      flashIllegal(target);
      return 'snapback';
    }
    lastMove = { from: source, to: target };
    return;
  }

  function onSnapEnd() {
    /* En mode leçon : ne rien faire (le LessonEngine gère) */
    if (lessonMode) return;

    /* En mode libre : rafraîchir l'échiquier */
    if (onSnapEndHandler) {
      onSnapEndHandler();
      return;
    }
    if (board) board.position(game.fen());
    applyLastMoveHighlight();
  }

  /* =========================================================
     API PUBLIQUE
     ========================================================= */

  var API = {

    init: function () {
      board = window.Chessboard('board', {
        draggable: true,
        position: 'start',
        pieceTheme: 'https://chessboardjs.com/img/chesspieces/wikipedia/{piece}.png',
        showNotation: true,
        onDragStart: onDragStart,
        onDrop: onDrop,
        onSnapEnd: onSnapEnd
      });
      this.resize();
    },

    reset: function () {
      game = new Chess();
      lastMove = null;
      lessonMode = false;
      onDropHandler = null;
      onSnapEndHandler = null;
      if (board) {
        board.position('start', false);
        board.orientation('white');
      }
      clearHighlights();
    },

    flip: function () {
      if (board) board.flip();
    },

    position: function (fen, animate) {
      if (board) board.position(fen, animate !== false);
    },

    orientation: function (color) {
      if (board) board.orientation(color);
    },

    resize: function () {
      if (board && typeof board.resize === 'function') board.resize();
    },

    getGame: function () { return game; },
    setGame: function (g) { game = g; },
    newGame: function () { game = new Chess(); },

    isLessonMode: function () { return lessonMode; },
    setLessonMode: function (b) { lessonMode = !!b; },

    setOnDropHandler: function (fn) { onDropHandler = fn; },
    setOnSnapEndHandler: function (fn) { onSnapEndHandler = fn; },

    setLastMove: function (from, to) { lastMove = { from: from, to: to }; },
    clearLastMove: function () { lastMove = null; },

    clearHighlights: clearHighlights,
    applyLastMoveHighlight: applyLastMoveHighlight,
    flashIllegal: flashIllegal,
    validateFen: validateFen,

    getBoardInstance: function () { return board; }
  };

  window.APP.Board = API;
})();
