/* =========================================================
   lesson-engine.js — Moteur de leçons (puzzles Lichess)
   =========================================================
   Rôle : charger un puzzle Lichess, l'afficher, valider la
   solution jouée par l'élève.

   API : window.APP.LessonEngine
     startCurrent()   : lance la leçon en cours (via UINav)
     start(lessonId)  : lance une leçon par ID
     hasContent(id)   : vérifie si une leçon a du contenu jouable
     reset()          : réinitialise l'état
   ========================================================= */

window.APP = window.APP || {};

(function () {
  'use strict';

  /* État interne */
  var state = {
    active: false,
    lessonId: null,
    theme: null,
    puzzle: null,       /* { fen, playerMove, opponentReply, ... } */
    awaiting: false,    /* true pendant une animation */
    solved: false
  };

  /* ---------- Utilitaires ---------- */

  function showFeedback(msg, kind) {
    var el = document.getElementById('lesson-feedback');
    if (!el) return;
    el.className = 'feedback show ' + kind;
    el.textContent = msg;
  }

  /* Normalisation SAN (retire +, #, !, ?, espaces) */
  function normSan(s) {
    if (!s) return '';
    return String(s)
      .replace(/\s+/g, '')
      .replace(/[+#!?]/g, '')
      .replace(/=Q$/i, '')
      .replace(/0-0-0/g, 'O-O-O')
      .replace(/0-0/g, 'O-O');
  }

  /* ---------- Chargement d'une leçon ---------- */

  function getLessonFromState() {
    var navState = window.APP.UINav.getState();
    if (!navState || !navState.currentModuleId || !navState.currentLessonId) return null;
    return window.APP.findLesson(navState.currentModuleId, navState.currentLessonId);
  }

  function hasContent(lessonId) {
    var lesson = window.APP.findLesson(null, lessonId);
    if (!lesson) {
      /* Fallback : chercher dans tous les modules */
      var arr = window.APP.CURRICULUM;
      for (var i = 0; i < arr.length; i++) {
        for (var j = 0; j < arr[i].lessons.length; j++) {
          if (arr[i].lessons[j].id === lessonId) {
            lesson = arr[i].lessons[j];
            break;
          }
        }
      }
    }
    return !!(lesson && lesson.lichessTheme);
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

    /* Afficher un message de chargement dans le panneau */
    renderLoading();

    /* Charger le puzzle */
    window.APP.LichessClient.fetchPuzzle(theme)
      .then(function (result) {
        var adapted = window.APP.LichessAdapter.adapt(result.data);
        if (adapted.error) {
          throw new Error(adapted.error);
        }
        state.puzzle = adapted;
        state.awaiting = false;
        renderPuzzle();
        window.APP.Board.position(adapted.fen, false);
        window.APP.log('Puzzle chargé :', adapted.lichessId, 'rating', adapted.rating);
      })
      .catch(function (err) {
        state.awaiting = false;
        state.active = false;
        window.APP.Board.setLessonMode(false);
        renderError('Impossible de charger le puzzle : ' + err.message);
      });
  }

  /* ---------- Rendu du panneau pendant la leçon ---------- */

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

    /* Vérifier que le coup est légal */
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
      return 'snapback';
    }

    /* Jouer le coup pour obtenir le SAN */
    var played = game.move({ from: source, to: target, promotion: 'q' });
    if (!played) {
      B.flashIllegal(target);
      return 'snapback';
    }
    var playedSan = played.san;

    /* Comparer avec la solution attendue */
    var expected = state.puzzle.playerMove;
    if (normSan(playedSan) === normSan(expected)) {
      /* Bonne réponse ! */
      state.solved = true;
      B.position(game.fen(), false);
      showFeedback('✅ Bravo ! ' + playedSan + ' est le coup gagnant.', 'ok');

      /* Jouer la réponse adverse automatiquement si présente */
      if (state.puzzle.opponentReply) {
        setTimeout(function () {
          var reply = game.move(state.puzzle.opponentReply);
          if (reply) {
            B.position(game.fen(), false);
            showFeedback('✅ Bravo ! Solution : ' + playedSan + ' puis ' + reply.san, 'ok');
          }
        }, 600);
      }
      return;
    }

    /* Mauvais coup */
    game.undo();
    B.position(game.fen(), false);
    B.flashIllegal(target);
    showFeedback('❌ Ce n\'est pas le coup gagnant. Réessaie.', 'ko');
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

  /* ---------- Initialisation du branchement ---------- */

  function init() {
    /* On enregistre le handler onDrop pour le mode leçon */
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
