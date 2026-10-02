/* =========================================================
   lesson-engine.js — Moteur de leçons (v1.4.0)
   =========================================================
   Nouveauté : gère maintenant 3 types de leçons :
     - interactive    : exercices M0/M1 (identify-square / move-piece)
     - puzzle-live    : puzzles Lichess (fork, pin, mateIn1…)
     - coming         : contenu à venir

   Enregistre chaque tentative dans le profil utilisateur.
   ========================================================= */

window.APP = window.APP || {};

(function () {
  'use strict';

  var state = {
    active: false,
    lessonId: null,
    theme: null,
    lessonKind: null,      /* 'interactive' | 'puzzle-live' */
    taskKind: null,        /* 'identify-square' | 'move-piece' | 'solve-puzzle' */
    puzzle: null,          /* puzzle Lichess adapté */
    taskList: [],          /* tâches interactives courantes */
    taskIndex: 0,          /* index tâche interactive */
    awaiting: false,
    solved: false,
    source: 'path',
    startTime: null
  };

  /* ================= HELPERS ================= */

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

  function shuffle(arr) {
    var a = arr.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
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

  function getLessonById(lessonId) {
    var arr = window.APP.CURRICULUM || [];
    for (var i = 0; i < arr.length; i++) {
      for (var j = 0; j < arr[i].lessons.length; j++) {
        if (arr[i].lessons[j].id === lessonId) return arr[i].lessons[j];
      }
    }
    return null;
  }

  function getThemeForLesson(lessonId) {
    var arr = window.APP.CURRICULUM || [];
    for (var i = 0; i < arr.length; i++) {
      for (var j = 0; j < arr[i].lessons.length; j++) {
        if (arr[i].lessons[j].id === lessonId) return arr[i].theme;
      }
    }
    return null;
  }

  /* Retourne le type d'une leçon */
  function lessonType(lessonId) {
    /* Interactif (M0/M1) ? */
    if (window.APP.INTERACTIVE_LESSONS && window.APP.INTERACTIVE_LESSONS[lessonId]) {
      return 'interactive';
    }
    /* Puzzle Lichess ? */
    var lesson = getLessonById(lessonId);
    if (lesson && lesson.lichessTheme) return 'puzzle-live';
    return 'coming';
  }

  function hasContent(lessonId) {
    return lessonType(lessonId) !== 'coming';
  }

  /* ================= POINTS D'ENTRÉE ================= */

  function startCurrent() {
    var lesson = getLessonFromState();
    if (!lesson) { showFeedback('Leçon introuvable.', 'ko'); return; }
    state.source = 'path';
    start(lesson.id);
  }

  function startFromCatalog(moduleId, lessonId, theme) {
    state.source = 'catalog';
    start(lessonId);
  }

  /* ================= DÉMARRAGE ================= */

  function start(lessonId) {
    var kind = lessonType(lessonId);
    if (kind === 'coming') {
      showFeedback('Le contenu de cette leçon sera ajouté ultérieurement.', 'ko');
      return;
    }

    state.active = true;
    state.lessonId = lessonId;
    state.lessonKind = kind;
    state.theme = getThemeForLesson(lessonId);
    state.solved = false;
    state.awaiting = false;
    state.startTime = Date.now();
    state.puzzle = null;
    state.taskList = [];
    state.taskIndex = 0;

    window.APP.Board.setLessonMode(true);
    window.APP.Board.clearHighlights();

    if (kind === 'interactive') {
      startInteractive();
    } else if (kind === 'puzzle-live') {
      startPuzzle();
    }
  }

  /* ================= INTERACTIF (M0/M1) ================= */

  function startInteractive() {
    var def = window.APP.INTERACTIVE_LESSONS[state.lessonId];
    if (!def) { renderError('Exercice introuvable.'); return; }

    state.taskKind = def.kind;
    var picked = shuffle(def.tasks).slice(0, Math.min(5, def.tasks.length));
    state.taskList = picked;
    state.taskIndex = 0;

    applyInteractiveTask();
    renderInteractive();
  }

  function applyInteractiveTask() {
    var task = state.taskList[state.taskIndex];
    if (!task) return;

    var B = window.APP.Board;
    B.clearHighlights();

    if (state.taskKind === 'identify-square') {
      /* Échiquier vide */
      B.setGame(new Chess());
      B.orientation('white');
      B.position('8/8/8/8/8/8/8/8 w - - 0 1', false);
      setTimeout(function () {
        if (window.jQuery) window.jQuery('#board .square-55d63').addClass('clickable');
      }, 100);
    } else if (state.taskKind === 'move-piece') {
      /* Position FEN de la tâche */
      var g = new Chess(task.fen);
      B.setGame(g);
      B.orientation('white');
      B.position(task.fen, false);
      setTimeout(function () {
        if (window.jQuery) window.jQuery('#board .square-' + task.from).addClass('hl-target');
      }, 100);
    }
  }

  function renderInteractive() {
    var container = getRenderContainer();
    if (!container) return;

    var lesson = getLessonById(state.lessonId);
    var task = state.taskList[state.taskIndex];
    var total = state.taskList.length;
    var current = state.taskIndex + 1;

    var isWhiteToMove = state.taskKind === 'move-piece'
      ? (task.fen.indexOf(' w ') !== -1)
      : true;

    var progressHtml = '';
    for (var i = 0; i < total; i++) {
      var cls = 'pip';
      if (i < state.taskIndex) cls += ' done';
      else if (i === state.taskIndex) cls += ' current';
      progressHtml += '<span class="' + cls + '"></span>';
    }

    var backBtn = state.source === 'catalog'
      ? '<button class="back-btn" data-catalog-nav="list">‹ Catalogue</button>'
      : '<button class="back-btn" data-nav="lessons">‹ Retour</button>';

    var html = backBtn +
      '<div class="lesson-play">' +
        '<h3>' + lesson.title + '</h3>' +
        '<div class="lesson-progress">' + progressHtml + '</div>' +
        '<div class="task-counter">Tâche ' + current + ' / ' + total + '</div>';

    if (state.taskKind === 'move-piece') {
      html += '<div class="play-turn">' +
                '<span class="dot' + (isWhiteToMove ? '' : ' black') + '"></span>' +
                '<span>' + (isWhiteToMove ? 'Aux Blancs' : 'Aux Noirs') + '</span>' +
              '</div>';
    }

    html += '<div class="instruction">' + task.prompt + '</div>' +
            '<div class="feedback" id="lesson-feedback"></div>' +
            '</div>';

    container.innerHTML = html;
    bindBackButtons();
  }

  /* Clic sur une case en mode identify-square */
  function onSquareClick(square) {
    if (state.lessonKind !== 'interactive') return;
    if (state.taskKind !== 'identify-square') return;
    if (state.awaiting) return;

    var task = state.taskList[state.taskIndex];
    var ok = false;

    if (task.matchRow)      ok = square.charAt(1) === task.targetRow;
    else if (task.matchCol) ok = square.charAt(0) === task.targetCol;
    else                    ok = square === task.target;

    var $ = window.jQuery;

    /* Enregistre la tentative (une par clic) */
    recordAttempt(ok);

    if (ok) {
      $('#board .square-' + square).addClass('hl-good');
      showFeedback('✅ Bravo ! ' + square + ' est la bonne case.', 'ok');
      state.awaiting = true;
      setTimeout(function () { nextInteractiveTask(); }, 900);
    } else {
      $('#board .square-' + square).addClass('hl-bad');
      setTimeout(function () { $('#board .square-' + square).removeClass('hl-bad'); }, 700);
      var hint = '';
      if (task.matchRow) hint = 'La bonne réponse est sur la rangée ' + task.targetRow + '.';
      else if (task.matchCol) hint = 'La bonne réponse est sur la colonne ' + task.targetCol + '.';
      else hint = 'La bonne case est ' + task.target + '.';
      showFeedback('❌ Raté. ' + hint, 'ko');
    }
  }

  function nextInteractiveTask() {
    state.taskIndex++;
    state.awaiting = false;
    if (state.taskIndex >= state.taskList.length) {
      finishInteractive();
    } else {
      applyInteractiveTask();
      renderInteractive();
    }
  }

  function finishInteractive() {
    state.solved = true;
    var container = getRenderContainer();
    if (!container) return;

    var backLabel = state.source === 'catalog' ? '‹ Retour au catalogue' : '‹ Retour aux leçons';
    var backAttr = state.source === 'catalog' ? 'data-catalog-nav="list"' : 'data-nav="lessons"';

    container.innerHTML =
      '<div class="lesson-play">' +
        '<h3>✅ Leçon terminée</h3>' +
        '<div class="lesson-complete">' +
          '<div class="icon">🏆</div>' +
          '<h4>Bravo !</h4>' +
          '<p>Tu as terminé les ' + state.taskList.length + ' tâches de cette leçon.</p>' +
          '<div class="btn-row" style="flex-direction:column;">' +
            '<button class="back-btn" ' + backAttr + ' ' +
                    'style="min-width:100%;justify-content:center;">' + backLabel + '</button>' +
          '</div>' +
        '</div>' +
      '</div>';

    bindBackButtons();
  }

  /* ================= PUZZLE LICHESS ================= */

  function startPuzzle() {
    var lesson = getLessonById(state.lessonId);
    if (!lesson || !lesson.lichessTheme) { renderError('Thème introuvable.'); return; }
    state.taskKind = 'solve-puzzle';
    renderLoading();
    fetchAndValidate(lesson.lichessTheme, 0);
  }

  function fetchAndValidate(theme, attempt) {
    var MAX_ATTEMPTS = 3;

    window.APP.LichessClient.fetchPuzzle(theme)
      .then(function (result) {
        var adapted = window.APP.LichessAdapter.adapt(result.data);
        if (adapted.error) throw new Error(adapted.error);

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

  function isThemeMatch(themes, requestedTheme) {
    if (!themes || themes.length === 0) return false;
    if (!requestedTheme) return true;
    return themes.slice(0, 2).indexOf(requestedTheme) !== -1;
  }

  /* ================= ENREGISTREMENT PROFIL ================= */

  function recordAttempt(correct) {
    if (!window.APP.UserProfile || !state.lessonId) return;
    var timeSpent = state.startTime ? Math.round((Date.now() - state.startTime) / 1000) : 0;
    window.APP.UserProfile.recordAttempt(state.lessonId, state.theme, correct, timeSpent);
    /* Reset startTime pour ne pas cumuler le temps sur plusieurs tentatives */
    state.startTime = Date.now();
  }

  /* ================= RENDUS COMMUNS ================= */

  function getRenderContainer() {
    if (state.source === 'catalog') return document.getElementById('catalog-content');
    return document.getElementById('curriculum-content');
  }

  function renderLoading() {
    var container = getRenderContainer();
    if (!container) return;
    container.innerHTML =
      '<div class="lesson-play">' +
        '<h3>Chargement du puzzle…</h3>' +
        '<p class="text-dim">Connexion à Lichess…</p>' +
      '</div>';
  }

  function renderError(msg) {
    var container = getRenderContainer();
    if (!container) return;
    var backBtn = state.source === 'catalog'
      ? '<button class="back-btn" data-catalog-nav="list">‹ Catalogue</button>'
      : '<button class="back-btn" data-nav="lessons">‹ Retour</button>';
    container.innerHTML = backBtn +
      '<div class="lesson-play">' +
        '<h3>Erreur</h3>' +
        '<div class="feedback show ko">' + msg + '</div>' +
      '</div>';
    bindBackButtons();
  }

  function renderPuzzle() {
    var p = state.puzzle;
    var container = getRenderContainer();
    if (!container || !p) return;

    var isWhiteToMove = p.fen.indexOf(' w ') !== -1;
    var rating = p.rating ? ' — Rating ' + p.rating : '';
    var backBtn = state.source === 'catalog'
      ? '<button class="back-btn" data-catalog-nav="list">‹ Catalogue</button>'
      : '<button class="back-btn" data-nav="lessons">‹ Retour</button>';

    container.innerHTML = backBtn +
      '<div class="lesson-play">' +
        '<h3>Puzzle Lichess' + rating + '</h3>' +
        '<div class="play-turn">' +
          '<span class="dot' + (isWhiteToMove ? '' : ' black') + '"></span>' +
          '<span>' + (isWhiteToMove ? 'Aux Blancs de jouer' : 'Aux Noirs de jouer') + '</span>' +
        '</div>' +
        '<div class="instruction">Trouve la solution.</div>' +
        '<div class="feedback" id="lesson-feedback"></div>' +
        '<div class="btn-row">' +
          '<button id="btn-see-solution" type="button">💡 Voir la solution</button>' +
        '</div>' +
      '</div>';

    var bSol = document.getElementById('btn-see-solution');
    if (bSol) bSol.addEventListener('click', onSeeSolution);
    bindBackButtons();
  }

  function renderSuccess() {
    var p = state.puzzle;
    var container = getRenderContainer();
    if (!container || !p) return;

    var seq = p.playerMove;
    if (p.opponentReply) seq += ' ' + p.opponentReply;

    var backLabel = state.source === 'catalog' ? '‹ Retour au catalogue' : '‹ Retour aux leçons';
    var backAttr = state.source === 'catalog' ? 'data-catalog-nav="list"' : 'data-nav="lessons"';

    container.innerHTML =
      '<div class="lesson-play">' +
        '<h3>✅ Résolu !</h3>' +
        '<div class="lesson-complete">' +
          '<div class="icon">🏆</div>' +
          '<h4>Bravo !</h4>' +
          '<p>Solution : <strong>' + seq + '</strong></p>' +
          '<div class="btn-row" style="flex-direction:column;">' +
            '<button id="btn-next-puzzle" type="button">▶ Puzzle suivant</button>' +
            '<button class="back-btn" ' + backAttr + ' ' +
                    'style="min-width:100%;justify-content:center;">' + backLabel + '</button>' +
          '</div>' +
        '</div>' +
      '</div>';

    var bNext = document.getElementById('btn-next-puzzle');
    if (bNext) bNext.addEventListener('click', onNextPuzzle);
    bindBackButtons();
  }

  function bindBackButtons() {
    var container = getRenderContainer();
    if (!container) return;
    var backBtns = container.querySelectorAll('[data-nav="lessons"], [data-catalog-nav="list"]');
    for (var i = 0; i < backBtns.length; i++) {
      (function (btn) {
        btn.onclick = function () {
          if (btn.getAttribute('data-catalog-nav') === 'list') returnToCatalog();
          else returnToPath();
        };
      })(backBtns[i]);
    }
  }

  function returnToCatalog() {
    reset();
    if (window.APP.UICatalog) window.APP.UICatalog.returnFromLesson();
  }

  function returnToPath() {
    reset();
    if (window.APP.UINav) window.APP.UINav.render();
  }

  /* ================= ACTIONS ================= */

  function onSeeSolution() {
    var p = state.puzzle;
    if (!p) return;
    var seq = p.playerMove;
    if (p.opponentReply) seq += ' puis ' + p.opponentReply;
    showFeedback('💡 Solution : ' + seq + '.', 'hint');
  }

  function onNextPuzzle() {
    if (state.lessonKind !== 'puzzle-live') return;
    state.solved = false;
    state.puzzle = null;
    state.awaiting = true;
    state.startTime = Date.now();
    renderLoading();
    var lesson = getLessonById(state.lessonId);
    fetchAndValidate(lesson.lichessTheme, 0);
  }

  /* ================= VALIDATION PUZZLE ================= */

  function onDrop(source, target) {
    if (!state.active) return 'snapback';

    /* Mode interactif move-piece */
    if (state.lessonKind === 'interactive' && state.taskKind === 'move-piece') {
      if (state.awaiting) return 'snapback';
      var task = state.taskList[state.taskIndex];
      if (!task) return 'snapback';

      if (source === task.from && target === task.to) {
        state.awaiting = true;
        var B = window.APP.Board;
        var game = B.getGame();
        var move = game.move({ from: source, to: target, promotion: 'q' });
        B.position(game.fen(), false);
        if (window.jQuery) window.jQuery('#board .square-' + target).addClass('hl-good');
        recordAttempt(true);
        showFeedback('✅ Bravo ! ' + (move ? move.san : ''), 'ok');
        setTimeout(function () {
          if (window.jQuery) window.jQuery('#board .square-' + target).removeClass('hl-good');
          state.awaiting = false;
          nextInteractiveTask();
        }, 900);
        return;
      } else {
        /* Mauvaise case tentée */
        recordAttempt(false);
        window.APP.Board.flashIllegal(target);
        showFeedback('❌ Ce n\'est pas la bonne case. La pièce doit aller en ' + task.to + '.', 'ko');
        return 'snapback';
      }
    }

    /* Mode puzzle Lichess */
    if (state.lessonKind === 'puzzle-live' && state.taskKind === 'solve-puzzle') {
      if (state.awaiting || state.solved || !state.puzzle) return 'snapback';

      var B2 = window.APP.Board;
      var game2 = B2.getGame();

      var legalMoves = game2.moves({ verbose: true });
      var found = null;
      for (var i = 0; i < legalMoves.length; i++) {
        if (legalMoves[i].from === source && legalMoves[i].to === target) {
          found = legalMoves[i];
          break;
        }
      }
      if (!found) {
        B2.flashIllegal(target);
        reloadPuzzlePosition();
        return 'snapback';
      }

      var played = game2.move({ from: source, to: target, promotion: 'q' });
      if (!played) {
        B2.flashIllegal(target);
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

      recordAttempt(match);

      if (match) {
        state.solved = true;
        B2.position(game2.fen(), false);
        if (state.puzzle.opponentReply) {
          setTimeout(function () {
            var reply = game2.move(state.puzzle.opponentReply);
            if (reply) B2.position(game2.fen(), false);
            setTimeout(renderSuccess, 500);
          }, 700);
        } else {
          setTimeout(renderSuccess, 500);
        }
        return;
      }

      showFeedback('❌ Ce n\'est pas le coup gagnant. Réessaie.', 'ko');
      B2.flashIllegal(target);
      reloadPuzzlePosition();
      return 'snapback';
    }

    return 'snapback';
  }

  /* ================= CLIC CASE (identify-square) ================= */

  function init() {
    if (window.APP.Board) {
      window.APP.Board.setOnDropHandler(onDrop);
    }
    /* Clic sur les cases pour identify-square */
    var wrap = document.getElementById('board-wrap');
    if (wrap) {
      wrap.addEventListener('click', function (e) {
        var sq = e.target.closest('[class*="square-"]');
        if (!sq) return;
        var match = sq.className.match(/square-([a-h][1-8])/);
        if (!match) return;
        onSquareClick(match[1]);
      });
    }
  }

  /* ================= RESET ================= */

  function reset() {
    state.active = false;
    state.lessonId = null;
    state.theme = null;
    state.lessonKind = null;
    state.taskKind = null;
    state.puzzle = null;
    state.taskList = [];
    state.taskIndex = 0;
    state.awaiting = false;
    state.solved = false;
    state.source = 'path';
    state.startTime = null;
    if (window.APP.Board) {
      window.APP.Board.setLessonMode(false);
      window.APP.Board.setOnDropHandler(null);
    }
  }

  window.APP.LessonEngine = {
    init: init,
    startCurrent: startCurrent,
    startFromCatalog: startFromCatalog,
    reset: reset,
    hasContent: hasContent,
    lessonType: lessonType,
    getState: function () { return state; }
  };
})();
