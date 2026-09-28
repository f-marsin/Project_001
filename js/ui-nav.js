/* =========================================================
   ui-nav.js — Navigation curriculum + rendu du panneau
   =========================================================
   Gère :
     - L'état de navigation (modules / lessons / lesson / play)
     - Le rendu des cartes modules, lignes de leçons
     - Le rendu de la vue "leçon en cours" (avec progression)
     - Les onglets Curriculum / Partie libre
     - Les boutons de contrôle de la partie libre
   ========================================================= */

window.APP = window.APP || {};

(function () {
  'use strict';

  /* ---------- État ---------- */
  var state = {
    view: 'curriculum',        // 'curriculum' | 'freeplay'
    curriculumView: 'modules', // 'modules' | 'lessons' | 'lesson' | 'play'
    currentModuleId: null,
    currentLessonId: null
  };

  /* ---------- Raccourcis DOM ---------- */
  function $(sel) { return document.querySelector(sel); }
  function $$(sel) { return document.querySelectorAll(sel); }

  function crumbEl() { return document.getElementById('crumb'); }
  function currContent() { return document.getElementById('curriculum-content'); }

  /* ---------- Helpers type ---------- */
  function lessonType(id) {
    var hasLesson = window.APP.LESSON_TASKS && window.APP.LESSON_TASKS[id];
    var hasPuzzle = window.APP.PUZZLE_TASKS && window.APP.PUZZLE_TASKS[id];
    if (hasPuzzle) return 'puzzle-live';
    if (hasLesson) return 'interactive';
    return 'coming';
  }

  function typeLabel(t) {
    if (t === 'lesson')       return 'Leçon';
    if (t === 'exercise')     return 'Exercice';
    if (t === 'puzzle')       return 'Puzzle';
    if (t === 'interactive')  return '▶ Jouable';
    if (t === 'puzzle-live')  return '♟ Puzzle';
    if (t === 'coming')       return 'À venir';
    return t;
  }

  function findModule(mid) {
    var arr = window.APP.CURRICULUM || [];
    for (var i = 0; i < arr.length; i++) if (arr[i].id === mid) return arr[i];
    return null;
  }

  function findLesson(mid, lid) {
    var m = findModule(mid);
    if (!m) return null;
    for (var i = 0; i < m.lessons.length; i++) if (m.lessons[i].id === lid) return m.lessons[i];
    return null;
  }

  function diffBars(level) {
    var s = '<span class="diff-bars">';
    for (var i = 1; i <= 5; i++) s += '<span class="' + (i <= level ? 'on' : '') + '"></span>';
    return s + '</span>';
  }

  /* ---------- Rendu : crumb ---------- */
  function renderCrumb() {
    var el = crumbEl();
    if (!el) return;

    if (state.curriculumView === 'modules') {
      el.innerHTML = '<span>Parcours</span>';
      return;
    }
    var m = findModule(state.currentModuleId);
    if (!m) { el.innerHTML = '<span>Parcours</span>'; return; }

    if (state.curriculumView === 'lessons') {
      el.innerHTML = '<a data-nav="modules">Parcours</a>' +
                     '<span class="sep">›</span>' +
                     '<span>' + m.id + ' — ' + m.title + '</span>';
    } else {
      var l = findLesson(state.currentModuleId, state.currentLessonId);
      el.innerHTML = '<a data-nav="modules">Parcours</a>' +
                     '<span class="sep">›</span>' +
                     '<a data-nav="lessons">' + m.id + '</a>' +
                     '<span class="sep">›</span>' +
                     '<span>' + l.title + '</span>';
    }
  }

  /* ---------- Rendu : modules ---------- */
  function renderModules() {
    var html = '<h2>Modules du parcours</h2>';
    var arr = window.APP.CURRICULUM || [];
    for (var i = 0; i < arr.length; i++) {
      var m = arr[i];
      var lock = m.unlocked ? '' : '<span class="module-lock">🔒</span>';
      html += '<div class="module-card' + (m.unlocked ? '' : ' locked') + '" data-action="open-module" data-module="' + m.id + '">' +
                lock +
                '<div class="module-head">' +
                  '<span class="module-id">' + m.id + '</span>' +
                  '<span class="module-count">' + m.lessons.length + ' leçons</span>' +
                '</div>' +
                '<div class="module-title">' + m.title + '</div>' +
                '<div class="module-sub">' + m.subtitle + '</div>' +
              '</div>';
    }
    currContent().innerHTML = html;
  }

  /* ---------- Rendu : leçons d'un module ---------- */
  function renderLessons() {
    var m = findModule(state.currentModuleId);
    if (!m) return;
    var html = '<button class="back-btn" data-nav="modules">‹ Modules</button>';
    html += '<h2>' + m.id + ' — ' + m.title + '</h2>';
    for (var i = 0; i < m.lessons.length; i++) {
      var l = m.lessons[i];
      var lt = lessonType(l.id);
      html += '<div class="lesson-row" data-action="open-lesson" data-module="' + m.id + '" data-lesson="' + l.id + '">' +
                '<span class="lesson-num">' + (i + 1) + '</span>' +
                '<div class="lesson-info">' +
                  '<div class="lesson-title">' + l.title + '</div>' +
                  '<div class="lesson-meta">' +
                    '<span class="lesson-type ' + lt + '">' + typeLabel(lt) + '</span>' +
                    diffBars(l.difficulty) +
                  '</div>' +
                '</div>' +
              '</div>';
    }
    currContent().innerHTML = html;
  }

  /* ---------- Rendu : détail d'une leçon ---------- */
  function renderLesson() {
    var m = findModule(state.currentModuleId);
    var l = findLesson(state.currentModuleId, state.currentLessonId);
    if (!m || !l) return;
    var lt = lessonType(l.id);
    var html = '<button class="back-btn" data-nav="lessons">‹ ' + m.id + '</button>';
    html += '<div class="lesson-detail">' +
              '<h3>' + l.title + '</h3>' +
              '<div class="objective"><strong>Objectif :</strong> ' + l.objective + '</div>';
    if (lt === 'interactive' || lt === 'puzzle-live') {
      html += '<button data-action="start-lesson" class="back-btn" style="background:var(--accent);color:#fff;border-color:var(--accent);min-width:100%;justify-content:center;padding:12px;">▶ Démarrer la leçon</button>';
    } else {
      html += '<div class="placeholder">Le contenu de cette leçon sera ajouté dans une étape ultérieure.</div>';
    }
    html += '</div>';
    currContent().innerHTML = html;
  }

  /* ---------- Rendu : leçon en cours (play) ---------- */
  function renderLessonPlay() {
    var m = findModule(state.currentModuleId);
    var l = findLesson(state.currentModuleId, state.currentLessonId);
    var engine = window.APP.LessonEngine;
    var p = engine ? engine.getState().play : null;
    if (!p) { state.curriculumView = 'lesson'; renderLesson(); return; }

    var html = '<button class="back-btn" data-nav="lessons">‹ ' + m.id + '</button>';
    html += '<div class="lesson-play">';
    html += '<h3>' + l.title + '</h3>';

    /* Progression */
    html += '<div class="lesson-progress">';
    for (var i = 0; i < p.taskList.length; i++) {
      var cls = 'pip';
      if (i < p.index) cls += ' done';
      else if (i === p.index && !p.finished) cls += ' current';
      html += '<span class="' + cls + '"></span>';
    }
    html += '</div>';

    var counterLabel = p.finished
      ? 'Leçon terminée'
      : ('Tâche ' + Math.min(p.index + 1, p.taskList.length) + ' / ' + p.taskList.length);
    html += '<div class="task-counter">' + counterLabel + '</div>';

    if (p.finished) {
      html += '<div class="lesson-complete">' +
                '<div class="icon">🏆</div>' +
                '<h4>Leçon terminée !</h4>' +
                '<p>Tu as réussi ' + p.taskList.length + ' tâche(s) avec ' + p.errors + ' erreur(s) au total.</p>' +
                '<button data-action="start-lesson" type="button">Refaire la leçon</button>' +
              '</div>';
    } else {
      /* Indicateur de tour pour les puzzles */
      if (p.kind === 'solve-puzzle') {
        var t = p.currentTask;
        var isWhite = t.fen.indexOf(' w ') !== -1;
        html += '<div class="play-turn">' +
                  '<span class="dot' + (isWhite ? '' : ' black') + '"></span>' +
                  '<span>' + (isWhite ? 'Aux Blancs de jouer' : 'Aux Noirs de jouer') + '</span>' +
                '</div>';
      }
      html += '<div class="instruction" id="lesson-instruction">' + p.currentTask.prompt + '</div>';
      html += '<div class="feedback" id="lesson-feedback"></div>';
      html += '<div class="btn-row">' +
                '<button data-action="hint-task" type="button">💡 Indice</button>' +
                '<button data-action="skip-task" type="button">Passer</button>' +
              '</div>';
    }
    html += '</div>';
    currContent().innerHTML = html;
  }

  /* ---------- Rendu global ---------- */
  function renderCurriculum() {
    renderCrumb();
    if (state.curriculumView === 'modules')      renderModules();
    else if (state.curriculumView === 'lessons') renderLessons();
    else if (state.curriculumView === 'lesson')  renderLesson();
    else                                          renderLessonPlay();
  }

  /* ---------- Délégation d'événements ---------- */
  function handleCurriculumClick(e) {
    /* Navigation (crumb / boutons retour) */
    var navEl = e.target.closest('[data-nav]');
    if (navEl) {
      var target = navEl.getAttribute('data-nav');
      if (target === 'modules') {
        resetToModules();
        return;
      }
      if (target === 'lessons') {
        resetToLessons();
        return;
      }
    }

    var actionEl = e.target.closest('[data-action]');
    if (!actionEl) return;
    var action = actionEl.getAttribute('data-action');

    if (action === 'open-module') {
      var mid = actionEl.getAttribute('data-module');
      var m = findModule(mid);
      if (!m || !m.unlocked) return;
      state.currentModuleId = mid;
      state.curriculumView = 'lessons';
      renderCurriculum();
    } else if (action === 'open-lesson') {
      state.currentModuleId = actionEl.getAttribute('data-module');
      state.currentLessonId = actionEl.getAttribute('data-lesson');
      state.curriculumView = 'lesson';
      renderCurriculum();
    } else if (action === 'start-lesson') {
      startCurrentLesson();
    } else if (action === 'skip-task') {
      window.APP.LessonEngine.skipTask();
    } else if (action === 'hint-task') {
      window.APP.LessonEngine.hintTask();
    }
  }

  /* ---------- Reset navigation ---------- */
  function resetToModules() {
    window.APP.LessonEngine.reset();
    window.APP.Board.setLessonMode(false);
    window.APP.Board.setOnDropHandler(null);
    state.curriculumView = 'modules';
    state.currentModuleId = null;
    state.currentLessonId = null;
    resetBoardToStart();
    renderCurriculum();
  }

  function resetToLessons() {
    window.APP.LessonEngine.reset();
    window.APP.Board.setLessonMode(false);
    window.APP.Board.setOnDropHandler(null);
    state.curriculumView = 'lessons';
    state.currentLessonId = null;
    resetBoardToStart();
    renderCurriculum();
  }

  function resetBoardToStart() {
    var B = window.APP.Board;
    B.reset();
    /* Réactualise le panneau partie libre */
    var tg = document.getElementById('turn-label');
    var td = document.getElementById('turn-dot');
    if (tg) { tg.textContent = 'Aux Blancs de jouer'; tg.classList.remove('check','mate','draw'); }
    if (td) td.classList.remove('black');
    var st = document.getElementById('status');
    if (st) { st.className = 'status ok'; st.textContent = 'Position initiale. Aux Blancs.'; }
    var hist = document.getElementById('history');
    if (hist) hist.innerHTML = '<div class="history-empty">Aucun coup joué.</div>';
  }

  /* ---------- Démarrage leçon ---------- */
  function startCurrentLesson() {
    var lid = state.currentLessonId;
    var engine = window.APP.LessonEngine;
    if (!engine) return;

    engine.startLesson(
      lid,
      function onRender() {
        state.curriculumView = 'play';
        renderCurriculum();
      },
      function onFinish(isDone) {
        /* Re-render à chaque avancée ou fin */
        renderCurriculum();
        if (isDone) {
          resetToLessons();
          /* Puis re-affiche la leçon terminée */
          state.currentModuleId = findModule(state.currentModuleId) ? state.currentModuleId : state.currentModuleId;
        }
      }
    );
  }

  /* ---------- Onglets ---------- */
  function bindTabs() {
    var tabs = $$('.tab');
    for (var i = 0; i < tabs.length; i++) {
      tabs[i].addEventListener('click', function () {
        var v = this.getAttribute('data-view');
        state.view = v;

        var all = $$('.tab');
        for (var j = 0; j < all.length; j++) all[j].classList.remove('active');
        this.classList.add('active');

        var vc = document.getElementById('view-curriculum');
        var vf = document.getElementById('view-freeplay');
        if (vc) vc.classList.toggle('active', v === 'curriculum');
        if (vf) vf.classList.toggle('active', v === 'freeplay');

        if (v === 'freeplay') {
          window.APP.LessonEngine.reset();
          window.APP.Board.setLessonMode(false);
          window.APP.Board.setOnDropHandler(null);
          resetBoardToStart();
          setTimeout(function () { window.APP.Board.resize(); }, 50);
        } else {
          if (state.curriculumView === 'play') {
            window.APP.LessonEngine.reset();
            window.APP.Board.setLessonMode(false);
            window.APP.Board.setOnDropHandler(null);
            state.curriculumView = 'lessons';
            resetBoardToStart();
            renderCurriculum();
          }
          setTimeout(function () { window.APP.Board.resize(); }, 50);
        }
      });
    }
  }

  /* ---------- Boutons de la partie libre ---------- */
  function bindFreeplayButtons() {
    var btnReset = document.getElementById('btn-reset');
    var btnFlip  = document.getElementById('btn-flip');
    var btnUndo  = document.getElementById('btn-undo');
    var btnPgn   = document.getElementById('btn-copy-pgn');
    var modalClose = document.getElementById('modal-close');
    var overlay = document.getElementById('overlay');

    if (btnReset) btnReset.addEventListener('click', function () {
      window.APP.Board.newGame();
      window.APP.Board.clearLastMove();
      window.APP.Board.clearHighlights();
      window.APP.Board.position('start', false);
      window.APP.Board.orientation('white');
      updateTurnIndicator();
      updateHistory();
      setStatus('Nouvelle partie. Position initiale. Aux Blancs.', 'ok');
    });

    if (btnFlip) btnFlip.addEventListener('click', function () {
      window.APP.Board.flip();
    });

    if (btnUndo) btnUndo.addEventListener('click', function () {
      var game = window.APP.Board.getGame();
      var undone = game.undo();
      if (!undone) { setStatus('Aucun coup à annuler.', 'warn'); return; }
      window.APP.Board.clearLastMove();
      var hist = game.history({ verbose: true });
      if (hist.length > 0) {
        var prev = hist[hist.length - 1];
        window.APP.Board.setLastMove(prev.from, prev.to);
      }
      window.APP.Board.position(game.fen(), false);
      window.APP.Board.applyLastMoveHighlight();
      updateTurnIndicator();
      updateHistory();
      setStatus('Coup annulé : ' + undone.san + '.', 'warn');
    });

    if (btnPgn) btnPgn.addEventListener('click', function () {
      var game = window.APP.Board.getGame();
      var pgn = game.pgn();
      if (!pgn) { setStatus('Aucun coup à copier.', 'warn'); return; }
      copyToClipboard(pgn).then(function (ok) {
        setStatus(ok ? 'PGN copié dans le presse-papiers.' : 'Copie impossible.', ok ? 'ok' : 'warn');
      });
    });

    if (modalClose) modalClose.addEventListener('click', function () {
      if (overlay) overlay.classList.remove('show');
    });
    if (overlay) overlay.addEventListener('click', function (e) {
      if (e.target === overlay) overlay.classList.remove('show');
    });
  }

  /* ---------- Helpers partie libre ---------- */
  function setStatus(msg, kind) {
    var st = document.getElementById('status');
    if (!st) return;
    st.className = 'status' + (kind ? ' ' + kind : '');
    st.textContent = msg;
  }

  function updateTurnIndicator() {
    var game = window.APP.Board.getGame();
    var turnDot = document.getElementById('turn-dot');
    var turnLabel = document.getElementById('turn-label');
    if (!turnDot || !turnLabel) return;

    if (game.game_over()) {
      turnDot.classList.remove('black');
      turnLabel.classList.remove('check','mate','draw');
      if (game.in_checkmate()) { turnLabel.classList.add('mate'); turnLabel.textContent = 'Échec et mat'; }
      else if (game.in_stalemate()) { turnLabel.classList.add('draw'); turnLabel.textContent = 'Pat'; }
      else { turnLabel.classList.add('draw'); turnLabel.textContent = 'Nulle'; }
      return;
    }
    turnLabel.classList.remove('check','mate','draw');
    if (game.turn() === 'w') {
      turnDot.classList.remove('black');
      turnLabel.textContent = 'Aux Blancs de jouer';
    } else {
      turnDot.classList.add('black');
      turnLabel.textContent = 'Aux Noirs de jouer';
    }
    if (game.in_check()) {
      turnLabel.classList.add('check');
      turnLabel.textContent += ' — ÉCHEC !';
    }
  }

  function updateHistory() {
    var game = window.APP.Board.getGame();
    var historyEl = document.getElementById('history');
    if (!historyEl) return;
    var hist = game.history();
    if (hist.length === 0) {
      historyEl.innerHTML = '<div class="history-empty">Aucun coup joué.</div>';
      return;
    }
    var html = '';
    for (var i = 0; i < hist.length; i += 2) {
      var n = (i / 2) + 1;
      var w = hist[i] || '';
      var b = hist[i + 1] || '';
      html += '<div class="history-row">' +
                '<div class="num">' + n + '.</div>' +
                '<div class="san-w">' + (w || '—') + '</div>' +
                '<div class="san-b">' + (b || '—') + '</div>' +
              '</div>';
    }
    historyEl.innerHTML = html;
    historyEl.scrollTop = historyEl.scrollHeight;
  }

  function copyToClipboard(text) {
    return new Promise(function (resolve) {
      if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(text).then(
          function () { resolve(true); },
          function () { resolve(false); }
        );
      } else {
        try {
          var ta = document.createElement('textarea');
          ta.value = text;
          ta.style.position = 'fixed';
          ta.style.left = '-9999px';
          document.body.appendChild(ta);
          ta.select();
          document.execCommand('copy');
          document.body.removeChild(ta);
          resolve(true);
        } catch (err) { resolve(false); }
      }
    });
  }

  /* ---------- API publique ---------- */
  window.APP.UINav = {
    init: function () {
      /* Bind des événements */
      var cc = currContent();
      if (cc) cc.addEventListener('click', handleCurriculumClick);

      bindTabs();
      bindFreeplayButtons();

      /* Rendu initial */
      renderCurriculum();
      updateTurnIndicator();
      updateHistory();
      setStatus('Position initiale. Aux Blancs.', 'ok');
    },

    /* Ces fonctions sont appelées par le moteur de leçon via callback */
    refreshLessonPlay: function () {
      renderCurriculum();
    },

    onFreeplaySnapEnd: function (lastMove, move) {
      updateTurnIndicator();
      updateHistory();
      if (move) {
        if (move.san.indexOf('#') !== -1) {
          setStatus('Échec et mat ! ' + move.san, 'error');
        } else if (move.san.indexOf('+') !== -1) {
          setStatus('Échec après ' + move.san + '.', 'warn');
        } else {
          setStatus('Coup joué : ' + move.san + '.', 'ok');
        }
      }
    },

    getState: function () { return state; },
    render: renderCurriculum,
    resetBoardToStart: resetBoardToStart
  };
})();
