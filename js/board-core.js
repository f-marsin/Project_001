/* =========================================================
   board-core.js — Échiquier + règles légales + validation FEN
   =========================================================
   Expose window.APP.Board avec :
     - init()               : crée l'échiquier
     - reset()              : remet en position initiale
     - flip()               : retourne l'échiquier
     - position(fen)        : affiche une position
     - orientation(color)   : oriente l'échiquier
     - resize()             : redimensionne
     - getGame()            : instance chess.js courante
     - setGame(g)           : remplace l'instance chess.js
     - newGame()            : nouvelle partie
     - isLessonMode()       : renvoie true/false
     - setLessonMode(b)     : active/désactive le mode leçon
     - setOnDropHandler(fn) : branche un handler custom
     - setOnSnapEndHandler(fn)
     - setLastMove(from,to) : mémorise le dernier coup
     - clearLastMove()
     - clearHighlights()
     - applyLastMoveHighlight()
     - flashIllegal(square)
     - getBoardInstance()
     - validateFen(fen)     : NOUVEAU — retourne { valid, error }
   ========================================================= */

window.APP = window.APP || {};

(function () {
  'use strict';

  var board = null;
  var game = new Chess();
  var lastMove = null;
  var lessonMode = false;
  var onDropHandler = null;
  var onSnapEndHandler = null;

  /* ---------- Helpers visuels ---------- */
  function clearHighlights() {
    if (!window.jQuery) return;
    window.jQuery('#board .square-55d63').removeClass('hl-from hl-to hl-target hl-good hl-bad clickable');
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
    setTimeout(function () { $sq.removeClass('illegal-flash'); }, 500);
  }

  /* ---------- Validation FEN ---------- */
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
      /* Vérification : le camp au trait ne doit pas être en échec
         APRÈS avoir chargé la position (sauf si c'est la position de départ). */
      if (testGame.in_check()) {
        return {
          valid: true,
          warning: 'Le camp au trait (' + (turn === 'w' ? 'Blancs' : 'Noirs') + ') est en échec dans cette position de départ.',
          turn: turn,
          inCheck: true
        };
      }
      return { valid: true, turn: turn, inCheck: false };
    } catch (err) {
      return { valid: false, error: err.message || 'Erreur inconnue' };
    }
  }

  /* ---------- Callbacks par défaut ---------- */
  function defaultOnDragStart(source, piece) {
    if (lessonMode) return true;
    if (game.game_over()) return false;
    var turn = game.turn();
    if (turn === 'w' && piece.search(/^b/) !== -1) return false;
    if (turn === 'b' && piece.search(/^w/) !== -1) return false;
    return true;
  }

  function defaultOnDrop(source, target) {
    if (onDropHandler) {
      var result = onDropHandler(source, target);
      if (result !== undefined) return result;
    }

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

  function defaultOnSnapEnd() {
    if (onSnapEndHandler) {
      onSnapEndHandler();
      return;
    }
    if (lessonMode) return;
    if (board) board.position(game.fen());
    applyLastMoveHighlight();
  }

  /* ---------- API publique ---------- */
  var API = {
    init: function () {
      board = window.Chessboard('board', {
        draggable: true,
        position: 'start',
        pieceTheme: 'https://chessboardjs.com/img/chesspieces/wikipedia/{piece}.png',
        showNotation: true,
        onDragStart: defaultOnDragStart,
        onDrop: defaultOnDrop,
        onSnapEnd: defaultOnSnapEnd
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

    flip: function () { if (board) board.flip(); },
    position: function (fen, animate) { if (board) board.position(fen, animate !== false); },
    orientation: function (color) { if (board) board.orientation(color); },
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
