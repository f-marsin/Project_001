/* =========================================================
   lesson-engine.js — Moteur de leçons (puzzles Lichess)
   =========================================================
   v1.0.8 — Nettoyage + UX :
     - Suppression des logs de debug et de debugSolution
     - Ajout bouton « Voir la solution » (avec confirmation)
     - Ajout bouton « Puzzle suivant » après réussite
     - Message de réussite amélioré
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
    solved: false,
    solvedOnce: false
  };

  /* =========================================================
     HELPERS
     ========================================================= */

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

  /* Vérifie que le thème demandé est bien dans les 2 premiers
     thèmes du puzzle (Lichess les trie par importance). */
  function isThemeMatch(themes, requestedTheme) {
    if (!themes || themes.length === 0) return false;
    if (!requestedTheme) return true;
    var top = themes.slice(0, 2);
    return top.indexOf(requestedTheme) !== -1;
  }

  /* =========================================================
     DÉMARRAGE D'UNE LEÇON
     ========================================================= */

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
    fetchAndValidate(theme, 0);
  }

  function fetchAndValidate(theme, attempt) {
    var MAX_ATTEMPTS = 3;

    window.APP.LichessClient.fetchPuzzle(theme)
      .then(function (result) {
        var adapted = window.APP.LichessAdapter.adapt(result.data);
        if (adapted.error) throw new Error(adapted.error);

        /* Vérification thème */
        if (!isThemeMatch(adapted.themes, theme) && attempt < MAX_ATTEMPTS) {
          setTimeout(function () { fetchAndValidate(theme, attempt + 1); }, 300);
          return;
        }

        state.puzzle = adapted;
        state.awaiting = false;
        renderPuzzle();
        reloadPuzzlePosition();
      })
      .catch(function (err) {
        state.awaiting = false;
        state.active = false;
        window.APP.Board.setLessonMode(false);
        renderError('Impossible de charger le puzzle : ' + err.message);
      });
  }

  /* =========================================================
     RENDUS
     ========================================================= */

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
    var rating = p.rating ? ' — Rating ' + p.rating : '';

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
        '<div class="btn-row">' +
          '<button id="btn-see-solution" type="button">💡 Voir la solution</button>' +
        '</div>' +
      '</div>';

    /* Bind bouton solution */
    var bSol = document.getElementById('btn-see-solution');
    if (bSol) bSol.addEventListener('click', onSeeSolution);
  }

  function renderSuccess() {
    var p = state.puzzle;
    var content = document.getElementById('curriculum-content');
    if (!content || !p) return;

    var seq = p.playerMove;
    if (p.opponentReply) seq += ' ' + p.opponentReply;

    content.innerHTML =
      '<button class="back-btn" data-nav="lessons">‹ Retour</button>' +
      '<div class="lesson-play">' +
        '<h3>✅ Résolu !</h3>' +
        '<div class="lesson-complete">' +
          '<div class="icon">🏆</div>' +
          '<h4>Bravo !</h4>' +
          '<p>Solution : <strong>' + seq + '</strong></p>' +
          '<div class="btn-row" style="flex-direction:column;">' +
            '<button id="btn-next-puzzle" type="button">▶ Puzzle suivant</button>' +
            '<button class="back-btn" data-nav="lessons" ' +
                    'style="min-width:100%;justify-content:center;">‹ Retour aux leçons</button>' +
          '</div>' +
        '</div>' +
      '</div>';

    var bNext = document.getElementById('btn-next-puzzle');
    if (bNext) bNext.addEventListener('click', onNextPuzzle);
  }

  /* =========================================================
     ACTIONS
     ========================================================= */

  function onSeeSolution() {
    var p = state.puzzle;
    if (!p) return;

    var seq = p.playerMove;
    if (p.opponentReply) seq += ' puis ' + p.opponentReply;

    showFeedback('💡 Solution : ' + seq + '. Observe bien pourquoi ce coup gagne.', 'hint');
  }

  function onNextPuzzle() {
    if (!state.theme) return;
    /* Reset l'état du puzzle en gardant la leçon */
    state.solved = false;
    state.solvedOnce = true;
    state.puzzle = null;
    state.awaiting = true;

    renderLoading();
    fetchAndValidate(state.theme, 0);
  }

  /* =========================================================
     VALIDATION DU COUP
     ========================================================= */

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
    var playedUci = source + target;

    var match = false;
    if (state.puzzle.playerMove) {
      match = normSan(playedSan) === normSan(state.puzzle.playerMove);
    } else if (state.puzzle.playerMoveUci) {
      match = (playedUci === state.puzzle.playerMoveUci.substring(0, 4));
    }

    if (match) {
      /* Bonne réponse */
      state.solved = true;
      B.position(game.fen(), false);

      /* Jouer la réponse adverse auto si présente */
      if (state.puzzle.opponentReply) {
        setTimeout(function () {
          var reply = game.move(state.puzzle.opponentReply);
          if (reply) {
            B.position(game.fen(), false);
          }
          setTimeout(function () {
            renderSuccess();
          }, 500);
        }, 700);
      } else {
        setTimeout(function () {
          renderSuccess();
        }, 500);
      }
      return;
    }

    /* Mauvais coup */
    showFeedback('❌ Ce n\'est pas le coup gagnant. Réessaie.', 'ko');
    B.flashIllegal(target);
    reloadPuzzlePosition();
    return 'snapback';
  }

  /* =========================================================
     RESET + INIT
     ========================================================= */

  function reset() {
    state.active = false;
    state.lessonId = null;
    state.theme = null;
    state.puzzle = null;
    state.awaiting = false;
    state.solved = false;
    state.solvedOnce = false;
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
    getState: function () { return state; }
  };
})();
