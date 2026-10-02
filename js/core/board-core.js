/* =========================================================
   board-core.js — Échiquier (v1.0.13)
   Ajout : setEvaluation(evaluation) — met à jour la barre d'éval.
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

  function highlightSquares(from, to) {
    if (!window.jQuery) return;
    clearHighlights();
    if (from) window.jQuery('#board .square-' + from).addClass('hl-from');
    if (to)   window.jQuery('#board .square-' + to).addClass('hl-to');
  }

  function flashIllegal(square) {
    if (!window.jQuery) return;
    var $sq = window.jQuery('#board .square-' + square);
    if (!$sq.length) return;
    $sq.addClass('illegal-flash');
    setTimeout(function () { $sq.removeClass('illegal-flash'); }, 500);
  }

  /* ---------- Barre d'évaluation ---------- */

  /* Convertit un cp en probabilité de victoire (0..1) */
  function cpToWinProbability(cp) {
    return 1 / (1 + Math.pow(10, -cp / 400));
  }

  /**
   * Met à jour la barre d'évaluation.
   * @param {object|number|null} evaluation
   *   - null : réinitialise à 50/50
   *   - number : centipions (ex: 150 = +1.50)
   *   - { type:'cp', value } ou { type:'mate', value }
   */
  function setEvaluation(evaluation) {
    var elWhite = document.getElementById('eval-bar-white');
    var elBlack = document.getElementById('eval-bar-black');
    var elLabel = document.getElementById('eval-bar-label');
    if (!elWhite || !elBlack) return;

    var proba = 0.5;   /* probabilité de victoire des Blancs */
    var label = '0.0';

    if (evaluation == null) {
      proba = 0.5;
      label = '0.0';
    } else if (typeof evaluation === 'number') {
      proba = cpToWinProbability(evaluation);
      label = (evaluation >= 0 ? '+' : '') + (evaluation / 100).toFixed(1);
    } else if (evaluation.type === 'cp') {
      var cp = evaluation.value;
      proba = cpToWinProbability(cp);
      label = (cp >= 0 ? '+' : '') + (cp / 100).toFixed(1);
    } else if (evaluation.type === 'mate') {
      var mateIn = evaluation.value;
      proba = mateIn > 0 ? 1 : 0;
      label = '#' + Math.abs(mateIn);
    }

    var whitePct = Math.round(proba * 100);
    elWhite.style.height = whitePct + '%';
    elBlack.style.height = (100 - whitePct) + '%';
    if (elLabel) elLabel.textContent = label;
  }

  /* ---------- Validation FEN ---------- */

  function validateFen(fen) {
    if (!fen || typeof fen !== 'string') {
      return { valid: false, error: 'FEN vide ou non-chaîne' };
    }
    try {
      var testGame = new Chess(fen);
      if (!testGame) return { valid: false, error: 'Échec de création' };
      var turn = testGame.turn();
      if (testGame.in_check()) return { valid: true, inCheck: true, turn: turn };
      return { valid: true, inCheck: false, turn: turn };
    } catch (err) {
      return { valid: false, error: err.message || 'Erreur inconnue' };
    }
  }

  /* ---------- Callbacks ---------- */

  function onDragStart(source, piece) {
    if (lessonMode) return true;
    if (game.game_over()) return false;
    var turn = game.turn();
    if (turn === 'w' && piece.search(/^b/) !== -1) return false;
    if (turn === 'b' && piece.search(/^w/) !== -1) return false;
    return true;
  }

  function onDrop(source, target) {
    if (onDropHandler) return onDropHandler(source, target);

    var legalMoves = game.moves({ verbose: true });
    var found = null;
    for (var i = 0; i < legalMoves.length; i++) {
      if (legalMoves[i].from === source && legalMoves[i].to === target) {
        found = legalMoves[i];
        break;
      }
    }
    if (!found) { flashIllegal(target); return 'snapback'; }
    var move = game.move({ from: source, to: target, promotion: 'q' });
    if (!move) { flashIllegal(target); return 'snapback'; }
    lastMove = { from: source, to: target };
    return;
  }

  function onSnapEnd() {
    if (lessonMode) return;
    if (onSnapEndHandler) { onSnapEndHandler(); return; }
    if (board) board.position(game.fen());
    applyLastMoveHighlight();
  }

  /* ---------- API ---------- */

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
      /* Barre à 50/50 par défaut */
      setEvaluation(null);
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
      setEvaluation(null);
    },

    flip: function () { if (board) board.flip(); },
    position: function (fen, animate) { if (board) board.position(fen, animate !== false); },
    orientation: function (color) { if (board) board.orientation(color); },
    resize: function () { if (board && typeof board.resize === 'function') board.resize(); },

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
    highlightSquares: highlightSquares,
    flashIllegal: flashIllegal,
    validateFen: validateFen,

    /* Barre d'évaluation */
    setEvaluation: setEvaluation,

    getBoardInstance: function () { return board; }
  };

  window.APP.Board = API;
})();
