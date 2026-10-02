/* =========================================================
   lesson-engine.js — Moteur de leçons (puzzles Lichess)
   =========================================================
   v1.0.5 — Affichage debug complet (SAN + UCI) pour faciliter
   le diagnostic en cas de mismatch.
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

  function reloadPuzzlePosition() {
    if (!state.puzzle) return;
    var B = window.APP.Board;
    var freshGame = new Chess(state.puzzle.fen);
    B.setGame(freshGame);
    B.position(freshGame.fen(), false);
    B.clearHighlights();
  }

  /* ---------- Debug : afficher la solution ---------- */

  function debugSolution() {
    if (!state.puzzle) {
      console.log('[DEBUG] Pas de puzzle chargé.');
      return;
    }
    console.log('%c[DEBUG] 🧩 Solution du puzzle', 'color:#4ade80;font-weight:bold;font-size:14px;');
    console.log('  FEN         :', state.puzzle.fen);
    console.log('  Trait       :', state.puzzle.fen.indexOf(' w ') !== -1 ? 'Blancs' : 'Noirs');
    console.log('  SAN attendu :', state.puzzle.playerMove);
    console.log('  UCI attendu :', state.puzzle.playerMoveUci);
    console.log('  Réponse     :', state.puzzle.opponentReply || '—');
    console.log('  Rating      :', state.puzzle.rating);
    console.log('  Thèmes      :', state.puzzle.themes.join(', '));
    console.log('  Séquence SAN complète :', state.puzzle.fullSequence);
    console.log('  Solution UCI brute    :', state.puzzle.rawSolution);
  }

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
    if (!lesson) { showFeedback('Leçon introuvable.', 'ko'); return; }
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

    console.log('[DEBUG] Chargement puzzle thème :', theme);

    window.APP.LichessClient.fetchPuzzle(theme)
      .then(function (result) {
        var adapted = window.APP.LichessAdapter.adapt(result.data);
        if (adapted.error) throw new Error(adapted.error);
        state.puzzle = adapted;
        state.awaiting = false;
        renderPuzzle();
        reloadPuzzlePosition();
        debugSolution();
      })
      .catch(function (err) {
        state.awaiting = false;
        state.active = false;
        window.APP.Board.setLessonMode(false);
        renderError('Impossible de charger le puzzle : ' + err.message);
      });
  }

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
        '<div class="instruction">' +
          'Trouve la solution. Joue le coup gagnant sur l\'échiquier.' +
        '</div>' +
        '<div class="feedback" id="lesson-feedback"></div>' +
        '<p class="text-dim" style="font-size:0.75rem;margin-top:12px;">' +
          '💡 <em>Solution dans la console (F12 → onglet Console).</em>' +
        '</p>' +
      '</div>';
  }

  function onDrop(source, target) {
    if (!state.active || state.awaiting || state.solved || !state.puzzle) {
      return 'snapback';
    }

    var B = window.APP.Board;
    var game = B.getGame();

    var legalMoves = game.moves({ verbose: true });
    var found = null;
    for (var i = 0; i < legalMoves.length; i++) {
      if (legalMoves[i].from === source && legalMoves[i].to === target) {
        found = legalMoves[i];
        break;
      }
    }
    if (!found) {
      console.log('[DEBUG] Coup illégal :', source, '→', target);
      B.flashIllegal(target);
      reloadPuzzlePosition();
      return 'snapback';
    }

    var played = game.move({ from: source, to: target, promotion: 'q' });
    if (!played) {
      B.flashIllegal(target);
      reloadPuzzlePosition();
      return 'snapback';
    }
    var playedSan = played.san;

    var expected = state.puzzle.playerMove;
    var match = normSan(playedSan) === normSan(expected);

    console.log('%c[DEBUG] 🎯 Tentative', 'color:#fbbf24;font-weight:bold;');
    console.log('  Joué (SAN)    :', playedSan);
    console.log('  Attendu (SAN) :', expected);
    console.log('  Match         :', match ? '✅ OUI' : '❌ NON');

    if (match) {
      state.solved = true;
      B.position(game.fen(), false);
      showFeedback('✅ Bravo ! ' + playedSan + ' est le coup gagnant.', 'ok');

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

    showFeedback('❌ Ce n\'est pas le coup gagnant. Réessaie.', 'ko');
    B.flashIllegal(target);
    reloadPuzzlePosition();
    return 'snapback';
  }

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

  window.APP.LessonEngine = {
    init: init,
    startCurrent: startCurrent,
    start: start,
    reset: reset,
    hasContent: hasContent,
    getState: function () { return state; },
    debugSolution: debugSolution
  };
})();
