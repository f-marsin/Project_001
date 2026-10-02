/* =========================================================
   lesson-engine.js — Moteur de leçons (puzzles Lichess)
   =========================================================
   v1.0.3 — Correctif : après un mauvais coup, on recharge
   TOUJOURS la position de départ du puzzle (via une nouvelle
   instance chess.js à partir de la FEN), au lieu de se fier
   à game.undo() qui pouvait être désynchronisé.
   ========================================================= */

window.APP = window.APP || {};

(function () {
  'use strict';

  var state = {
    active: false,
    lessonId: null,
    theme: null,
    puzzle: null,
    awaiting: false,
    solved: false
  };

  /* ---------- Utilitaires ---------- */

  function showFeedback(msg, kind) {
    var el = document.getElementById('lesson-feedback');
    if (!el) return;
    el.className = 'feedback show ' + kind;
    el.textContent = msg;
  }

  function normSan(s) {
    if (!s) return '';
    return String(s)
      .replace(/\s+/g, '')
      .replace(/[+#!?]/g, '')
      .replace(/=Q$/i, '')
      .replace(/0-0-0/g, 'O-O-O')
      .replace(/0-0/g, 'O-O');
  }

  /* ⚠️ CORRECTIF v1.0.3 : recharge la position du puzzle
     de manière fiable, en créant une nouvelle instance game. */
  function reloadPuzzlePosition() {
    if (!state.puzzle) return;
    var B = window.APP.Board;
    var freshGame = new Chess(state.puzzle.fen);
    B.setGame(freshGame);
    B.position(freshGame.fen(), false);
    B.clearHighlights();
    window.APP.log('Position du puzzle rechargée :', state.puzzle.fen);
  }

  /* ---------- Chargement d'une leçon ---------- */

  function getLessonFromState() {
    var navState = window.APP.UINav.getState();
    if (!navState || !navState.currentModuleId || !navState.currentLessonId) return null;
    return window.APP.findLesson(navState.currentModuleId, navState.currentLessonId);
  }

  function hasContent(lessonId) {
    var arr = window.APP.CURRICULUM || [];
    for (var i = 0; i < arr.length; i++) {
      for (var j = 0; j < arr[i].lessons.length; j++) {
        if (arr[i].lessons[j].id === lessonId) {
          return !!arr[i].lessons[j].lichessTheme;
        }
      }
    }
    return false;
  }

  function startCurrent() {
    var lesson = getLessonFromState();
    if (!lesson) {
      showFeedback('Leçon introuvable.', 'ko');
      return;
    }
    if (!lesson.lichessTheme) {
      showFeedback('Le contenu de cette leçon sera ajouté ultérieurement.', 'ko');
      return;
    }
    start(lesson.id, lesson.lichessTheme);
  }

  function start(lessonId, theme) {
    state.active = true;
    state.lessonId = lessonId;
    state.theme = theme;
    state.solved = false;
    state.awaiting = true;

    window.APP.Board.setLessonMode(true);
    window.APP.Board.clearHighlights();

    renderLoading();

    window.APP.LichessClient.fetchPuzzle(theme)
      .then(function (result) {
        var adapted = window.APP.LichessAdapter.adapt(result.data);
        if (adapted.error) {
          throw new Error(adapted.error);
        }
        state.puzzle = adapted;
        state.awaiting = false;
        renderPuzzle();
        reloadPuzzlePosition();
        window.APP.log('Puzzle chargé :', adapted.lichessId, 'rating', adapted.rating);
      })
      .catch(function (err) {
        state.awaiting = false;
        state.active = false;
        window.APP.Board.setLessonMode(false);
        renderError('Impossible de charger le puzzle : ' + err.message);
      });
  }

  /* ---------- Rendu ---------- */

  function renderLoading() {
    var content = document.getElementById('curriculum-content');
    if (!content) return;
    content.innerHTML =
      '<div class="lesson-play">' +
        '<h3>Chargement du puzzle…</h3>' +
        '<p class="text-dim">Connexion à Lichess…</p>' +
      '</div>';
  }

  function renderError(msg) {
    var content = document.getElementById('curriculum-content');
    if (!content) return;
    content.innerHTML =
      '<button class="back-btn" data-nav="lessons">‹ Retour</button>' +
      '<div class="lesson-play">' +
        '<h3>Erreur</h3>' +
        '<div class="feedback show ko">' + msg + '</div>' +
        '<p class="text-dim">Vérifie ta connexion ou réessaie.</p>' +
      '</div>';
  }

  function renderPuzzle() {
    var p = state.puzzle;
    var content = document.getElementById('curriculum-content');
    if (!content || !p) return;

    var isWhiteToMove = p.fen.indexOf(' w ') !== -1;
    var rating = p.rating ? ' (rating ' + p.rating + ')' : '';

    content.innerHTML =
      '<button class="back-btn" data-nav="lessons">‹ Retour</button>' +
      '<div class="lesson-play">' +
        '<h3>Puzzle Lichess' + rating + '</h3>' +
        '<div class="play-turn">' +
          '<span class="dot' + (isWhiteToMove ? '' : ' black') + '"></span>' +
          '<span>' + (isWhiteToMove ? 'Aux Blancs de jouer' : 'Aux Noirs de jouer') + '</span>' +
        '</div>' +
        '<div class="instruction" id="lesson-instruction">' +
          'Trouve la solution. Joue le coup gagnant sur l\'échiquier.' +
        '</div>' +
        '<div class="feedback" id="lesson-feedback"></div>' +
      '</div>';
  }

  /* ---------- Validation de la solution ---------- */

  function onDrop(source, target) {
    if (!state.active || state.awaiting || state.solved || !state.puzzle) {
      return 'snapback';
    }

    var B = window.APP.Board;
    var game = B.getGame();

    /* 1. Vérifier que le coup est légal dans la position ACTUELLE */
    var legalMoves = game.moves({ verbose: true });
    var found = null;
    for (var i = 0; i < legalMoves.length; i++) {
      if (legalMoves[i].from === source && legalMoves[i].to === target) {
        found = legalMoves[i];
        break;
      }
    }
    if (!found) {
      B.flashIllegal(target);
      /* ⚠️ On recharge la position pour être sûr */
      reloadPuzzlePosition();
      return 'snapback';
    }

    /* 2. Jouer le coup sur le game */
    var played = game.move({ from: source, to: target, promotion: 'q' });
    if (!played) {
      B.flashIllegal(target);
      reloadPuzzlePosition();
      return 'snapback';
    }
    var playedSan = played.san;

    /* 3. Comparer avec la solution */
    var expected = state.puzzle.playerMove;

    if (normSan(playedSan) === normSan(expected)) {
      /* --- BON COUP --- */
      state.solved = true;
      B.position(game.fen(), false);
      showFeedback('✅ Bravo ! ' + playedSan + ' est le coup gagnant.', 'ok');

      /* Jouer la réponse adverse automatiquement */
      if (state.puzzle.opponentReply) {
        setTimeout(function () {
          var reply = game.move(state.puzzle.opponentReply);
          if (reply) {
            B.position(game.fen(), false);
            showFeedback('✅ Bravo ! Solution : ' + playedSan + ' puis ' + reply.san, 'ok');
          }
        }, 700);
      }
      return;
    }

    /* --- MAUVAIS COUP --- */
    showFeedback('❌ Ce n\'est pas le coup gagnant. Réessaie.', 'ko');
    B.flashIllegal(target);

    /* ⚠️ CORRECTIF : on recharge entièrement la position du puzzle */
    reloadPuzzlePosition();
    return 'snapback';
  }

  /* ---------- Reset ---------- */

  function reset() {
    state.active = false;
    state.lessonId = null;
    state.theme = null;
    state.puzzle = null;
    state.awaiting = false;
    state.solved = false;
    if (window.APP.Board) {
      window.APP.Board.setLessonMode(false);
      window.APP.Board.setOnDropHandler(null);
    }
  }

  function init() {
    if (window.APP.Board) {
      window.APP.Board.setOnDropHandler(onDrop);
    }
  }

  /* ---------- API ---------- */

  window.APP.LessonEngine = {
    init: init,
    startCurrent: startCurrent,
    start: start,
    reset: reset,
    hasContent: hasContent,
    getState: function () { return state; }
  };
})();
